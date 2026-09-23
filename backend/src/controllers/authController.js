const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

async function register(req, res, next) {
  try {
    const {
      businessName,
      ownerName,
      email,
      mobileNumber,
      businessAddress,
      city,
      district,
      state,
      pincode,
      businessType,
      password,
      confirmPassword,
      gstNumber,
    } = req.body;

    // Validation
    if (!businessName || !ownerName || !email || !mobileNumber || !businessAddress || !city || !district || !state || !pincode || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
        errorCode: 'INVALID_EMAIL',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        errorCode: 'WEAK_PASSWORD',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
        errorCode: 'PASSWORD_MISMATCH',
      });
    }

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errorCode: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: ownerName,
        phone: mobileNumber,
        role: 'BUSINESS_OWNER',
        status: 'ACTIVE',
        business: {
          create: {
            businessName,
            ownerName,
            email: email.toLowerCase().trim(),
            mobile: mobileNumber,
            address: businessAddress,
            city,
            district,
            state,
            pincode,
            businessType: businessType || 'Retail Store',
            gstNumber: gstNumber || null,
          },
        },
      },
      include: {
        business: true,
      },
    });

    await logAudit({
      userId: user.id,
      userRole: 'BUSINESS_OWNER',
      action: 'BUSINESS_REGISTERED',
      entity: 'Business',
      entityId: user.business.id,
      description: `New business "${businessName}" registered by ${ownerName}.`,
      ipAddress: req.ip,
    });

    await createNotification({
      userId: user.id,
      title: 'Welcome to MESUREGX',
      message: 'Your business account is active. You can now register your measuring instruments.',
      type: 'SUCCESS',
      link: '/business/instruments',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login to continue.',
      data: {
        userId: user.id,
        email: user.email,
        businessName: user.business.businessName,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        errorCode: 'MISSING_CREDENTIALS',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        business: true,
        officer: true,
        gatc: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        errorCode: 'ACCOUNT_DEACTIVATED',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.email} (${user.role}) logged in successfully.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          business: user.business,
          officer: user.officer,
          gatc: user.gatc,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function registerGatc(req, res, next) {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      district,
      state,
      pincode,
      authorizationNo,
      categories,
      password,
      confirmPassword,
      documents,
    } = req.body;

    if (!name || !contactPerson || !email || !phone || !address || !city || !district || !state || !pincode || !authorizationNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        errorCode: 'WEAK_PASSWORD',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
        errorCode: 'PASSWORD_MISMATCH',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        errorCode: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const existingAuth = await prisma.gatc.findUnique({
      where: { authorizationNo: authorizationNo.trim() },
    });
    if (existingAuth) {
      return res.status(409).json({
        success: false,
        message: 'A test centre with this authorization number already exists.',
        errorCode: 'AUTH_NO_ALREADY_EXISTS',
      });
    }

    const gatcCount = await prisma.gatc.count();
    const stateCode = (state || 'TN').toUpperCase().includes('TAMIL') ? 'TN' : 'IND';
    const gatcCode = `GATC-${stateCode}-${String(gatcCount + 1).padStart(3, '0')}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        phone,
        role: 'GATC',
        status: 'ACTIVE',
        gatc: {
          create: {
            gatcCode,
            name,
            contactPerson,
            email: email.toLowerCase().trim(),
            phone,
            address,
            city,
            district,
            state,
            pincode,
            authorizationNo: authorizationNo.trim(),
            validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2),
            status: 'PENDING_APPROVAL',
            categories: categories || 'Non-Automatic Weighing Instruments, Flow Meters, Fuel Dispensers',
            documents: documents ? (typeof documents === 'string' ? documents : JSON.stringify(documents)) : null,
          },
        },
      },
      include: {
        gatc: true,
      },
    });

    await logAudit({
      userId: user.id,
      userRole: 'GATC',
      action: 'GATC_REGISTERED',
      entity: 'Gatc',
      entityId: user.gatc.id,
      description: `New GATC "${name}" (${gatcCode}) registered by ${contactPerson}. Awaiting Admin approval.`,
      ipAddress: req.ip,
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'New GATC Registration for Approval',
        message: `${name} (${gatcCode}, ${district}) has registered as an Approved Test Centre and awaits verification.`,
        type: 'WARNING',
        link: '/admin/gatc',
      });
    }

    res.status(201).json({
      success: true,
      message: 'GATC registration submitted successfully. Your account is pending administrative verification and approval.',
      data: {
        userId: user.id,
        gatcId: user.gatc.id,
        gatcCode: user.gatc.gatcCode,
        name: user.gatc.name,
        status: user.gatc.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        business: true,
        officer: true,
        gatc: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: req.user.id,
        description: `User ${req.user.email} logged out.`,
        ipAddress: req.ip,
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  registerGatc,
  login,
  getMe,
  logout,
};
