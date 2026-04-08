import { describe, it, expect } from 'vitest';
import { formatSql } from './formatter';
import type { FormatterConfig } from './store/useConfigStore';

const defaultConfig: FormatterConfig = {
  noTabs: true,
  noEmptyLines: true,
  keywordUppercase: true,
  functionUppercase: true,
  fieldLowercase: true,
  tableLowercase: true,
  variableLowercase: true,
  selectFieldWrapLimit: 80,
  newlineWhere: true,
  newlineJoin: true,
  newlineGroupBy: true,
  newlineOrderBy: true,
  newlineLimit: true,
  newlineOffset: true,
  indentSize: 2,
  alignKeywords: true,
};

describe('SQL Formatter - Full Regression Suite', () => {
  const normalize = (sql: string) => sql.replace(/\s+/g, '').toUpperCase();

  // --- 1. Integrity & Core Rules ---
  it('should NEVER add or remove non-whitespace tokens (Integrity Check)', () => {
    const complexSql = `
      create table if not exists tmp_ai.test_table as
      select cid AS resource_id, name from (
        select DISTINCT cid, LOWER(TRIM(name)) AS name from source_table
      ) t1 inner join (select id from t2) t2 on t1.id = t2.id
    `;
    const formatted = formatSql(complexSql, defaultConfig);
    expect(normalize(formatted)).toBe(normalize(complexSql));
  });

  it('should format keywords to uppercase and identifiers to lowercase', () => {
    const sql = 'select Column1 from Table1 WHERE ID = 1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('column1');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('table1');
  });

  it('should replace tabs with spaces and remove empty lines', () => {
    const sql = 'SELECT\t*\n\nFROM table1';
    const formatted = formatSql(sql, { ...defaultConfig, noTabs: true, noEmptyLines: true });
    expect(formatted).not.toContain('\t');
    expect(formatted).not.toContain('\n\n');
  });

  // --- 2. Spacing & Punctuation ---
  it('should remove space between function name and parenthesis but KEEP for keywords', () => {
    const sql = 'SELECT SUM ( COUNT ( id ) ) FROM t JOIN x ON(a=b)';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SUM(COUNT(id))');
    expect(formatted).toContain('ON (a = b)'); 
  });

  it('should not duplicate commas or parentheses', () => {
    const sql = 'SELECT a, b FROM (SELECT 1) t';
    const formatted = formatSql(sql, defaultConfig);
    const commaCount = (formatted.match(/,/g) || []).length;
    const parenCount = (formatted.match(/\(/g) || []).length;
    expect(commaCount).toBe(1);
    expect(parenCount).toBe(1);
  });

  // --- 3. Clause Wrapping & Alignment ---
  it('should add newline and indent for subqueries and keep ( on same line as FROM', () => {
    const sql = 'SELECT * FROM (SELECT id FROM t1) sub';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('FROM (');
    // Subqueries inside parentheses current indent + 2
    expect(formatted).toContain('\n  SELECT id'); 
  });

  it('should format WHERE/JOIN/GROUP BY/ORDER BY with newlines and alignment', () => {
    const sql = 'SELECT * FROM t1 JOIN t2 ON t1.id = t2.id WHERE a=1 AND b=2';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('\n  JOIN');
    expect(formatted).toContain('\n    ON');
    expect(formatted).toContain('\n WHERE');
    // WHERE starts at 1, Alignable width is 6. Space before AND should be such that AND aligns under WHERE's content column.
    expect(formatted).toContain('\n       AND');
  });

  it('should right-align top-level keywords when configured', () => {
    const sql = 'SELECT col FROM tbl WHERE id = 1';
    const formatted = formatSql(sql, { ...defaultConfig, alignKeywords: true });
    const lines = formatted.split('\n');
    expect(lines[0].startsWith('SELECT')).toBe(true);
    expect(lines[1].startsWith('  FROM')).toBe(true);
    expect(lines[2].startsWith(' WHERE')).toBe(true);
  });

  // --- 4. SELECT Expression Logic (30/80 Rule) ---
  it('should wrap SELECT expressions longer than 30 characters', () => {
    const sql = "SELECT short, COUNT(DISTINCT CASE WHEN a > 1 THEN b ELSE NULL END) AS long_expr FROM t";
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    expect(lines.some(l => l.trim().startsWith('COUNT(DISTINCT'))).toBe(true);
  });

  it('should not break inside simple functions like DATEDIFF', () => {
    const sql = "SELECT DATEDIFF(t2.date, t1.date) AS diff FROM t";
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 10 });
    expect(formatted).toContain('DATEDIFF(t2.date, t1.date) AS diff');
  });

  // --- 5. CASE WHEN Logic ---
  it('should handle nested CASE alignment (THEN/ELSE aligned with WHEN)', () => {
    const sql = `SELECT COUNT(DISTINCT CASE WHEN datediff(t2.draw_date, t1.draw_date) > 1 THEN t2.mid ELSE NULL END) AS cnt FROM t`;
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    const whenLine = lines.find(l => l.includes('WHEN')) || "";
    const thenLine = lines.find(l => l.includes('THEN')) || "";
    
    // Check if THEN is aligned under WHEN
    expect(thenLine.indexOf('THEN')).toBe(whenLine.indexOf('WHEN'));
  });
});
