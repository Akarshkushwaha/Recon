import os
from dotenv import load_dotenv

load_dotenv()

# LLM / AI API Keys (used by Cognee for ECL pipeline & embeddings)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Cognee Cloud / Remote Configuration (optional, self-hosted file-based by default)
COGNEE_API_URL = os.getenv("COGNEE_API_URL", "")
COGNEE_API_KEY = os.getenv("COGNEE_API_KEY", "")

# Default Data Storage paths for self-hosted Cognee (Kuzu graph + LanceDB vector + SQLite relational)
COGNEE_DATA_DIR = os.getenv("COGNEE_DATA_DIR", "./cognee_data")
