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
  
  // Keywords that often start a new line and can be aligned
  const alignableKeywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING', 'ON', 'UNION', 'VALUES', 'INSERT', 'UPDATE', 'CREATE'
  ]);

  const keywords = new Set([
    ...Array.from(alignableKeywords),
    'AND', 'OR', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'BY', 'DISTINCT', 'CASE', 'WHEN', 
    'THEN', 'ELSE', 'END', 'DESC', 'ASC', 'TABLE', 'INTO', 'DELETE', 'IF', 'EXISTS'
  ]);

  const functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'IFNULL', 'CONCAT', 
    'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'ABS', 'CEIL', 'FLOOR', 'TRIM', 'SIZE', 'SPLIT'
  ]);

  const ALIGN_WIDTH = 6; // Target width for SELECT alignment

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
      const isTable = ['FROM', 'JOIN', 'TABLE', 'INTO', 'UPDATE', 'TABLE'].includes(lastToken.toUpperCase());
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
        const lastUpper = lastToken.toUpperCase();
        if (lastUpper === 'FROM' || lastUpper === 'JOIN' || lastUpper === 'AS') {
          result = result.trimEnd() + " (";
        } else {
          result = result.trimEnd() + "\n" + getIndent() + "(";
        }
        indentLevel++;
        result += "\n" + getIndent();
        skipFinalAdd = true;
      } else {
        parenStack.push({ type: 'expression', indent: indentLevel });
        const lastUpper = lastToken.toUpperCase();
        const isKeyword = keywords.has(lastUpper);
        const isFunction = functions.has(lastUpper);
        
        // Remove space for functions or normal identifiers (likely custom functions)
        // But KEEP space for structural keywords like ON, WHERE, etc.
        if (lastToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
          if (isFunction || !isKeyword) {
            prefix = ""; 
          }
        }
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
      const isNewClause = alignableKeywords.has(upperToken);
      const isJoinKeyword = ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'JOIN'].includes(upperToken);

      if (isNewClause && result !== "") {
        // Prevent breaking "GROUP BY" or "LEFT JOIN" mid-phrase
        if (!((upperToken === 'BY' && (lastToken.toUpperCase() === 'GROUP' || lastToken.toUpperCase() === 'ORDER')) ||
              (isJoinKeyword && ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(lastToken.toUpperCase())))) {
          
          result = result.trimEnd() + "\n" + getIndent();
          
          if (config.alignKeywords) {
            // Apply right-alignment for keywords within the indent block
            let fullKeyword = upperToken;
            if (upperToken === 'GROUP' || upperToken === 'ORDER') {
               if (nextToken === 'BY') fullKeyword = upperToken + ' BY';
            }
            if (isJoinKeyword) {
               // Handle multi-word joins if necessary, but keep it simple for now
            }
            
            const padding = Math.max(0, ALIGN_WIDTH - fullKeyword.length);
            result += " ".repeat(padding);
          }
          
          prefix = "";
        }
      }

      // Clause specific breaks
      if ((currentClause === 'WHERE' || currentClause === 'HAVING') && (upperToken === 'AND' || upperToken === 'OR') && config.newlineWhere) {
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
        result = result.trimEnd() + "\n" + getIndent() + " ".repeat(wrapIndent);
        prefix = "";
      } else if (upperToken === 'ON' && config.newlineJoin) {
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH - 2 : config.indentSize; // ON is 2 chars, aligns to 6 with 4 spaces
        result = result.trimEnd() + "\n" + getIndent() + " ".repeat(Math.max(0, wrapIndent));
        prefix = "";
      } else if (token === ',' && (currentClause === 'GROUP BY' || currentClause === 'ORDER BY')) {
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
        result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
        skipFinalAdd = true;
      } else if (currentClause === 'SELECT' && token === ',') {
        const lastLine = result.split('\n').pop() || "";
        if (lastLine.length > config.selectFieldWrapLimit) {
          const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
          result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
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

  // 5. Cleanup
  if (config.noTabs) result = result.replace(/\t/g, " ".repeat(config.indentSize));
  if (config.noEmptyLines) {
    result = result.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0).join('\n');
  }

  return result;
}
