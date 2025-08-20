// controllers/clientController.js
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import prisma from "../prisma/client.js"; // <- make sure this path is correct

// -------- Google Sheets config --------
const serviceAccountPath = path.join(process.cwd(), "service-account.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Google Service Account file not found:", serviceAccountPath);
}

const auth = new google.auth.GoogleAuth({
  keyFile: serviceAccountPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = "1hel2Gzvijg6EWdq5OEvkw8Hy_kQq_WcdvaTflxLlmTU"; // <--- your sheet ID
const sheetName = "Client Sheet"; // exact tab name in your spreadsheet

// -------- Helper: update entire sheet from DB --------
async function updateGoogleSheet() {
  try {
    // fetch DB data
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Prepare values (header + rows). Use String(...) to avoid undefined.toString() errors
    const values = [
      [
        "ID",
        "Company Name",
        "Full Name",
        "Mobile Number",
        "Address",
        "Email",
        "Pickup Address",
        "PAN Number",
        "PAN Card Link",
        "Bank Name",
        "Branch Name",
        "Account Holder Name",
        "Account Number",
        "IFSC Code",
        "GST Certificate Link",
        "Trademark Certificate Link",
        "Cancelled Cheque Link",
        "Signature Link",
        "Budget",
        "Created At",
      ],
      ...clients.map((c) => [
        String(c.id ?? ""),
        String(c.companyName ?? ""),
        String(c.fullName ?? ""),
        String(c.mobileNumber ?? ""),
        String(c.address ?? ""),
        String(c.email ?? ""),
        String(c.pickupAddress ?? ""),
        String(c.panNumber ?? ""),
        String(c.pancardLink ?? ""),
        String(c.bankName ?? ""),
        String(c.branchName ?? ""),
        String(c.accountHolderName ?? ""),
        String(c.accountNumber ?? ""),
        String(c.ifscCode ?? ""),
        String(c.gstCertificateLink ?? ""),
        String(c.trademarkCertificateLink ?? ""),
        String(c.cancelChequeLink ?? ""),
        String(c.signatureLink ?? ""),
        c.budget === null || c.budget === undefined ? "" : String(c.budget),
        c.createdAt ? new Date(c.createdAt).toISOString() : "",
      ]),
    ];

    // 1) Clear whole sheet range (A:Z) to remove leftover rows
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${sheetName}'!A:Z`,
    });

    // 2) Write fresh values starting at A1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    console.log("✅ Google Sheet updated successfully");
  } catch (err) {
    console.error("❌ Error updating Google Sheet:", err);
    // don't throw — allow controllers to continue returning appropriate HTTP errors
  }
}

// -------- Controllers (CRUD + search) --------

// Create Client
export const createClient = async (req, res) => {
  try {
    const data = { ...req.body };

    // Normalize budget: empty string -> null, otherwise parseFloat (if provided)
    if (data.budget === "") data.budget = null;
    else if (data.budget !== undefined && data.budget !== null)
      data.budget = isNaN(Number(data.budget)) ? null : Number(data.budget);

    const newClient = await prisma.client.create({ data });

    // Sync sheet (best-effort; failures are logged inside updateGoogleSheet)
    await updateGoogleSheet();

    return res.status(201).json({ message: "Client created", client: newClient });
  } catch (err) {
    console.error("Error creating client:", err);
    return res.status(500).json({ error: "Failed to create client", details: err.message });
  }
};

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    return res.status(500).json({ error: "Failed to fetch clients", details: err.message });
  }
};

// Get client by ID
export const getClientById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return res.status(404).json({ error: "Client not found" });
    return res.json(client);
  } catch (err) {
    console.error("Error fetching client by id:", err);
    return res.status(500).json({ error: "Failed to fetch client", details: err.message });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _id, createdAt, updatedAt, ...updateData } = req.body;

    // Normalize budget if present
    if (updateData.hasOwnProperty("budget")) {
      if (updateData.budget === "") updateData.budget = null;
      else updateData.budget = isNaN(Number(updateData.budget)) ? null : Number(updateData.budget);
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    await updateGoogleSheet();

    return res.json({ message: "Client updated", client: updated });
  } catch (err) {
    console.error("Error updating client:", err);
    return res.status(500).json({ error: "Failed to update client", details: err.message });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Ensure exists
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Client not found" });

    await prisma.client.delete({ where: { id } });

    await updateGoogleSheet();

    return res.json({ message: "Client deleted" });
  } catch (err) {
    console.error("Error deleting client:", err);
    return res.status(500).json({ error: "Failed to delete client", details: err.message });
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
