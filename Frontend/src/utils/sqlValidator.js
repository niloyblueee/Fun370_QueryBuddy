/**
 * SQL Query Validator - Server-based validation
 * Validates queries by actually executing them against the database
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Validate SQL query by executing against the database
 * @param {string} userQuery - User's SQL query
 * @param {string|string[]} correctQuery - Expected correct query or array of possible queries
 * @returns {Promise<{isValid: boolean, feedback: string, userRowCount?: number, correctRowCount?: number}>}
 */
export async function validateSQL(userQuery, correctQuery) {
  try {
    const correctQueries = Array.isArray(correctQuery) ? correctQuery : [correctQuery];
    
    const response = await fetch(`${API_BASE_URL}/api/validate-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userQuery: userQuery.trim(),
        correctQueries: correctQueries
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isValid: false,
        feedback: errorData.feedback || 'Server error occurred'
      };
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      feedback: `Connection error: ${error.message}. Make sure the backend server is running.`
    };
  }
}

/**
 * Validate SQL query against multiple possible answers
 * @param {string} userQuery - User's SQL query
 * @param {string[]} possibleQueries - Array of acceptable queries
 * @returns {Promise<{isValid: boolean, feedback: string}>}
 */
export async function validateSQLAgainstMany(userQuery, possibleQueries) {
  if (!Array.isArray(possibleQueries)) {
    possibleQueries = [possibleQueries];
  }
  
  return validateSQL(userQuery, possibleQueries);
}

/**
 * Check if backend is available
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Get table schemas from the database
 * @returns {Promise<Object>}
 */
export async function getTableSchemas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/table-schemas`);
    if (!response.ok) throw new Error('Failed to fetch schemas');
    return await response.json();
  } catch (error) {
    console.error('Error fetching table schemas:', error);
    return {};
  }
}
