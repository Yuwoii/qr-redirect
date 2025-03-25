import QRCode from 'qrcode';
import logger from './logger';
import { AppError, ErrorType } from './error-handler';
// Fix the canvas import for client-side rendering
let createCanvas: any;
let loadImage: any;

// Only import on the server side
if (typeof window === 'undefined') {
  const canvasModule = require('canvas');
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
} else {
  // Client-side polyfill
  createCanvas = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };
  loadImage = async (src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };
}

/**
 * QR code customization options
 */
export interface QRCodeCustomOptions {
  // Standard QR code options
  margin?: number;
  width?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  
  // Color options
  color?: {
    dark?: string;
    light?: string;
  };
  
  // Logo options
  logo?: {
    src?: string;
    width?: number;
    height?: number;
    opacity?: number;
    border?: boolean;
    borderWidth?: number;
    borderColor?: string;
  };
  
  // Style options
  style?: {
    // The shape of dots in the QR code ('square', 'rounded', 'dots')
    dotShape?: 'square' | 'rounded' | 'dots';
    // The shape of corners in the QR code ('square', 'rounded')
    cornerShape?: 'square' | 'rounded';
    // The style of corners in the QR code ('square', 'dot')
    cornerDotStyle?: 'square' | 'dot';
  };
}

/**
 * QR code generation error
 */
