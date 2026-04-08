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

describe('SQL Formatter SELECT Logic', () => {
  const normalize = (sql: string) => sql.replace(/\s+/g, '').toUpperCase();

  it('should wrap SELECT expressions longer than 30 characters', () => {
    const sql = "SELECT col1, COUNT(DISTINCT CASE WHEN a > 1 THEN b ELSE NULL END) AS long_expr, col2 FROM table";
    const formatted = formatSql(sql, defaultConfig);
    const lines = formatted.split('\n');
    
    expect(lines.some(l => l.includes('COUNT(DISTINCT'))).toBe(true);
    expect(lines.some(l => l.trim().startsWith('COUNT(DISTINCT'))).toBe(true);
  });

  it('should handle nested CASE alignment within complex expressions', () => {
    const sql = `SELECT COUNT(DISTINCT CASE WHEN datediff(t2.draw_date, t1.draw_date) > 1 AND datediff(t2.draw_date, t1.draw_date) <= 7 THEN t2.mid ELSE NULL END) AS next_7days_paycnt FROM t`;
    const formatted = formatSql(sql, defaultConfig);
    
    expect(formatted).toContain('WHEN');
    expect(formatted).toContain('THEN');
    expect(formatted).toContain('ELSE');
    
    const lines = formatted.split('\n');
    const whenLine = lines.find(l => l.includes('WHEN')) || "";
    const thenLine = lines.find(l => l.includes('THEN')) || "";
    
    expect(thenLine.indexOf('THEN')).toBe(whenLine.indexOf('WHEN'));
  });

  it('should not break inside simple function expressions at commas', () => {
    const sql = "SELECT datediff(t2.date, t1.date) AS diff, col2 FROM t";
    const formatted = formatSql(sql, { ...defaultConfig, selectFieldWrapLimit: 10 });
    // Should break at col2 comma, but not inside datediff
    // Note: Use uppercase for function name check because default is uppercase
    expect(formatted).toContain('DATEDIFF(t2.date, t1.date) AS diff');
  });

  it('should put subquery parenthesis on same line as keywords', () => {
    const sql = "SELECT * FROM (SELECT 1) t1 JOIN (SELECT 2) t2 AS (SELECT 3)";
    const formatted = formatSql(sql, defaultConfig);
    expect(formatted).toContain('FROM (');
    expect(formatted).toContain('JOIN (');
    expect(formatted).toContain('AS (');
  });
  
  it('should maintain total integrity', () => {
    const sql = `SELECT t1.week_id, t1.first_last_date, CASE WHEN t1.week_id = t3.box_first_week_id THEN '魔力赏新客' ELSE '魔力赏老客' END is_box_week_new, COUNT(DISTINCT t1.mid) pay_mid_cnt, COUNT(DISTINCT CASE WHEN datediff(t2.draw_date, t1.draw_date) > 1 AND datediff(t2.draw_date, t1.draw_date) <= 7 THEN t2.mid ELSE NULL END) next_7days_paycnt FROM t`;
    const formatted = formatSql(sql, defaultConfig);
    expect(normalize(formatted)).toBe(normalize(sql));
  });
});
