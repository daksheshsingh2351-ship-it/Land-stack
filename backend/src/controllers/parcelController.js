import prisma from '../config/database.js';

// ─── Field selections ─────────────────────────────────────────────

/** Ownership fields to include when returning parcel details. */
const ownershipInclude = {
  ownerships: {
    where: { isCurrent: true },
    select: {
      id: true,
      ownerName: true,
      ownershipType: true,
      ownershipStatus: true,
      rorStatus: true,
      verificationStatus: true,
      isCurrent: true,
      acquiredDate: true,
    },
  },
};

// ─── Validation ───────────────────────────────────────────────────

const VALID_LAND_USES = [
  'RESIDENTIAL', 'COMMERCIAL', 'AGRICULTURAL', 'INDUSTRIAL', 'PUBLIC_INSTITUTIONAL',
];

const validateParcelInput = (body, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    // Required fields for creation
    if (!body.ulpin || body.ulpin.trim().length === 0) errors.push('ULPIN is required.');
    if (!body.plotNumber || body.plotNumber.trim().length === 0) errors.push('Plot number is required.');
    if (body.area === undefined || body.area === null || isNaN(Number(body.area)) || Number(body.area) <= 0) {
      errors.push('Area must be a positive number.');
    }
    if (!body.location || body.location.trim().length === 0) errors.push('Location is required.');
  }

  // Validate enum fields if provided
  if (body.landUse && !VALID_LAND_USES.includes(body.landUse)) {
    errors.push(`landUse must be one of: ${VALID_LAND_USES.join(', ')}`);
  }

  if (body.status && !['VERIFIED', 'PENDING', 'DISPUTED', 'UNDER_REVIEW'].includes(body.status)) {
    errors.push('status must be VERIFIED, PENDING, DISPUTED, or UNDER_REVIEW.');
  }

  if (body.riskStatus && !['LOW', 'MEDIUM', 'HIGH'].includes(body.riskStatus)) {
    errors.push('riskStatus must be LOW, MEDIUM, or HIGH.');
  }

  if (body.area !== undefined && (isNaN(Number(body.area)) || Number(body.area) <= 0)) {
    errors.push('Area must be a positive number.');
  }

  return errors;
};

// ─── GET /api/parcels/:ulpin ──────────────────────────────────────

/**
 * Find a single parcel by ULPIN.
 * Includes current ownership.
 */
