import { Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Valid mobile is required"),
  email: z.string().email().nullish().or(z.literal('')),
  businessName: z.string().nullish(),
  gstNumber: z.string().nullish(),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).nullish(),
  address: z.string().nullish(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).nullish(),
  followUpDate: z.string().nullish().transform(val => val ? new Date(val) : undefined),
  notes: z.string().nullish(),
});

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    
    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search } },
          { businessName: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: validatedData as any, // Type casting due to followUpDate transform
    });
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = customerSchema.parse(req.body);
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: validatedData as any,
    });
    res.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};
