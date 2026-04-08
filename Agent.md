# SQL Formatter - Project Context & Coding Standards

## 1. Project Overview
A professional, high-performance web-based SQL Formatter specialized for **Apache Spark SQL** syntax. The application provides a dual-pane IDE experience with real-time formatting, syntax highlighting, and deep customization options.

- **URL:** [https://wankunde.github.io/sql_formatter/](https://wankunde.github.io/sql_formatter/)
- **Repository:** `git@github.com:wankunde/sql_formatter.git`
- **Tech Stack:** React, TypeScript, Vite, Tailwind CSS, PrismJS, Zustand.

## 2. Core Formatting Rules (The "Refinery" Logic)

### 2.1 Lexical & Integrity Rules
- **Integrity:** The formatter MUST NEVER add, remove, or modify non-whitespace characters (except for casing). The token sequence must remain 1:1 with the source.
- **Operators:** Multi-character operators like `<=`, `>=`, `!=`, and `<>` must remain intact with no internal spaces.
- **Functions:** No space is allowed between a function name and its opening parenthesis (e.g., `SUM(COALESCE(...))`).
- **Whitespaces:** No tabs are allowed (convert to spaces). No empty lines are allowed (Compact Mode).

### 2.2 Alignment & Indentation
- **Gutter Alignment:** All top-level keywords (`SELECT`, `FROM`, `WHERE`, `LEFT JOIN`, `ON`, `AND`, etc.) must be **left-aligned** at the start of their respective indentation level.
- **Content Gutter:** A fixed width of **10 characters** is reserved for keywords. All subsequent content (columns, tables, conditions) must start at the **11th character** column to create a perfect vertical alignment.
- **Keywords:** Keywords and built-in functions must be **UPPERCASE**.
- **Identifiers:** Table names, column names, and variables must be **lowercase**.

### 2.3 Structural Wrapping
- **SELECT Expressions:** Any expression in the `SELECT` clause exceeding **30 characters** must be moved to a new line.
- **CASE WHEN:** If a `CASE` expression exceeds **30 characters**, the `THEN` and `ELSE` branches must start on new lines and be vertically aligned with the `WHEN` keyword.
- **Subqueries:** Opening parentheses for subqueries following `FROM`, `JOIN`, or `AS` should stay on the **same line** as the keyword (e.g., `FROM (`).
- **Nested Logic:** Subqueries must be recursively indented.

## 3. UI/UX Standards (Professional IDE Style)
- **Layout:** Strict 50/50 vertical split between "Source Input" and "Refined Output".
- **Typography:** Use `JetBrains Mono` for all code areas at `12px` font size. High clarity, `500` font-weight, and `1.6` line-height for output.
- **Theme:** Professional SaaS Light Theme with a slate-900 compact header.
- **Line Numbers:** Gutter-style line numbers must be present on both panes and perfectly synchronized with scrolling.
- **Config:** A non-transparent, right-side drawer for preferences with solid white background and clear descriptive labels.

## 4. Engineering & Quality Assurance
- **Unit Testing (UT):** Every formatting rule must have a corresponding test case in `src/formatter.test.ts`.
- **Regression:** A full regression suite must run and pass (`npm test`) before every deployment.
- **CI/CD:** Automated deployment to GitHub Pages via GitHub Actions or manual `gh-pages` branch synchronization.
- **Type Safety:** Strict TypeScript usage. Avoid `any`. Use `import type` for type-only imports to satisfy `verbatimModuleSyntax`.

## 5. Development Workflow
1.  Modify formatting logic in `src/formatter.ts`.
2.  Update/Add tests in `src/formatter.test.ts`.
3.  Run `npm test` to verify.
4.  Build and Deploy using `npm run build` and `npx gh-pages -d dist`.
