/**
 * Check if user is admin - Support all formats
 * @param {Object} userInfo - User info object from localStorage or state
 * @returns {boolean} - true if admin, false otherwise
 */
export const checkIsAdmin = (userInfo) => {
  if (!userInfo) return false;
  
  const isAdmin = userInfo.isAdmin;
  
  // Handle null/undefined
  if (isAdmin == null) return false;
  
  // Handle number: 1 = admin, 0 = not admin
  if (typeof isAdmin === 'number') {
    return isAdmin === 1;
  }
  
  // Handle boolean: true = admin
  if (typeof isAdmin === 'boolean') {
    return isAdmin === true;
  }
  
  // Handle string: "1", "true", "True" = admin
  if (typeof isAdmin === 'string') {
    const lower = isAdmin.toLowerCase().trim();
    // Explicitly false strings
    if (lower === 'false' || lower === '0' || lower === '') return false;
    // Explicitly true strings
    if (lower === 'true' || lower === '1') return true;
  }
  
  // Fallback: any other truthy value = admin
  return Boolean(isAdmin);
};

/**
 * Get user info from localStorage with proper parsing
 * @returns {Object|null} - Parsed user info or null
 */
export const getUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('Failed to parse user_info:', error);
    return null;
  }
};