import requests
url = "https://nvh1101-translation-web.hf.space/translate"
payload = {"text": "Hello, how are you?"}
res = requests.post(url, json=payload)
print(res.json())