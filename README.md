# 📄 Your Smart Assistant is Here

Welcome to **Your Smart Assistant** — an AI-powered PDF assistant that lets you upload a PDF, ask questions about its content, and receive smart answers with highlighted references from the document.

---

## 🎥 Demo

![Demo](rag_llama3.gif)

> 📌 This video shows how the assistant works end-to-end. Try it yourself!

---

## 🚀 Features

- 📁 Upload PDF files
- 💬 Ask natural language questions
- 📌 Get answers with document highlights
- 🧠 Powered by **LLaMA 3** + **LangChain**
- 💻 FastAPI + React frontend

---

## 🛠️ Run Locally

### Backend
```bash
uvicorn main:app --reload
```

### Frontend
```bash
cd docu-ai-highlight-main
npm install
npm run dev
