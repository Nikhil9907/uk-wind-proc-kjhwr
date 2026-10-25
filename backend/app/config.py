from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "UK Wind Day-Ahead Procurement Analytics"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Elexon BMRS Stream Endpoints
    ELEXON_FUELHH_URL: str = "https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream"
    ELEXON_WINDFOR_URL: str = "https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream"

    class Config:
        env_file = ".env"

settings = Settings()
