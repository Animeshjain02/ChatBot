try:
    import pypdf
    print("pypdf import success")
except ImportError as e:
    print(f"pypdf import failed: {e}")

try:
    import faiss
    print("faiss import success")
except ImportError as e:
    print(f"faiss import failed: {e}")

try:
    from sentence_transformers import SentenceTransformer
    print("sentence_transformers import success")
except ImportError as e:
    print(f"sentence_transformers import failed: {e}")

# Re-verify previous fixes
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    print("RecursiveCharacterTextSplitter import success")
except ImportError as e:
    print(f"RecursiveCharacterTextSplitter import failed: {e}")

try:
    from langchain_huggingface import HuggingFacePipeline
    print("HuggingFacePipeline import success")
except ImportError as e:
    print(f"HuggingFacePipeline import failed: {e}")
