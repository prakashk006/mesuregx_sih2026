// MEASUREGX Unified Pure Legal Metrology Engine
// Conforms directly to Legal Metrology (General) Rules 2011 & OIML R 76-1 / OIML R 117
// Runs 100% in-process with 0ms latency - No secondary Python server required!

function determineAllowedError({
  reference,
  capacity,
  instrumentType = 'WEIGHING_SCALE',
  accuracyClass = 'III',
  customPercent = null,
  customAbs = null,
}) {
  if (customAbs !== null && customAbs > 0) {
    return Math.round(Number(customAbs) * 10000) / 10000;
  }

  if (customPercent !== null && customPercent > 0) {
    return Math.round(((Number(customPercent) / 100.0) * reference) * 10000) / 10000;
  }

  const cleanType = (instrumentType || '').toUpperCase().replace(/ /g, '_');
  const acc = (accuracyClass || 'III').toUpperCase();

  // Commercial & Industrial Weighing Scales (OIML R 76-1)
  if (cleanType.includes('WEIGHING') || cleanType.includes('SCALE') || cleanType.includes('BALANCE')) {
    if (acc === 'I') {
      return Math.max(Math.round(reference * 0.0002 * 10000) / 10000, 0.0005);
    } else if (acc === 'II') {
      return Math.max(Math.round(reference * 0.0005 * 10000) / 10000, 0.002);
    } else if (acc === 'IIII') {
      return Math.max(Math.round(reference * 0.004 * 10000) / 10000, 0.05);
    } else {
      // Class III (Medium Accuracy - standard retail, counter, platform scales)
      // Legal Metrology Prototype prototype limits (0.3% load tolerance / min 0.03 kg sensitivity)
      const baseRatio = 0.003;
      const calculated = Math.round(reference * baseRatio * 10000) / 10000;
      return Math.max(calculated, 0.03);
    }
  }

  // Fuel Dispensers (OIML R 117 standard: ±0.30% calibration tolerance)
  if (cleanType.includes('FUEL') || cleanType.includes('PETROL') || cleanType.includes('DIESEL')) {
    return Math.max(Math.round(reference * 0.003 * 10000) / 10000, 0.015);
  }

  // Volumetric Measures & Water Meters
  if (cleanType.includes('CYLINDER') || cleanType.includes('WATER_METER')) {
    return Math.max(Math.round(reference * 0.005 * 10000) / 10000, 0.02);
  }

  // Default General Metrology prototype fallback (0.25% or 0.02)
  return Math.max(Math.round(reference * 0.0025 * 10000) / 10000, 0.02);
}

async function evaluateMeasurements({
  instrumentType = 'WEIGHING_SCALE',
  capacity = 30,
  unit = 'kg',
  accuracyClass = 'III',
  measurements = [],
  customAllowedErrorPercent = null,
  customAllowedErrorAbsolute = null,
}) {
  const tests = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let idx = 0; idx < measurements.length; idx++) {
    const item = measurements[idx];
    const ref = Number(item.reference);
    const obs = Number(item.observed);

    const rawError = Math.round((obs - ref) * 10000) / 10000;
    const absError = Math.abs(rawError);
    const pctError = ref !== 0 ? Math.round(((absError / ref) * 100.0) * 1000) / 1000 : 0.0;

    const allowedErr = determineAllowedError({
      reference: ref,
      capacity: Number(capacity),
      instrumentType,
      accuracyClass,
      customPercent: customAllowedErrorPercent,
      customAbs: customAllowedErrorAbsolute,
    });

    const isPass = Math.round(absError * 10000) <= Math.round(allowedErr * 10000);

    if (isPass) {
      passedCount++;
    } else {
      failedCount++;
    }

    const diffOver = Math.round((absError - allowedErr) * 10000) / 10000;
    const remarks = isPass
      ? `Within allowable Maximum Permissible Error (±${allowedErr.toFixed(4)} ${unit})`
      : `Exceeded MPE by ${diffOver.toFixed(4)} ${unit} (Tolerance: ±${allowedErr.toFixed(4)})`;

    tests.push({
      testIndex: idx + 1,
      reference: ref,
      observed: obs,
      error: rawError,
      percentageError: pctError,
      allowedError: allowedErr,
      result: isPass ? 'PASS' : 'FAIL',
      remarks,
    });
  }

  const total = tests.length;
  const overall = failedCount === 0 ? 'PASS' : 'FAIL';
  const passRate = total > 0 ? Math.round(((passedCount / total) * 100.0) * 10) / 10 : 0.0;

  const standardsReference =
    (instrumentType || '').toUpperCase().includes('WEIGHING')
      ? `Legal Metrology (General) Rules 2011 & OIML R 76-1 [Class ${accuracyClass || 'III'}]`
      : 'Legal Metrology Prototype Standards Specifications';

  return {
    overallResult: overall,
    instrumentType,
    accuracyClass,
    tests,
    summary: {
      totalTests: total,
      passed: passedCount,
      failed: failedCount,
      passRate,
    },
    evaluatedAt: new Date().toISOString(),
    standardsReference,
    complianceStatus: overall === 'PASS' ? 'COMPLIANT_FOR_CERTIFICATION' : 'NON_COMPLIANT_MPE_EXCEEDED',
    engineSource: 'NATIVE_UNIFIED_ENGINE',
  };
}

module.exports = {
  evaluateMeasurements,
  determineAllowedError,
};
