import prisma from "../prisma/client.js";

// Create one or multiple portals for a client
export const createPortals = async (req, res) => {
  try {
    const { clientId, portals } = req.body;

    if (!clientId || !Array.isArray(portals) || portals.length === 0) {
      return res.status(400).json({ message: "clientId and portals[] are required" });
    }

    // Validate client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Insert many portals
    const createdPortals = await prisma.portal.createMany({
      data: portals.map(p => ({
        clientId,
        portalName: p.portalName,
        username: p.username,
        password: p.password,
        status: p.status || "TODO",
        remarks: p.remarks || null,
      })),
      skipDuplicates: true, // avoid duplicate [clientId, portalName, username]
    });

    res.status(201).json({
      message: "Portals created successfully",
      count: createdPortals.count,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating portals", error: err.message });
  }
};

// Get all portals (with client info)
export const getPortals = async (req, res) => {
  try {
    const portals = await prisma.portal.findMany({
      include: { client: { select: { id: true, companyName: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(portals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching portals", error: err.message });
  }
};

// Get portals for a single client
export const getPortalsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const portals = await prisma.portal.findMany({
      where: { clientId: Number(clientId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(portals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client portals", error: err.message });
  }
};

// Update a portal
export const updatePortal = async (req, res) => {
  try {
    const { id } = req.params;
    const { portalName, username, password, status, remarks } = req.body;

    const portal = await prisma.portal.update({
      where: { id: Number(id) },
      data: { portalName, username, password, status, remarks },
    });

    res.json({ message: "Portal updated successfully", portal });
  } catch (err) {
    res.status(500).json({ message: "Error updating portal", error: err.message });
  }
};

// Delete a portal
export const deletePortal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.portal.delete({ where: { id: Number(id) } });
    res.json({ message: "Portal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting portal", error: err.message });
  }
};
// In portalController.js
export const getPortalsGrouped = async (req, res) => {
  try {
    const portals = await prisma.client.findMany({
      include: {
        portals: true, // fetch all portals for that client
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(portals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching portals", error: err.message });
  }
};
