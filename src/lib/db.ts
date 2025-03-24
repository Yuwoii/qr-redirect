import { getPrismaClient, executeWithRetry } from "./prisma-client";
import logger from "./logger";

// Get the Prisma client instance
const prismaClient = getPrismaClient();

// Repository pattern - User operations with retry logic
const userRepository = {
  findByEmail: (email: string) => {
    logger.debug(`Finding user by email: ${email}`, 'userRepository.findByEmail');
    return executeWithRetry(() => 
      prismaClient.user.findUnique({
        where: { email }
      })
    );
  },
  
  findById: (id: string) => {
    logger.debug(`Finding user by id: ${id}`, 'userRepository.findById');
    return executeWithRetry(() => 
      prismaClient.user.findUnique({
        where: { id }
      })
    );
  },
  
  create: (data: { name?: string; email: string; password: string }) => {
    logger.info(`Creating new user with email: ${data.email}`, 'userRepository.create');
    return executeWithRetry(() => 
      prismaClient.user.create({
        data
      })
    );
  },
  
  update: (id: string, data: { name?: string; email?: string; password?: string }) => {
    logger.info(`Updating user: ${id}`, 'userRepository.update');
    return executeWithRetry(() => 
      prismaClient.user.update({
        where: { id },
        data
      })
    );
  },
  
  delete: (id: string) => {
    logger.info(`Deleting user: ${id}`, 'userRepository.delete');
    return executeWithRetry(() => 
      prismaClient.user.delete({
        where: { id }
      })
    );
  },
};

// Repository pattern - QR Code operations with retry logic
const qrCodeRepository = {
  findById: (id: string) => {
    logger.debug(`Finding QR code by id: ${id}`, 'qrCodeRepository.findById');
    return executeWithRetry(() => 
      prismaClient.qRCode.findUnique({
        where: { id },
        include: { redirects: true }
      })
    );
  },
  
  findBySlug: (slug: string) => {
    logger.debug(`Finding QR code by slug: ${slug}`, 'qrCodeRepository.findBySlug');
    return executeWithRetry(() => 
      prismaClient.qRCode.findUnique({
        where: { slug },
        include: { redirects: { where: { isActive: true } } }
      })
    );
  },
  
  findByUser: (userId: string) => {
    logger.debug(`Finding QR codes for user: ${userId}`, 'qrCodeRepository.findByUser');
    return executeWithRetry(() => 
      prismaClient.qRCode.findMany({
        where: { userId },
        include: { redirects: true },
        orderBy: { createdAt: 'desc' }
      })
    );
  },
  
  create: (data: { name: string; slug: string; userId: string }) => {
    logger.info(`Creating new QR code: ${data.slug} for user: ${data.userId}`, 'qrCodeRepository.create');
    return executeWithRetry(() => 
      prismaClient.qRCode.create({
        data,
        include: { redirects: true }
      })
    );
  },
  
  update: (id: string, data: { name?: string; slug?: string }) => {
    logger.info(`Updating QR code: ${id}`, 'qrCodeRepository.update');
    return executeWithRetry(() => 
      prismaClient.qRCode.update({
        where: { id },
        data,
        include: { redirects: true }
      })
    );
  },
  
  delete: (id: string) => {
    logger.info(`Deleting QR code: ${id}`, 'qrCodeRepository.delete');
    return executeWithRetry(() => 
      prismaClient.qRCode.delete({
        where: { id }
      })
    );
  },
};

// Repository pattern - Redirect operations with retry logic
const redirectRepository = {
  findById: (id: string) => {
    logger.debug(`Finding redirect by id: ${id}`, 'redirectRepository.findById');
    return executeWithRetry(() => 
      prismaClient.redirect.findUnique({
        where: { id }
      })
    );
  },
  
  findByQRCode: (qrCodeId: string) => {
    logger.debug(`Finding redirects for QR code: ${qrCodeId}`, 'redirectRepository.findByQRCode');
    return executeWithRetry(() => 
      prismaClient.redirect.findMany({
        where: { qrCodeId },
        orderBy: { createdAt: 'desc' }
      })
    );
  },
  
  findActiveByQRCode: (qrCodeId: string) => {
    logger.debug(`Finding active redirect for QR code: ${qrCodeId}`, 'redirectRepository.findActiveByQRCode');
    return executeWithRetry(() => 
      prismaClient.redirect.findFirst({
        where: { 
          qrCodeId,
          isActive: true
        }
      })
    );
  },
  
  create: async (data: { url: string; qrCodeId: string; isActive?: boolean }) => {
    logger.info(`Creating new redirect to ${data.url} for QR code: ${data.qrCodeId}`, 'redirectRepository.create');
    
    // If this redirect will be active, deactivate all others first
    if (data.isActive) {
      await executeWithRetry(() => prismaClient.redirect.updateMany({
        where: { qrCodeId: data.qrCodeId },
        data: { isActive: false }
      }));
    }
    
    return executeWithRetry(() => 
      prismaClient.redirect.create({
        data
      })
    );
  },
  
  update: async (id: string, data: { url?: string; isActive?: boolean }) => {
    logger.info(`Updating redirect: ${id}`, 'redirectRepository.update');
    
    // If activating this redirect, deactivate all others
    if (data.isActive) {
      const redirect = await executeWithRetry(() => prismaClient.redirect.findUnique({
        where: { id }
      }));
      
      if (redirect) {
        await executeWithRetry(() => prismaClient.redirect.updateMany({
          where: { 
            qrCodeId: redirect.qrCodeId,
            id: { not: id }
          },
          data: { isActive: false }
        }));
      }
    }
    
    return executeWithRetry(() => 
      prismaClient.redirect.update({
        where: { id },
        data
      })
    );
  },
  
  incrementVisitCount: (id: string) => {
    logger.debug(`Incrementing visit count for redirect: ${id}`, 'redirectRepository.incrementVisitCount');
    return executeWithRetry(() => 
      prismaClient.redirect.update({
        where: { id },
        data: {
          visitCount: {
            increment: 1
          }
        }
      })
    );
  },
  
  delete: (id: string) => {
    logger.info(`Deleting redirect: ${id}`, 'redirectRepository.delete');
    return executeWithRetry(() => 
      prismaClient.redirect.delete({
        where: { id }
      })
    );
  },
};

// Create a repositories object
const repositories = {
  users: userRepository,
  qrCodes: qrCodeRepository,
  redirects: redirectRepository
};

// Create a Prisma-like interface for backward compatibility
const prisma = {
  user: prismaClient.user,
  qRCode: prismaClient.qRCode,
  redirect: prismaClient.redirect,
  ...repositories
};

// Export the repositories and the Prisma-like interface
export { userRepository, qrCodeRepository, redirectRepository };
export default prisma; 