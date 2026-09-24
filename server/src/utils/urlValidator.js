/**
 * Validates that an external URL begins with http:// or https://
 * and explicitly rejects unsafe pseudo-protocols like javascript:, data:, file:, vbscript:.
 */
const validateUrlSecurity = (urlStr, fieldName = 'URL') => {
  if (!urlStr || typeof urlStr !== 'string') {
    return null;
  }
  
  const cleanUrl = urlStr.trim();
  if (cleanUrl === '') return '';

  const lower = cleanUrl.toLowerCase();
  
  // Explicitly reject forbidden schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    const error = new Error(`${fieldName} contains forbidden scheme. Only http:// or https:// URLs are allowed.`);
    error.statusCode = 400;
    throw error;
  }

  // Must begin with http:// or https://
  if (!/^https?:\/\//i.test(cleanUrl)) {
    const error = new Error(`${fieldName} must begin with http:// or https://`);
    error.statusCode = 400;
    throw error;
  }

  return cleanUrl;
};

module.exports = { validateUrlSecurity };
