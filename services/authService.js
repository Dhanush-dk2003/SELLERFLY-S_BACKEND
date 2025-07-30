import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const login = async (emailOrId, password) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { officialEmail: emailOrId },
        { employeeId: emailOrId }
      ]
    }
  });

  if (!user || !user.password) {
    throw new Error('User not found or password not set yet');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, employeeId: user.employeeId, officialEmail: user.officialEmail, role: user.role }, // Changed from user.email to user.officialEmail
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  await prisma.userSession.create({
    data: {
      userId: user.id,
      loginTime: new Date(),
    }
  });

  return { token, user };
};
