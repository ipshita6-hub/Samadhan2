from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "support_tickets"
    firebase_credentials_path: Optional[str] = None
    cors_origins: str = "http://localhost:3000,https://master.d1z4pvdn033yh.amplifyapp.com"
    
    class Config:
        env_file = ".env"

settings = Settings()
