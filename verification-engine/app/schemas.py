from typing import List, Optional
from pydantic import BaseModel, Field

class MeasurementInput(BaseModel):
    reference: float = Field(..., description="Reference standard weight/volume value (e.g., 5 kg)")
    observed: float = Field(..., description="Observed instrument reading (e.g., 5.01 kg)")

class VerificationRequest(BaseModel):
    instrumentType: str = Field(..., description="Type of instrument (e.g. WEIGHING_SCALE, FUEL_DISPENSER)")
    capacity: float = Field(..., gt=0, description="Max rated capacity of the instrument")
    unit: str = Field(default="kg", description="Measurement unit (kg, g, L, m)")
    accuracyClass: Optional[str] = Field(default="III", description="Accuracy class (I, II, III, IIII)")
    measurements: List[MeasurementInput] = Field(..., min_length=1, description="List of test measurements")
    customAllowedErrorPercent: Optional[float] = None
    customAllowedErrorAbsolute: Optional[float] = None

class TestResult(BaseModel):
    testIndex: int
    reference: float
    observed: float
    error: float
    percentageError: float
    allowedError: float
    result: str  # "PASS" or "FAIL"
    remarks: str

class VerificationSummary(BaseModel):
    totalTests: int
    passed: int
    failed: int
    passRate: float

class VerificationResponse(BaseModel):
    overallResult: str  # "PASS" or "FAIL"
    instrumentType: str
    accuracyClass: Optional[str]
    tests: List[TestResult]
    summary: VerificationSummary
    evaluatedAt: str
    standardsReference: str
    complianceStatus: str
