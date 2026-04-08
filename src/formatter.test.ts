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
  alignKeywords: false,
};

describe('SQL Formatter Integrity', () => {
  const normalize = (sql: string) => sql.replace(/\s+/g, '').toUpperCase();

  it('should NEVER add or remove non-whitespace tokens', () => {
    const complexSql = `
      create table if not exists tmp_ai.tmp_hjw_ott_search_query__channelscore_20260406 as
      select cid AS resource_id, name AS resource_name from (
        select DISTINCT cid, LOWER(TRIM(name)) AS name from bi_yyzx.channel_search_daily
      ) channel_info
      inner join (
        select keyword from tmp_ai.top_query
      ) top_query on (channel_info.name = top_query.keyword)
    `;
    const formatted = formatSql(complexSql, defaultConfig);
    
    // Check integrity: non-space content must be identical (ignoring case)
    expect(normalize(formatted)).toBe(normalize(complexSql));
  });

  it('should not duplicate parentheses in subqueries', () => {
    const sql = 'SELECT * FROM (SELECT 1) t';
    const formatted = formatSql(sql, defaultConfig);
    const openParenCount = (formatted.match(/\(/g) || []).length;
    const closeParenCount = (formatted.match(/\)/g) || []).length;
    expect(openParenCount).toBe(1);
    expect(closeParenCount).toBe(1);
  });

  it('should not duplicate commas', () => {
    const sql = 'SELECT a, b, c FROM t GROUP BY a, b';
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 5 });
    const commaCount = (formatted.match(/,/g) || []).length;
    expect(commaCount).toBe(3);
  });

  it('should keep function spacing tight', () => {
    const sql = 'SELECT SUM(COALESCE(a, 0)) FROM t';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SUM(COALESCE(a, 0))');
    expect(formatted).not.toContain('SUM (');
  });

  it('should handle ON condition without merging with subquery alias', () => {
    const sql = 'SELECT * FROM (SELECT 1) t1 JOIN (SELECT 2) t2 ON t1.id = t2.id';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain(') t2');
    expect(formatted).toContain('\n  ON');
  });

  it('should right-align keywords when alignKeywords is true', () => {
    const sql = 'SELECT col FROM tbl WHERE id = 1';
    const formatted = formatSql(sql, { ...defaultConfig, alignKeywords: true });
    // SELECT (6), "  FROM" (2+4=6), " WHERE" (1+5=6)
    expect(formatted).toContain('SELECT col');
    expect(formatted).toContain('\n  FROM tbl');
    expect(formatted).toContain('\n WHERE id = 1');
  });

  it('should have space between ON and parenthesis', () => {
    const sql = 'SELECT * FROM t1 JOIN t2 ON (t1.id = t2.id)';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('ON (');
  });

  it('should put subquery parenthesis on the same line as FROM', () => {
    const sql = 'SELECT * FROM (SELECT id FROM t1) sub';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('FROM (');
  });

  it('should put subquery parenthesis on the same line as JOIN', () => {
    const sql = 'SELECT * FROM t1 JOIN (SELECT id FROM t2) sub ON t1.id = sub.id';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('JOIN (');
  });

  it('should put subquery parenthesis on the same line as AS', () => {
    const sql = 'CREATE TABLE t AS (SELECT * FROM source)';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('AS (');
  });

  it('should keep complex expressions on a single line if under wrap limit', () => {
    // Let's test an expression with a comma inside.
    const sql = `SELECT a, b, datediff(t2.date, t1.date) AS diff FROM t`;
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 5 });
    // It should break at top-level commas, but NOT inside datediff
    expect(formatted).toContain('datediff(t2.date, t1.date) AS diff');
  });
});
