

import sys
print("PYTHON EXECUTABLE:", sys.executable)
print("SYS PATH:", sys.path)

from fastapi import FastAPI
from pydantic import BaseModel
try:
    from model import ask_question  # your existing function
except ImportError as e:
    print(f"Import Error in model.py: {e}")
    # minimal mock for debugging if model fails
    def ask_question(q): return "Model Error"


from deep_translator import GoogleTranslator

app = FastAPI()

class Question(BaseModel):
    question: str
    lang: str = "en"

@app.post("/ask")
def ask_question_endpoint(q: Question):
    lang = q.lang
    query_text = q.question

    # 1. Translate User Query to English (if not EN)
    print(f"Incoming Request -> Question: {query_text}, Lang: {lang}")
    
    if lang != "en":
        try:
            print(f"Translating input from {lang} to English...")
            # Use specific language code instead of 'auto' for better accuracy
            query_text = GoogleTranslator(source=lang, target='en').translate(query_text)
            print(f"Translated Input: {query_text}")
        except Exception as e:
            print(f"Translation Error (Input): {e}")

    # 2. Get Answer from RAG Model (English)
    print("Getting answer from RAG model...")
    answer_text = ask_question(query_text)
    print(f"RAG Answer (English): {answer_text}")

    # 3. Translate Answer back to User Language (if not EN)
    if lang != "en":
        # Manual Fallback for common static messages (to save API calls / prevents failure)
        static_translations = {
            "hi": {
                "Sorry, I couldn": "क्षमा करें, मुझे अस्पताल की जानकारी में वह नहीं मिला।",
                "encounter": "मुझे खेद है, आपके अनुरोध को संसाधित करते समय एक त्रुटि हुई।"
            }
        }
        
        try:
            print(f"Translating answer to {lang}...")
            
            translated = False
            # Check manual dict first (Fuzzy Match)
            if lang in static_translations:
                for key, val in static_translations[lang].items():
                    if key in answer_text:
                        answer_text = val
                        translated = True
                        print(f"Translated Answer (Static): {answer_text}")
                        break
            
            if not translated:
                answer_text = GoogleTranslator(source='en', target=lang).translate(answer_text)
                print(f"Translated Answer: {answer_text}")
        except Exception as e:
            print(f"Translation Error (Output): {e}")

    return {"answer": answer_text}

# Test route
@app.get("/")
async def root():
    return {"message": "FastAPI server is running ✅"}


if __name__ == "__main__":
    import uvicorn
    import os
    print("Starting Server directly...")
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)

