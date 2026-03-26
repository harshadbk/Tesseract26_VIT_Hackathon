import json
import re
from typing import Any, Dict, List, Optional
from app.config.settings import settings

_client = None
_runtime_preferred_model = None
DEFAULT_MODEL_FALLBACKS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]

_INTENT_KEYWORDS = {
    "order_not_delivered": [
        "late",
        "delay",
        "delayed",
        "not delivered",
        "where is my order",
        "tracking",
        "shipment",
        "delivery",
        "status",
    ],
    "refund_delay": [
        "refund",
        "money back",
        "return",
        "returned",
        "refund status",
        "refund not",
    ],
    "wrong_product": [
        "wrong product",
        "wrong item",
        "damaged",
        "broken",
        "defective",
        "different item",
    ],
    "payment_issue": [
        "payment",
        "card",
        "upi",
        "transaction",
        "declined",
        "failed",
        "charged",
    ],
}


def _get_client():
    global _client
    if _client is not None:
        return _client

    if not settings.groq_api_key:
        return None

    try:
        from groq import Groq
    except Exception as exc:
        raise RuntimeError(
            "Groq SDK is missing. Run: pip install -r backend/requirements.txt"
        ) from exc

    _client = Groq(api_key=settings.groq_api_key)
    return _client


def _extract_json(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
    return {}


def _extract_order_id(text: str) -> str:
    if not text:
        return ""
    match = re.search(r"(?:order(?:\s*id)?\s*[:#-]?\s*)(\d{1,12})", text, flags=re.IGNORECASE)
    if match:
        return match.group(1)
    hash_match = re.search(r"#(\d{1,12})", text)
    if hash_match:
        return hash_match.group(1)
    return ""


def quick_analyze_user_query(user_input: str, known_order_id: str = "") -> Dict[str, Any]:
    text = (user_input or "").strip().lower()
    score_map = {intent: 0 for intent in _INTENT_KEYWORDS}

    for intent, keywords in _INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                score_map[intent] += 1

    intent = max(score_map, key=score_map.get)
    best_score = score_map[intent]
    confidence = min(0.95, 0.5 + (best_score * 0.12)) if best_score > 0 else 0.0

    emotion = "calm"
    if re.search(r"\bangr\w*\b|furious|worst|ridiculous|hate|\bmad\b|\bpissed\b", text):
        emotion = "angry"
        confidence = max(confidence, 0.78)
    elif re.search(
        r"\bfrust\w*\b|\bfrast\w*\b|upset|annoy\w*|disappoint\w*|again|still|irritat\w*|"
        r"\basap\b|\burgent\b|right now|immediately|hurry|"
        r"\bdo\s+(it|this)\s+fast\b|\bfast\s+please\b|quickly|faster|\bquick\b",
        text,
    ):
        emotion = "frustrated"
        confidence = max(confidence, 0.72)

    order_id = _extract_order_id(user_input) or (known_order_id or "")
    return {
        "intent": intent,
        "emotion": emotion,
        "order_id": order_id,
        "confidence": round(confidence, 3),
    }


def call_llm(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
    preferred_model: Optional[str] = None,
) -> str:
    global _runtime_preferred_model
    client = _get_client()
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is missing. Set it in backend/.env.")
    if not client:
        raise RuntimeError("Groq client could not be created. Check SDK installation and API key.")

    model_candidates = []
    if _runtime_preferred_model:
        model_candidates.append(_runtime_preferred_model)
    if preferred_model:
        model_candidates.append(preferred_model)
    model_candidates.append(settings.groq_model)
    model_candidates.extend(DEFAULT_MODEL_FALLBACKS)
    # Preserve order while removing duplicates.
    seen = set()
    model_candidates = [m for m in model_candidates if not (m in seen or seen.add(m))]
    last_exception = None
    run_temperature = settings.groq_temperature if temperature is None else temperature

    for model_name in model_candidates:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=run_temperature,
            )
            _runtime_preferred_model = model_name
            return (response.choices[0].message.content or "").strip()
        except Exception as exc:
            last_exception = exc
            error_text = str(exc).lower()
            if _runtime_preferred_model and model_name == _runtime_preferred_model:
                _runtime_preferred_model = None
            if (
                "decommissioned" in error_text
                or ("model" in error_text and "not found" in error_text)
                or "rate limit" in error_text
                or "rate_limit_exceeded" in error_text
                or "404" in error_text
            ):
                continue
            break

    raise RuntimeError(f"Groq request failed across models: {last_exception}")


