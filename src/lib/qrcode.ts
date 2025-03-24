import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL for the given URL
 * @param url The URL to encode in the QR code
 * @param options Options for QR code generation
 * @returns A Promise that resolves to a data URL string
 */
export async function generateQRCodeDataURL(url: string, options: QRCode.QRCodeToDataURLOptions = {}): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    margin: 1,
    width: 300,
    color: {
      dark: '#000',
      light: '#fff'
    },
    ...options
  };
  
  try {
    return await QRCode.toDataURL(url, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate a QR code as an SVG string for the given URL
 * @param url The URL to encode in the QR code
 * @param options Options for QR code generation
 * @returns A Promise that resolves to an SVG string
 */
export async function generateQRCodeSVG(url: string, options: QRCode.QRCodeToStringOptions = {}): Promise<string> {
  const defaultOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    margin: 1,
    width: 300,
    color: {
      dark: '#000',
      light: '#fff'
    },
    ...options
  };
  
  try {
    return await QRCode.toString(url, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
} 