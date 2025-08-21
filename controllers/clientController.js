import prisma from "../prisma/client.js"; // <- make sure this path is correct

// Create client
export const createClient = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      mobileNumber,
      address,
      email,
      pickupAddress,
      gstCertificateNumber,
      bankName,
      branchName,
      accountHolderName,
      accountNumber,
      ifscCode,
      documentsLink,
      description,
      aPlus,
      brandWebstore,
      budget
    } = req.body;

    const client = await prisma.client.create({
      data: {
        fullName,
        companyName,
        mobileNumber,
        address,
        email,
        pickupAddress,
        gstCertificateNumber,
        bankName,
        branchName,
        accountHolderName,
        accountNumber,
        ifscCode,
        documentsLink,
        description,
        aPlus: aPlus || false,
        brandWebstore: brandWebstore || false,
        budget
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating client" });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      companyName,
      mobileNumber,
      address,
      email,
      pickupAddress,
      gstCertificateNumber,
      bankName,
      branchName,
      accountHolderName,
      accountNumber,
      ifscCode,
      documentsLink,
      description,
      aPlus,
      brandWebstore,
      budget
    } = req.body;

    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        fullName,
        companyName,
        mobileNumber,
        address,
        email,
        pickupAddress,
        gstCertificateNumber,
        bankName,
        branchName,
        accountHolderName,
        accountNumber,
        ifscCode,
        documentsLink,
        description,
        aPlus,
        brandWebstore,
        budget
      },
    });

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating client" });
  }
};

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients" });
  }
};

// Get single client
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: Number(id) },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client" });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};


// Search clients
export const searchClients = async (req, res) => {
  try {
    const q = req.params.query ?? "";
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { mobileNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(clients);
  } catch (err) {
    console.error("Error searching clients:", err);
    return res.status(500).json({ error: "Failed to search clients", details: err.message });
  }
};
