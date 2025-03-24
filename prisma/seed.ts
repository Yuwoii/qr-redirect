import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });
  
  console.log(`Created user: ${user.email}`);
  
  // Create a test QR code
  const qrCode = await prisma.qRCode.upsert({
    where: { slug: 'test-qr' },
    update: {},
    create: {
      name: 'Test QR',
      slug: 'test-qr',
      userId: user.id,
    },
  });
  
  console.log(`Created QR code: ${qrCode.slug}`);
  
  // Create a test redirect
  const redirect = await prisma.redirect.create({
    data: {
      url: 'https://example.com',
      isActive: true,
      qrCodeId: qrCode.id,
    },
  });
  
  console.log(`Created redirect: ${redirect.url}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 