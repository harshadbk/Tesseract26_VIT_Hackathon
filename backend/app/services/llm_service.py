import os
import weaviate
from dotenv import load_dotenv

# LangChain
from langchain_community.vectorstores import Weaviate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.memory import ConversationBufferMemory
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.prompts import PromptTemplate
from langchain_groq import ChatGroq


# ---------------- ENV ----------------
load_dotenv()

WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")
WEAVIATE_URL = os.getenv("WEAVIATE_CLUSTER")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# ---------------- GLOBALS ----------------
vector_db = None
rag_chain = None


# ---------------- INIT FUNCTION ----------------
def initialize_rag():
    global vector_db, rag_chain

    if rag_chain is not None:
        return rag_chain

    print("🚀 Initializing RAG...")

    # ---------------- WEAVIATE ----------------
    auth_config = weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY)

    client = weaviate.Client(
        url=WEAVIATE_URL,
        auth_client_secret=auth_config,
        timeout_config=(15, 120),
    )

    # ---------------- EMBEDDINGS ----------------
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # ---------------- LOAD DATA ----------------
    folder_path = r"D:\React Develeoment\Tesseract26_VIT_Hackathon\backend\data"
    all_docs = []

    if not os.path.exists(folder_path):
        raise Exception(f"❌ Folder not found: {folder_path}")

    for file in os.listdir(folder_path):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(folder_path, file))
            pages = loader.load()

            for p in pages:
                p.metadata["source"] = file

            all_docs.extend(pages)

    print(f"✅ Loaded {len(all_docs)} pages")

    # ---------------- SPLIT ----------------
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50
    )

    docs = splitter.split_documents(all_docs)
    docs = docs[:20]  # limit for testing

    # ---------------- VECTOR STORE ----------------
    vector_db = Weaviate.from_documents(
        docs,
        embeddings,
        client=client,
        by_text=False
    )

    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    # ---------------- MEMORY ----------------
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )

    # ---------------- LLM ----------------
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.1-8b-instant"
    )

    # ---------------- PROMPT (🔥 MULTI-TASK AGENT WITH EMOTION & INTENSITY) ----------------
    prompt = PromptTemplate(
        input_variables=["context", "question", "chat_history"],
        template="""
You are an AI customer support assistant for an e-commerce platform.

Your tasks:
1. Detect user INTENT
2. Detect user EMOTION
3. Detect EMOTION INTENSITY (1-10)
4. Generate a helpful response

-------------------------

🎯 INTENTS:
- order_status
- order_delay
- refund_request
- cancellation
- order_id_issue
- payment_issue
- complaint
- general_query
- out_of_scope

-------------------------

💡 EMOTIONS:
- happy
- angry
- frustrated
- sad
- anxious
- neutral

-------------------------

⚠️ RULES:
- If query is NOT e-commerce → mark intent as out_of_scope
- NEVER hallucinate user data
- If info missing → ASK for it
- If user is angry/frustrated → be more polite + apologetic
- Keep response short (2–4 lines)

-------------------------

📌 OUTPUT FORMAT (STRICT):

Intent: <intent>
Emotion: <emotion>
Emotion Intensity: <1-10>
Response: <final answer>

-------------------------

Context:
{context}

Chat History:
{chat_history}

User Question:
{question}
"""
    )

    # ---------------- RAG CHAIN ----------------
    rag_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        combine_docs_chain_kwargs={"prompt": prompt},
        return_source_documents=True
    )

    print("✅ RAG Ready!")

    return rag_chain


# ---------------- MAIN FUNCTION ----------------
def generate_rag_chat_result(user_input: str):
    try:
        chain = initialize_rag()

        result = chain.invoke({
            "question": user_input
        })

        answer_text = result.get("answer", "")

        # Defaults
        intent = "general_query"
        emotion = "neutral"
        emotion_intensity = 5
        response = answer_text

        # ---------------- PARSE OUTPUT (STRICT FORMAT) ----------------
        # Expecting:
        # Intent: <intent>
        # Emotion: <emotion>
        # Emotion Intensity: <1-10>
        # Response: <final answer>
        if "Intent:" in answer_text and "Response:" in answer_text:
            # Split by 'Response:'
            parts = answer_text.split("Response:")
            header = parts[0]
            response = parts[1].strip()

            # Extract intent, emotion, emotion intensity
            if "Emotion Intensity:" in header:
                # Intent: ... Emotion: ... Emotion Intensity: ...
                try:
                    intent_part, rest = header.split("Emotion:")
                    intent = intent_part.replace("Intent:", "").strip()
                    emotion_part, intensity_part = rest.split("Emotion Intensity:")
                    emotion = emotion_part.strip()
                    emotion_intensity = int(intensity_part.strip())
                except Exception:
                    # fallback to basic parsing
                    if "Emotion:" in header:
                        intent = header.split("Emotion:")[0].replace("Intent:", "").strip()
                        emotion = header.split("Emotion:")[1].strip()
            elif "Emotion:" in header:
                intent = header.split("Emotion:")[0].replace("Intent:", "").strip()
                emotion = header.split("Emotion:")[1].strip()
            else:
                intent = header.replace("Intent:", "").strip()

        return {
            "intent": intent,
            "emotion": emotion,
            "emotion_intensity": emotion_intensity,
            "answer": response,
            "sources": [
                doc.metadata for doc in result.get("source_documents", [])
            ]
        }

    except Exception as e:
        return {
            "intent": "error",
            "answer": f"❌ Error: {str(e)}",
            "sources": []
        }