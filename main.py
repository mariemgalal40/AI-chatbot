import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError, StringConstraints, field_validator
from typing import Annotated
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import Ollama
from langchain.chains.question_answering import load_qa_chain

app = FastAPI()

# CORS for frontend (adjust if deploying)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_pdfs"
VECTOR_DB_DIR = "chroma_db"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class QuestionInput(BaseModel):
    question: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]

    @field_validator("question")
    def check_valid_question(cls, v: str) -> str:
        if v.isdigit():
            raise ValueError("This is not a valid question — only a number was entered.")
        if not any(char.isalpha() for char in v):
            raise ValueError("This is not a valid question — it must include letters.")
        return v

# Utility functions
def load_pdf(file_path):
    loader = PyPDFLoader(file_path)
    return loader.load()

def split_documents(documents, chunk_size=1000, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_documents(documents)

def create_or_load_vectorstore(docs, persist_directory=VECTOR_DB_DIR):
    if os.path.exists(persist_directory):
        return Chroma(persist_directory=persist_directory,
                      embedding_function=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"))
    else:
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectordb = Chroma.from_documents(docs, embedding=embeddings, persist_directory=persist_directory)
        vectordb.persist()
        return vectordb

def ask_question(question, docs):
    llm = Ollama(model="llama3")
    chain = load_qa_chain(llm, chain_type="stuff")
    return chain.run(input_documents=docs, question=question)

# In-memory vector store (replaceable)
vectordb = None

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global vectordb

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    file_path = os.path.join(UPLOAD_DIR, "uploaded.pdf")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Process PDF
    raw_docs = load_pdf(file_path)
    docs = split_documents(raw_docs)
    vectordb = create_or_load_vectorstore(docs)

    return {"message": "PDF uploaded and processed successfully."}

@app.post("/ask-question")
async def handle_question(input_data: QuestionInput):
    global vectordb

    if vectordb is None:
        raise HTTPException(status_code=400, detail="No document uploaded yet.")

    try:
        docs = vectordb.similarity_search(input_data.question, k=3)
        answer = ask_question(input_data.question, docs)
        source_texts = [doc.page_content for doc in docs]

        return {
            "answer": answer
            # ,"source_documents": source_texts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
