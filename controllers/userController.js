import prisma from "../prisma/client.js";

export const getNextEmployeeId = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { employeeId: true },
  });

  let maxNum = 0;
  for (const u of users) {
    if (u.employeeId) {
      const num = parseInt(u.employeeId.slice(4)); // take numeric part
      if (num > maxNum) maxNum = num;
    }
  }

  const nextId = `SKSY${(maxNum + 1).toString().padStart(3, "0")}`;

  res.json({ nextId });
};

// @route   POST /api/users/create
// @access  Admin
export const createUserProfile = async (req, res) => {
  try {
    // ✅ Generate next employeeId
    const users = await prisma.user.findMany({
      select: { employeeId: true },
    });

    let maxNum = 0;
    for (const u of users) {
      if (u.employeeId) {
        const num = parseInt(u.employeeId.slice(4));
        if (num > maxNum) maxNum = num;
      }
    }

    const nextId = `SKSY${(maxNum + 1).toString().padStart(3, "0")}`;

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
      profilePic
    } = req.body;

    // Ensure officialEmail is unique
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ employeeId: nextId }, { officialEmail }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Employee ID or Email already exists" });
    }

    const newUser = await prisma.user.create({
      data: {
        employeeId: nextId,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        bloodGroup,
        joiningDate: new Date(joiningDate),
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
        profilePic,
      },
    });

    res.status(201).json({ message: "User profile created successfully", user: newUser });
  } catch (error) {
    console.error("Create Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
