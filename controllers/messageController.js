// controllers/messageController.js
import prisma from "../prisma/client.js";

// @GET /api/messages
export const getMessages = async (req, res) => {
  try {
    const userEmail = req.user.officialEmail;

const messages = await prisma.permissionRequest.findMany({
  where: {
    OR: [
      {
        toEmail: userEmail,
        receiverDeleted: false
      },
      {
        requestedBy: { officialEmail: userEmail },
        senderDeleted: false
      }
    ]
  },
  include: {
    requestedBy: true,
    respondedBy: true,
  },
  orderBy: { createdAt: "desc" },
});


    // ✅ Make sure to include 'to' as an array so frontend can check it
    const result = messages.map((msg) => ({
      id: msg.id,
      from: msg.requestedBy.officialEmail,
      to: [msg.toEmail], // ✅ wrap toEmail as array for compatibility
      content: msg.reason,
      timeRange: `${msg.startTime} - ${msg.endTime}`,
      status: msg.status,
    }));

    res.json(result);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
};

// @POST /api/messages
// @POST /api/messages
export const createMessage = async (req, res) => {
  const { to, content, startTime, endTime } = req.body;

  const requests = await Promise.all(
    to.map((toEmail) =>
      prisma.permissionRequest.create({
        data: {
          requestedBy: { connect: { officialEmail: req.user.officialEmail } }, // Changed from email to officialEmail
          toEmail,
          reason: content,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      })
    )
  );

  res.status(201).json({
    id: requests[0].id,
    from: req.user.officialEmail,
    to: to,
    content,
    timeRange: `${startTime} - ${endTime}`,
    status: "PENDING",
  });
};


// @DELETE /api/messages/:id
export const deleteMessage = async (req, res) => {
  const userEmail = req.user.officialEmail;

  const msg = await prisma.permissionRequest.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { requestedBy: true },
  });

  if (!msg) return res.status(404).json({ error: "Message not found" });

  // Decide which side is deleting
  const isSender = msg.requestedBy.officialEmail === userEmail;
  const isReceiver = msg.toEmail === userEmail;

  if (!isSender && !isReceiver)
    return res.status(403).json({ error: "Not authorized to delete this message" });

  const updated = await prisma.permissionRequest.update({
    where: { id: msg.id },
    data: {
      senderDeleted: isSender ? true : msg.senderDeleted,
      receiverDeleted: isReceiver ? true : msg.receiverDeleted,
    },
  });

  res.json({ success: true });
};

// @PATCH /api/messages/:id/status
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log("🔁 Updating message ID:", req.params.id);
    console.log("New status:", status);
    console.log("Responder:", req.user.officialEmail);

    const updated = await prisma.permissionRequest.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        respondedBy: { connect: { officialEmail: req.user.officialEmail } }, // Ensure officialEmail is used
        updatedAt: new Date(),
      },
    });

    res.json({ success: true, status: updated.status });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Failed to update message status" });
  }
};

