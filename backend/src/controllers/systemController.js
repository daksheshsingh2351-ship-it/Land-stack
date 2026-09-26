import prisma from '../config/database.js';

const VALID_STATUSES = ['CONNECTED', 'DISCONNECTED', 'SYNCING', 'ERROR'];

// ─── GET /api/systems ─────────────────────────────────────────────

export const listSystems = async (req, res, next) => {
  try {
    const { status, systemType } = req.query;

    const where = {};
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (systemType) where.systemType = systemType;

    const systems = await prisma.connectedSystem.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        systemType: true,
        description: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, data: { systems } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/systems/:id ─────────────────────────────────────────

export const getSystemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const system = await prisma.connectedSystem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        systemType: true,
        description: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!system) {
      return res.status(404).json({ success: false, message: 'Connected system not found.' });
    }

    res.json({ success: true, data: { system } });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/systems ────────────────────────────────────────────

export const createSystem = async (req, res, next) => {
  try {
    const { name, systemType, description, status } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!systemType || typeof systemType !== 'string' || systemType.trim() === '') {
      return res.status(400).json({ success: false, message: 'System type is required.' });
    }

    // Check if system with this name already exists
    const existing = await prisma.connectedSystem.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A system with this name already exists.' });
    }

    const data = {
      name: name.trim(),
      systemType: systemType.trim(),
      description: description || null,
    };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` });
      }
      data.status = status;
    }

    const system = await prisma.connectedSystem.create({
      data,
      select: {
        id: true,
        name: true,
        systemType: true,
        description: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ success: true, message: 'System configuration created.', data: { system } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/systems/:id ───────────────────────────────────────

export const updateSystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, systemType, description, status } = req.body;

    const system = await prisma.connectedSystem.findUnique({ where: { id } });
    if (!system) {
      return res.status(404).json({ success: false, message: 'Connected system not found.' });
    }

    const data = {};

    if (name) {
      const existing = await prisma.connectedSystem.findUnique({ where: { name: name.trim() } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, message: 'A system with this name already exists.' });
      }
      data.name = name.trim();
    }

    if (systemType) data.systemType = systemType.trim();
    if (description !== undefined) data.description = description;

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` });
      }
      data.status = status;
      
      // Update lastSyncAt if status becomes SYNCING or CONNECTED
      if (status === 'SYNCING') {
        data.lastSyncAt = new Date();
      }
    }

    const updatedSystem = await prisma.connectedSystem.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        systemType: true,
        description: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, message: 'System updated.', data: { system: updatedSystem } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/systems/:id ──────────────────────────────────────

export const deleteSystem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const system = await prisma.connectedSystem.findUnique({ where: { id } });
    if (!system) {
      return res.status(404).json({ success: false, message: 'Connected system not found.' });
    }

    await prisma.connectedSystem.delete({ where: { id } });

    res.json({ success: true, message: 'System deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
