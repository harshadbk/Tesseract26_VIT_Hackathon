from fastapi import APIRouter, HTTPException, Path
from app.models.schemas import UserQuery
from app.services.llm_service import generate_rag_chat_result

router = APIRouter()

@router.get("/chat/history/{user_id}")
def get_chat_history(user_id: str = Path(...)):
    # Stub: always return empty history
    return {"history": []}

@router.post("/chat")
def chat(query: UserQuery):
    try:
        user_input = query.message
        rag_result = generate_rag_chat_result(user_input)
        return {
            "success": True,
            "response": rag_result["answer"],
            "sources": rag_result.get("sources", [])
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {exc}") from exc
