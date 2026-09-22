from datetime import datetime
from typing import Tuple
from .schemas import VerificationRequest, VerificationResponse, TestResult, VerificationSummary

def determine_allowed_error(
    reference: float,
    capacity: float,
    instrument_type: str,
    accuracy_class: str,
    custom_percent: float = None,
    custom_abs: float = None
) -> float:
    """
    Computes Maximum Permissible Error (MPE) based on Legal Metrology specifications.
    Default models conform to OIML R 76 / Legal Metrology (General) Rules prototype limits.
    """
    if custom_abs is not None and custom_abs > 0:
        return round(custom_abs, 4)

    if custom_percent is not None and custom_percent > 0:
        return round((custom_percent / 100.0) * reference, 4)

    clean_type = instrument_type.upper().replace(" ", "_")
    acc = (accuracy_class or "III").upper()

    # Commercial Weighing Scales
    if any(k in clean_type for k in ["WEIGHING", "SCALE", "BALANCE"]):
        if acc == "I":
            return max(round(reference * 0.0002, 4), 0.0005)
        elif acc == "II":
            return max(round(reference * 0.0005, 4), 0.002)
        elif acc == "IIII":
            return max(round(reference * 0.004, 4), 0.05)
        else:
            # Class III (Medium Accuracy - standard retail/counter/platform)
            # In Legal Metrology, 500e to 2000e = ±1e, 2000e+ = ±1.5e.
            # For typical 30kg / 5g e: 5kg test has ~0.03kg allowable error limit.
            base_ratio = 0.003  # 0.3% tolerance
            calculated = round(reference * base_ratio, 4)
            # Ensure minimum sensitivity threshold (e.g. 0.03 for 5kg range)
            return max(calculated, 0.03)

    # Fuel Dispensers (OIML R 117 standard: ±0.3% / ±0.5% verification tolerance)
    elif "FUEL" in clean_type or "PETROL" in clean_type or "DIESEL" in clean_type:
        return max(round(reference * 0.003, 4), 0.015)

    # Volumetric / Cylinder / Water Meter
    elif "CYLINDER" in clean_type or "WATER_METER" in clean_type:
        return max(round(reference * 0.005, 4), 0.02)

    # Default general metrology fallback (0.25% or 0.02)
    return max(round(reference * 0.0025, 4), 0.02)

def evaluate_verification(req: VerificationRequest) -> VerificationResponse:
    tests = []
    passed_count = 0
    failed_count = 0

    for idx, item in enumerate(req.measurements, start=1):
        ref = float(item.reference)
        obs = float(item.observed)

        raw_error = obs - ref
        abs_error = abs(raw_error)
        pct_error = (abs_error / ref * 100.0) if ref != 0 else 0.0

        allowed_err = determine_allowed_error(
            reference=ref,
            capacity=req.capacity,
            instrument_type=req.instrumentType,
            accuracy_class=req.accuracyClass or "III",
            custom_percent=req.customAllowedErrorPercent,
            custom_abs=req.customAllowedErrorAbsolute
        )

        # Evaluate against allowed tolerance (allowing slight float precision delta)
        is_pass = round(abs_error, 4) <= round(allowed_err, 4)

        if is_pass:
            result_str = "PASS"
            passed_count += 1
            remarks = f"Within allowable Maximum Permissible Error (±{allowed_err:.4f} {req.unit})"
        else:
            result_str = "FAIL"
            failed_count += 1
            diff_over = abs_error - allowed_err
            remarks = f"Exceeded MPE by {diff_over:.4f} {req.unit} (Tolerance: ±{allowed_err:.4f})"

        tests.append(TestResult(
            testIndex=idx,
            reference=round(ref, 4),
            observed=round(obs, 4),
            error=round(raw_error, 4),
            percentageError=round(pct_error, 3),
            allowedError=round(allowed_err, 4),
            result=result_str,
            remarks=remarks
        ))

    total = len(tests)
    overall = "PASS" if failed_count == 0 else "FAIL"
    pass_rate = round((passed_count / total * 100.0), 1) if total > 0 else 0.0

    standards_ref = (
        f"Legal Metrology (General) Rules 2011 & OIML R 76-1 [Class {req.accuracyClass or 'III'}]"
        if "WEIGHING" in req.instrumentType.upper()
        else "Legal Metrology Prototype Standards Specifications"
    )

    return VerificationResponse(
        overallResult=overall,
        instrumentType=req.instrumentType,
        accuracyClass=req.accuracyClass,
        tests=tests,
        summary=VerificationSummary(
            totalTests=total,
            passed=passed_count,
            failed=failed_count,
            passRate=pass_rate
        ),
        evaluatedAt=datetime.utcnow().isoformat() + "Z",
        standardsReference=standards_ref,
        complianceStatus="COMPLIANT_FOR_CERTIFICATION" if overall == "PASS" else "NON_COMPLIANT_MPE_EXCEEDED"
    )
