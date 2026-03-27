from datetime import datetime, timezone
from typing import Any, Dict, List

from app.services.db_service import save_chat_message, get_chat_history

_ORDER_CACHE: Dict[str, str] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user_state(user_id: str) -> Dict[str, Any]:
    """
    Returns the user state including order_id and recent history.
    History is fetched from Supabase.
    """
    key = user_id or "default_user"
    history = get_chat_history(key, limit=30)
    
    return {
        "order_id": _ORDER_CACHE.get(key, ""),
        "history": history,
        "updated_at": _now_iso(),
    }


def append_history(user_id: str, role: str, content: str, emotion: str = "") -> None:
    """Saves a message to Supabase."""
    save_chat_message(user_id, role, content, emotion)


def set_order_id(user_id: str, order_id: str) -> None:
    _ORDER_CACHE[user_id] = (order_id or "").strip()


def clear_order_id(user_id: str) -> None:
    _ORDER_CACHE[user_id] = ""


def list_user_states() -> Dict[str, Dict[str, Any]]:
    snapshot: Dict[str, Dict[str, Any]] = {}
    for user_id, state in _MEMORY.items():
        snapshot[user_id] = {
            "order_id": state.get("order_id", ""),
            "history": list(state.get("history", [])),
            "created_at": state.get("created_at"),
            "updated_at": state.get("updated_at"),
        }
    return snapshot
