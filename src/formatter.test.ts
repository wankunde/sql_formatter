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

  it('should left-align all major keywords and align content in a column (Gutter Style)', () => {
    const sql = `SELECT a.col1, b.col2 FROM table_a a LEFT JOIN table_b b ON a.id = b.id WHERE a.val > 0 AND b.status = 'active'`;
    const formatted = formatSql(sql, defaultConfig);
    
    // Check if SELECT starts at 0 and FROM follows on a new line also at 0
    expect(formatted.startsWith('SELECT')).toBe(true);
    expect(formatted).toContain('\nFROM');
    expect(formatted).toContain('\nLEFT JOIN');
    expect(formatted).toContain('\nON');
    expect(formatted).toContain('\nWHERE');
    expect(formatted).toContain('\nAND');
  });

  it('should format keywords to uppercase and identifiers to lowercase', () => {
    const sql = 'select Column1 from Table1 WHERE ID = 1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('column1');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('table1');
  });

  it('should remove space between function name and parenthesis but KEEP for keywords', () => {
    const sql = 'SELECT SUM ( COUNT ( id ) ) FROM t JOIN x ON(a=b)';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('SUM(COUNT(id))');
    // ON is now aligned, so it will have padding after it
    expect(formatted).toContain('ON         ('); 
  });

  it('should wrap SELECT expressions longer than 30 characters', () => {
    const sql = "SELECT short, COUNT(DISTINCT CASE WHEN a > 1 THEN b ELSE NULL END) AS long_expr FROM t";
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    expect(lines.some(l => l.trim().startsWith('COUNT(DISTINCT'))).toBe(true);
  });

  it('should handle nested CASE alignment (THEN/ELSE aligned with WHEN)', () => {
    const sql = `SELECT COUNT(DISTINCT CASE WHEN datediff(t2.draw_date, t1.draw_date) > 1 THEN t2.mid ELSE NULL END) AS cnt FROM t`;
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    const whenLine = lines.find(l => l.includes('WHEN')) || "";
    const thenLine = lines.find(l => l.includes('THEN')) || "";
    expect(thenLine.indexOf('THEN')).toBe(whenLine.indexOf('WHEN'));
  });

  it('should not add space between operator characters like <=, >=', () => {
    const sql = 'SELECT * FROM t WHERE a <= 1';
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('a <= 1');
  });

  it('should not align CASE WHEN inner AND at SELECT clause level', () => {
    const sql = `
      SELECT CASE
        WHEN get_json_object(av_feature, '$.operate_ogv_flag') != ''
             AND card_type IN ('bangumi', 'bangumi_op')
          THEN '托管流量'
        WHEN get_json_object(av_feature, '$.ogv_new_hot_flag') != ''
             AND card_type IN ('bangumi', 'bangumi_op')
          THEN '项目流量'
        ELSE '自然流量'
      END AS card_type
    `;

    const formatted = formatSql(sql, defaultConfig);
    const hasTopLevelAndLine = formatted
      .split('\n')
      .some((line) => line.startsWith('AND'));

    expect(hasTopLevelAndLine).toBe(false);
    expect(formatted).toContain("!= '' AND card_type IN ('bangumi', 'bangumi_op')");
  });

  it('should preserve end-of-line comments for SELECT expressions', () => {
    const sql = `
      select
        sum(played_time) as played_time,  -- 总时长
        sum(if(played_time>=10,1,0)) as vv_10s, -- 10秒vv
        sum(if(played_time>=60,1,0)) as vv_60s, -- 60秒vv
        sum(if(played_time<3,1,0)) as vv_rush, -- 3秒秒退
        sum(1) as vv -- vv
      from t
    `;

    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    const totalDurationLine = lines.find((line) => line.includes('-- 总时长')) ?? '';
    const vv10Line = lines.find((line) => line.includes('-- 10秒vv')) ?? '';
    const vv60Line = lines.find((line) => line.includes('-- 60秒vv')) ?? '';
    const rushLine = lines.find((line) => line.includes('-- 3秒秒退')) ?? '';
    const vvLine = lines.find((line) => line.includes('-- vv')) ?? '';

    expect(totalDurationLine).toContain('played_time,  -- 总时长');
    expect(vv10Line).toContain('vv_10s,  -- 10秒vv');
    expect(vv60Line).toContain('vv_60s,  -- 60秒vv');
    expect(rushLine).toContain('vv_rush,  -- 3秒秒退');
    expect(vvLine).toContain('AS vv  -- vv');

    const vv10Index = lines.findIndex((line) => line.includes('vv_10s'));
    const vv60Index = lines.findIndex((line) => line.includes('vv_60s'));
    expect(vv10Index).toBeGreaterThan(-1);
    expect(vv60Index).toBeGreaterThan(vv10Index);
  });
});