def analyze_user_query(
    user_input: str,
    conversation_history: Optional[List[Dict[str, Any]]] = None,
    known_order_id: str = "",
) -> Dict[str, Any]:
    conversation_history = conversation_history or []
    history_text = "\n".join(
        [f"{item.get('sender', 'user')}: {item.get('text', '')}" for item in conversation_history[-10:]]
    )

    prompt = f"""
Analyze this e-commerce support message and return STRICT JSON only:
{{
  "intent": "order_not_delivered|refund_delay|wrong_product|payment_issue",
  "emotion": "angry|frustrated|calm",
  "order_id": "string_or_empty",
  "confidence": 0.0
}}

Known order_id from previous conversation: {known_order_id or "none"}

Conversation history:
{history_text}

User message:
{user_input}
"""

    raw = call_llm(
        "You are a strict JSON analyzer. Never return markdown.",
        prompt,
        temperature=0.0,
        preferred_model=settings.groq_fast_model,
    )
    parsed = _extract_json(raw)

    if not parsed:
        raise RuntimeError("LLM did not return valid JSON for query analysis.")

    return {
        "intent": str(parsed.get("intent", "")).strip(),
        "emotion": str(parsed.get("emotion", "")).strip(),
        "order_id": str(parsed.get("order_id", "")).strip(),
        "confidence": float(parsed.get("confidence", 0.0)),
    }


def generate_chat_result(
    *,
    user_input: str,
    analysis: Dict[str, Any],
    issue_data: Optional[Dict[str, Any]],
    order_data: Optional[Dict[str, Any]],
    etiquette_rules: Optional[List[str]],
    issues_catalog: Optional[List[Dict[str, Any]]],
    recent_orders: Optional[List[Dict[str, Any]]],
    conversation_history: Optional[List[Dict[str, Any]]],
    known_order_id: str,
) -> Dict[str, Any]:
    issue_json = json.dumps(issue_data or {}, ensure_ascii=True)
    issue_solution = str((issue_data or {}).get("solution", "")).strip()
    order_json = json.dumps(order_data or {}, ensure_ascii=True)
    etiquette_json = json.dumps(etiquette_rules or [], ensure_ascii=True)
    catalog_json = json.dumps(issues_catalog or [], ensure_ascii=True)
    recent_orders_json = json.dumps(recent_orders or [], ensure_ascii=True)
    analysis_json = json.dumps(analysis, ensure_ascii=True)
    history_json = json.dumps(conversation_history or [], ensure_ascii=True)
    last_bot_reply = ""
    for item in reversed(conversation_history or []):
        if item.get("sender") == "bot" and item.get("text"):
            last_bot_reply = str(item.get("text"))
            break

    prompt = f"""
You are a professional e-commerce support AI.
Use provided database context and user message to generate final result.

User message:
{user_input}

Initial analysis:
{analysis_json}

Conversation history:
{history_json}

Known order_id from memory:
{known_order_id or "none"}

Issue mapped by intent:
{issue_json}

Primary solution from issues table:
{issue_solution or "none"}

Order mapped by order_id:
{order_json}

Etiquette rules:
{etiquette_json}

Related issues (database):
{catalog_json}

Recent order references (database):
{recent_orders_json}

Rules:
- If known_order_id is present OR analysis.order_id is present, treat order id as already provided.
- Do NOT ask user to provide/reconfirm order id again when it is already known.
- If order_data exists, use its status/delivery_date in response.
- If order_data is null but order id is known, acknowledge lookup limitation and guide the user with the next best action.
- If Primary solution from issues table is present, use that as the main troubleshooting action.
- If Primary solution is empty, pick the closest item from Related issues and use its solution.
- If issue_data.category is basic_ai_fallback, still follow it as valid guidance.
- Apply etiquette rules in tone when they are present.
- Respond quickly and directly; avoid filler.
- Do NOT say: "please give me a moment", "this may take a few seconds", "I am checking now".
- Do NOT use waiting phrases like "I will check", "I am looking into this", or "please wait".
- Response must be short: maximum 2 sentences and under 35 words.
- Include one concrete next step in the response.
- Avoid repeating the exact same wording from prior assistant response.
- Keep response practical, empathetic, and varied in phrasing.
- Set "escalate" to true only when user explicitly asks for a human agent OR user is angry/frustrated and issue remains unresolved after repeated attempts.
- If "escalate" is false, do not mention handoff to human agent in response.

Previous assistant reply to avoid repeating:
{last_bot_reply or "none"}

Return STRICT JSON only:
{{
  "intent": "order_not_delivered|refund_delay|wrong_product|payment_issue",
  "emotion": "angry|frustrated|calm",
  "response": "human-like and actionable response",
  "escalate": true_or_false,
  "summary": "single-line summary (always non-empty)",
  "resolved": false,
  "order_id": "current_order_id_or_empty"
}}
"""

    raw = call_llm(
        "Return strict JSON only. No prose outside JSON.",
        prompt,
        temperature=0.25,
        preferred_model=settings.groq_fast_model,
    )
    parsed = _extract_json(raw)

    if not parsed:
        raise RuntimeError("LLM did not return valid JSON for chat response.")
    response_text = str(parsed.get("response", "")).strip()

    return {
        "intent": str(parsed.get("intent", "")).strip(),
        "emotion": str(parsed.get("emotion", "")).strip(),
        "response": response_text,
        "escalate": bool(parsed.get("escalate", False)),
        "summary": str(parsed.get("summary", "")).strip(),
        "resolved": bool(parsed.get("resolved", False)),
        "order_id": str(parsed.get("order_id", "")).strip(),
    }
