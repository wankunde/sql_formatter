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
  selectFieldWrapLimit: 100,
  newlineWhere: true,
  newlineJoin: true,
  newlineGroupBy: true,
  newlineOrderBy: true,
  newlineLimit: true,
  newlineOffset: true,
  indentSize: 2,
};

describe('SQL Formatter', () => {
  it('should format keywords to uppercase', () => {
    const sql = 'select * from table1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('FROM');
  });

  it('should format identifiers to lowercase', () => {
    const sql = 'SELECT Column1 FROM Table1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('column1');
    expect(formatted).toContain('table1');
  });

  it('should add newline and indent for subqueries', () => {
    const sql = 'SELECT * FROM (SELECT id FROM t1) sub';
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    expect(lines.some(l => l.trim() === '(')).toBe(true);
    expect(lines.some(l => l.includes('  SELECT'))).toBe(true); // check indentation
  });

  it('should handle JOIN ON with proper spacing and newlines', () => {
    const sql = 'SELECT * FROM t1 JOIN t2 ON t1.id = t2.id';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('\nJOIN');
    expect(formatted).toContain('\n  ON');
  });

  it('should remove space between function and parenthesis', () => {
    const sql = 'SELECT SUM ( COUNT ( id ) ) FROM t1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SUM(COUNT(id))');
  });

  it('should wrap SELECT fields and indent', () => {
    const longFields = 'c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15';
    const sql = `SELECT ${longFields} FROM t1`;
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 20 });
    const lines = formatted.split('\n');
    expect(lines.length).toBeGreaterThan(2);
    expect(lines[1].startsWith('  ')).toBe(true);
  });

  it('should format WHERE conditions with newlines', () => {
    const sql = 'SELECT * FROM t1 WHERE a = 1 AND b = 2 OR c = 3';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('\n  AND');
    expect(formatted).toContain('\n  OR');
  });

  it('should format GROUP BY items with newlines', () => {
    const sql = 'SELECT a, b FROM t1 GROUP BY a, b';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('GROUP BY a,\n  b');
  });
});
