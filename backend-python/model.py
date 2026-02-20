from langchain_huggingface import HuggingFacePipeline
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import torch
from dotenv import load_dotenv

device = 0 if torch.cuda.is_available() else -1

llm = HuggingFacePipeline.from_model_id(
    model_id="google/flan-t5-base",
    task="text2text-generation",
    device=device,
    pipeline_kwargs={"max_new_tokens": 150, "temperature": 0.0}
)

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/multi-qa-mpnet-base-dot-v1")

pdf_loader = PyPDFLoader("BHMRC Hospital Data.pdf")
hospital_data = pdf_loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
hospital_chunks = text_splitter.split_documents(hospital_data)

print(f"Loaded {len(hospital_chunks)} chunks from PDF")

vectorstore = FAISS.from_documents(hospital_chunks, embedding_model)

small_talk = [
    "how are you", "hello", "hi", "hey", "who are you", "what is your name",
    "thank you", "thanks", "good morning", "good evening"
]

def ask_llm_direct(query: str) -> str:
    prompt = f"Answer briefly like a helpful assistant:\n\nQuestion: {query}\n\nAnswer:"
    return str(llm.invoke(prompt)).strip()

def ask_from_knowledge_base(query: str) -> str:
    docs = vectorstore.similarity_search(query, k=3)
    if not docs:
        return "Sorry, I couldn’t find that in the hospital information."
    context = "\n".join([d.page_content for d in docs])
    prompt_text = f"""
You are an assistant for hospital information. 
Answer ONLY using the following hospital data. 
If the answer is not in the data, say: "Sorry, I couldn’t find that in the hospital information."

Hospital Data:
{context}

Question: {query}

Answer:
"""
    return str(llm.invoke(prompt_text)).strip().strip('"')

def ask_question(query: str):
    q_lower = query.lower()
    print(f"DEBUG: Processing Query: '{query}', Lower: '{q_lower}'")
    
    is_small_talk = any(phrase in q_lower for phrase in small_talk)
    print(f"DEBUG: Small Chat Detected: {is_small_talk}")

    if is_small_talk:
        return ask_llm_direct(query)
    return ask_from_knowledge_base(query)

if __name__ == "__main__":
    print("Assistant ready! (type 'exit' to quit)")
    while True:
        query = input("\nYou: ").strip()
        if query.lower() in ["exit", "quit", "stop"]:
            print("Assistant: Goodbye! 👋")
            break
        answer = ask_question(query)
        print("Assistant:", answer)
