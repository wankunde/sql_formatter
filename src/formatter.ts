import type { FormatterConfig } from './store/useConfigStore';

export function formatSql(sql: string, config: FormatterConfig): string {
  if (!sql.trim()) return "";

  // 1. Remove extra spaces and handle casing
  let tokens = sql
    .replace(/\s+/g, ' ')
    .trim()
    .split(/([,()=<>!+\-*/%|&^~;])|\s+/)
    .filter(t => t && t.trim().length > 0 || t === ' ');

  let result = "";
  let indentLevel = 0;

  const getIndent = () => " ".repeat(indentLevel * config.indentSize);

  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET',
    'AND', 'OR', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DESC', 'ASC'
  ]);

  const functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'IFNULL', 'CONCAT', 'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY'
  ]);

  let lastToken = "";

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    let upperToken = token.toUpperCase();

    // Casing rules
    if (keywords.has(upperToken)) {
      token = config.keywordUppercase ? upperToken : upperToken.toLowerCase();
    } else if (functions.has(upperToken)) {
      token = config.functionUppercase ? upperToken : upperToken.toLowerCase();
    } else if (token.startsWith('$') || token.startsWith(':')) {
      token = config.variableLowercase ? token.toLowerCase() : token;
    } else if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      // Heuristic: if it's after FROM or JOIN, it's a table. Otherwise a field.
      const isTable = lastToken.toUpperCase() === 'FROM' || lastToken.toUpperCase() === 'JOIN' || lastToken.toUpperCase() === 'TABLE';
      if (isTable) {
        token = config.tableLowercase ? token.toLowerCase() : token;
      } else {
        token = config.fieldLowercase ? token.toLowerCase() : token;
      }
    }

    // Newline rules
    const needsNewlineBefore = 
      (upperToken === 'FROM' ) ||
      (upperToken === 'WHERE' && config.newlineWhere) ||
      (upperToken === 'JOIN' && config.newlineJoin) ||
      (upperToken === 'LEFT' && tokens[i+1]?.toUpperCase() === 'JOIN' && config.newlineJoin) ||
      (upperToken === 'RIGHT' && tokens[i+1]?.toUpperCase() === 'JOIN' && config.newlineJoin) ||
      (upperToken === 'GROUP' && tokens[i+1]?.toUpperCase() === 'BY' && config.newlineGroupBy) ||
      (upperToken === 'ORDER' && tokens[i+1]?.toUpperCase() === 'BY' && config.newlineOrderBy) ||
      (upperToken === 'LIMIT' && config.newlineLimit) ||
      (upperToken === 'OFFSET' && config.newlineOffset) ||
      (upperToken === 'AND' && lastToken !== '(') ||
      (upperToken === 'OR' && lastToken !== '(');

    if (needsNewlineBefore && result.length > 0) {
      result = result.trimEnd() + "\n" + getIndent();
    }

    // SELECT field wrapping
    if (lastToken === ',' && indentLevel === 0 && result.toLowerCase().includes('select')) {
       const lastLine = result.split('\n').pop()!;
       if (lastLine.length + token.length > config.selectFieldWrapLimit) {
         result = result.trimEnd() + "\n  ";
       }
    }

    // Add token
    const spacing = (token === ',' || token === '(' || token === ')' || result === "" || result.endsWith('\n') || result.endsWith(' ')) ? "" : " ";
    result += spacing + token;
    lastToken = token;
  }

  if (config.noTabs) {
    result = result.replace(/\t/g, " ".repeat(config.indentSize));
  }

  if (config.noEmptyLines) {
    result = result.split('\n').filter(line => line.trim() !== "").join('\n');
  }

  return result;
}
