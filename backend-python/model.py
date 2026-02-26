import os
import gc

# Global variables for lazy loading
_llm = None
_embedding_model = None
_vectorstore = None
INDEX_PATH = "faiss_index"

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
        gc.collect() # Free up RAM
    return _llm

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading Embedding model (MiniLM)...")
        from langchain_huggingface import HuggingFaceEmbeddings
        _embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embedding_model

def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        from langchain_community.vectorstores import FAISS
        
        # 1. Try to load existing index from disk (Much faster!)
        if os.path.exists(INDEX_PATH):
            print("Loading Knowledge Base from disk...")
            _vectorstore = FAISS.load_local(INDEX_PATH, get_embedding_model(), allow_dangerous_deserialization=True)
        else:
            # 2. Build index from PDF if not found
            print("Knowledge Base index not found. Building from PDF (This may take a moment)...")
            from langchain_community.document_loaders import PyPDFLoader
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            
            pdf_path = "BHMRC Hospital Data.pdf"
            if not os.path.exists(pdf_path):
                print(f"Error: PDF file {pdf_path} not found.")
                return None
                
            pdf_loader = PyPDFLoader(pdf_path)
            hospital_data = pdf_loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=40)
            hospital_chunks = text_splitter.split_documents(hospital_data)
            
            print(f"Loaded {len(hospital_chunks)} chunks from PDF. Creating index...")
            _vectorstore = FAISS.from_documents(hospital_chunks, get_embedding_model())
            
            # Save to disk for next time
            _vectorstore.save_local(INDEX_PATH)
            print("Knowledge Base saved to disk ✅")
            
        gc.collect() # Free up RAM
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
    prompt_text = f"Use this data: {context}\nQuestion: {query}\nAnswer briefly:"
    
    llm = get_llm()
    return str(llm.invoke(prompt_text)).strip().strip('"')

def ask_question(query: str):
    q_lower = query.lower()
    is_small_talk = any(phrase in q_lower for phrase in small_talk)

    if is_small_talk:
        return ask_llm_direct(query)
    return ask_from_knowledge_base(query)
