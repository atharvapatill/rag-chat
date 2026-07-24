import os
import requests
import google.generativeai as genai

# Setup Google API if present
google_api_key = os.getenv("GOOGLE_API_KEY")
if google_api_key:
    genai.configure(api_key=google_api_key)

def generate_answer(query: str, context: list[str]):
    context_text = "\n\n".join(context)

    prompt = f"""Use context to answer.

Context:
{context_text}

Question:
{query}"""

    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_api_key:
        model_name = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=30
            )
            if response.status_code == 200:
                res_json = response.json()
                choices = res_json.get("choices", [])
                if choices:
                    return choices[0]["message"]["content"]
            
            # If request fails, raise exception to trigger fallback or error reporting
            raise Exception(f"OpenRouter error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error calling OpenRouter: {e}")
            if not google_api_key:
                raise e

    # Fallback to Google Gemini
    if google_api_key:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text
    
    raise ValueError("Neither OPENROUTER_API_KEY nor GOOGLE_API_KEY is configured.")

