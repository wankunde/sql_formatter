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

  it('should add newline before WHERE clause', () => {
    const sql = 'SELECT * FROM table1 WHERE id = 1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('\nWHERE');
  });

  it('should add newline before JOIN clause', () => {
    const sql = 'SELECT * FROM t1 JOIN t2 ON t1.id = t2.id';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('\nJOIN');
  });

  it('should wrap SELECT fields exceeding 100 characters', () => {
    const longFields = Array(20).fill('very_long_column_name_to_test_wrapping_behavior').join(', ');
    const sql = `SELECT ${longFields} FROM table1`;
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach(line => {
      expect(line.length).toBeLessThanOrEqual(120); // 100 limit + indent/overhead
    });
  });

  it('should remove empty lines', () => {
    const sql = 'SELECT * \n\n FROM table1';
    const formatted = formatSql(sql, { ...defaultConfig, noEmptyLines: true });
    expect(formatted).not.toContain('\n\n');
  });

  it('should replace tabs with spaces', () => {
    const sql = 'SELECT\t*\tFROM\ttable1';
    const formatted = formatSql(sql, { ...defaultConfig, noTabs: true });
    expect(formatted).not.toContain('\t');
  });
});
