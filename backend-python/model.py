import os

# Global variables for lazy loading
_llm = None
_embedding_model = None
_vectorstore = None

def get_llm():
    global _llm
    if _llm is None:
        print("Loading LLM model (flan-t5-small)...")
        import torch
        from langchain_huggingface import HuggingFacePipeline
        
        device = 0 if torch.cuda.is_available() else -1
        _llm = HuggingFacePipeline.from_model_id(
            model_id="google/flan-t5-small",
            task="text2text-generation",
            device=device,
            pipeline_kwargs={"max_new_tokens": 150, "temperature": 0.0}
        )
    return _llm

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading Embedding model (MiniLM)...")
        from langchain_huggingface import HuggingFaceEmbeddings
        # Switching to a much lighter embedding model
        _embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embedding_model

def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        print("Initializing Knowledge Base...")
        from langchain_community.vectorstores import FAISS
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        
        pdf_path = "BHMRC Hospital Data.pdf"
        if not os.path.exists(pdf_path):
            print(f"Error: PDF file {pdf_path} not found.")
            return None
            
        pdf_loader = PyPDFLoader(pdf_path)
        hospital_data = pdf_loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        hospital_chunks = text_splitter.split_documents(hospital_data)
        
        print(f"Loaded {len(hospital_chunks)} chunks from PDF")
        _vectorstore = FAISS.from_documents(hospital_chunks, get_embedding_model())
    return _vectorstore

small_talk = [
    "how are you", "hello", "hi", "hey", "who are you", "what is your name",
    "thank you", "thanks", "good morning", "good evening"
]

def ask_llm_direct(query: str) -> str:
    llm = get_llm()
    prompt = f"Answer briefly like a helpful assistant:\n\nQuestion: {query}\n\nAnswer:"
    return str(llm.invoke(prompt)).strip()

def ask_from_knowledge_base(query: str) -> str:
    vs = get_vectorstore()
    if vs is None:
         return "I'm sorry, I'm having trouble accessing my knowledge base."
         
    docs = vs.similarity_search(query, k=3)
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
    llm = get_llm()
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
    print("Assistant ready! (Note: models will load on first request)")
    while True:
        query = input("\nYou: ").strip()
        if query.lower() in ["exit", "quit", "stop"]:
            print("Assistant: Goodbye! 👋")
            break
        answer = ask_question(query)
        print("Assistant:", answer)
