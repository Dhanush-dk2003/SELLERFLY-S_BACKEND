import prisma from "../prisma/client.js";

/* =========================================================
   CLIENT SECTION (Growth Page)
========================================================= */

// ✅ Update Client State (active/inactive, phone, productCount)
export const updateClientGrowth = async (req, res) => {
  try {
    const { id } = req.params;
    const { active, phoneNumber, productCount } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        active,
        phoneNumber,
        productCount,
      },
    });

    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client growth fields:", error);
    res.status(500).json({ message: "Error updating client" });
  }
};


/* =========================================================
   FOLLOWUP SECTION
========================================================= */

// ✅ Add new followup
export const addFollowup = async (req, res) => {
  try {
    const { clientId, companyName, portalName, type, description } = req.body;

    const followup = await prisma.followup.create({
      data: {
        clientId,
        companyName,
        portalName,
        type,
        description,
        date: new Date(), // auto set today’s date
      },
    });

    res.status(201).json(followup);
  } catch (error) {
    console.error("Error creating followup:", error);
    res.status(500).json({ message: "Error creating followup" });
  }
};

// ✅ Get all followups (with optional date filter + search)
export const getFollowups = async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    const whereClause = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { portalName: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const followups = await prisma.followup.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    res.json(followups);
  } catch (error) {
    console.error("Error fetching followups:", error);
    res.status(500).json({ message: "Error fetching followups" });
  }
};

// ✅ Delete selected followups
export const deleteFollowups = async (req, res) => {
  try {
    const { ids } = req.body; // expects an array of followup IDs

    await prisma.followup.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: "Followups deleted successfully" });
  } catch (error) {
    console.error("Error deleting followups:", error);
    res.status(500).json({ message: "Error deleting followups" });
  }
};
