import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Smart Voice Agent")
    app_env: str = os.getenv("APP_ENV", "development")

    # Groq
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_fast_model: str = os.getenv("GROQ_FAST_MODEL", "llama-3.1-8b-instant")
    groq_temperature: float = float(os.getenv("GROQ_TEMPERATURE", "0.3"))

    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")

    # API behavior
    allow_mock_llm: bool = os.getenv("ALLOW_MOCK_LLM", "false").lower() == "true"


settings = Settings()
