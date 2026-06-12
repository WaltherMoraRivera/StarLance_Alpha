from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "starlance"
    SECRET_KEY: str = "starlance-secret-key-mora-rivera-2026-dev-only"
    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env"}


settings = Settings()
