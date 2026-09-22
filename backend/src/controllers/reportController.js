const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');

async function getReports(req, res, next) {
  try {
    const [
      allApplications,
      allInstruments,
      allCertificates,
      allVerifications,
    ] = await Promise.all([
      prisma.verificationApplication.findMany({
        include: { business: true, instrument: { include: { instrumentType: true } } },
      }),
      prisma.instrument.findMany({
        include: { instrumentType: true, business: true },
      }),
      prisma.certificate.findMany({
        include: { business: true, instrument: true },
      }),
      prisma.verification.findMany({
        select: { overallResult: true },
      }),
    ]);

    // 1. Verification metrics
    const totalApps = allApplications.length;
    const approved = allApplications.filter((a) => a.status === 'APPROVED' || a.status === 'CERTIFICATE_ISSUED').length;
    const rejected = allApplications.filter((a) => a.status === 'REJECTED').length;
    const pending = totalApps - approved - rejected;
    const passedTests = allVerifications.filter((v) => v.overallResult === 'PASS').length;
    const passRate = allVerifications.length > 0 ? Math.round((passedTests / allVerifications.length) * 100) : 0;

    // 2. Instruments by Type
    const typeCountMap = {};
    allInstruments.forEach((i) => {
      const typeName = i.instrumentType.name;
      typeCountMap[typeName] = (typeCountMap[typeName] || 0) + 1;
    });
    const instrumentsByType = Object.keys(typeCountMap).map((k) => ({
      name: k,
      count: typeCountMap[k],
    }));

    // 3. Instruments by District
    const districtCountMap = {};
    allInstruments.forEach((i) => {
      const dist = i.business?.district || 'Unknown';
      districtCountMap[dist] = (districtCountMap[dist] || 0) + 1;
    });
    const instrumentsByDistrict = Object.keys(districtCountMap).map((k) => ({
      name: k,
      count: districtCountMap[k],
    }));

    // 4. Certificates Status Breakdown
    let activeCert = 0;
    let expiringCert = 0;
    let expiredCert = 0;
    let revokedCert = 0;

    allCertificates.forEach((c) => {
      const status = getDynamicCertificateStatus(c);
      if (status === 'VALID') activeCert++;
      else if (status === 'EXPIRING_SOON') expiringCert++;
      else if (status === 'EXPIRED') expiredCert++;
      else if (status === 'REVOKED') revokedCert++;
    });

    res.json({
      success: true,
      data: {
        verificationReport: {
          totalApplications: totalApps,
          approved,
          rejected,
          pending,
          passRate,
          totalTests: allVerifications.length,
        },
        instrumentsByType,
        instrumentsByDistrict,
        certificateReport: {
          active: activeCert,
          expiring: expiringCert,
          expired: expiredCert,
          revoked: revokedCert,
          total: allCertificates.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
};
