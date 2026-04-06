import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from fastapi import FastAPI
from clinic_data import clinic_info
from fastapi.middleware.cors import CORSMiddleware #


load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))




app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def read_healthroot():
    return {"status": "ok", "service": "student health assistant"}

@app.get("/clinic")
def info_clinic():
    return clinic_info


class Question(BaseModel):
    question: str
    history: list = [] # this tracks history of messages

@app.post("/ask")
def send_root(body: Question):
   
    messages = [{"role": "system", "content": (
        "You are a student health assistant at Gustavus Adolphus College. "
        "Only answer health-related questions. Always recommend Gustavus Health Services. "
        "Recommend seeing a doctor for serious concerns.\n\n"
        "LINK FORMATTING RULES — follow these exactly, no exceptions:\n"
        "- NEVER output a bare/raw URL (e.g. https://example.com).\n"
        "- ALWAYS wrap every URL in markdown link syntax: [descriptive text](url)\n"
        f"- Use [Gustavus Health Services]({clinic_info['website']}) for the clinic website.\n"
        f"- Use [Book an appointment]({clinic_info['appointment_url']}) for appointments.\n"
        "- Apply this rule to every link in your response, every time."
    )}]
    messages += body.history #add prev messages if empty nothing will be added
    messages.append({"role": "user", "content": body.question})

    # send to tht LLM 
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
        
    return {"answer": response.choices[0].message.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)