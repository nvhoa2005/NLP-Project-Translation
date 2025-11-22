import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import MarianTokenizer, MarianMTModel

# --- Load Hugging Face model ---
MODEL_ID = "nvh1101/Translation"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"➡️ Loading model '{MODEL_ID}' from Hugging Face...")
tokenizer = MarianTokenizer.from_pretrained(MODEL_ID)
model = MarianMTModel.from_pretrained(MODEL_ID)
model.to(device)
model.eval()
print(f"✅ Model loaded and ready on {device}")

# --- FastAPI app ---
app = FastAPI()

class TranslateRequest(BaseModel):
    text: str

@app.post("/translate")
def translate(req: TranslateRequest):
    text = req.text.strip()
    if not text:
        return {"translation": ""}
    
    # Tokenize & translate
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        outputs = model.generate(**inputs, max_length=256, num_beams=4, early_stopping=True)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return {"translation": result}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting translation API...")
    uvicorn.run("server.local_translate:app", host="127.0.0.1", port=8000, reload=True)
