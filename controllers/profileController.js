import prisma from "../prisma/client.js";

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.user.findMany();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getsearchProfile = async (req, res) => {
  const { term } = req.params;

  try {
    const results = await prisma.user.findMany({
      where: {
        OR: [
          { employeeId: { contains: term, mode: "insensitive" } },
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
        ],
      },
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching profiles found." });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

export const getProfileById = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const profile = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  } 
};



export const updateProfile = async (req, res) => {
  const { employeeId } = req.params;
  const {
    firstName,
    lastName,
    dob,
    gender,
    bloodGroup,
    joiningDate,
    phoneNumber,
    emergencyNumber,
    officialEmail,
    personalEmail,
    address,
    role,
    department,
    designation,
    salary,
    bankName,
    accountNumber,
    ifscCode,
    profilePic, // this comes from req.body
  } = req.body;

  // console.log("Received profilePic:", profilePic?.slice(0, 100)); // add this line here

  try {
    const updated = await prisma.user.update({
      where: { employeeId },
      data: {
        firstName,
        lastName,
        dob: dob ? new Date(dob) : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        gender,
        bloodGroup,
        phoneNumber,
        emergencyNumber,
        officialEmail,
        personalEmail,
        address,
        role,
        department,
        designation,
        salary,
        bankName,
        accountNumber,
        ifscCode,
        profilePic: profilePic || undefined,  // this is the fix
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProfile = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { employeeId },
      select: { id: true },
    });

    if (!user) return res.status(404).json({ message: "Profile not found" });

    const userId = user.id;

    // Step 1: Delete related UserSessions
    await prisma.userSession.deleteMany({ where: { userId } });

    // Step 2: Disconnect user from projects
    const projects = await prisma.project.findMany({
      where: { users: { some: { id: userId } } },
      select: { id: true },
    });

    for (const project of projects) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
      });
    }

    // Step 3: Delete PermissionRequests
    await prisma.permissionRequest.deleteMany({
      where: {
        OR: [{ requestedById: userId }, { respondedById: userId }],
      },
    });

    // Step 4: Delete the user
    await prisma.user.delete({
      where: { employeeId },
    });

    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
