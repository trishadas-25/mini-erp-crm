import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prismaClient';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'])
});

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = userSchema.parse(req.body);
    
    if (!validatedData.password) {
      res.status(400).json({ message: 'Password is required for new users' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email is already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = userSchema.parse(req.body);
    
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
    };

    if (validatedData.password && validatedData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }

    // Check if changing email to an existing one
    const existing = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existing && existing.id !== req.params.id) {
      res.status(400).json({ message: 'Email is already in use' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent deleting oneself
    if (req.user?.id === id) {
      res.status(400).json({ message: "You cannot delete your own account" });
      return;
    }

    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
