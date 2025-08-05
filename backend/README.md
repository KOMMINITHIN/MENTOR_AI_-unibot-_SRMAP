# Mentor Chatbot Backend

This backend powers the Mentor chatbot for SRM University AP, providing university-specific and general answers using Retrieval-Augmented Generation (RAG) and the Groq LLM API.

## Features
- Answers all queries about SRM AP University using official sources
- Handles general and coding questions concisely
- Always responds in 2–3 user-friendly lines
- Cites the relevant SRM AP University webpage for university answers
- Batch ingestion of PDFs and website links

## Updating the Knowledge Base

1. **Add new SRM AP University links** to `links.txt`, one per line.
2. (Optional) Place university PDFs in the `pdfs/` folder.
3. Run the ingestion script:

```bash
python ingest.py
```

This will update the FAISS index and knowledge base with the latest content.

## Running the Backend

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

## How It Works
- When a user asks a question, the backend retrieves the most relevant SRM AP context and sends it to the LLM with a strict system prompt.
- If the answer is university-specific, the response includes a citation to the source webpage.
- For general/coding questions, the LLM answers concisely and professionally.

## Adding More Data
- Expand `links.txt` with more official SRM AP URLs.
- Add more PDFs to the `pdfs/` folder as needed.

## Contact
For more information, visit [SRM University AP](https://srmap.edu.in/).

## Endpoints
- `POST /ingest/pdf` — Upload PDF (form-data, key: `file`)
- `POST /ingest/url` — Ingest website (form-data, key: `url`)
- `POST /chat` — Chat endpoint (JSON: `{ "messages": [{"role": "user", "content": "..."}, ...] }`)

---
**Connect your Next.js frontend to `http://localhost:8000/chat` for chat.** 