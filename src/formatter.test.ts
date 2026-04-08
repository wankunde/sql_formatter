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
});
