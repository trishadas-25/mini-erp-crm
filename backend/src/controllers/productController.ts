import { Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Price must be >= 0"),
  minStockAlert: z.number().min(0).nullish(),
  location: z.string().nullish(),
});

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    
    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = productSchema.parse(req.body);
    
    // check if sku exists
    const existing = await prisma.product.findUnique({ where: { sku: validatedData.sku } });
    if (existing) {
      res.status(400).json({ message: 'SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: validatedData,
    });
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: validatedData,
    });
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const stockMovementSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.enum(['IN', 'OUT']),
  reason: z.string().optional(),
});

export const addStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = stockMovementSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (validatedData.type === 'OUT' && product.stock < validatedData.quantity) {
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    const newStock = validatedData.type === 'IN' 
      ? product.stock + validatedData.quantity 
      : product.stock - validatedData.quantity;

    // Transaction to ensure atomicity
    const result = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: id,
          quantity: validatedData.quantity,
          type: validatedData.type,
          reason: validatedData.reason,
          createdBy: userId, // Assuming you might have a relation, but it's a string here
        }
      }),
      prisma.product.update({
        where: { id },
        data: { stock: newStock }
      })
    ]);

    res.status(201).json({ movement: result[0], newStock: result[1].stock });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};
