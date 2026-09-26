import prisma from '../config/database.js';

// ─── GET /api/notifications ───────────────────────────────────────

export const listNotifications = async (req, res, next) => {
  try {
    const { unread, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = { userId: req.user.id };
    if (unread === 'true') where.isRead = false;
    else if (unread === 'false') where.isRead = true;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
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

// ─── GET /api/notifications/unread-count ─────────────────────────

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read.', data: { notification: updated } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/notifications/read-all ───────────────────────────

export const markAllAsRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: `Marked ${count} notification(s) as read.`, data: { updatedCount: count } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/notifications/:id ───────────────────────────────

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};
