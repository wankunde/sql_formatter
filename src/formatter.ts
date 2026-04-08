import type { FormatterConfig } from './store/useConfigStore';

function extractLineComments(sql: string) {
  let normalizedSql = '';
  const comments = new Map<string, string>();
  let commentIndex = 0;
  let i = 0;
  let inSingleQuote = false;

  while (i < sql.length) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (char === "'") {
      normalizedSql += char;
      if (inSingleQuote && nextChar === "'") {
        normalizedSql += nextChar;
        i += 2;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      i++;
      continue;
    }

    if (!inSingleQuote && char === '-' && nextChar === '-') {
      let j = i;
      while (j < sql.length && sql[j] !== '\n') {
        j++;
      }
      const comment = sql.slice(i, j).trimEnd();
      const token = `@@SQLFMT_COMMENT_${commentIndex}@@`;
      comments.set(token, comment);
      normalizedSql += ` ${token} `;
      if (j < sql.length && sql[j] === '\n') {
        normalizedSql += '\n';
        j++;
      }
      i = j;
      commentIndex++;
      continue;
    }

    normalizedSql += char;
    i++;
  }

  return { normalizedSql, comments };
}

function isCommentToken(token: string) {
  return token.startsWith('@@SQLFMT_COMMENT_') && token.endsWith('@@');
}

export function formatSql(sql: string, config: FormatterConfig): string {
  if (!sql.trim()) return "";

  const { normalizedSql, comments } = extractLineComments(sql);

  // 1. Tokenize the SQL with multi-character operator support
  const tokens = normalizedSql
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
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'HAVING', 'ON', 'UNION', 'VALUES', 'INSERT INTO', 'UPDATE', 'CREATE TABLE', 'AND', 'OR'
  ]);

  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING', 'ON', 'UNION', 'VALUES', 'INSERT', 'UPDATE', 'CREATE',
    'AND', 'OR', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'BY', 'DISTINCT', 'CASE', 'WHEN', 
    'THEN', 'ELSE', 'END', 'DESC', 'ASC', 'TABLE', 'INTO', 'DELETE', 'IF', 'EXISTS'
  ]);

  const functions = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE', 'IFNULL', 'CONCAT', 
    'SUBSTR', 'UPPER', 'LOWER', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'ABS', 'CEIL', 'FLOOR', 'TRIM', 'SIZE', 'SPLIT', 'DATEDIFF'
  ]);

  const ALIGN_WIDTH = 10; 

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    let upperToken = token.toUpperCase();
    
    // Combine multi-word keywords
    const nextTokenRaw = tokens[i+1];
    let nextUpper = nextTokenRaw?.toUpperCase();
    if (['GROUP', 'ORDER', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'CREATE', 'INSERT'].includes(upperToken)) {
       if (nextUpper === 'BY' || nextUpper === 'JOIN' || nextUpper === 'TABLE' || nextUpper === 'INTO') {
          token = token + " " + (config.keywordUppercase ? nextUpper : nextTokenRaw.toLowerCase());
          upperToken = upperToken + " " + nextUpper;
          i++;
          nextUpper = tokens[i+1]?.toUpperCase();
       }
    }

    // Identify Clause
    if (alignableKeywords.has(upperToken) && !['AND', 'OR', 'ON'].includes(upperToken)) {
      currentClause = upperToken;
    }

    // Casing
    if (keywords.has(upperToken) || alignableKeywords.has(upperToken)) {
      token = config.keywordUppercase ? upperToken : upperToken.toLowerCase();
    } else if (functions.has(upperToken)) {
      token = config.functionUppercase ? upperToken : upperToken.toLowerCase();
    } else if (token.startsWith('$') || token.startsWith(':')) {
      token = config.variableLowercase ? token.toLowerCase() : token;
    } else if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      const isTable = ['FROM', 'JOIN', 'TABLE', 'INTO', 'UPDATE', 'TABLE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'].includes(lastToken.toUpperCase());
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
      if (result.endsWith('\n') || result === "") whenIndentPos = getIndent().length + (config.alignKeywords ? ALIGN_WIDTH + 1 : 0) + 5;
      caseStack.push({ startPos: i, isLong: caseLength > 30, indent: indentLevel, whenIndent: whenIndentPos });
    }

    // Core Formatting Logic
    if (isCommentToken(token)) {
      const commentText = comments.get(token) ?? '--';
      result = result.trimEnd();
      result += `  ${commentText}\n${getIndent()}`;
      if (config.alignKeywords && currentClause === 'SELECT') {
        result += " ".repeat(ALIGN_WIDTH + 1);
      }
      skipFinalAdd = true;
      prefix = "";
    } else if (token === '(') {
      const isSubquery = nextUpper === 'SELECT';
      if (isSubquery) {
        parenStack.push({ type: 'subquery', indent: indentLevel });
        const lastUpper = lastToken.toUpperCase();
        if (['FROM', 'JOIN', 'AS', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'].includes(lastUpper)) {
          result = result.trimEnd() + " (";
        } else {
          result = result.trimEnd() + "\n" + getIndent() + "(";
        }
        indentLevel++;
        result += "\n" + getIndent();
        if (config.alignKeywords) result += " ".repeat(ALIGN_WIDTH + 1);
        skipFinalAdd = true;
      } else {
        parenStack.push({ type: 'expression', indent: indentLevel });
        const lastUpper = lastToken.toUpperCase();
        if (lastToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
          if (functions.has(lastUpper) || !keywords.has(lastUpper)) prefix = ""; 
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
      const isLogicalConnector = upperToken === 'AND' || upperToken === 'OR';
      const shouldAlignLogicalConnector =
        isLogicalConnector &&
        caseStack.length === 0 &&
        (currentClause === 'WHERE' || currentClause === 'HAVING');
      const isAlignable = alignableKeywords.has(upperToken) && (!isLogicalConnector || shouldAlignLogicalConnector);
      if (isAlignable && result !== "") {
        result = result.trimEnd() + "\n" + getIndent();
        if (config.alignKeywords) {
          result += token + " ".repeat(Math.max(1, ALIGN_WIDTH + 1 - token.length));
          skipFinalAdd = true;
        }
        prefix = "";
      } else if (token === ',' && !parenStack.some(p => p.type === 'expression')) {
        const hasTrailingComment = isCommentToken(tokens[i + 1] ?? "");
        if (hasTrailingComment) {
          // Keep "," on the current expression line; the following comment token
          // will append itself to the same line and then force a line break.
        } else {
        const wrapIndent = config.alignKeywords ? ALIGN_WIDTH + 1 : config.indentSize;
        if (currentClause === 'SELECT') {
          let nextExprLength = 0;
          let pDepth = 0;
          for (let j = i + 1; j < tokens.length; j++) {
            const t = tokens[j].toUpperCase();
            if (pDepth === 0 && (t === ',' || alignableKeywords.has(t))) break;
            if (t === '(') pDepth++;
            if (t === ')') pDepth--;
            nextExprLength += tokens[j].length + 1;
          }
          if (nextExprLength > 30) {
            result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
            skipFinalAdd = true;
          }
        } else if (currentClause === 'GROUP BY' || currentClause === 'ORDER BY') {
          result = result.trimEnd() + ",\n" + getIndent() + " ".repeat(wrapIndent);
          skipFinalAdd = true;
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

  if (config.noTabs) result = result.replace(/\t/g, " ".repeat(config.indentSize));
  if (config.noEmptyLines) {
    result = result.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0).join('\n');
  }
  return result;
}
