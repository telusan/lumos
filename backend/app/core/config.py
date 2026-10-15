import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lumos"
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "Lumos-super-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # Прямое подключение к вашей базе данных Neon
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_qN7dQxvgSftS@ep-long-dew-b4hnoa4b-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

    class Config:
        case_sensitive = True

settings = Settings()
