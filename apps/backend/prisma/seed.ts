import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create Mock User
  await prisma.user.create({
    data: {
      id: 'mock-user-id',
      email: 'demo@outsiders.com',
      password: 'hashed-password-placeholder', // In real app, hash this
      name: 'Demo User',
      role: 'USER',
    },
  });

  // Create Products
  const products = [
    {
      name: 'Shift Navy Cropped Blazer',
      description: 'Wool blend · Oversized',
      price: 1320.00,
      stock: 10,
      imageUrl: 'https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      name: 'Rougher Off-Sand Knit',
      description: 'Heavy knit · Unisex',
      price: 890.00,
      stock: 15,
      imageUrl: 'https://images.pexels.com/photos/7671121/pexels-photo-7671121.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      name: 'Alt Navy Tailored Pant',
      description: 'Wide leg · Pinstripe',
      price: 760.00,
      stock: 20,
      imageUrl: 'https://images.pexels.com/photos/7671220/pexels-photo-7671220.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      name: 'Jay Black Loafer',
      description: 'Leather · Everyday',
      price: 1050.00,
      stock: 8,
      imageUrl: 'https://images.pexels.com/photos/4464825/pexels-photo-4464825.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
