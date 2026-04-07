import type { FormatterConfig } from './store/useConfigStore';

export function formatSql(sql: string, config: FormatterConfig): string {
  if (!sql.trim()) return "";

  // 1. Tokenize the SQL
  const tokens = sql
    .replace(/\s+/g, ' ')
    .trim()
    .split(/([,()=<>!+\-*/%|&^~;])|\s+/)
    .filter(t => t && t.trim().length > 0);

  let result = "";
  let indentLevel = 0;
  let currentClause = "";
  let lastToken = "";

  const getIndent = (extra = 0) => " ".repeat((indentLevel + extra) * config.indentSize);
  
  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET',
    'AND', 'OR', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'HAVING', 'LEFT', 'RIGHT', 
    'INNER', 'OUTER', 'FULL', 'CROSS', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 
    'THEN', 'ELSE', 'END', 'DESC', 'ASC', 'TABLE', 'VALUES', 'INSERT', 'INTO', 'UPDATE', 'DELETE'
  ]);

  const functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'IFNULL', 'CONCAT', 
    'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'ABS', 'CEIL', 'FLOOR'
  ]);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    const upperToken = token.toUpperCase();

    // 2. Identify Current Clause
    if (['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING'].includes(upperToken)) {
      currentClause = upperToken;
      if (upperToken === 'GROUP' || upperToken === 'ORDER') {
        if (tokens[i + 1]?.toUpperCase() === 'BY') {
           currentClause = upperToken + ' BY';
        }
      }
    }

    // 3. Handle Casing
    if (keywords.has(upperToken)) {
      token = config.keywordUppercase ? upperToken : upperToken.toLowerCase();
    } else if (functions.has(upperToken)) {
      token = config.functionUppercase ? upperToken : upperToken.toLowerCase();
    } else if (token.startsWith('$') || token.startsWith(':')) {
      token = config.variableLowercase ? token.toLowerCase() : token;
    } else if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      const isTable = ['FROM', 'JOIN', 'TABLE', 'INTO', 'UPDATE'].includes(lastToken.toUpperCase());
      if (isTable) {
        token = config.tableLowercase ? token.toLowerCase() : token;
      } else {
        token = config.fieldLowercase ? token.toLowerCase() : token;
      }
    }

    // 4. Handle Newlines & Indentation
    let prefix = " ";
    
    const isNewClause = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(upperToken);
    const isJoinKeyword = ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'JOIN'].includes(upperToken);

    if (isNewClause && result !== "") {
      // Don't break if it's "GROUP BY" or "ORDER BY" intermediate keywords
      if (!((upperToken === 'BY' && (lastToken.toUpperCase() === 'GROUP' || lastToken.toUpperCase() === 'ORDER')) ||
            (isJoinKeyword && ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(lastToken.toUpperCase())))) {
        result = result.trimEnd() + "\n" + getIndent();
        prefix = "";
      }
    }

    // Newlines for conditions/fields
    if (currentClause === 'WHERE' || currentClause === 'HAVING') {
      if ((upperToken === 'AND' || upperToken === 'OR') && config.newlineWhere) {
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
      }
    } else if (currentClause === 'JOIN') {
      if (upperToken === 'ON' && config.newlineJoin) {
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
      }
    } else if (currentClause === 'GROUP BY') {
      if (token === ',' && config.newlineGroupBy) {
        result += ",";
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
        lastToken = ",";
        continue;
      }
    } else if (currentClause === 'ORDER BY') {
      if (token === ',' && config.newlineOrderBy) {
        result += ",";
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
        lastToken = ",";
        continue;
      }
    } else if (currentClause === 'SELECT') {
      if (token === ',') {
        const lines = result.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.length > config.selectFieldWrapLimit) {
          result += ",";
          result = result.trimEnd() + "\n" + getIndent(1);
          prefix = "";
          lastToken = ",";
          continue;
        }
      } else {
        const lines = result.split('\n');
        const lastLine = lines[lines.length - 1];
        // If adding this token (plus space/comma) exceeds limit, and we are at a point where we can break
        if (lastLine.length + token.length > config.selectFieldWrapLimit && lastToken === ',') {
          result = result.trimEnd() + "\n" + getIndent(1);
          prefix = "";
        }
      }
    }

    // Prevent space before comma/parenthesis
    if (token === ',' || token === ')' || token === ';') {
      prefix = "";
    }
    if (lastToken === '(' || result === "" || result.endsWith('\n') || result.endsWith(' ')) {
      prefix = "";
    }

    result += prefix + token;
    lastToken = token;
  }

  // 5. Cleanup
  if (config.noTabs) {
    result = result.replace(/\t/g, " ".repeat(config.indentSize));
  }

  if (config.noEmptyLines) {
    result = result.split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)
      .join('\n');
  }

  return result;
}
