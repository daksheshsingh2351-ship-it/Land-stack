import prisma from '../config/database.js';

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES = ['REQUIRES_VERIFICATION', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];

// ─── GET /api/alerts ──────────────────────────────────────────────

export const listAlerts = async (req, res, next) => {
  try {
    const { severity, status, alertType, parcelId, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (severity && VALID_SEVERITIES.includes(severity)) where.severity = severity;
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (alertType) where.alertType = alertType;
    if (parcelId) where.parcelId = parcelId;

    if (req.user.role === 'CITIZEN') {
      // Citizen can only see alerts for parcels they own (where ownership is active)
      where.parcel = {
        ownerships: {
          some: {
            userId: req.user.id,
            isCurrent: true,
          }
        }
      };
    }

    const [alerts, total] = await Promise.all([
      prisma.aIAlert.findMany({
        where,
        include: {
          parcel: { select: { ulpin: true, location: true, plotNumber: true, area: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.aIAlert.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        alerts,
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

// ─── GET /api/alerts/:id ──────────────────────────────────────────

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const where = { id };

    if (req.user.role === 'CITIZEN') {
      where.parcel = {
        ownerships: {
          some: {
            userId: req.user.id,
            isCurrent: true,
          }
        }
      };
    }

    const alert = await prisma.aIAlert.findFirst({
      where,
      include: {
        parcel: { select: { ulpin: true, location: true, plotNumber: true, area: true } }
      }
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found or access denied.' });
    }

    res.json({ success: true, data: { alert } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/alerts/:id ────────────────────────────────────────

export const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description, severity, confidence, recommendation, observedSignal, recordedUse } = req.body;

    const alert = await prisma.aIAlert.findUnique({ where: { id } });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const data = {};

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
         return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` });
      }
      data.status = status;
      if (status === 'RESOLVED' || status === 'DISMISSED') {
        data.resolvedAt = new Date();
      } else {
        data.resolvedAt = null;
      }
    }

    if (severity) {
      if (!VALID_SEVERITIES.includes(severity)) {
         return res.status(400).json({ success: false, message: `Invalid severity. Allowed values: ${VALID_SEVERITIES.join(', ')}` });
      }
      data.severity = severity;
    }

    if (description !== undefined) data.description = description;
    if (confidence !== undefined) data.confidence = confidence;
    if (recommendation !== undefined) data.recommendation = recommendation;
    if (observedSignal !== undefined) data.observedSignal = observedSignal;
    if (recordedUse !== undefined) data.recordedUse = recordedUse;

    const updatedAlert = await prisma.aIAlert.update({
      where: { id },
      data,
      include: {
        parcel: { select: { ulpin: true, location: true } }
      }
    });

    res.json({ success: true, message: 'Alert updated successfully.', data: { alert: updatedAlert } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/alerts/summary ──────────────────────────────────────

export const getAlertSummary = async (req, res, next) => {
  try {
    const [severityGroups, statusGroups] = await Promise.all([
      prisma.aIAlert.groupBy({
        by: ['severity'],
        _count: { id: true }
      }),
      prisma.aIAlert.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    // Format the response nicely
    const summary = {
      bySeverity: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0
      },
      byStatus: {
        REQUIRES_VERIFICATION: 0,
        UNDER_REVIEW: 0,
        RESOLVED: 0,
        DISMISSED: 0
      },
      total: 0
    };

    severityGroups.forEach(group => {
      summary.bySeverity[group.severity] = group._count.id;
      summary.total += group._count.id;
    });

    statusGroups.forEach(group => {
      summary.byStatus[group.status] = group._count.id;
    });

    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};
