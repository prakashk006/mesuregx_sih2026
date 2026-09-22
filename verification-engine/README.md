# MESUREGX Verification Engine

FastAPI-powered Smart Legal Metrology Rule & Accuracy Evaluation Engine.

## Overview
Evaluates physical measurement tests against Indian Legal Metrology (General) Rules 2011 and OIML R 76 / R 117 standards. Computes Maximum Permissible Error (MPE), absolute error, percentage error, and PASS/FAIL compliance.

## Endpoints
- `GET /health`: Engine status check
- `POST /api/verify`: Evaluates measurement tests for an instrument
- `GET /api/standards`: Metrological accuracy classes and standards reference

## Running standalone
```bash
python -m uvicorn app.main:app --reload --port 8000
```
