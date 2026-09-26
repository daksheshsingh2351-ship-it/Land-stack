import prisma from '../config/database.js';

const VALID_REQUEST_STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'ACTION_REQUIRED',
  'VERIFIED',
  'COMPLETED',
  'REJECTED',
];

// ─── GET /api/officer/dashboard ───────────────────────────────────

/**
 * Get dashboard summary counts for the officer.
 * For OFFICER: counts requests assigned to them, plus unassigned.
 * For ADMIN: counts all requests.
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const isOfficer = req.user.role === 'OFFICER';

    // Base where clause for total requests relevant to the user
    const baseWhere = isOfficer 
      ? { OR: [{ officerId: req.user.id }, { officerId: null }] } 
      : {};

    const [
      total,
      pending,
      inProgress, // UNDER_REVIEW or ACTION_REQUIRED
      completed,
      rejected,
      unassigned,
    ] = await Promise.all([
      prisma.serviceRequest.count({ where: baseWhere }),
      prisma.serviceRequest.count({ where: { ...baseWhere, status: 'PENDING' } }),
      prisma.serviceRequest.count({ where: { ...baseWhere, status: { in: ['UNDER_REVIEW', 'ACTION_REQUIRED'] } } }),
      prisma.serviceRequest.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      prisma.serviceRequest.count({ where: { officerId: null } }), // Unassigned in general
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed,
        rejected,
        unassigned,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/officer/requests ────────────────────────────────────

/**
 * List requests for the officer dashboard.
 * Supports filtering by status, type, and assignment.
 */
export const listOfficerRequests = async (req, res, next) => {
  try {
    const { status, type, assignment, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && VALID_REQUEST_STATUSES.includes(status)) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    if (req.user.role === 'OFFICER') {
      if (assignment === 'unassigned') {
        where.officerId = null;
      } else if (assignment === 'assigned') {
        where.officerId = req.user.id;
      } else {
        // Default for officer: see assigned to them OR unassigned
        where.OR = [
          { officerId: req.user.id },
          { officerId: null }
        ];
      }
    } else if (req.user.role === 'ADMIN') {
      if (assignment === 'unassigned') {
        where.officerId = null;
      } else if (assignment === 'assigned') {
        where.officerId = { not: null };
      }
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          parcel: { select: { ulpin: true, location: true, plotNumber: true, area: true } },
          creator: { select: { name: true, email: true, phone: true } },
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

// ─── POST /api/officer/requests/:id/assign ────────────────────────

/**
 * Assign a request to an officer.
 */
export const assignRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Determine target officer ID (Officer can assign to self, Admin can assign to anyone)
    const targetOfficerId = officerId || (req.user.role === 'OFFICER' ? req.user.id : null);

    if (!targetOfficerId) {
      return res.status(400).json({ success: false, message: 'officerId is required for ADMIN.' });
    }

    // Validate target user exists and is an OFFICER
    const targetOfficer = await prisma.user.findUnique({ where: { id: targetOfficerId } });
    if (!targetOfficer || targetOfficer.role !== 'OFFICER') {
      return res.status(400).json({ success: false, message: 'Invalid target officer ID.' });
    }

    // If it's an officer assigning, they can usually only assign to themselves (unless the system allows otherwise)
    if (req.user.role === 'OFFICER' && targetOfficerId !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Officers can only assign requests to themselves.' });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { officerId: targetOfficerId },
      include: {
        officer: { select: { name: true, email: true } },
      }
    });

    res.json({
      success: true,
      message: 'Request assigned successfully.',
      data: { request: updatedRequest }
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/officer/requests/:id/status ────────────────────────

/**
 * Update request status.
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    if (!status || !VALID_REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_REQUEST_STATUSES.join(', ')}` });
    }

    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Determine if resolvedAt should be set
    let resolvedAt = request.resolvedAt;
    if ((status === 'COMPLETED' || status === 'REJECTED') && !resolvedAt) {
      resolvedAt = new Date();
    } else if (status !== 'COMPLETED' && status !== 'REJECTED') {
      resolvedAt = null; // Clear if moved back to pending/review
    }

    const data = { status, resolvedAt };
    if (description !== undefined) {
      data.description = description;
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data,
      include: {
        parcel: { select: { ulpin: true, location: true } },
        officer: { select: { name: true, email: true } },
      }
    });

    // Create a notification for the citizen
    let notificationTitle = 'Service Request Updated';
    let notificationMessage = `Your service request has been updated to ${status.replace(/_/g, ' ')}.`;

    if (status === 'VERIFIED' || status === 'COMPLETED') {
      notificationTitle = 'Service Request Verified';
      notificationMessage = `Your service request for ${request.ulpin || 'your parcel'} has been successfully verified.`;
    } else if (status === 'ACTION_REQUIRED') {
      notificationTitle = 'Action Required';
      notificationMessage = description ? `Action Required: ${description}` : 'Action Required — Please submit documents';
    } else if (status === 'REJECTED') {
      notificationTitle = 'Service Request Rejected';
      notificationMessage = `Your service request has been rejected.`;
    }

    await prisma.notification.create({
      data: {
        userId: request.creatorId,
        title: notificationTitle,
        message: notificationMessage
      }
    });

    res.json({
      success: true,
      message: 'Request status updated successfully.',
      data: { request: updatedRequest }
    });
  } catch (error) {
    next(error);
  }
};
