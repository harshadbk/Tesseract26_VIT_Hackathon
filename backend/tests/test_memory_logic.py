import sys
import os
from datetime import datetime

# Add app to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.conversation_memory_service import append_history, get_user_state
from app.routes.chat import _count_recent_negative_user_turns, _already_waiting_human_agent

def test_memory_format():
    user_id = "test_user_1"
    append_history(user_id, "user", "Hello", "calm")
    append_history(user_id, "assistant", "Hi there!", "calm")
    
    state = get_user_state(user_id)
    history = state["history"]
    
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "Hello"
    assert history[1]["role"] == "assistant"
    assert history[1]["content"] == "Hi there!"
    print("✓ Memory format test passed")

def test_negative_turns_counting():
    user_id = "test_user_2"
    history = [
        {"role": "user", "content": "I am angry", "emotion": "angry"},
        {"role": "assistant", "content": "Sorry", "emotion": "calm"},
        {"role": "user", "content": "Still not fixed", "emotion": "frustrated"},
    ]
    
    count = _count_recent_negative_user_turns(history)
    assert count == 2
    print("✓ Negative turns counting test passed")

def test_waiting_agent_detection():
    history = [
        {"role": "user", "content": "Help me"},
        {"role": "assistant", "content": "Sent to human agent. Please wait for their response."},
    ]
    assert _already_waiting_human_agent(history) == True
    
    history2 = [
        {"role": "user", "content": "Help me"},
        {"role": "assistant", "content": "I can help with that."},
    ]
    assert _already_waiting_human_agent(history2) == False
    print("✓ Waiting agent detection test passed")

if __name__ == "__main__":
    try:
        test_memory_format()
        test_negative_turns_counting()
        test_waiting_agent_detection()
        print("\nAll internal logic tests passed!")
    except Exception as e:
        print(f"\nTests failed: {e}")
        sys.exit(1)
