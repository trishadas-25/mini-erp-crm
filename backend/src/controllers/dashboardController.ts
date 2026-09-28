import { Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      totalUsers
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count(),
      isAdmin ? prisma.user.count() : Promise.resolve(0)
    ]);

    // Calculate total stock value (unitPrice * stock)
    const allProducts = await prisma.product.findMany({ select: { unitPrice: true, stock: true }});
    const totalInventoryValue = allProducts.reduce((acc, p) => acc + (p.unitPrice * p.stock), 0);

    res.json({
      totalCustomers,
      totalProducts,
      totalChallans,
      totalInventoryValue,
      ...(isAdmin && { totalUsers })
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
    res.status(500).json({ message: 'Server error' });
  }
};
