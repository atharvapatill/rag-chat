import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def generate_answer(query: str, context: list[str]):
    context_text = "\n\n".join(context)

    prompt = f"""
        Use context to answer.

        Context:
        {context_text}

        Question:
        {query}
        """

    response = model.generate_content(prompt)
    return response.text

