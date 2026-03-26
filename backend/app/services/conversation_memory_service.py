from datetime import datetime, timezone
from typing import Any, Dict, List

_MEMORY: Dict[str, Dict[str, Any]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _default_state() -> Dict[str, Any]:
    now = _now_iso()
    return {
        "order_id": "",
        "history": [],
        "created_at": now,
        "updated_at": now,
    }


def get_user_state(user_id: str) -> Dict[str, Any]:
    key = user_id or "default_user"
    if key not in _MEMORY:
        _MEMORY[key] = _default_state()
    return _MEMORY[key]


def append_history(user_id: str, sender: str, text: str, emotion: str = "") -> None:
    state = get_user_state(user_id)
    now = _now_iso()
    state["history"].append(
        {
            "sender": sender,
            "text": text,
            "emotion": emotion,
            "timestamp": now,
        }
    )
    # Keep bounded memory for stability/cost.
    state["history"] = state["history"][-20:]
    state["updated_at"] = now


def set_order_id(user_id: str, order_id: str) -> None:
    state = get_user_state(user_id)
    state["order_id"] = (order_id or "").strip()
    state["updated_at"] = _now_iso()


def clear_order_id(user_id: str) -> None:
    state = get_user_state(user_id)
    state["order_id"] = ""
    state["updated_at"] = _now_iso()


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
