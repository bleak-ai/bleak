from pydantic import BaseModel, Field

class Configuration(BaseModel):
    """Application configuration"""
    model_name: str = "gemma3:4b"
    temperature: float = 0.7
    ollama_base_url: str = Field(
    default="http://localhost:11434/",
    title="Ollama Base URL",
    description="Base URL for Ollama API"
)