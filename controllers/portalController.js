import prisma from "../prisma/client.js";

// Create multiple portals
export const createPortals = async (req, res) => {
  try {
    const { clientId, portals } = req.body;

    if (!clientId || !Array.isArray(portals) || portals.length === 0) {
      return res
        .status(400)
        .json({ message: "clientId and portals[] are required" });
    }

    const client = await prisma.client.findUnique({
      where: { id: Number(clientId) },
    });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const createdPortals = await prisma.portal.createMany({
      data: portals.map((p) => ({
        clientId: Number(clientId),
        portalName: p.portalName === "Custom" ? p.customPortal : p.portalName,
        username: p.username,
        password: p.password,
        status: p.status || "TODO",
        remarks: p.remarks || null,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.endDate ? new Date(p.endDate) : null,
        portalHealth: p.portalHealth || null,
        portalLink: p.portalLink || null,
        masterLink: p.masterLink || null,
        registeredBy: p.registeredBy || "US",
        
      })),
    });

    return res.status(201).json({
      message: "Portals created successfully",
      count: createdPortals.count,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error creating portals", error: err.message });
  }
};

// Get all portals (with client info)
export const getPortals = async (req, res) => {
  try {
    const portals = await prisma.portal.findMany({
      include: {
        client: { select: { id: true, companyName: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(portals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching portals", error: err.message });
  }
};

// Get portals for a single client
export const getPortalsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { department } = req.query; // optional query filter

    const portals = await prisma.portal.findMany({
      where: {
        clientId: Number(clientId),
        ...(department && { department }), // filter if query param provided
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(portals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching client portals", error: err.message });
  }
};

// Catalog = Only KEY ACC MANAGEMENT portals for a client
export const getCatalogByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const portals = await prisma.portal.findMany({
      where: {
        clientId: Number(clientId),
        department: "KEY ACC MANAGEMENT",
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(portals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching catalog portals", error: err.message });
  }
};

// Update a portal
export const updatePortal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      portalName,
      customPortal,
      username,
      password,
      status,
      remarks,
      startDate,
      endDate,
      portalHealth,
      portalLink,
      masterLink,
      registeredBy,
    } = req.body;

    const data = {
      portalName: portalName === "Custom" ? customPortal : portalName,
      username,
      password,
      status,
      remarks,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      portalHealth,
      portalLink: portalLink ?? null,
      masterLink: masterLink ?? null,
       ...(registeredBy && { registeredBy }),
    };

    const portal = await prisma.portal.update({
      where: { id: Number(id) },
      data,
    });

    return res.json({ message: "Portal updated successfully", portal });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating portal", error: err.message });
  }
};

// Delete a portal
export const deletePortal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.portal.delete({ where: { id: Number(id) } });
    res.json({ message: "Portal deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting portal", error: err.message });
  }
};

// Grouped portals by client
export const getPortalsGrouped = async (req, res) => {
  try {
    const portals = await prisma.client.findMany({
      include: { portals: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(portals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching portals", error: err.message });
  }
};

export const updatePortalsForClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { portals } = req.body;

    await prisma.portal.deleteMany({ where: { clientId: parseInt(clientId) } });

    const newPortals = await prisma.portal.createMany({
      data: portals.map((p) => ({
        clientId: parseInt(clientId),
        portalName: p.portalName === "Custom" ? p.customPortal : p.portalName,
        username: p.username,
        password: p.password,
        status: p.status || "TODO",
        remarks: p.remarks || null,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.endDate ? new Date(p.endDate) : null,
        portalHealth: p.portalHealth || null,
        portalLink: p.portalLink || null,
        masterLink: p.masterLink || null,
        registeredBy: p.registeredBy || "US",
      })),
    });

    res.json({ message: "Catalog updated", count: newPortals.count });
  } catch (error) {
    console.error("Error updating catalog", error);
    res.status(500).json({ error: "Failed to update catalog" });
  }
};
