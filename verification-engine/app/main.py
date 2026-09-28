from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import VerificationRequest, VerificationResponse
from .rules import evaluate_verification

app = FastAPI(
    title="MESUREGX Verification Engine",
    description="Smart Legal Metrology Rule & Accuracy Evaluation Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "MESUREGX Legal Metrology Verification Engine",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MESUREGX Verification Engine"
    }

@app.post("/api/verify", response_model=VerificationResponse)
def verify_measurements(request: VerificationRequest):
    try:
        return evaluate_verification(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/standards")
def get_standards():
    return {
        "classes": {
            "I": "Special Accuracy (Analytical balances, laboratory, gold test)",
            "II": "High Accuracy (Jewelry, precious metals, precision chemistry)",
            "III": "Medium Accuracy (Commercial retail, counter, platform scales)",
            "IIII": "Ordinary Accuracy (Heavy industrial weighbridges, bulk freight)"
        },
        "defaultLimits": {
            "WEIGHING_SCALE_CLASS_III": "OIML R 76 Table 6 (~0.3% load tolerance / min 0.03 kg)",
            "FUEL_DISPENSER": "OIML R 117 ±0.30% calibration tolerance",
            "WATER_METER": "ISO 4064 ±2.0% transitional, ±5.0% minimum"
        }
    }
