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
    expect(normalize(formatted)).toBe(normalize(complexSql));
  });

  it('should format CASE WHEN correctly (short case)', () => {
    const sql = 'SELECT CASE WHEN a=1 THEN 1 END FROM t';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('CASE WHEN a = 1 THEN 1 END');
  });

  it('should format CASE WHEN correctly (long case > 30 chars)', () => {
    const sql = 'SELECT CASE WHEN long_column_name_exceeds_thirty = 1 THEN some_other_long_value ELSE default_val END FROM t';
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    
    const whenLine = lines.find(l => l.includes('WHEN')) || "";
    const thenLine = lines.find(l => l.includes('THEN')) || "";
    const elseLine = lines.find(l => l.includes('ELSE')) || "";
    
    const whenIndent = whenLine.indexOf('WHEN');
    const thenIndent = thenLine.indexOf('THEN');
    const elseIndent = elseLine.indexOf('ELSE');
    
    expect(thenIndent).toBeGreaterThan(0);
    expect(thenIndent).toBe(whenIndent);
    expect(elseIndent).toBe(whenIndent);
  });

  it('should keep complex expressions on a single line if under wrap limit', () => {
    const sql = `SELECT a, b, datediff(t2.date, t1.date) AS diff FROM t`;
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 5 });
    expect(formatted).toContain('datediff(t2.date, t1.date) AS diff');
  });

  it('should right-align keywords when alignKeywords is true', () => {
    const sql = 'SELECT col FROM tbl WHERE id = 1';
    const formatted = formatSql(sql, { ...defaultConfig, alignKeywords: true });
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

  it('should put subquery parenthesis on the same line as AS', () => {
    const sql = 'CREATE TABLE t AS (SELECT * FROM source)';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('AS (');
  });
});