export class QRCodeGenerationError extends AppError {
  constructor(message: string, originalError?: Error) {
    super({
      message,
      type: ErrorType.SERVER,
      code: 'QR_CODE_GENERATION_ERROR',
      statusCode: 500,
      originalError,
      context: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Default QR code options
 */
export const defaultQRCodeOptions: QRCodeCustomOptions = {
  margin: 1,
  width: 300,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#ffffff'
  },
  style: {
    dotShape: 'square',
    cornerShape: 'square',
    cornerDotStyle: 'square'
  }
};

/**
 * Generate a QR code as a data URL for the given URL
 * @param url The URL to encode in the QR code
 * @param options Options for QR code generation
 * @returns A Promise that resolves to a data URL string
 */
export async function generateQRCodeDataURL(
  url: string, 
  customOptions: Partial<QRCodeCustomOptions> = {}
): Promise<string> {
  try {
    // Validate URL
    validateQRCodeURL(url);
    
    // Merge options
    const options = mergeOptions(customOptions);
    
    logger.debug(`Generating QR code data URL for: ${url}`, 'generateQRCodeDataURL');
    
    // Basic options for QRCode library
    const qrCodeOptions: QRCode.QRCodeToDataURLOptions = {
      margin: options.margin,
      width: options.width,
      errorCorrectionLevel: options.errorCorrectionLevel,
      color: options.color
    };
    
    // If we have advanced styling options or a logo, we need to generate a custom QR code
    if (options.logo?.src || options.style?.dotShape !== 'square' || 
        options.style?.cornerShape !== 'square' || options.style?.cornerDotStyle !== 'square') {
      return generateCustomQRCode(url, options);
    }
    
    // Otherwise, use the standard QR code library
    return await QRCode.toDataURL(url, qrCodeOptions);
  } catch (error) {
    logger.error(`Error generating QR code data URL: ${(error as Error).message}`, 'generateQRCodeDataURL', error as Error);
    throw new QRCodeGenerationError(`Failed to generate QR code data URL: ${(error as Error).message}`, error as Error);
  }
}

/**
 * Generate a QR code as an SVG string for the given URL
 * @param url The URL to encode in the QR code
 * @param options Options for QR code generation
 * @returns A Promise that resolves to an SVG string
 */
export async function generateQRCodeSVG(
  url: string, 
  customOptions: Partial<QRCodeCustomOptions> = {}
): Promise<string> {
  try {
    // Validate URL
    validateQRCodeURL(url);
    
    // Merge options
    const options = mergeOptions(customOptions);
    
    logger.debug(`Generating QR code SVG for: ${url}`, 'generateQRCodeSVG');
    
    // Basic options for QRCode library
    const qrCodeOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
      margin: options.margin,
      width: options.width,
      errorCorrectionLevel: options.errorCorrectionLevel,
      color: options.color
    };
    
    // If we have a logo, we currently can't use SVG directly
    // For now, generate a basic SVG without advanced styling
    return await QRCode.toString(url, qrCodeOptions);
  } catch (error) {
    logger.error(`Error generating QR code SVG: ${(error as Error).message}`, 'generateQRCodeSVG', error as Error);
    throw new QRCodeGenerationError(`Failed to generate QR code SVG: ${(error as Error).message}`, error as Error);
  }
}

/**
 * Generate a custom QR code with advanced styling options
 * @param url The URL to encode in the QR code
 * @param options Customization options
 * @returns A Promise that resolves to a data URL string
 */
async function generateCustomQRCode(url: string, options: QRCodeCustomOptions): Promise<string> {
  try {
    // Generate the QR code data matrix manually
    // We'll use the toCanvas method internally and then access its data
    // Create a temporary canvas to generate the QR code data
    const tempCanvas = createCanvas(options.width || 300, options.width || 300);
    
    // Use the native QRCode.toCanvas method to generate the QR code on our canvas
    await new Promise<void>((resolve, reject) => {
      QRCode.toCanvas(
        tempCanvas,
        url,
        {
          errorCorrectionLevel: options.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H' || 'M',
          margin: options.margin || 1,
          width: options.width || 300,
          color: options.color || { dark: '#000000', light: '#ffffff' }
        },
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Get the QR matrix data from the canvas
    const qrContext = tempCanvas.getContext('2d');
    const qrData = qrContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Now create our final canvas for custom rendering
    const canvas = createCanvas(options.width || 300, options.width || 300);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = options.color?.light || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // We need to determine the QR code structure from the image data
    // This is a simplified approach - we'll detect dark modules from the generated image
    const moduleSize = (options.width || 300) / 25; // Typical QR code is 25x25 for version 1
    const margin = (options.margin || 0) * moduleSize;
    
    // Extract module information from the image data
    const modules: boolean[][] = [];
    const pixelSize = tempCanvas.width / 25;
    
    for (let i = 0; i < 25; i++) {
      modules[i] = [];
      for (let j = 0; j < 25; j++) {
        // Sample the center of each expected module
        const x = Math.floor(j * pixelSize + pixelSize / 2);
        const y = Math.floor(i * pixelSize + pixelSize / 2);
        const pixelIndex = (y * tempCanvas.width + x) * 4;
        
        // If it's dark (all RGB values close to 0), this is a filled module
        const isDark = 
          qrData.data[pixelIndex] < 128 && 
          qrData.data[pixelIndex + 1] < 128 && 
          qrData.data[pixelIndex + 2] < 128;
        
        modules[i][j] = isDark;
      }
    }
    
    // Draw the QR code with custom styling based on our extracted module data
    await drawCustomQRCode(ctx, { modules }, options);
    
    // Add logo if provided
    if (options.logo?.src) {
      await addLogoToQRCode(ctx, options.logo.src, options);
    }
    
    // Return as data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    logger.error(`Error generating custom QR code: ${(error as Error).message}`, 'generateCustomQRCode', error as Error);
    throw new QRCodeGenerationError(`Failed to generate custom QR code: ${(error as Error).message}`, error as Error);
  }
}

// Export the drawCustomQRCode, drawRoundedSquare, and drawCircle functions
export async function drawCustomQRCode(
  ctx: CanvasRenderingContext2D, 
  qrData: { modules: boolean[][] }, 
  options: QRCodeCustomOptions
): Promise<void> {
  const moduleCount = qrData.modules.length;
  const moduleSize = (options.width || 300) / moduleCount;
  const margin = (options.margin || 0) * moduleSize;
  
  // Get the colors from options, ensuring they're in a usable format
  const darkColor = options.color?.dark || '#000000';
  const lightColor = options.color?.light || '#ffffff';
  
  // First, fill the entire canvas with the light color (background)
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, (options.width || 300), (options.width || 300));
  
  // Save the context state to ensure proper styling
  ctx.save();
  
  // Now we'll draw each module in the dark color
  // Draw each module (dot) of the QR code
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Check if this module should be drawn (is dark)
      if (qrData.modules[row][col]) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        
        // Important: Set the fill style for EACH drawing operation
        // This ensures the color is consistently applied
        ctx.fillStyle = darkColor;
        
        // Check if this is a special position (e.g., corner)
        const isCorner = 
          (row < 7 && col < 7) || // Top-left corner
          (row < 7 && col >= moduleCount - 7) || // Top-right corner
          (row >= moduleCount - 7 && col < 7); // Bottom-left corner
        
        // Check if this is a corner dot (center of a corner)
        const isCornerDot = 
          (row >= 2 && row < 5 && col >= 2 && col < 5) || // Top-left corner dot
          (row >= 2 && row < 5 && col >= moduleCount - 5 && col < moduleCount - 2) || // Top-right corner dot
          (row >= moduleCount - 5 && row < moduleCount - 2 && col >= 2 && col < 5); // Bottom-left corner dot
        
        if (isCorner && options.style?.cornerShape === 'rounded') {
          // Draw rounded corner with explicit color
          drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 3, darkColor);
        } else if (isCornerDot && options.style?.cornerDotStyle === 'dot') {
          // Draw corner dot as circle with explicit color
          drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor);
        } else {
          // Draw regular module based on selected style
          switch (options.style?.dotShape) {
            case 'rounded':
              drawRoundedSquare(ctx, x, y, moduleSize, moduleSize, moduleSize / 4, darkColor);
              break;
            case 'dots':
              drawCircle(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, darkColor);
              break;
            case 'square':
            default:
              // Directly set fill style before each draw operation
              ctx.fillStyle = darkColor;
              ctx.fillRect(x, y, moduleSize, moduleSize);
              break;
          }
        }
      }
    }
  }
  
  // Restore the context state
  ctx.restore();
}

