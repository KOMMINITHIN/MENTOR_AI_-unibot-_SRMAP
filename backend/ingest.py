import os
import glob
import requests
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_STORE_PATH = "faiss_index.bin"
DOCS_STORE_PATH = "docs_store.npy"
LINKS_PATH = "links.txt"
PDFS_DIR = "pdfs"
CHUNK_SIZE = 400  # characters
CHUNK_OVERLAP = 50

model = SentenceTransformer(EMBEDDING_MODEL)

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        if len(chunk.strip()) > 50:  # skip tiny chunks
            chunks.append(chunk.strip())
        start += chunk_size - overlap
    return chunks

def extract_text_from_url(url):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        # Remove scripts/styles
        for tag in soup(["script", "style", "header", "footer", "nav"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return text
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = " ".join(page.extract_text() or "" for page in reader.pages)
        return text
    except Exception as e:
        print(f"[ERROR] Failed to read {pdf_path}: {e}")
        return ""

def main():
    docs = []
    embeddings = []

    # Ingest URLs
    if os.path.exists(LINKS_PATH):
        with open(LINKS_PATH, "r", encoding="utf-8") as f:
            urls = [line.strip() for line in f if line.strip()]
        for url in urls:
            print(f"[INFO] Processing URL: {url}")
            text = extract_text_from_url(url)
            for chunk in chunk_text(text):
                docs.append({"text": chunk, "source": url})
    else:
        print(f"[WARNING] {LINKS_PATH} not found.")

    # Ingest PDFs
    if os.path.exists(PDFS_DIR):
        pdf_files = glob.glob(os.path.join(PDFS_DIR, "*.pdf"))
        for pdf_path in pdf_files:
            print(f"[INFO] Processing PDF: {pdf_path}")
            text = extract_text_from_pdf(pdf_path)
            for chunk in chunk_text(text):
                docs.append({"text": chunk, "source": os.path.basename(pdf_path)})
    else:
        print(f"[WARNING] {PDFS_DIR} directory not found.")

    if not docs:
        print("[ERROR] No documents found to ingest.")
        return

    print(f"[INFO] Embedding {len(docs)} chunks...")
    texts = [d["text"] for d in docs]
    emb = model.encode(texts, show_progress_bar=True, batch_size=32).astype(np.float32)

    print(f"[INFO] Building FAISS index...")
    dim = emb.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(emb)
    faiss.write_index(index, VECTOR_STORE_PATH)
    np.save(DOCS_STORE_PATH, np.array(docs, dtype=object))
    print(f"[SUCCESS] Ingestion complete. {len(docs)} chunks indexed.")

if __name__ == "__main__":
    main() 