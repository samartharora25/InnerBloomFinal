from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from scipy.signal import find_peaks, detrend, butter, filtfilt, savgol_filter
from scipy.stats import zscore
import os
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

app = FastAPI()

# Chatbot Setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama3-8b-8192"
)

template = """You are a helpful and empathetic wellness companion for InnerBloom. 
Use the following context to answer the user's question about mental health and wellness.
If you don't know the answer, just say you don't know, don't try to make up an answer.

Question: {question}
Answer:"""

prompt = PromptTemplate(template=template, input_variables=["question"])

class ChatRequest(BaseModel):
    message: str

class StressRequest(BaseModel):
    brightness_values: List[float]
    fps: float

def bandpass_filter(signal, lowcut=0.7, highcut=4.0, fs=30.0, order=4):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return filtfilt(b, a, signal)

def refine_signal(raw_signal, fps):
    signal = detrend(raw_signal)
    signal = bandpass_filter(signal, fs=fps)
    signal = savgol_filter(signal, window_length=9, polyorder=2)
    signal = zscore(signal)
    return signal

def estimate_heart_rate(signal, fps):
    # Simplified peak finding for the bridge
    peaks, _ = find_peaks(signal, distance=fps * 0.5)
    if len(peaks) < 2:
        return None
    intervals = np.diff(peaks) / fps
    avg_interval = np.mean(intervals)
    bpm = 60 / avg_interval
    return round(bpm, 2)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = llm.invoke(prompt.format(question=request.message))
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-stress")
async def analyze_stress(request: StressRequest):
    try:
        if len(request.brightness_values) < request.fps * 10:
            return {"error": "Not enough data collected. Please stay still for longer."}
        
        refined = refine_signal(request.brightness_values, request.fps)
        hr = estimate_heart_rate(refined, request.fps)
        
        if hr:
            # Simple stress heuristic based on HR variability or range
            # (In a real app, this would be more complex)
            stress_level = min(100, max(0, (hr - 60) * 1.5)) 
            return {
                "heart_rate": hr,
                "stress_level": round(stress_level, 1),
                "status": "Success"
            }
        else:
            return {"error": "Could not determine a valid heart rate. Try again."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
