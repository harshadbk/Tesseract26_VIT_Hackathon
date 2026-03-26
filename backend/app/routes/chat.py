from fastapi import APIRouter, HTTPException
import re
from app.models.schemas import UserQuery
from app.services.db_service import (
    get_etiquettes,
    get_issue_by_intent,
    find_issue_candidates,
    get_order_by_id,
    save_escalation,
)
from app.services.conversation_memory_service import (
    append_history,
    clear_order_id,
    get_user_state,
    set_order_id,
)
from app.services.llm_service import analyze_user_query, generate_chat_result, quick_analyze_user_query

router = APIRouter()
_ALLOWED_INTENTS = {"order_not_delivered", "refund_delay", "wrong_product", "payment_issue"}
_HANDOFF_RESPONSE_TEXT = "I understand this is frustrating. I'm connecting you with a specialist from our team who can investigate this further for you. They will be with you shortly."
_WAITING_RESPONSE_TEXT = "I've already requested a specialist to join our conversation. They are checking your details now and will message you here as soon as they are ready. Thanks for your patience!"


@router.get("/chat/history/{user_id}")
def get_history(user_id: str):
    try:
        state = get_user_state(user_id)
        return {
            "user_id": user_id,
            "history": state.get("history", []),
            "order_id": state.get("order_id", "")
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {exc}")



_HUMAN_HANDOFF_PHRASES = [
    "human agent",
    "real agent",
    "real person",
    "connect me to agent",
    "talk to agent",
    "talk to human",
    "contact you shortly",
    "assist with your issue",
    "customer care executive",
    "escalate this issue",
    "escalate to our team",
    "wait for our team's response",
    "investigate further",
    "please escalate",
]


_EMOTION_RANK = {"calm": 0, "frustrated": 1, "angry": 2}
_UNRESOLVED_SIGNAL_RE = re.compile(
    r"\bagain\b|\bstill\b|not\s+(resolved|solved|fixed)|same\s+issue|no\s+update|not\s+helpful",
    flags=re.IGNORECASE,
)
_FOLLOWUP_WAIT_RE = re.compile(
    r"\b(update|status|any update|when|eta|how long|reply|response|agent update)\b",
    flags=re.IGNORECASE,
)
_DIRECT_HANDOFF_RE = re.compile(
    r"(escalat|connect\s+me|talk\s+to|speak\s+to|transfer\s+me|real\s+agent|real\s+person|human\s+agent\s+please)",
    flags=re.IGNORECASE,
)
_GRATITUDE_RE = re.compile(r"\b(thanks|thank\s*you|thx|tks|thanku|tysm)\b", flags=re.IGNORECASE)


def _build_basic_issue_fallback(intent: str) -> dict:
    return {
        "intent": intent,
        "issue": f"Auto fallback for {intent}",
        "solution": "Understand the issue, provide one concrete next step, and escalate when user remains unhappy.",
        "category": "basic_ai_fallback",
    }





def _needs_human_handoff(text: str) -> bool:
    lower_text = str(text or "").strip().lower()
    if any(phrase in lower_text for phrase in _HUMAN_HANDOFF_PHRASES):
        return True
    # Catch generic escalation wording that may vary slightly.
    if "escalat" in lower_text and (
        "team" in lower_text or "agent" in lower_text or "investigat" in lower_text or "wait for" in lower_text
    ):
        return True
    return False


def _count_recent_negative_user_turns(history: list, limit: int = 15) -> int:
    turns = history[-limit:] if history else []
    count = 0
    for item in turns:
        if str(item.get("role", "")).strip().lower() != "user":
            continue
        emotion = str(item.get("emotion", "")).strip().lower()
        content = str(item.get("content", ""))
        if emotion in {"frustrated", "angry"} or _needs_human_handoff(content):
            count += 1
    return count


def _already_waiting_human_agent(history: list, limit: int = 15) -> bool:
    turns = history[-limit:] if history else []
    last_assistant_content = ""
    for item in reversed(turns):
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", ""))
        if role != "assistant":
            continue
        last_assistant_content = content.strip()
        break
    if not last_assistant_content:
        return False
    return last_assistant_content in {_HANDOFF_RESPONSE_TEXT, _WAITING_RESPONSE_TEXT}


def _merge_emotion(primary: str, secondary: str) -> str:
    first = str(primary or "calm").strip().lower()
    second = str(secondary or "calm").strip().lower()
    if first not in _EMOTION_RANK:
        first = "calm"
    if second not in _EMOTION_RANK:
        second = "calm"
    return first if _EMOTION_RANK[first] >= _EMOTION_RANK[second] else second


def _has_unresolved_signal(text: str) -> bool:
    return bool(_UNRESOLVED_SIGNAL_RE.search(str(text or "")))


def _count_recent_same_intent_turns(history: list, intent: str, limit: int = 15) -> int:
    if not history:
        return 0
    target_intent = str(intent or "").strip()
    if not target_intent:
        return 0
    count = 0
    for item in history[-limit:]:
        if str(item.get("role", "")).strip().lower() != "user":
            continue
        content = str(item.get("content", ""))
        if not content:
            continue
        item_intent = str(quick_analyze_user_query(content).get("intent", "")).strip()
        if item_intent == target_intent:
            count += 1
    return count


def _is_handoff_followup_query(text: str) -> bool:
    normalized = str(text or "")
    if _FOLLOWUP_WAIT_RE.search(normalized):
        return True
    lowered = normalized.lower()
    return "human agent" in lowered and any(word in lowered for word in ["update", "when", "reply", "response"])


def _is_direct_handoff_request(text: str) -> bool:
    return bool(_DIRECT_HANDOFF_RE.search(str(text or "")))


def _is_gratitude_message(text: str) -> bool:
    normalized = str(text or "").strip().lower()
    if not normalized or not _GRATITUDE_RE.search(normalized):
        return False
    if any(token in normalized for token in ["but", "still", "again", "issue", "problem", "not "]):
        return False
    return len(normalized.split()) <= 8


def _infer_recent_intent(history: list) -> str:
    for item in reversed(history or []):
        if str(item.get("role", "")).strip().lower() != "user":
            continue
        user_content = str(item.get("content", "")).strip()
        if not user_content:
            continue
        inferred = str(quick_analyze_user_query(user_content).get("intent", "")).strip()
        if inferred in _ALLOWED_INTENTS:
            return inferred
    return "payment_issue"


@router.post("/chat")
def chat(query: UserQuery):
    try:
        user_input = query.message
        user_id = query.user_id or "default_user"
        state = get_user_state(user_id)
        conversation_history = state.get("history", [])
        known_order_id = state.get("order_id", "")
        prompt_history = conversation_history[-15:]

        print(f"[CHAT] Request received from user: {user_id}")

        if _is_gratitude_message(user_input):
            quick_intent = _infer_recent_intent(conversation_history)
            gratitude_response = (
                "You're welcome. If you want more details, share your order ID and what you want to check "
                "(delivery, refund, or payment), and I will help right away."
            )
            append_history(user_id, "user", user_input, "calm")
            append_history(user_id, "assistant", gratitude_response, "calm")
            return {
                "success": True,
                "intent": quick_intent,
                "emotion": "calm",
                "response": gratitude_response,
                "message": gratitude_response,
                "escalate": False,
                "summary": "User acknowledged response; assistant asked for more details.",
            }

        print(f"[CHAT] Performing query analysis for: '{user_input[:50]}...'")
        quick_analysis = quick_analyze_user_query(user_input, known_order_id=known_order_id)
        analysis = dict(quick_analysis)
        if quick_analysis.get("confidence", 0) < 0.68:
            try:
                analysis = analyze_user_query(
                    user_input,
                    conversation_history=prompt_history,
                    known_order_id=known_order_id,
                )
            except Exception:
                # Keep service responsive even if LLM is unavailable/slow/invalid.
                analysis = dict(quick_analysis)
        normalized_intent = str(analysis.get("intent", "")).strip()
        if normalized_intent not in _ALLOWED_INTENTS:
            normalized_intent = str(quick_analysis.get("intent", "payment_issue")).strip()
        analysis["intent"] = normalized_intent
        # Use lexical emotion from the latest user message for stable escalation decisions.
        user_emotion = _merge_emotion(quick_analysis.get("emotion", "calm"), "calm")
        followup_handoff_query = _is_handoff_followup_query(user_input)
        user_requested_handoff = _is_direct_handoff_request(user_input) or (
            _needs_human_handoff(user_input) and not followup_handoff_query
        )
        prior_negative_turns = _count_recent_negative_user_turns(conversation_history)
        repeated_intent_turns = _count_recent_same_intent_turns(conversation_history, normalized_intent)
        has_unresolved_signal = _has_unresolved_signal(user_input)
        waiting_human_agent = _already_waiting_human_agent(conversation_history)

        if waiting_human_agent and followup_handoff_query:
            final_order_id = analysis.get("order_id") or known_order_id
            if final_order_id:
                set_order_id(user_id, final_order_id)

            append_history(user_id, "user", user_input, user_emotion)
            # We let the LLM generate a natural "wait" response instead of hardcoded text.
            analysis["waiting_escalation"] = True
        should_escalate_now = user_requested_handoff or user_emotion == "angry" or (
            user_emotion == "frustrated"
            and (has_unresolved_signal or repeated_intent_turns >= 1 or prior_negative_turns >= 2)
        )

        # Fast escalation path: skip retrieval + generation and hand off immediately.
        if should_escalate_now:
            final_order_id = analysis.get("order_id") or known_order_id
            if final_order_id:
                set_order_id(user_id, final_order_id)

            final_response = _HANDOFF_RESPONSE_TEXT
            final_summary = (
                f"Escalated for {normalized_intent.replace('_', ' ')} "
                f"(emotion={user_emotion}, repeated={repeated_intent_turns}, unresolved={has_unresolved_signal})."
            )
            append_history(user_id, "user", user_input, user_emotion)
            append_history(user_id, "assistant", final_response, "calm")
            save_escalation(
                summary=final_summary,
                emotion=user_emotion,
                intent=normalized_intent,
                order_id=final_order_id,
            )
            return {
                "success": True,
                "intent": normalized_intent,
                "emotion": user_emotion,
                "response": final_response,
                "message": final_response,
                "escalate": True,
                "summary": final_summary,
            }

        issue_data = get_issue_by_intent(normalized_intent)
        issue_candidates = []
        if not issue_data or not (issue_data.get("solution") or "").strip():
            issue_candidates = find_issue_candidates(user_input, normalized_intent, limit=3)
        if not issue_data and issue_candidates:
            issue_data = issue_candidates[0]
        if not issue_data:
            issue_data = _build_basic_issue_fallback(normalized_intent)
        effective_order_id = analysis.get("order_id") or known_order_id
        order_data = get_order_by_id(effective_order_id) if effective_order_id else None
        etiquette_rules = get_etiquettes()
        issues_catalog = issue_candidates if issue_candidates else [issue_data]
        recent_orders = [order_data] if order_data else []
        is_resolved = False

        print(f"[CHAT] Generating AI response for intent: {normalized_intent}")

        # All non-trivial flows now pass through the dynamic generator for voice-naturalness.
        try:
            result = generate_chat_result(
                user_input=user_input,
                analysis=analysis,
                issue_data=issue_data,
                order_data=order_data,
                etiquette_rules=etiquette_rules,
                issues_catalog=issues_catalog,
                recent_orders=recent_orders,
                conversation_history=prompt_history,
                known_order_id=known_order_id,
            )
            final_intent = str(result.get("intent", "")).strip() or normalized_intent
            if final_intent not in _ALLOWED_INTENTS:
                final_intent = normalized_intent
            final_response = str(result.get("response", "")).strip()
            final_summary = str(result.get("summary", "")).strip() or "Issue is being handled."
            final_order_id = result.get("order_id") or effective_order_id
            is_resolved = bool(result.get("resolved"))
        except Exception:
            result = {}
            final_intent = normalized_intent
            final_response = "I am having trouble processing that right now. Could you please share more details?"
            final_summary = f"Fallback response delivered for {normalized_intent.replace('_', ' ')}."
            final_order_id = effective_order_id
            is_resolved = False

        response_requests_handoff = _needs_human_handoff(final_response)
        model_requested_escalation = bool(result.get("escalate"))
        escalation_by_model = (response_requests_handoff or model_requested_escalation) and (
            user_requested_handoff
            or user_emotion == "angry"
            or (
                user_emotion == "frustrated"
                and (has_unresolved_signal or repeated_intent_turns >= 1 or prior_negative_turns >= 2)
            )
        )
        final_escalate = should_escalate_now or escalation_by_model
        if final_escalate:
            # We ensure the response reflects escalation naturally.
            final_summary = final_summary or f"Escalated for {final_intent.replace('_', ' ')}."
        if final_order_id:
            set_order_id(user_id, final_order_id)

        if is_resolved:
            clear_order_id(user_id)

        append_history(user_id, "user", user_input, user_emotion)
        append_history(user_id, "assistant", final_response, "calm")
        if final_escalate:
            save_escalation(
                summary=final_summary,
                emotion=user_emotion,
                intent=final_intent,
                order_id=(order_data or {}).get("id") or final_order_id,
            )

        print(f"[CHAT] Sending response. Intent: {final_intent}, Escalated: {final_escalate}")
        return {
            "success": True,
            "intent": final_intent,
            "emotion": user_emotion,
            "response": final_response,
            "message": final_response,  # Added for compatibility
            "escalate": final_escalate,
            "summary": final_summary,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {exc}") from exc
