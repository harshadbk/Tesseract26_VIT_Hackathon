from pydantic import BaseModel


class UserQuery(BaseModel):
    message: str
    user_id: str = "default_user"
