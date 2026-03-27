from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL:        str = "postgresql://agri_user:agri_pass@db:5432/agribridge"
    JWT_SECRET:          str = "dev_secret_change_in_production"
    JWT_ALGO:            str = "HS256"
    JWT_EXPIRE_MINUTES:  int = 60 * 24 * 7  # 7 days
    APP_ENV:             str = "development"
    DEV_OTP:             str = "123456"
    WEATHER_API_PROVIDER: str = "open-meteo"
    WEATHER_API_TIMEOUT_SECONDS: int = 10
    WEATHER_ALERT_COUNTRY_CODE: str = "RW"

    class Config:
        env_file = ".env"

settings = Settings()
