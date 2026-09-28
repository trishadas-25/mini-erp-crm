import { Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const challanSchema = z.object({
  customerId: z.string().uuid(),
  status: z.enum(['DRAFT', 'CONFIRMED']).optional(),
  items: z.array(challanItemSchema).min(1, "At least one product is required"),
});

const generateChallanNo = async (): Promise<string> => {
  const count = await prisma.challan.count();
  return `CH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

export const getChallans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        challanItems: {
          include: { product: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = challanSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const challanNo = await generateChallanNo();
    let totalQuantity = 0;

    // Fetch products to validate stock and get snapshot info
    const productIds = validatedData.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const challanItemsData: any[] = [];

    for (const item of validatedData.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(400).json({ message: `Product ${item.productId} not found` });
        return;
      }
      
      // Stock check if confirmed
      if (validatedData.status === 'CONFIRMED' && product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        return;
      }

      totalQuantity += item.quantity;
      challanItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        snapshotPrice: product.unitPrice,
        snapshotName: product.name,
      });
    }

    // Transaction for creating challan and deducting stock if confirmed
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.create({
        data: {
          challanNo,
          customerId: validatedData.customerId,
          totalQuantity,
          status: validatedData.status || 'DRAFT',
          createdBy: userId,
          challanItems: {
            create: challanItemsData
          }
        },
        include: {
          challanItems: true,
          customer: true
        }
      });

      if (validatedData.status === 'CONFIRMED') {
        for (const item of challanItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan ${challanNo}`,
              createdBy: userId
            }
          });
        }
      }

      return challan;
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (status !== 'CONFIRMED' && status !== 'CANCELLED') {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { challanItems: true }
    });

    if (!challan) {
      res.status(404).json({ message: 'Challan not found' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ message: 'Only draft challans can be updated' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (status === 'CONFIRMED') {
        // Deduct stock
        for (const item of challan.challanItems) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
             throw new Error(`Insufficient stock for product ID: ${item.productId}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan ${challan.challanNo}`,
              createdBy: userId
            }
          });
        }
      }

      return tx.challan.update({
        where: { id },
        data: { status }
      });
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};
