from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Explicitly load the .env file from the correct path
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    MONGODB_URI: str
    JWT_SECRET: str
    JWT_EXPIRES_IN: int

    class Config:
        # The env_file path is now handled by the explicit load_dotenv call
        pass

settings = Settings()