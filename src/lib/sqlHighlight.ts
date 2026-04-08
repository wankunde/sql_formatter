import * as Prism from 'prismjs';
import 'prismjs/components/prism-sql';

let hasPatchedSparkKeywords = false;

const sparkKeywords =
  /\b(?:SELECT|FROM|WHERE|JOIN|ON|GROUP|BY|ORDER|LIMIT|OFFSET|AND|OR|AS|IN|IS|NULL|NOT|EXISTS|HAVING|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|DESC|ASC|TABLE|VALUES|INSERT|INTO|UPDATE|DELETE|CREATE|IF|DATEDIFF|COUNT|SUM|AVG|MIN|MAX|CAST|COALESCE|IFNULL|CONCAT|SUBSTR|UPPER|LOWER|NOW|DATE|YEAR|MONTH|DAY|OVER|PARTITION|ROWS|PRECEDING|FOLLOWING)\b/i;

function patchSqlKeywords() {
  if (hasPatchedSparkKeywords || !Prism.languages.sql) {
    return;
  }

  const currentKeyword = Prism.languages.sql.keyword;
  if (Array.isArray(currentKeyword)) {
    currentKeyword.push(sparkKeywords);
  } else if (currentKeyword) {
    Prism.languages.sql.keyword = [currentKeyword, sparkKeywords] as unknown as typeof Prism.languages.sql.keyword;
  } else {
    Prism.languages.sql.keyword = sparkKeywords;
  }

  hasPatchedSparkKeywords = true;
}

export function highlightSql(sql: string) {
  patchSqlKeywords();
  const language = Prism.languages.sql;
  if (!language) {
    return sql;
  }
  return Prism.highlight(sql, language, 'sql');
}
