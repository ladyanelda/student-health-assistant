import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from fastapi import FastAPI
from clinic_data import clinic_info

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))




app = FastAPI()
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
@app.post("/ask")
def send_root(body: Question):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages= [
        {"role": "system", "content": f"You are a helpful student health assistant. You have access to the following clinic information: {clinic_info}. Answer health questions clearly, always recommend seeing a doctor for serious concerns, and always include the appointment URL {clinic_info['appointment_url']} when students ask about booking appointments."},
        {"role": "user", "content": body.question}
        ]
    )
    return {"answer": response.choices[0].message.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)