export const getParcelByUlpin = async (req, res, next) => {
  try {
    const { ulpin } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { ulpin },
      include: ownershipInclude,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: `Parcel with ULPIN "${ulpin}" not found.`,
      });
    }

    res.json({ success: true, data: { parcel } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/parcels ─────────────────────────────────────────────

/**
 * List/search parcels with optional filters and pagination.
 *
 * Query params:
 *   ulpin      – partial match
 *   location   – partial match on location string
 *   district   – exact match
 *   village    – exact match
 *   landUse    – exact enum match
 *   status     – exact enum match
 *   page       – page number (default 1)
 *   limit      – items per page (default 20, max 100)
 */
export const listParcels = async (req, res, next) => {
  try {
    const {
      ulpin, location, district, village, landUse, status,
      page = '1', limit = '20',
    } = req.query;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (ulpin) where.ulpin = { contains: ulpin, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (village) where.village = { equals: village, mode: 'insensitive' };
    if (landUse && VALID_LAND_USES.includes(landUse)) where.landUse = landUse;
    if (status) where.status = status;

    const [parcels, total] = await Promise.all([
      prisma.parcel.findMany({
        where,
        include: ownershipInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.parcel.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/parcels ────────────────────────────────────────────

/**
 * Create a new parcel. Requires OFFICER or ADMIN role.
 */
export const createParcel = async (req, res, next) => {
  try {
    const errors = validateParcelInput(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // Check ULPIN uniqueness
    const existing = await prisma.parcel.findUnique({ where: { ulpin: req.body.ulpin.trim() } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A parcel with ULPIN "${req.body.ulpin}" already exists.`,
      });
    }

    const parcel = await prisma.parcel.create({
      data: {
        ulpin: req.body.ulpin.trim(),
        plotNumber: req.body.plotNumber.trim(),
        surveyNo: req.body.surveyNo || null,
        gatNumber: req.body.gatNumber || null,
        khataNumber: req.body.khataNumber || null,
        area: parseFloat(req.body.area),
        areaUnit: req.body.areaUnit || 'sqm',
        location: req.body.location.trim(),
        village: req.body.village || null,
        taluka: req.body.taluka || null,
        district: req.body.district || null,
        state: req.body.state || null,
        landUse: req.body.landUse || 'RESIDENTIAL',
        zoning: req.body.zoning || null,
        status: req.body.status || 'PENDING',
        riskStatus: req.body.riskStatus || 'LOW',
        buildingPermission: req.body.buildingPermission || null,
        developmentRestrictions: req.body.developmentRestrictions || null,
        propertyTaxStatus: req.body.propertyTaxStatus || null,
        outstandingAmount: req.body.outstandingAmount || null,
        encumbranceStatus: req.body.encumbranceStatus || null,
        mortgage: req.body.mortgage || null,
        electricity: req.body.electricity || null,
        water: req.body.water || null,
        roadAccess: req.body.roadAccess || null,
        registrationStatus: req.body.registrationStatus || null,
        lastTransactionType: req.body.lastTransactionType || null,
        registrationDocumentId: req.body.registrationDocumentId || null,
        lastTransactionDate: req.body.lastTransactionDate ? new Date(req.body.lastTransactionDate) : null,
        lastUpdated: new Date(),
      },
      include: ownershipInclude,
    });

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully.',
      data: { parcel },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/parcels/:id ───────────────────────────────────────

/**
 * Update a parcel by ID. Requires OFFICER or ADMIN role.
 */
export const updateParcel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const errors = validateParcelInput(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // Check parcel exists
    const existing = await prisma.parcel.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    // If ULPIN is being changed, check uniqueness
    if (req.body.ulpin && req.body.ulpin.trim() !== existing.ulpin) {
      const duplicate = await prisma.parcel.findUnique({ where: { ulpin: req.body.ulpin.trim() } });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `A parcel with ULPIN "${req.body.ulpin}" already exists.`,
        });
      }
    }

    // Build update data (only include provided fields)
    const data = {};
    const stringFields = [
      'ulpin', 'plotNumber', 'surveyNo', 'gatNumber', 'khataNumber',
      'areaUnit', 'location', 'village', 'taluka', 'district', 'state',
      'zoning', 'buildingPermission', 'developmentRestrictions',
      'propertyTaxStatus', 'outstandingAmount', 'encumbranceStatus', 'mortgage',
      'electricity', 'water', 'roadAccess',
      'registrationStatus', 'lastTransactionType', 'registrationDocumentId',
    ];

    for (const field of stringFields) {
      if (req.body[field] !== undefined) {
        data[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    }

    if (req.body.area !== undefined) data.area = parseFloat(req.body.area);
    if (req.body.landUse !== undefined) data.landUse = req.body.landUse;
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.riskStatus !== undefined) data.riskStatus = req.body.riskStatus;
    if (req.body.lastTransactionDate !== undefined) {
      data.lastTransactionDate = req.body.lastTransactionDate ? new Date(req.body.lastTransactionDate) : null;
    }

    data.lastUpdated = new Date();

    const parcel = await prisma.parcel.update({
      where: { id },
      data,
      include: ownershipInclude,
    });

    res.json({
      success: true,
      message: 'Parcel updated successfully.',
      data: { parcel },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/parcels/:id ──────────────────────────────────────

/**
 * Delete a parcel by ID. Requires ADMIN role.
 */
export const deleteParcel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.parcel.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    await prisma.parcel.delete({ where: { id } });

    res.json({
      success: true,
      message: `Parcel "${existing.ulpin}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
