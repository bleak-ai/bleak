# Bleak Backend

FastAPI backend with LangGraph integration for interactive AI conversations.

## Features

- **FastAPI Backend**: Modern, fast web API with automatic documentation
- **LangGraph Integration**: Interactive AI workflows with human-in-the-loop capabilities
- **Bleak Interactive System**: Multi-step conversation flow with clarifying questions
- **LangGraph Dev Tool**: Built-in development server for graph debugging and visualization

## Setup

### Prerequisites

- Python 3.12+
- OpenAI API key

### Installation

1. **Install dependencies**:

   ```bash
   uv sync
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Required environment variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
   ```

## Running the Application

### FastAPI Server

Start the FastAPI development server:

```bash
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### LangGraph Dev Tool

Start the LangGraph development server for graph visualization and debugging:

```bash
uv run langgraph dev
```

This will start the LangGraph Studio at http://localhost:8123 where you can:

- Visualize the graph structure
- Debug graph execution
- Test individual nodes
- Monitor state transitions

## API Endpoints

### Basic Endpoints

- `GET /` - Health check
- `GET /health` - Service health status
- `GET /debug` - Available endpoints list

### Chat Endpoints

- `POST /chat` - Basic chat functionality
- `POST /bleak/interactive` - Start interactive conversation with clarifying questions
- `POST /bleak/interactive/resume` - Resume conversation with user answers

### Interactive Workflow

The Bleak Interactive system follows this flow:

1. **Start**: Send a prompt to `/bleak/interactive`
2. **Clarify**: System generates clarifying questions
3. **Structure**: Questions are formatted for UI (radio/text inputs)
4. **Wait**: Execution pauses for human input
5. **Resume**: Send answers to `/bleak/interactive/resume`
6. **Answer**: System generates final answer with rating

#### Example Usage

**Start conversation**:

```bash
curl -X POST "http://localhost:8000/bleak/interactive" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the best region in Europe?"}'
```

**Resume with answers**:

```bash
curl -X POST "http://localhost:8000/bleak/interactive/resume" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "your_thread_id",
    "answered_questions": [
      {"question": "What qualities are you prioritizing?", "answer": "Natural beauty and affordability"},
      {"question": "What time of year?", "answer": "Summer"}
    ]
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── backend/
│   │   ├── main.py              # FastAPI application
│   │   └── graph.py             # Basic graph setup
│   ├── bleak_interactive/       # Interactive AI system
│   │   ├── graph/
│   │   │   ├── build_graph.py   # Graph construction
│   │   │   └── runner.py        # Graph execution
│   │   ├── nodes/               # Graph nodes
│   │   ├── models/              # Data models
│   │   ├── state.py             # Graph state definitions
│   │   ├── configuration.py     # Configuration
│   │   ├── llm_provider.py      # LLM abstraction
│   │   └── prompts.py           # Prompt templates
│   └── graph.py                 # Simple graph for basic chat
├── langgraph.json               # LangGraph configuration
├── pyproject.toml               # Project dependencies
└── .env.example                 # Environment template
```

## Development

### Adding New Nodes

1. Create a new node file in `src/bleak_interactive/nodes/`
2. Import and add to `src/bleak_interactive/nodes/__init__.py`
3. Add to the graph in `src/bleak_interactive/graph/build_graph.py`

### Modifying the Graph

Edit `src/bleak_interactive/graph/build_graph.py` to:

- Add new nodes
- Modify edges and flow
- Change interruption points
- Update state handling

### Testing

The graph can be tested independently:

```bash
# Test graph loading
python -c "import sys; sys.path.append('src'); from bleak_interactive.graph.build_graph import graph; print('Graph loaded successfully')"

# Test with LangGraph dev tool
uv run langgraph dev
```

## Configuration

### LLM Provider

The system uses OpenAI by default. Configure via environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-3.5-turbo)
- `OPENAI_BASE_URL`: API base URL (default: https://api.openai.com/v1)

### LangSmith (Optional)

For tracing and monitoring:

- `LANGCHAIN_TRACING_V2=true`
- `LANGCHAIN_API_KEY=your_langsmith_key`
- `LANGCHAIN_PROJECT=bleak-backend`

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're running from the backend directory
2. **Missing API key**: Check your `.env` file
3. **Port conflicts**: Change ports in commands if needed
4. **Graph loading errors**: Check the LangGraph dev tool output for details

### Debug Mode

Start the FastAPI server with debug logging:

```bash
PYTHONPATH=src uvicorn backend.main:app --reload --log-level debug
```
