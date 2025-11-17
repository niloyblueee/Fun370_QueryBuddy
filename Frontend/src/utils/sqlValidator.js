/**
 * SQL Query Validator - Semantically compares SQL queries
 * Handles different valid ways to write the same query
 */

// Normalize SQL query for comparison
export function normalizeSQL(sql) {
  if (!sql) return '';
  
  // Convert to lowercase and remove extra whitespace
  let normalized = sql.trim().toLowerCase();
  // Remove semicolons at the end
  normalized = normalized.replace(/;+\s*$/, '');
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  // Normalize quotes (both single and double to single)
  normalized = normalized.replace(/"/g, "'");
  // Remove trivial WHERE clauses (where 1=1, where true, etc.)
  normalized = normalized.replace(/where\s+(1=1|true|1|0=0|true=true|1<>0|1\s+is\s+not\s+null|exists\(select 1\))\b(\s+and\s+)?/g, '');
  return normalized;
}

// Extract key components from SQL query
export function parseSQL(sql) {
  const normalized = normalizeSQL(sql);
  
  const components = {
    type: '',
    select: [],
    from: [],
    joins: [],
    where: [],
    groupBy: [],
    having: [],
    orderBy: [],
    limit: null,
    distinct: false,
    functions: [],
    subqueries: 0
  };

  // Detect query type
  if (normalized.startsWith('select')) {
    components.type = 'SELECT';
  } else if (normalized.startsWith('insert')) {
    components.type = 'INSERT';
  } else if (normalized.startsWith('update')) {
    components.type = 'UPDATE';
  } else if (normalized.startsWith('delete')) {
    components.type = 'DELETE';
  }

  // Extract DISTINCT
  components.distinct = /select\s+distinct/i.test(normalized);

  // Extract SELECT clause
  const selectMatch = normalized.match(/select\s+(?:distinct\s+)?(.*?)\s+from/i);
  if (selectMatch) {
    const selectClause = selectMatch[1];
    components.select = selectClause.split(',').map(s => s.trim().replace(/\s+as\s+/gi, ' as '));
  }

  // Extract FROM clause
  // If WHERE clause is trivial, treat as if it doesn't exist for FROM extraction
  let fromClause = '';
  const fromWhereMatch = normalized.match(/from\s+([\w\s,]+?)\s+where\s+([^;]+?)(?:\s+(?:group|order|limit|having|;|$))/i);
  if (fromWhereMatch) {
    // Check if WHERE is trivial
    const whereNorm = fromWhereMatch[2].replace(/\s+/g, ' ').toLowerCase();
    if (
      whereNorm === '1=1' ||
      whereNorm === 'true' ||
      whereNorm === '1' ||
      whereNorm === '0=0' ||
      whereNorm === 'true=true' ||
      whereNorm === '1<>0' ||
      whereNorm === '1 is not null' ||
      whereNorm === 'exists(select 1)'
    ) {
      fromClause = fromWhereMatch[1];
    }
  }
  if (!fromClause) {
    const fromMatch = normalized.match(/from\s+([\w\s,]+?)(?:\s+(?:where|join|left|right|inner|group|order|limit|having|;|$))/i);
    if (fromMatch) {
      fromClause = fromMatch[1];
    }
  }
  if (fromClause) {
    components.from = fromClause.split(',').map(t => t.trim());
  }

  // Extract JOINs
  const joinPattern = /((?:left|right|inner|full)?\s*(?:outer\s+)?join\s+\w+(?:\s+\w+)?\s+on\s+[^join|where|group|order|limit]+)/gi;
  const joins = normalized.match(joinPattern);
  if (joins) {
    components.joins = joins.map(j => j.trim().replace(/\s+/g, ' '));
  }

  // Extract WHERE clause
  const whereMatch = normalized.match(/where\s+(.*?)(?:\s+(?:group|order|limit|;|$))/i);
  if (whereMatch) {
    components.where = parseConditions(whereMatch[1]);
  }

  // Extract GROUP BY
  const groupByMatch = normalized.match(/group\s+by\s+([\w\s,\.]+?)(?:\s+(?:having|order|limit|;|$))/i);
  if (groupByMatch) {
    components.groupBy = groupByMatch[1].split(',').map(g => g.trim());
  }

  // Extract HAVING
  const havingMatch = normalized.match(/having\s+(.*?)(?:\s+(?:order|limit|;|$))/i);
  if (havingMatch) {
    components.having = parseConditions(havingMatch[1]);
  }

  // Extract ORDER BY
  const orderByMatch = normalized.match(/order\s+by\s+(.*?)(?:\s+(?:limit|;|$))/i);
  if (orderByMatch) {
    components.orderBy = orderByMatch[1].split(',').map(o => o.trim());
  }

  // Extract LIMIT
  const limitMatch = normalized.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    components.limit = parseInt(limitMatch[1]);
  }

  // Detect aggregate functions
  const aggregateFunctions = ['count', 'sum', 'avg', 'min', 'max'];
  aggregateFunctions.forEach(func => {
    const regex = new RegExp(`${func}\\s*\\(`, 'gi');
    if (regex.test(normalized)) {
      components.functions.push(func);
    }
  });

  // Count subqueries
  components.subqueries = (normalized.match(/\(\s*select\s+/gi) || []).length;

  return components;
}

// Parse WHERE/HAVING conditions into comparable format
function parseConditions(conditionStr) {
  if (!conditionStr) return [];
  // Split by AND/OR but keep the operators
  const conditions = [];
  const parts = conditionStr.split(/\s+(and|or)\s+/gi);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part && part.toLowerCase() !== 'and' && part.toLowerCase() !== 'or') {
      // Ignore trivial always-true conditions
      const norm = part.replace(/\s+/g, ' ').toLowerCase();
      if (
        norm === '1=1' ||
        norm === 'true' ||
        norm === '1' ||
        norm === '0=0' ||
        norm === 'true=true' ||
        norm === '1<>0' ||
        norm === '1 is not null' ||
        norm === 'exists(select 1)'
      ) {
        continue;
      }
      conditions.push(part.replace(/\s+/g, ' '));
    }
  }
  return conditions;
}