/**
 * Add a logo to the center of a QR code
 * @param ctx Canvas context
 * @param logoSource File or URL for the logo
 * @param options Customization options
 */
export async function addLogoToQRCode(
  ctx: CanvasRenderingContext2D, 
  logoSource: File | string,
  options: QRCodeCustomOptions
): Promise<void> {
  // Check if we even have logo source
  if (!logoSource && !options.logo?.src) return;
  
  try {
    const canvasSize = options.width || 300;
    // Use the calculated dimensions from options
    const logoWidth = options.logo?.width || canvasSize * 0.2;
    const logoHeight = options.logo?.height || logoWidth;
    
    // Load the logo image
    let logo;
    if (options.logo?.src) {
      logo = await loadImage(options.logo.src);
    } else if (typeof logoSource === 'string') {
      logo = await loadImage(logoSource);
    } else if (logoSource instanceof File) {
      // If it's a File object, create a URL for it
      const url = URL.createObjectURL(logoSource);
      logo = await loadImage(url);
      // Clean up the URL after loading
      URL.revokeObjectURL(url);
    } else {
      throw new Error('Invalid logo source');
    }
    
    // Calculate logo position (center)
    const x = (canvasSize - logoWidth) / 2;
    const y = (canvasSize - logoHeight) / 2;
    
    // Save the current state
    ctx.save();
    
    // No border radius handling as it's been removed
    
    // Add white background for logo
    ctx.fillStyle = '#ffffff';
    
    if (options.logo?.border) {
      const borderWidth = options.logo.borderWidth || 5;
      ctx.fillRect(
        x - borderWidth, 
        y - borderWidth, 
        logoWidth + 2 * borderWidth, 
        logoHeight + 2 * borderWidth
      );
      
      // Draw border
      if (options.logo?.borderColor) {
        ctx.strokeStyle = options.logo.borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          x - borderWidth / 2, 
          y - borderWidth / 2, 
          logoWidth + borderWidth, 
          logoHeight + borderWidth
        );
      }
    } else {
      ctx.fillRect(x, y, logoWidth, logoHeight);
    }
    
    // Draw the logo with opacity
    if (options.logo?.opacity !== undefined && options.logo.opacity < 1) {
      ctx.globalAlpha = options.logo.opacity;
    }
    
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    
    // Restore the state
    ctx.restore();
  } catch (error) {
    logger.error(`Error adding logo to QR code: ${(error as Error).message}`, 'addLogoToQRCode', error as Error);
    throw new QRCodeGenerationError(`Failed to add logo to QR code: ${(error as Error).message}`, error as Error);
  }
}

/**
 * Helper function to draw a rounded square
 */
function drawRoundedSquare(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number,
  color: string
): void {
  // Save the current context state
  ctx.save();
  
  // Explicitly set the fill color
  ctx.fillStyle = color;
  
  // Draw the rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  
  // Fill the path with the specified color
  ctx.fill();
  
  // Restore the context state
  ctx.restore();
}

/**
 * Helper function to draw a circle
 */
function drawCircle(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  radius: number,
  color: string
): void {
  // Save the current context state
  ctx.save();
  
  // Explicitly set the fill color
  ctx.fillStyle = color;
  
  // Draw the circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.closePath();
  
  // Fill the circle with the specified color
  ctx.fill();
  
  // Restore the context state
  ctx.restore();
}

/**
 * Merge custom options with defaults
 * @param customOptions User-provided options
 * @returns Merged options
 */
function mergeOptions(customOptions: Partial<QRCodeCustomOptions> = {}): QRCodeCustomOptions {
  return {
    ...defaultQRCodeOptions,
    ...customOptions,
    color: {
      ...defaultQRCodeOptions.color,
      ...customOptions.color
    },
    style: {
      ...defaultQRCodeOptions.style,
      ...customOptions.style
    },
    logo: customOptions.logo ? {
      width: (customOptions.width || 300) * 0.2,
      height: (customOptions.width || 300) * 0.2,
      opacity: customOptions.logo.opacity !== undefined ? customOptions.logo.opacity : 1,
      border: customOptions.logo.border !== undefined ? customOptions.logo.border : true,
      borderWidth: customOptions.logo.borderWidth || 5,
      borderColor: customOptions.logo.borderColor || '#ffffff',
      ...customOptions.logo
    } : undefined
  };
}

/**
 * Validate a URL for QR code generation
 * @param url The URL to validate
 * @throws Error if the URL is invalid
 */
export function validateQRCodeURL(url: string): void {
  if (!url) {
    throw new QRCodeGenerationError('URL is required for QR code generation');
  }
  
  try {
    // Check if URL is valid
    new URL(url);
  } catch {
    throw new QRCodeGenerationError(`Invalid URL for QR code: ${url}`);
  }
} 