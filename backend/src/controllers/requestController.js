import prisma from '../config/database.js';

const VALID_REQUEST_TYPES = [
  'UPDATE_ROR_DETAILS',
  'BOUNDARY_VERIFICATION',
  'TAX_DISPUTE_RESOLUTION',
  'REGISTRATION_INFO',
  'LAND_USE_VERIFICATION',
  'PROPERTY_TAX_ISSUE',
  'OTHER',
];

const VALID_REQUEST_STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'ACTION_REQUIRED',
  'VERIFIED',
  'COMPLETED',
  'REJECTED',
];

// Generate a random Request ID e.g., REQ-2026-8812
const generateRequestId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${rand}`;
};

export const createRequest = async (req, res, next) => {
  try {
    const { parcelId, type, description } = req.body;

    if (!type || !VALID_REQUEST_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid or missing type. Must be one of: ${VALID_REQUEST_TYPES.join(', ')}` });
    }

    if (!parcelId) {
      return res.status(400).json({ success: false, message: 'parcelId is required.' });
    }

    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const request = await prisma.serviceRequest.create({
      data: {
        requestId: generateRequestId(),
        type,
        description,
        status: 'PENDING',
        parcelId: parcel.id,
        ulpin: parcel.ulpin,
        creatorId: req.user.id,
      },
      include: {
        parcel: { select: { ulpin: true, location: true } },
        creator: { select: { name: true, email: true } },
      }
    });

    res.status(201).json({ success: true, message: 'Service request created.', data: { request } });
  } catch (error) {
    next(error);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && VALID_REQUEST_STATUSES.includes(status)) {
      where.status = status;
    }
    if (type && VALID_REQUEST_TYPES.includes(type)) {
      where.type = type;
    }

    if (req.user.role === 'CITIZEN') {
      where.creatorId = req.user.id;
    } else if (req.user.role === 'OFFICER') {
      // Officer can see requests assigned to them OR unassigned ones (for them to pick up)
      // If we want to allow officers to see all, we can remove the filter.
      // Let's say officers see only their assigned requests by default, unless they ask for unassigned.
      const { assigned } = req.query;
      if (assigned === 'false') {
        where.officerId = null;
      } else {
        // By default, maybe an officer wants to see all, or just theirs.
        // The prompt says: "Return requests assigned to them. Also support an appropriate way to view/manage unassigned requests"
        // Let's make it so if `unassigned=true` is passed, it returns unassigned. Otherwise assigned to them.
        if (req.query.unassigned === 'true') {
          where.officerId = null;
        } else if (req.query.all === 'true') {
          // allow seeing all
        } else {
          where.officerId = req.user.id;
        }
      }
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          parcel: { select: { ulpin: true, location: true } },
          creator: { select: { name: true, email: true } },
          officer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
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

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        parcel: { select: { ulpin: true, location: true, plotNumber: true, area: true } },
        creator: { select: { name: true, email: true, phone: true } },
        officer: { select: { name: true, email: true } },
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (req.user.role === 'CITIZEN' && request.creatorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { request } });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description, officerId } = req.body;

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const data = {};

    if (req.user.role === 'CITIZEN') {
      if (existing.creatorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (existing.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Request can only be updated while pending.' });
      }
      if (description) data.description = description;
      // Citizens can't change status or officer
    } else if (req.user.role === 'OFFICER') {
      // Officer can update status and assignment
      if (status && VALID_REQUEST_STATUSES.includes(status)) data.status = status;
      if (description) data.description = description;
      if (officerId !== undefined) data.officerId = officerId; // Can assign to themselves or unassign

      if (data.status === 'COMPLETED' || data.status === 'REJECTED') {
        data.resolvedAt = new Date();
      }
    } else if (req.user.role === 'ADMIN') {
      if (status && VALID_REQUEST_STATUSES.includes(status)) data.status = status;
      if (description) data.description = description;
      if (officerId !== undefined) data.officerId = officerId;

      if (data.status === 'COMPLETED' || data.status === 'REJECTED') {
        data.resolvedAt = new Date();
      }
    }

    const request = await prisma.serviceRequest.update({
      where: { id },
      data,
      include: {
        parcel: { select: { ulpin: true, location: true } },
        officer: { select: { name: true, email: true } },
      }
    });

    res.json({ success: true, message: 'Request updated.', data: { request } });
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (req.user.role === 'CITIZEN') {
      if (existing.creatorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (existing.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Request can only be deleted while pending.' });
      }
    } else if (req.user.role === 'OFFICER') {
      return res.status(403).json({ success: false, message: 'Officers cannot delete requests.' });
    }

    await prisma.serviceRequest.delete({ where: { id } });

    res.json({ success: true, message: 'Request deleted.' });
  } catch (error) {
    next(error);
  }
};
