import re
import time
from typing import Any, Dict, List, Optional, Tuple
from app.config.database import supabase

_CACHE_TTL_SECONDS = 30
_CACHE: Dict[str, Tuple[float, Any]] = {}


def _cache_get(key: str):
    entry = _CACHE.get(key)
    if not entry:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: Any, ttl_seconds: int = _CACHE_TTL_SECONDS):
    _CACHE[key] = (time.time() + ttl_seconds, value)
    return value


def _safe_execute(query):
    try:
        result = query.execute()
        return result.data or []
    except Exception:
        return []


def get_issue_by_intent(intent: str) -> Optional[Dict[str, Any]]:
    if not supabase:
        return None

    normalized_intent = _normalize_text(intent)
    if not normalized_intent:
        return None

    cached_rows = _cache_get("issues_catalog")
    if isinstance(cached_rows, list):
        for row in cached_rows:
            if _normalize_text(row.get("intent")) == normalized_intent:
                return row

    rows = _safe_execute(
        supabase.table("issues").select("*").eq("intent", intent).limit(1)
    )
    return rows[0] if rows else None


def get_issues_catalog(limit: int = 100) -> List[Dict[str, Any]]:
    if not supabase:
        return []

    cached_rows = _cache_get("issues_catalog")
    if isinstance(cached_rows, list):
        return cached_rows[:limit]

    rows = _safe_execute(
        supabase.table("issues").select("*").limit(limit)
    )
    _cache_set("issues_catalog", rows)
    return rows


def _normalize_text(value: Any) -> str:
    return str(value or "").strip().lower()


def _tokenize(text: str) -> List[str]:
    return [token for token in re.findall(r"[a-z0-9_]+", _normalize_text(text)) if len(token) > 2]


def find_issue_candidates(user_input: str, intent: str = "", limit: int = 5) -> List[Dict[str, Any]]:
    rows = get_issues_catalog(limit=80)
    if not rows:
        return []

    input_tokens = set(_tokenize(user_input))
    if not input_tokens and not intent:
        return []
    normalized_intent = _normalize_text(intent)
    scored: List[Tuple[float, Dict[str, Any]]] = []

    for row in rows:
        issue_text = _normalize_text(row.get("issue"))
        solution_text = _normalize_text(row.get("solution"))
        category_text = _normalize_text(row.get("category"))
        intent_text = _normalize_text(row.get("intent"))
        row_tokens = set(_tokenize(f"{issue_text} {solution_text} {category_text} {intent_text}"))

        overlap = len(input_tokens.intersection(row_tokens))
        score = float(overlap)
        if normalized_intent and intent_text == normalized_intent:
            score += 3.0
        if normalized_intent and normalized_intent in issue_text:
            score += 1.0

        if score > 0:
            scored.append((score, row))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [row for _, row in scored[:limit]]


def get_etiquettes() -> List[str]:
    if not supabase:
        return []

    cached_rules = _cache_get("etiquettes")
    if isinstance(cached_rules, list):
        return cached_rules

    rows = _safe_execute(supabase.table("etiquettes").select("rule"))
    rules = [item["rule"] for item in rows if item.get("rule")]
    _cache_set("etiquettes", rules)
    return rules


def get_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    if not supabase or not order_id:
        return None

    rows = _safe_execute(
        supabase.table("orders")
        .select("id,user_name,product,status,delivery_date")
        .eq("id", order_id)
        .limit(1)
    )
    return rows[0] if rows else None


def get_recent_orders(limit: int = 50) -> List[Dict[str, Any]]:
    if not supabase:
        return []

    return _safe_execute(
        supabase.table("orders")
        .select("id,user_name,product,status,delivery_date")
        .limit(limit)
    )


def get_recent_orders_by_user(user_name: str, limit: int = 3) -> List[Dict[str, Any]]:
    if not supabase or not user_name:
        return []

    return _safe_execute(
        supabase.table("orders")
        .select("id,user_name,product,status,delivery_date")
        .ilike("user_name", user_name)
        .limit(limit)
    )


def save_escalation(summary: str, emotion: str, intent: str = "unknown", order_id: str = None):
    if not supabase:
        return None

    payload = {
        "summary": summary,
        "emotion": emotion,
        "status": "open",
        "intent": intent,
    }
    if order_id:
        payload["order_id"] = order_id

    try:
        return supabase.table("escalations").insert(payload).execute()
    except Exception:
        return None


def save_chat_message(user_id: str, role: str, content: str, emotion: str = "calm"):
    """Saves a single chat message to Supabase chat_history table."""
    if not supabase:
        return None

    payload = {
        "user_id": user_id,
        "role": role,
        "content": content,
        "emotion": emotion,
    }

    try:
        return supabase.table("chat_history").insert(payload).execute()
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return None


def get_chat_history(user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
    """Retrieves recent chat history for a user from Supabase."""
    if not supabase:
        return []

    try:
        rows = _safe_execute(
            supabase.table("chat_history")
            .select("role,content,emotion,timestamp")
            .eq("user_id", user_id)
            .order("timestamp", desc=True)
            .limit(limit)
        )
        # Reverse to get chronological order
        return rows[::-1]
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []
