import torch
import sys
import os
import sentencepiece as spm
from fastapi import FastAPI
from pydantic import BaseModel

# --- CẤU HÌNH PATH ---
# Trong Docker, mọi thứ nằm ở /code
BASE_DIR = "/code"
sys.path.append(os.path.join(BASE_DIR, "model_core"))

try:
    # Import từ folder model_core
    from model_core.transformer import Transformer
    from model_core.constants import (
        device, seq_len, pad_id, sos_id, eos_id, 
        src_model_prefix, trg_model_prefix
    )
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)

# --- LOAD RESOURCES ---
# Lưu ý: Trên HF Space dùng CPU, nên ép device là 'cpu'
device = torch.device('cpu') 

SP_DIR = os.path.join(BASE_DIR, "data", "sp")
CKPT_PATH = os.path.join(BASE_DIR, "saved_model", "best_ckpt.tar")

print("➡️ Loading SentencePiece...")
src_sp = spm.SentencePieceProcessor()
trg_sp = spm.SentencePieceProcessor()
src_sp.Load(os.path.join(SP_DIR, f"{src_model_prefix}.model"))
trg_sp.Load(os.path.join(SP_DIR, f"{trg_model_prefix}.model"))

src_vocab_size = src_sp.GetPieceSize()
trg_vocab_size = trg_sp.GetPieceSize()

print("➡️ Loading Transformer...")
model = Transformer(src_vocab_size, trg_vocab_size).to(device)

# Load Checkpoint
if os.path.exists(CKPT_PATH):
    checkpoint = torch.load(CKPT_PATH, map_location=device, weights_only=False)
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)
    model.eval()
    print("✅ Model Ready!")
else:
    print(f"❌ Checkpoint not found at {CKPT_PATH}")

# --- INFERENCE LOGIC ---
def pad_or_truncate(tokenized_text):
    if len(tokenized_text) < seq_len:
        tokenized_text += [pad_id] * (seq_len - len(tokenized_text))
    else:
        tokenized_text = tokenized_text[:seq_len]
    return tokenized_text

app = FastAPI()

class TranslateRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Translation API is running on Hugging Face Spaces!"}

@app.post("/translate")
def translate(req: TranslateRequest):
    text = req.text.strip()
    if not text: return {"translation": ""}
    
    try:
        tokenized = src_sp.EncodeAsIds(text)
        src_data = torch.LongTensor(pad_or_truncate(tokenized)).unsqueeze(0).to(device)
        e_mask = (src_data != pad_id).unsqueeze(1).to(device)

        with torch.no_grad():
            src_data = model.src_embedding(src_data)
            src_data = model.positional_encoder(src_data)
            e_output = model.encoder(src_data, e_mask)

            last_words = torch.LongTensor([pad_id] * seq_len).to(device)
            last_words[0] = sos_id
            
            for i in range(seq_len - 1):
                d_mask = (last_words.unsqueeze(0) != pad_id).unsqueeze(1).to(device)
                nopeak_mask = torch.tril(torch.ones([1, seq_len, seq_len], dtype=torch.bool)).to(device)
                d_mask = d_mask & nopeak_mask

                trg_emb = model.trg_embedding(last_words.unsqueeze(0))
                trg_pos = model.positional_encoder(trg_emb)
                dec_out = model.decoder(trg_pos, e_output, e_mask, d_mask)
                output = model.softmax(model.output_linear(dec_out))
                
                pred_id = torch.argmax(output, dim=-1)[0][i].item()
                last_words[i + 1] = pred_id
                if pred_id == eos_id: break
            
            res_ids = last_words.tolist()
            clean_ids = []
            for tid in res_ids:
                if tid == sos_id: continue
                if tid == eos_id: break
                if tid == pad_id: break
                clean_ids.append(tid)
                
            return {"translation": trg_sp.decode_ids(clean_ids)}

    except Exception as e:
        return {"error": str(e)}