// Helper: Remove aliases and normalize column names
function normalizeColumn(col) {
  // Remove "as ..." and table aliases (e.g., "p.ProductName as name" -> "productname")
  return col
    .replace(/\s+as\s+\w+/gi, '') // remove aliases
    .replace(/^\w+\./, '') // remove table alias
    .replace(/["'`]/g, '') // remove quotes
    .replace(/\s/g, '') // remove all whitespace
    .toLowerCase();
}

// Helper: Remove table aliases from FROM/JOIN
function normalizeTable(tbl) {
  // Remove "as ..." and aliases (e.g., "Products p" or "Products AS p" -> "products")
  return tbl
    .replace(/\s+as\s+\w+/gi, '')
    .replace(/\s+\w+$/, '')
    .replace(/["'`]/g, '')
    .replace(/\s/g, '')
    .toLowerCase();
}

// Helper: Normalize condition for WHERE/HAVING
function normalizeCondition(cond) {
  return cond
    .replace(/\s/g, '')
    .replace(/["'`]/g, '')
    .toLowerCase();
}

// Improved array matcher for SQL clause arrays
function arraysMatch(arr1, arr2, strict = false, type = '') {
  if (arr1.length !== arr2.length) return false;
  // SELECT: ignore order, aliases, whitespace, table prefixes
  if (type === 'select') {
    // If either contains '*', always match
    if (arr1.includes('*') || arr2.includes('*')) return true;
    const norm1 = arr1.map(normalizeColumn).sort();
    const norm2 = arr2.map(normalizeColumn).sort();
    return norm1.every((val, idx) => val === norm2[idx]);
  }
  // FROM: ignore table aliases
  if (type === 'from') {
    const norm1 = arr1.map(normalizeTable).sort();
    const norm2 = arr2.map(normalizeTable).sort();
    return norm1.every((val, idx) => val === norm2[idx]);
  }
  // WHERE/HAVING: ignore order, whitespace, case
  if (type === 'where' || type === 'having') {
    // Remove trivial always-true conditions from both arrays
    const isTrivial = cond => {
      const norm = cond.replace(/\s+/g, ' ').toLowerCase();
      return (
        norm === '1=1' ||
        norm === 'true' ||
        norm === '1' ||
        norm === '0=0' ||
        norm === 'true=true' ||
        norm === '1<>0' ||
        norm === '1 is not null' ||
        norm === 'exists(select 1)'
      );
    };
    const filtered1 = arr1.filter(cond => !isTrivial(cond));
    const filtered2 = arr2.filter(cond => !isTrivial(cond));
    if (filtered1.length === 0 && filtered2.length === 0) return true;
    if (filtered1.length !== filtered2.length) return false;
    const norm1 = filtered1.map(normalizeCondition).sort();
    const norm2 = filtered2.map(normalizeCondition).sort();
    return norm1.every((val, idx) => val === norm2[idx]);
  }
  // GROUP BY: ignore order, whitespace, table aliases
  if (type === 'groupBy') {
    const norm1 = arr1.map(normalizeColumn).sort();
    const norm2 = arr2.map(normalizeColumn).sort();
    return norm1.every((val, idx) => val === norm2[idx]);
  }
  // ORDER BY: ignore whitespace, table aliases, but keep order
  if (type === 'orderBy') {
    const norm1 = arr1.map(normalizeColumn);
    const norm2 = arr2.map(normalizeColumn);
    if (norm1.length !== norm2.length) return false;
    return norm1.every((val, idx) => val === norm2[idx]);
  }
  // Default: fuzzy match
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  if (strict) {
    return sorted1.every((val, idx) => val === sorted2[idx]);
  } else {
    return sorted1.every(val => sorted2.some(v => v.includes(val) || val.includes(v)));
  }
}

// Main validation function
export function validateSQL(userQuery, correctQuery) {
  try {
    const userNormalized = normalizeSQL(userQuery);
    const correctNormalized = normalizeSQL(correctQuery);

    // Quick exact match check
    if (userNormalized === correctNormalized) {
      return { isValid: true, feedback: 'Perfect match!' };
    }

    const userParsed = parseSQL(userQuery);
    const correctParsed = parseSQL(correctQuery);

    let feedback = [];

    // Query type must match
    if (userParsed.type !== correctParsed.type) {
      feedback.push(`Wrong query type. Expected ${correctParsed.type}`);
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // DISTINCT must match
    if (userParsed.distinct !== correctParsed.distinct) {
      feedback.push('DISTINCT usage differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // SELECT clause must match (allow * as wildcard, ignore order/aliases)
    if (
      !arraysMatch(userParsed.select, correctParsed.select, false, 'select')
    ) {
      feedback.push('SELECT clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // FROM clause must match (ignore aliases)
    if (!arraysMatch(userParsed.from, correctParsed.from, false, 'from')) {
      feedback.push('FROM clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // JOINs count must match (could be improved for join equivalence)
    if (userParsed.joins.length !== correctParsed.joins.length) {
      feedback.push('JOIN structure differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // WHERE clause must match (order-insensitive, ignore whitespace/case)
    // Treat queries with only trivial always-true conditions as equivalent to no WHERE clause
    const isTrivialWhere = arr => arr.length === 0 || arr.every(cond => {
      const norm = cond.replace(/\s+/g, ' ').toLowerCase();
      return (
        norm === '1=1' ||
        norm === 'true' ||
        norm === '1' ||
        norm === '0=0' ||
        norm === 'true=true' ||
        norm === '1<>0' ||
        norm === '1 is not null' ||
        norm === 'exists(select 1)'
      );
    });
    const userTrivial = isTrivialWhere(userParsed.where);
    const correctTrivial = isTrivialWhere(correctParsed.where);
    if (userTrivial && correctTrivial) {
      // Both are trivial/no WHERE, treat as equivalent
    } else if (!arraysMatch(userParsed.where, correctParsed.where, false, 'where')) {
      feedback.push('WHERE clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // GROUP BY must match (ignore order/aliases)
    if (userParsed.groupBy.length !== correctParsed.groupBy.length ||
        (userParsed.groupBy.length > 0 && !arraysMatch(userParsed.groupBy, correctParsed.groupBy, false, 'groupBy'))) {
      feedback.push('GROUP BY clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // HAVING must match (order-insensitive, ignore whitespace/case)
    if (
      !(userParsed.having.length === 0 && correctParsed.having.length === 0) &&
      !arraysMatch(userParsed.having, correctParsed.having, false, 'having')
    ) {
      feedback.push('HAVING clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // Aggregate functions must match (strict)
    if (!arraysMatch(userParsed.functions, correctParsed.functions, true)) {
      feedback.push('Aggregate functions differ');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // ORDER BY must match (order-sensitive, ignore whitespace/aliases)
    if (
      !(userParsed.orderBy.length === 0 && correctParsed.orderBy.length === 0) &&
      !arraysMatch(userParsed.orderBy, correctParsed.orderBy, false, 'orderBy')
    ) {
      feedback.push('ORDER BY clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // LIMIT must match
    if (userParsed.limit !== correctParsed.limit) {
      feedback.push('LIMIT clause differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    // Subqueries count must match
    if (userParsed.subqueries !== correctParsed.subqueries) {
      feedback.push('Subquery structure differs');
      return { isValid: false, feedback: feedback.join('. ') };
    }

    return {
      isValid: true,
      feedback: 'Correct! Your query is semantically equivalent.'
    };

  } catch (error) {
    return {
      isValid: false,
      feedback: 'Invalid SQL syntax or structure'
    };
  }
}

// Accepts an array of possible correct queries, returns validation result for any match
export function validateSQLAgainstMany(userQuery, possibleQueries) {
  if (!Array.isArray(possibleQueries)) {
    // fallback for legacy single-string answers
    possibleQueries = [possibleQueries];
  }
  for (const correctQuery of possibleQueries) {
    const result = validateSQL(userQuery, correctQuery);
    if (result.isValid) {
      return result;
    }
  }
  // If none matched, return the result of the last validation (or a generic failure)
  return {
    isValid: false,
    feedback: 'Your query does not match any of the expected answers.'
  };
}
