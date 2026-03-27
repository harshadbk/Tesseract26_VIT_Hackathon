import sys
import os
from unittest.mock import MagicMock, patch

# Add app to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock settings and groq before importing llm_service
from app.config.settings import settings

with patch('app.services.llm_service._get_client') as mock_get_client:
    from app.services.llm_service import analyze_user_query, generate_chat_result

    def test_analyze_user_query_prompt():
        user_input = "Where is my order?"
        history = [
            {"role": "user", "content": "My order #12345 is late.", "emotion": "calm"},
            {"role": "assistant", "content": "I can help with that.", "emotion": "calm"},
        ]
        
        with patch('app.services.llm_service.call_llm') as mock_call_llm:
            mock_call_llm.return_value = '{"intent": "order_not_delivered", "emotion": "calm", "order_id": "12345", "confidence": 0.9}'
            
            analyze_user_query(user_input, conversation_history=history, known_order_id="12345")
            
            # Check the prompt passed to call_llm
            args, kwargs = mock_call_llm.call_args
            prompt = args[1]
            
            assert "user: My order #12345 is late." in prompt
            assert "assistant: I can help with that." in prompt
            assert "User message:\nWhere is my order?" in prompt
            print("✓ analyze_user_query prompt test passed")

    def test_generate_chat_result_prompt():
        user_input = "Thanks"
        analysis = {"intent": "order_not_delivered", "emotion": "calm", "order_id": "12345"}
        history = [
            {"role": "user", "content": "Where is my order?"},
            {"role": "assistant", "content": "It is on the way."},
        ]
        
        with patch('app.services.llm_service.call_llm') as mock_call_llm:
            mock_call_llm.return_value = '{"intent": "order_not_delivered", "emotion": "calm", "response": "You are welcome!", "escalate": false, "summary": "Done"}'
            
            generate_chat_result(
                user_input=user_input,
                analysis=analysis,
                issue_data={},
                order_data={},
                etiquette_rules=[],
                issues_catalog=[],
                recent_orders=[],
                conversation_history=history,
                known_order_id="12345"
            )
            
            args, kwargs = mock_call_llm.call_args
            prompt = args[1]
            
            # Check for JSON representation of history in the prompt
            assert '"role": "user"' in prompt
            assert '"content": "Where is my order?"' in prompt
            assert '"role": "assistant"' in prompt
            assert '"content": "It is on the way."' in prompt
            assert "Previous assistant reply to avoid repeating:\nIt is on the way." in prompt
            print("✓ generate_chat_result prompt test passed")

    if __name__ == "__main__":
        try:
            test_analyze_user_query_prompt()
            test_generate_chat_result_prompt()
            print("\nLLM Prompt construction tests passed!")
        except Exception as e:
            print(f"\nTests failed: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
