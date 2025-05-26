"""Centralized LLM provider for the bleak interactive system."""

import os
from typing import Any, Optional, Type, Union, cast, TypeVar

from langchain_core.language_models import BaseChatModel
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from .configuration import Configuration

# Type variable for Pydantic models
T = TypeVar('T', bound=Any)

class LLMProvider:
    """Centralized provider for LLM models."""
    
    @staticmethod
    def get_llm(config: Configuration, structured_output: Optional[Type[T]] = None) -> Any:
        """Get the appropriate LLM based on configuration and environment.
        
        Args:
            config: Configuration object with LLM settings
            structured_output: Optional Pydantic model for structured output
            
        Returns:
            BaseChatModel or Runnable: The configured LLM model, potentially with structured output
        """
        # For now, we'll use OpenAI as the default LLM
        # Get OpenAI configuration from environment variables
        openai_model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        openai_base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        
        # Ensure the API key is set in the environment
        if "OPENAI_API_KEY" not in os.environ or not os.environ["OPENAI_API_KEY"]:
            raise ValueError("OPENAI_API_KEY environment variable must be set")
        
        # ChatOpenAI will automatically use OPENAI_API_KEY from environment
        llm = ChatOpenAI(
            model=openai_model,
            temperature=0,
            base_url=openai_base_url
        )
        print(f"Using OpenAI model: {openai_model}")
        
        # Add structured output if specified
        if structured_output:
            return llm.with_structured_output(structured_output)
        
        return llm 