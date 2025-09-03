import prisma from "../prisma/client.js";
import { fileTypeFromBuffer } from "file-type";

// 🔹 Helper to exclude profilePic from JSON responses
const formatUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    profilePic: null, // Exclude profilePic, fetch separately via /profile-pic/:employeeId
    hasProfilePic: !!user.profilePic, // Add flag: true if image exists
  };
};

// ✅ Get Next Employee ID
export const getNextEmployeeId = async (req, res) => {
  try {
    const lastUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
      select: { employeeId: true },
    });

    let maxNum = 0;
    if (lastUser?.employeeId) {
      maxNum = parseInt(lastUser.employeeId.slice(4));
    }

    const nextId = `SKSY${(maxNum + 1).toString().padStart(3, "0")}`;
    res.json({ nextId });
  } catch (error) {
    console.error("Get Next EmployeeId Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route   POST /api/users/create
// @access  Admin
export const createUserProfile = async (req, res) => {
  try {
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
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "dob",
      "gender",
      "joiningDate",
      "phoneNumber",
      "emergencyNumber",
      "officialEmail",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Ensure officialEmail is unique
    const existingUser = await prisma.user.findUnique({
      where: { officialEmail },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Official email already exists" });
    }

    // Generate next employeeId
    const lastUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
      select: { employeeId: true },
    });
    let maxNum = 0;
    if (lastUser?.employeeId) {
      maxNum = parseInt(lastUser.employeeId.slice(4));
    }
    const nextId = `SKSY${(maxNum + 1).toString().padStart(3, "0")}`;

    // Validate profile picture if provided
    let profilePicBuffer = null;
    if (req.file) {
      try {
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !type.mime.startsWith('image/')) {
          return res.status(400).json({ message: "Profile picture must be a valid image file" });
        }
        profilePicBuffer = req.file.buffer;
      } catch (error) {
        console.error("Profile picture validation error:", error);
        return res.status(400).json({ message: "Invalid profile picture file" });
      }
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        employeeId: nextId,
        firstName,
        lastName,
        dob: dob ? new Date(dob) : null,
        gender,
        bloodGroup,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
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
        profilePic: profilePicBuffer,
      },
    });

    res.status(201).json({
      message: "User profile created successfully",
      user: formatUser(newUser),
    });
  } catch (error) {
    console.error("Create Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route   GET /api/users
// @access  Admin
export const getAllProfiles = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users.map(formatUser)); // Use formatUser to include hasProfilePic
  } catch (err) {
    console.error("Get All Profiles Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/users/profile/:employeeId
// @access  Admin
export const getProfileById = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const profile = await prisma.user.findUnique({
      where: { employeeId },
    });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(formatUser(profile));
  } catch (err) {
    console.error("Get Profile By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/users/search/:term
// @access  Admin
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
      return res.status(404).json({ message: "No matching profiles found" });
    }
    res.json(results.map(formatUser));
  } catch (err) {
    console.error("Search Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ FIXED: Controller: Get Profile Picture
export const getProfilePic = async (req, res) => {
  try {
    const { employeeId } = req.params;
    // console.log("Fetching profile picture for employeeId:", employeeId);
    
    const user = await prisma.user.findUnique({
      where: { employeeId },
      select: { profilePic: true },
    });

    // console.log("User found:", !!user, "ProfilePic exists:", !!user?.profilePic);
    
    // Return 404 without JSON content for no profile picture
    if (!user || !user.profilePic) {
      return res.status(404).end(); // No JSON response, just HTTP 404
    }

    try {
      // Validate that the stored data is actually an image
      const type = await fileTypeFromBuffer(user.profilePic);
      let contentType = "application/octet-stream"; // Default fallback
      
      if (type && type.mime.startsWith("image/")) {
        contentType = type.mime;
      } else {
        // If file-type detection fails, try common image types based on magic bytes
        const buffer = user.profilePic;
        if (buffer.length >= 4) {
          // Check for common image signatures
          const signature = Array.from(buffer.subarray(0, 4))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('').toLowerCase();
          
          if (signature.startsWith('ffd8ff')) {
            contentType = 'image/jpeg';
          } else if (signature === '89504e47') {
            contentType = 'image/png';
          } else if (signature.startsWith('474946')) {
            contentType = 'image/gif';
          } else if (signature.startsWith('52494646')) {
            contentType = 'image/webp';
          } else {
            console.warn("Unknown image format, signature:", signature);
            // Still try to serve as generic image
            contentType = 'image/jpeg'; // Default to JPEG
          }
        }
      }
      
      // console.log("Backend Profile Pic MIME Type:", { 
      //   detected: type, 
      //   used: contentType,
      //   bufferSize: user.profilePic.length 
      // });
      
      // Set proper headers for image response
      res.set({
        'Content-Type': contentType,
        'Content-Length': user.profilePic.length,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': `"${Buffer.from(user.profilePic).toString('base64').slice(0, 16)}"` // Simple ETag
      });
      
      res.send(user.profilePic);
    } catch (fileTypeError) {
      console.error("File type detection error:", fileTypeError);
      // If file-type detection fails, still try to serve the image
      res.set({
        'Content-Type': 'image/jpeg', // Default assumption
        'Content-Length': user.profilePic.length,
      });
      res.send(user.profilePic);
    }
  } catch (err) {
    console.error("Get Profile Pic Error:", err);
    res.status(500).json({ 
      message: "Error fetching profile picture", 
      error: err.message 
    });
  }
};

// @route   PUT /api/users/profile/:employeeId
// @access  Admin
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
  } = req.body;

  try {
    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "dob",
      "gender",
      "joiningDate",
      "phoneNumber",
      "emergencyNumber",
      "officialEmail",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if profile exists
    const existingUser = await prisma.user.findUnique({
      where: { employeeId },
    });
    if (!existingUser) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if officialEmail is unique (excluding current user)
    if (officialEmail !== existingUser.officialEmail) {
      const emailInUse = await prisma.user.findUnique({
        where: { officialEmail },
      });
      if (emailInUse) {
        return res.status(400).json({ message: "Official email already exists" });
      }
    }

    // Handle profile picture update
    let profilePicBuffer = existingUser.profilePic; // Keep existing by default
    if (req.file) {
      try {
        const type = await fileTypeFromBuffer(req.file.buffer);
        if (!type || !type.mime.startsWith('image/')) {
          return res.status(400).json({ message: "Profile picture must be a valid image file" });
        }
        profilePicBuffer = req.file.buffer;
      } catch (error) {
        console.error("Profile picture validation error:", error);
        return res.status(400).json({ message: "Invalid profile picture file" });
      }
    }

    const updated = await prisma.user.update({
      where: { employeeId },
      data: {
        firstName,
        lastName,
        dob: dob ? new Date(dob) : undefined,
        gender,
        bloodGroup,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
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
        profilePic: profilePicBuffer,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: formatUser(updated),
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   DELETE /api/users/profile/:employeeId
// @access  Admin
export const deleteProfile = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { employeeId },
      select: { id: true },
    });
    if (!user) return res.status(404).json({ message: "Profile not found" });

    const userId = user.id;

    // Delete related UserSessions
    await prisma.userSession.deleteMany({ where: { userId } });

    // Disconnect user from projects
    const projects = await prisma.project.findMany({
      where: { users: { some: { id: userId } } },
      select: { id: true },
    });
    for (const project of projects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { users: { disconnect: { id: userId } } },
      });
    }

    // Delete PermissionRequests
    await prisma.permissionRequest.deleteMany({
      where: {
        OR: [{ requestedById: userId }, { respondedById: userId }],
      },
    });

    // Delete the user
    await prisma.user.delete({ where: { employeeId } });

    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};