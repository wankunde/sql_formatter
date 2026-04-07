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
  
  const parenStack: { type: 'subquery' | 'expression', indent: number }[] = [];
  const getIndent = (extra = 0) => " ".repeat(Math.max(0, indentLevel + extra) * config.indentSize);
  
  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET',
    'AND', 'OR', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'HAVING', 'LEFT', 'RIGHT', 
    'INNER', 'OUTER', 'FULL', 'CROSS', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 
    'THEN', 'ELSE', 'END', 'DESC', 'ASC', 'TABLE', 'VALUES', 'INSERT', 'INTO', 'UPDATE', 'DELETE',
    'CREATE', 'IF', 'EXISTS'
  ]);

  const functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'IFNULL', 'CONCAT', 
    'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'ABS', 'CEIL', 'FLOOR', 'TRIM', 'SIZE', 'SPLIT'
  ]);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    const upperToken = token.toUpperCase();
    const nextToken = tokens[i+1]?.toUpperCase();

    // Identify Clause
    if (['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING', 'INSERT', 'UPDATE', 'CREATE'].includes(upperToken)) {
      currentClause = upperToken;
      if (upperToken === 'GROUP' || upperToken === 'ORDER') {
        if (nextToken === 'BY') currentClause = upperToken + ' BY';
      }
    }

    // Casing
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

    let prefix = " ";
    let skipFinalAdd = false;

    // Core Formatting Logic
    if (token === '(') {
      const isSubquery = nextToken === 'SELECT';
      if (isSubquery) {
        parenStack.push({ type: 'subquery', indent: indentLevel });
        result = result.trimEnd() + "\n" + getIndent() + "(";
        indentLevel++;
        result += "\n" + getIndent();
        skipFinalAdd = true;
      } else {
        parenStack.push({ type: 'expression', indent: indentLevel });
        if (lastToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) prefix = ""; 
      }
    } else if (token === ')') {
      const lastParen = parenStack.pop();
      if (lastParen?.type === 'subquery') {
        indentLevel--;
        result = result.trimEnd() + "\n" + getIndent() + ")";
        skipFinalAdd = true;
      } else {
        prefix = "";
      }
    } else {
      const isNewClause = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(upperToken);
      const isJoinKeyword = ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'JOIN'].includes(upperToken);

      if (isNewClause && result !== "") {
        if (!((upperToken === 'BY' && (lastToken.toUpperCase() === 'GROUP' || lastToken.toUpperCase() === 'ORDER')) ||
              (isJoinKeyword && ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(lastToken.toUpperCase())))) {
          result = result.trimEnd() + "\n" + getIndent();
          prefix = "";
        }
      }

      if ((currentClause === 'WHERE' || currentClause === 'HAVING') && (upperToken === 'AND' || upperToken === 'OR') && config.newlineWhere) {
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
      } else if (upperToken === 'ON' && config.newlineJoin) {
        result = result.trimEnd() + "\n" + getIndent(1);
        prefix = "";
      } else if (token === ',' && (currentClause === 'GROUP BY' || currentClause === 'ORDER BY')) {
        result = result.trimEnd() + ",\n" + getIndent(1);
        skipFinalAdd = true;
      } else if (currentClause === 'SELECT' && token === ',') {
        const lastLine = result.split('\n').pop() || "";
        if (lastLine.length > config.selectFieldWrapLimit) {
          result = result.trimEnd() + ",\n" + getIndent(1);
          skipFinalAdd = true;
        }
      }
    }

    if (!skipFinalAdd) {
      if (token === ',' || token === ';' || prefix === "") prefix = "";
      if (lastToken === '(' || result === "" || result.endsWith('\n') || result.endsWith(' ')) prefix = "";
      result += prefix + token;
    }
    
    lastToken = token;
  }

  // Final Pass
  if (config.noTabs) result = result.replace(/\t/g, " ".repeat(config.indentSize));
  if (config.noEmptyLines) {
    result = result.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0).join('\n');
  }

  return result;
}
