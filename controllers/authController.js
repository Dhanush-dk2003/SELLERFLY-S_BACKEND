import { login } from "../services/authService.js";
import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { employeeId, email, password, confirmPassword } = req.body;

    if (!employeeId || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Look for user created by admin
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ officialEmail: email }, { employeeId: employeeId }],
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found. Contact Admin." });
    }

    if (existingUser.password) {
      return res
        .status(400)
        .json({ message: "Password already set. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    res
      .status(200)
      .json({ message: "Password set successfully. You can now login." });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { emailOrId, password } = req.body;

    if (!emailOrId || !password) {
      return res
        .status(400)
        .json({ message: "Email/ID and password are required" });
    }

    const { token, user } = await login(emailOrId, password);

    // Create session only if not already today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        loginTime: {
          gte: todayStart,
        },
      },
    });

    if (!existingSession) {
      await prisma.userSession.create({
        data: {
          userId: user.id,
          loginTime: new Date(),
        },
      });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        officialEmail: user.officialEmail, // Already correct
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(401).json({ message: err.message || "Invalid credentials" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (userId) {
      // Find latest session without logoutTime
      const latestSession = await prisma.userSession.findFirst({
        where: {
          userId,
          logoutTime: null,
        },
        orderBy: {
          loginTime: "desc",
        },
      });

      if (latestSession) {
        const logoutTime = new Date();
        const durationMs = logoutTime - latestSession.loginTime;
        const durationHours = durationMs / (1000 * 60 * 60);

        await prisma.userSession.update({
          where: { id: latestSession.id },
          data: {
            logoutTime,
            totalDuration: durationHours,
          },
        });
      }
    }

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ message: "Failed to logout" });
  }
};
export const getAllSessions = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sessions = await prisma.userSession.findMany({
      where: {
        loginTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
            role: true,
          },
        },
      },
      orderBy: {
        loginTime: "asc",
      },
    });

    const userAggregates = {};

    sessions.forEach((session) => {
      const userId = session.user.id;

      if (!userAggregates[userId]) {
        userAggregates[userId] = {
          user: session.user,
          firstLogin: session.loginTime,
          lastLogout: session.logoutTime || null,
          totalHours: 0,
          isActive: false, // ✅ add default
        };
      }

      // Update first login if earlier
      if (session.loginTime < userAggregates[userId].firstLogin) {
        userAggregates[userId].firstLogin = session.loginTime;
      }

      // Update last logout if later
      if (
        session.logoutTime &&
        (!userAggregates[userId].lastLogout ||
          session.logoutTime > userAggregates[userId].lastLogout)
      ) {
        userAggregates[userId].lastLogout = session.logoutTime;
      }

      // Add total hours
      userAggregates[userId].totalHours += session.totalDuration || 0;

      // ✅ If there is any session with logoutTime null, mark as active
      if (!session.logoutTime) {
        userAggregates[userId].isActive = true;
      }
    });

    const finalData = Object.values(userAggregates);

    res.status(200).json(finalData);
  } catch (err) {
    console.error("Fetch sessions error:", err.message);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};
export const getSessionsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await prisma.userSession.findMany({
      where: {
        loginTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
            salary: true,
            employeeId: true,
            
          },
        },
      },
      orderBy: {
        loginTime: "asc",
      },
    });

    const dailyAggregates = {};

    sessions.forEach((session) => {
      const userId = session.user.id;
      const dateKey = session.loginTime.toISOString().slice(0, 10);

      if (!dailyAggregates[`${userId}-${dateKey}`]) {
        dailyAggregates[`${userId}-${dateKey}`] = {
          user: session.user,
          firstLogin: session.loginTime,
          lastLogout: session.logoutTime || null,
          totalHours: 0,
        };
      }

      if (session.loginTime < dailyAggregates[`${userId}-${dateKey}`].firstLogin) {
        dailyAggregates[`${userId}-${dateKey}`].firstLogin = session.loginTime;
      }

      if (
        session.logoutTime &&
        (!dailyAggregates[`${userId}-${dateKey}`].lastLogout ||
          session.logoutTime > dailyAggregates[`${userId}-${dateKey}`].lastLogout)
      ) {
        dailyAggregates[`${userId}-${dateKey}`].lastLogout = session.logoutTime;
      }

      dailyAggregates[`${userId}-${dateKey}`].totalHours += session.totalDuration || 0;
    });

    res.status(200).json(Object.values(dailyAggregates));
  } catch (err) {
    console.error("Fetch range sessions error:", err.message);
    res.status(500).json({ message: "Failed to fetch sessions in range" });
  }
};