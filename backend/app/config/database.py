from supabase import create_client
from app.config.settings import settings


def _create_supabase_client():
    if not settings.supabase_url or not settings.supabase_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_key)

supabase = _create_supabase_client()
