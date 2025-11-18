/**
 * SQL Query Validator - Server-based validation
 * Validates queries by actually executing them against the database
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fun370querybuddybackend-production.up.railway.app';

console.log('🚀 [FRONTEND] SQL Validator initialized');
console.log(`📡 [FRONTEND] API Base URL: ${API_BASE_URL}`);

/**
 * Validate SQL query by executing against the database
 * @param {string} userQuery - User's SQL query
 * @param {string|string[]} correctQuery - Expected correct query or array of possible queries
 * @returns {Promise<{isValid: boolean, feedback: string, userRowCount?: number, correctRowCount?: number}>}
 */
export async function validateSQL(userQuery, correctQuery) {
  try {
    console.log('📤 [FRONTEND] Sending validation request...');
    console.log(`   Query: ${userQuery.substring(0, 80)}...`);
    
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

    console.log(`📥 [FRONTEND] Response received - Status: ${response.status}`);

    if (!response.ok) {
      console.warn(`⚠️  [FRONTEND] Server returned error status: ${response.status}`);
      const errorData = await response.json();
      return {
        isValid: false,
        feedback: errorData.feedback || 'Server error occurred'
      };
    }

    const result = await response.json();
    console.log(`✅ [FRONTEND] Validation result: ${result.isValid ? 'PASSED' : 'FAILED'}`);
    return result;

  } catch (error) {
    console.error('❌ [FRONTEND] Validation error:', error);
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
    console.log('❤️  [FRONTEND] Checking backend health...');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const isHealthy = response.ok;
    console.log(`${isHealthy ? '✅' : '❌'} [FRONTEND] Backend health: ${isHealthy ? 'CONNECTED' : 'DISCONNECTED'}`);
    return isHealthy;
  } catch (error) {
    console.error('❌ [FRONTEND] Backend health check failed:', error.message);
    return false;
  }
}

/**
 * Get table schemas from the database
 * @returns {Promise<Object>}
 */
export async function getTableSchemas() {
  try {
    console.log('📋 [FRONTEND] Fetching table schemas...');
    const response = await fetch(`${API_BASE_URL}/api/table-schemas`);
    if (!response.ok) throw new Error('Failed to fetch schemas');
    const schemas = await response.json();
    console.log(`✅ [FRONTEND] Fetched ${Object.keys(schemas).length} table schemas`);
    return schemas;
  } catch (error) {
    console.error('❌ [FRONTEND] Error fetching table schemas:', error.message);
    return {};
  }
}
