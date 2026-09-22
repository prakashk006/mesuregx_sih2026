const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

async function evaluateMeasurements({
  instrumentType,
  capacity,
  unit = 'kg',
  accuracyClass = 'III',
  measurements = [],
  customAllowedErrorPercent = null,
  customAllowedErrorAbsolute = null,
}) {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instrumentType,
        capacity: Number(capacity),
        unit,
        accuracyClass,
        measurements: measurements.map((m) => ({
          reference: Number(m.reference),
          observed: Number(m.observed),
        })),
        customAllowedErrorPercent: customAllowedErrorPercent ? Number(customAllowedErrorPercent) : null,
        customAllowedErrorAbsolute: customAllowedErrorAbsolute ? Number(customAllowedErrorAbsolute) : null,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FastAPI returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return { ...data, engineSource: 'FASTAPI_SERVICE' };
  } catch (err) {
    console.warn('FastAPI service call failed, using internal Legal Metrology engine fallback:', err.message);

    // Resilient built-in fallback evaluation
    const tests = measurements.map((m, idx) => {
      const ref = Number(m.reference);
      const obs = Number(m.observed);
      const error = Math.round((obs - ref) * 10000) / 10000;
      const absError = Math.abs(error);
      const percentageError = ref !== 0 ? Math.round((absError / ref) * 10000) / 100 : 0;

      let allowedError = 0.03;
      if (customAllowedErrorAbsolute && customAllowedErrorAbsolute > 0) {
        allowedError = customAllowedErrorAbsolute;
      } else if (customAllowedErrorPercent && customAllowedErrorPercent > 0) {
        allowedError = Math.round(((customAllowedErrorPercent / 100) * ref) * 10000) / 10000;
      } else {
        const cleanType = (instrumentType || '').toUpperCase();
        if (cleanType.includes('FUEL')) {
          allowedError = Math.max(Math.round(ref * 0.003 * 10000) / 10000, 0.015);
        } else {
          allowedError = Math.max(Math.round(ref * 0.003 * 10000) / 10000, 0.03);
        }
      }

      const isPass = absError <= allowedError;
      return {
        testIndex: idx + 1,
        reference: ref,
        observed: obs,
        error,
        percentageError,
        allowedError,
        result: isPass ? 'PASS' : 'FAIL',
        remarks: isPass
          ? `Within allowable Maximum Permissible Error (±${allowedError} ${unit})`
          : `Exceeded MPE by ${Math.round((absError - allowedError) * 10000) / 10000} ${unit}`,
      };
    });

    const failedCount = tests.filter((t) => t.result === 'FAIL').length;
    const passedCount = tests.length - failedCount;
    const overallResult = failedCount === 0 ? 'PASS' : 'FAIL';

    return {
      overallResult,
      instrumentType,
      accuracyClass,
      tests,
      summary: {
        totalTests: tests.length,
        passed: passedCount,
        failed: failedCount,
        passRate: tests.length > 0 ? Math.round((passedCount / tests.length) * 1000) / 10 : 0,
      },
      evaluatedAt: new Date().toISOString(),
      standardsReference: 'Legal Metrology Rules 2011 (Embedded Engine Fallback)',
      complianceStatus: overallResult === 'PASS' ? 'COMPLIANT_FOR_CERTIFICATION' : 'NON_COMPLIANT_MPE_EXCEEDED',
      engineSource: 'EMBEDDED_FALLBACK',
    };
  }
}

module.exports = {
  evaluateMeasurements,
};
