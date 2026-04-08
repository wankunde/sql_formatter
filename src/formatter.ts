import type { FormatterConfig } from './store/useConfigStore';

export function formatSql(sql: string, config: FormatterConfig): string {
  if (!sql.trim()) return "";

  // 1. Tokenize the SQL
  const tokens = sql
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(<=|>=|!=|<>|[,()=<>!+\-*/%|&^~;])|\s+/)
    .filter(t => t && t.trim().length > 0);

  let result = "";
  let indentLevel = 0;
  let currentClause = "";
  let lastToken = "";
  
  const parenStack: { type: 'subquery' | 'expression', indent: number }[] = [];
  const caseStack: { startPos: number, isLong: boolean, indent: number, whenIndent: number }[] = [];

  const getIndent = (extra = 0) => " ".repeat(Math.max(0, indentLevel + extra) * config.indentSize);
  
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
    'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'ABS', 'CEIL', 'FLOOR', 'TRIM', 'SIZE', 'SPLIT', 'DATEDIFF'
  ]);

  const ALIGN_WIDTH = 6; 

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    const upperToken = token.toUpperCase();
    const nextToken = tokens[i+1]?.toUpperCase();

    // Identify Clause
    if (alignableKeywords.has(upperToken)) {
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

    // CASE WHEN logic
    if (upperToken === 'CASE') {
      let caseLength = 0;
      let depth = 0;
      for (let j = i; j < tokens.length; j++) {
        caseLength += tokens[j].length + 1;
        if (tokens[j].toUpperCase() === 'CASE') depth++;
        if (tokens[j].toUpperCase() === 'END') depth--;
        if (depth === 0) break;
      }
      
      const currentLine = result.split('\n').pop() || "";
      let whenIndentPos = currentLine.length + prefix.length + 5; 
      if (result.endsWith('\n') || result === "") {
         whenIndentPos = getIndent().length + (config.alignKeywords ? ALIGN_WIDTH + 1 : 0) + 5;
      }

      caseStack.push({ 
        startPos: i, 
        isLong: caseLength > 30, 
        indent: indentLevel,
        whenIndent: whenIndentPos
      });
    }

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
        if (lastToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
          if (isFunction || !isKeyword) prefix = ""; 
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
    } else if (upperToken === 'WHEN' || upperToken === 'THEN' || upperToken === 'ELSE' || upperToken === 'END') {
      const currentCase = caseStack[caseStack.length - 1];
      if (currentCase && currentCase.isLong) {
        if (upperToken === 'WHEN') {
          if (lastToken.toUpperCase() !== 'CASE') {
            result = result.trimEnd() + "\n" + " ".repeat(currentCase.whenIndent - 5);
            prefix = "";
          }
        } else if (upperToken === 'THEN' || upperToken === 'ELSE') {
          result = result.trimEnd() + "\n" + " ".repeat(currentCase.whenIndent - 5) + "     ";
          prefix = "";
        } else if (upperToken === 'END') {
          caseStack.pop();
        }
      } else if (upperToken === 'END') {
        caseStack.pop();
      }
    } else {
      const isNewClause = alignableKeywords.has(upperToken);
      const isJoinKeyword = ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'JOIN'].includes(upperToken);

      if (isNewClause && result !== "") {
        if (!((upperToken === 'BY' && (lastToken.toUpperCase() === 'GROUP' || lastToken.toUpperCase() === 'ORDER')) ||
              (isJoinKeyword && ['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL'].includes(lastToken.toUpperCase())))) {
          
          result = result.trimEnd() + "\n" + getIndent();
          if (config.alignKeywords) {
            let fullKeyword = upperToken;
            if (upperToken === 'GROUP' || upperToken === 'ORDER') {
               if (nextToken === 'BY') fullKeyword = upperToken + ' BY';
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
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH - 2 : config.indentSize; 
        result = result.trimEnd() + "\n" + getIndent() + " ".repeat(Math.max(0, wrapIndent));
        prefix = "";
      } else if (token === ',' && (currentClause === 'GROUP BY' || currentClause === 'ORDER BY') && !parenStack.some(p => p.type === 'expression')) {
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
        result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
        skipFinalAdd = true;
      } else if (currentClause === 'SELECT' && (upperToken === 'SELECT' || (token === ',' && !parenStack.some(p => p.type === 'expression')))) {
        // Calculate next expression length
        let nextExprLength = 0;
        let pDepth = 0;
        let startIndex = (token === ',') ? i + 1 : i + 1;
        if (upperToken === 'SELECT' && tokens[i+1]?.toUpperCase() === 'DISTINCT') startIndex++;

        for (let j = startIndex; j < tokens.length; j++) {
          const t = tokens[j].toUpperCase();
          if (pDepth === 0 && (t === ',' || alignableKeywords.has(t))) break;
          if (t === '(') pDepth++;
          if (t === ')') pDepth--;
          nextExprLength += tokens[j].length + 1;
        }

        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
        
        if (token === ',') {
          if (nextExprLength > 30) {
            result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
            skipFinalAdd = true;
          } else {
            const lastLine = result.split('\n').pop() || "";
            if (lastLine.length + nextExprLength > config.selectFieldWrapLimit) {
              result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
              skipFinalAdd = true;
            }
          }
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

  // Final Cleanup
  if (config.noTabs) result = result.replace(/\t/g, " ".repeat(config.indentSize));
  if (config.noEmptyLines) {
    result = result.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0).join('\n');
  }

  return result;
}
