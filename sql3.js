// The SQL track, lesson 3: your own tables. CREATE TABLE, DESCRIBE, INSERT, types (INT, BIGINT,
// VARCHAR, DATE, DECIMAL, and why money is never FLOAT), DROP TABLE, PRIMARY KEY, NOT NULL, UNIQUE,
// UPDATE and DELETE (and what happens without WHERE).
//
// Every query box here has db: 'sandbox': it runs in the database "sandbox" as the user lab_sandbox,
// which may create and change tables there and nowhere else (app/sql/setup.ps1, app/Server.java).
// payments_lab stays read-only. The block sqlreset shows the "Empty the sandbox" button.
// A sqltask may have pre (statements the lab runs first, said in the task text) and verify (the lab's
// own queries, run after his statement; their answers are in r.verify for the checks).
//
// Every result and MySQL message quoted below was produced in the sandbox of the lab-mysql container
// (MySQL 8.4.11). This file adds its lesson to the SQL week made in missions/sql1.js.

(function () {
  const W = (window.WEEKS || []).find(w => w.id === 'sql-track');
  if (!W) return;
  const SB = 'sandbox';

  // ---- the task: the wallets table ----
  const WANT = ['id', 'owner', 'upi_id', 'balance_paise', 'opened_on'];
  const colsOf = r => (r.verify && r.verify.cols && r.verify.cols.ok ? r.verify.cols.rows : null);   // [name, type, len, nullable]
  const keysOf = r => (r.verify && r.verify.keys && r.verify.keys.ok ? r.verify.keys.rows : []);     // [index, column, non_unique]
  const col = (r, name) => (colsOf(r) || []).find(c => c[0].toLowerCase() === name);
  const made = r => { const c = colsOf(r); return !!c && c.length > 0; };
  const typeText = c => c[1] + (c[2] ? '(' + c[2] + ')' : '');
  function createWhy(r) {
    if (r.blocked || r.setup || !r.errno) return r.error;
    if (r.errno === 1064) return 'MySQL could not read the statement. Look just before the text after "near". Common causes here: a missing comma between two columns, a comma after the last column (just before the closing bracket), or a missing bracket.';
    if (r.errno === 1050) return 'A table called wallets already exists. The lab removes it before each Run, so press Run again.';
    return r.error;
  }

  W.missions.push({
    id: 'sql1m3',
    title: 'Your own tables',
    skill: 'CREATE TABLE, types, keys, INSERT, UPDATE, DELETE',
    blocks: [
      { t: 'say', html: '<b>SQL night 3.</b> Until now you only read. Tonight you build tables of your own and change their rows.<br>You get your own database, called <code>sandbox</code>. payments_lab stays read-only, so nothing there can break.<div class="muted" style="margin-top:8px">If a Run box says "The lab only sends queries that read data", the lab is still the old version: close the lab window and double-click <code>start.bat</code> again. If it says the sandbox is not set up, double-click <code>app/sql/setup.bat</code> once (Docker Desktop running), then Run again.</div>' },
      { t: 'sqlreset', db: SB, html: 'Start from an empty sandbox. You can press this any time tonight; it removes every table you made in the sandbox, and nothing else.' },

      { t: 'say', html: 'First, two questions from lesson 2, from memory.' },
      {
        t: 'predict', xp: 10, answer: '3\n4',
        ask: 'Which refund ids come back? One per line, smallest first.',
        code: 'SELECT id FROM refunds WHERE refunded_at IS NULL;',
        why: 'IS NULL keeps the rows with no value in refunded_at, the refunds still waiting:<pre>id 1  2026-10-03 12:00:00\nid 2  2026-10-05 10:00:00\nid 3  NULL                  keep\nid 4  NULL                  keep\nid 5  2026-10-10 09:30:00</pre>The usual slip is writing = NULL, which keeps nothing.',
      },
      {
        t: 'predict', xp: 10, answer: '1\n5\n8\n11\n12',
        ask: 'Which payment ids come back? One per line, smallest first.',
        code: "SELECT id FROM payments\nWHERE status = 'APPROVED' AND merchant_id = 1 OR merchant_id = 5;",
        why: 'AND is worked out before OR:<pre>(status = \'APPROVED\' AND merchant_id = 1)  → 1, 11\nOR merchant_id = 5                         → 5, 8, 12\nanswer: 1, 5, 8, 11, 12</pre>Payment 5 is DECLINED but gets in through the OR side. Brackets around the two shop tests would keep it out.',
      },

      { t: 'say', html: '<b>Idea 1: CREATE TABLE makes an empty table.</b><br>Give the table a name, then each column inside brackets: a name and a <b>type</b>, with commas between columns.<br>The type is the column\'s rule: what kind of value it accepts.<pre>CREATE TABLE shops (\n  id         INT,            whole numbers\n  name       VARCHAR(40),    text, up to 40 characters\n  opened_on  DATE            a date: no comma after the last column\n);</pre>' },
      { t: 'sqltry', db: SB, sql: 'CREATE TABLE shops (\n  id         INT,\n  name       VARCHAR(40),\n  opened_on  DATE\n);', html: 'Run it. A CREATE shows no table: only "Done".', after: 'The table exists now, with three columns and no rows. If MySQL says <code>Table \'shops\' already exists</code> (error 1050), you made it earlier: carry on.' },

      { t: 'say', html: '<b>Idea 2: DESCRIBE shows a table\'s columns and rules.</b><br>One row per column: its type, whether it may be empty (Null), its key, and its Default: the value MySQL uses when an INSERT leaves that column out.<br>Use it whenever you meet a table you don\'t know. (Extra is for special settings; it is empty here.)<pre>DESCRIBE shops;\n\nField      Type         Null  Key  Default\nid         int          YES        NULL\nname       varchar(40)  YES        NULL\nopened_on  date         YES        NULL</pre>' },
      { t: 'sqltry', db: SB, sql: 'DESCRIBE shops;', html: 'Run it. Null says YES for every column: so far, any cell may be left empty.' },

      { t: 'say', html: '<b>Idea 3: INSERT adds rows.</b><br>Name the columns, then VALUES with one bracket per row, the values in the same order as the columns.<br>Text and dates go in single quotes; numbers don\'t.<pre>INSERT INTO shops (id, name, opened_on) VALUES\n  (1, \'Kettle and Cup\', \'2025-06-01\'),\n  (2, \'Fuel Stop 24\',   \'2024-11-15\');\n\n→ Done. 2 rows added.</pre>' },
      { t: 'sqltry', db: SB, sql: "INSERT INTO shops (id, name, opened_on) VALUES\n  (1, 'Kettle and Cup', '2025-06-01'),\n  (2, 'Fuel Stop 24',   '2024-11-15');", html: 'Run it <b>twice</b>.' },
      {
        t: 'predict', xp: 10, answer: '4',
        ask: 'You ran that INSERT twice. How many rows does shops have now? Type a number.',
        code: 'SELECT * FROM shops;',
        why: '<pre>first Run:   2 rows added   → 2\nsecond Run:  2 rows added   → 4\n             ids 1, 2, 1, 2</pre>Nothing in this table says an id must be different in every row, so MySQL took the repeats. That is the job of a primary key (Idea 8).',
      },
      { t: 'sqltry', db: SB, sql: 'SELECT * FROM shops;', html: 'Check it. Two shops with id 1 means "shop 1" no longer points at one row.' },

      { t: 'say', html: '<b>Idea 4: the type refuses wrong values.</b><br>Each type checks every value you put in. If one value breaks the rule, the whole statement fails (a <b>statement</b> is one instruction to MySQL: a CREATE, an INSERT, a SELECT).<pre>id = \'three\'            INT          ERROR 1366: Incorrect integer value: \'three\' for column \'id\'\nname = 50 characters    VARCHAR(40)  ERROR 1406: Data too long for column \'name\'\nopened_on = \'2026-02-30\' DATE        ERROR 1292: Incorrect date value: \'2026-02-30\'</pre>' },
      {
        t: 'sqltry', db: SB, experiment: true, sql: "INSERT INTO shops (id, name, opened_on) VALUES (3, 'Page Turner Books', '2026-02-30');",
        html: '<b>Break it.</b> February has no 30th. Run it and read the error. Then try <code>\'30-01-2026\'</code>, and then <code>\'2026-01-30\'</code>.',
        after: 'A DATE is written <code>\'YYYY-MM-DD\'</code>: year, month, day, with dashes and quotes. <code>\'30-01-2026\'</code> fails with the same 1292, because MySQL reads the first part as the year. <code>\'2026-01-30\'</code> works. A <b>DATETIME</b> adds the time: <code>\'2026-10-01 09:15:00\'</code>, like payments.created_at.',
      },
      {
        t: 'predict', xp: 10, answer: '1406',
        ask: 'name is VARCHAR(40). What error number does MySQL give? Type the number.',
        code: "INSERT INTO shops (id, name, opened_on)\nVALUES (4, 'The Very Long Name Of A Shop That Sells Everything', '2026-01-01');",
        why: '<pre>\'The Very Long Name Of A Shop That Sells Everything\' = 50 characters\nVARCHAR(40) holds at most 40\n→ ERROR 1406 (22001): Data too long for column \'name\' at row 1</pre>1366 is a wrong kind of value (text in a number column); 1406 is a value too long for its column.',
      },

      { t: 'say', html: '<b>Idea 5: INT or BIGINT.</b><br>INT holds whole numbers up to 2,147,483,647. BIGINT goes far higher: up to 9,223,372,036,854,775,807.<br>In paise, INT\'s limit is only about ₹2.1 crore:<pre>2,147,483,647 paise ÷ 100 = ₹2,14,74,836.47\n                          ≈ ₹2.1 crore</pre>One busy shop takes more than that in a year, so payments.amount_paise is BIGINT.' },
      { t: 'sqltry', db: SB, sql: 'CREATE TABLE money_test (\n  as_int      INT,\n  as_bigint   BIGINT,\n  as_float    FLOAT,\n  as_decimal  DECIMAL(10,2)\n);', html: 'A table to test the money types. Run it once.' },
      {
        t: 'sqltry', db: SB, experiment: true, sql: 'INSERT INTO money_test (as_int) VALUES (3000000000);',
        html: '<b>Break it.</b> 3,000,000,000 paise is ₹3 crore. Run it. Then change <code>as_int</code> to <code>as_bigint</code> and run again.',
        after: 'INT: <code>ERROR 1264 (22003): Out of range value for column \'as_int\' at row 1</code>. BIGINT: 1 row added. Out of range means the number does not fit in the type. Columns you leave out of the INSERT get NULL.',
      },

      { t: 'say', html: '<b>Idea 6: never FLOAT for money.</b><br>FLOAT and DOUBLE keep a nearby binary number, not the exact decimal: the same reason 0.1 + 0.2 went wrong in week 2.<br><code>DECIMAL(10,2)</code> keeps the exact digits: up to 10 digits, 2 of them after the point. Money is whole paise in BIGINT (this lab\'s choice) or DECIMAL; never FLOAT.<pre>put 0.1 in each column, then add 0.2:\n\nFLOAT     0.30000000149011613   ✗\nDECIMAL   0.30                  ✓</pre>' },
      { t: 'sqltry', db: SB, sql: 'INSERT INTO money_test (as_float, as_decimal) VALUES (0.1, 0.1);', html: 'Put 0.1 in the FLOAT column and in the DECIMAL column. Run it once.' },
      {
        t: 'predict', xp: 10, answer: '0',
        ask: 'The FLOAT column shows 0.1 when you SELECT it. How many rows come back? Type a number.',
        code: 'SELECT as_float FROM money_test WHERE as_float = 0.1;',
        why: '<pre>stored in as_float:   the binary number nearest to 0.1, kept in 4 bytes\n                      (shown as 0.1, but not exactly 0.1)\ncompared with:        0.1\nequal?                no → 0 rows</pre>The usual slip is 1: the screen shows 0.1, so it looks equal. The DECIMAL column holds exactly 0.10, so <code>WHERE as_decimal = 0.1</code> finds it.',
      },
      {
        t: 'sqltry', db: SB, experiment: true, sql: 'SELECT as_float, as_float + 0.2, as_decimal, as_decimal + 0.2 FROM money_test WHERE as_float IS NOT NULL;',
        html: 'See it. Run it, then try <code>WHERE as_float = 0.1</code> and <code>WHERE as_decimal = 0.1</code> in place of the WHERE here.',
        after: 'FLOAT + 0.2 gives <code>0.30000000149011613</code>; DECIMAL + 0.2 gives <code>0.30</code>. A bank that stored balances in FLOAT would lose or invent paise on every sum, and a test like "balance = 0.1" would miss rows.',
      },

      { t: 'say', html: '<b>Idea 7: DROP TABLE removes a whole table.</b><br>The table and every row in it are gone. There is no undo.<br>The shops table has repeated ids, so drop it and build it again with rules.<pre>DROP TABLE shops;\n\nafter it:  SELECT * FROM shops;\n→ ERROR 1146 (42S02): Table \'sandbox.shops\' doesn\'t exist</pre>' },
      { t: 'sqltry', db: SB, sql: 'DROP TABLE shops;', html: 'Run it. In real work you DROP only after checking twice which database you are in. Here it is your sandbox.' },

      { t: 'say', html: '<b>Ideas 8, 9 and 10: rules on columns.</b> Write them after the type.<pre>PRIMARY KEY   different in every row, never empty: one id = one row\nNOT NULL      this cell may never be empty\nUNIQUE        different in every row, but not the main key</pre>A table has one primary key; it can have many UNIQUE columns.<pre>CREATE TABLE shops (\n  id         INT PRIMARY KEY,\n  name       VARCHAR(40) NOT NULL UNIQUE,\n  opened_on  DATE NOT NULL\n);</pre>' },
      { t: 'sqltry', db: SB, sql: 'CREATE TABLE shops (\n  id         INT PRIMARY KEY,\n  name       VARCHAR(40) NOT NULL UNIQUE,\n  opened_on  DATE NOT NULL\n);', html: 'Run it. Then run <code>DESCRIBE shops;</code> here: Null now says NO, and Key says PRI and UNI.' },
      { t: 'sqltry', db: SB, sql: "INSERT INTO shops (id, name, opened_on) VALUES\n  (1, 'Kettle and Cup',    '2025-06-01'),\n  (2, 'Fuel Stop 24',      '2024-11-15'),\n  (3, 'Page Turner Books', '2026-01-30');", html: 'Three shops. Run it once. Now try running it a second time.', after: 'The second Run fails: <code>ERROR 1062 (23000): Duplicate entry \'1\' for key \'shops.PRIMARY\'</code>. And no row was added at all, not even the first: one statement either fully happens or not at all.' },
      {
        t: 'predict', xp: 10, answer: '1062',
        ask: 'Shop 4 is new, but the name is already taken. What error number? Type the number.',
        code: "INSERT INTO shops (id, name, opened_on)\nVALUES (4, 'Kettle and Cup', '2026-03-01');",
        why: '<pre>id 4:                 new, fine for PRIMARY KEY\nname \'Kettle and Cup\': already shop 1\'s name, and name is UNIQUE\n→ ERROR 1062 (23000): Duplicate entry \'Kettle and Cup\' for key \'shops.name\'</pre>1062 means "a repeat where repeats are not allowed". The key name after "for key" tells you which rule: shops.PRIMARY or shops.name.',
      },
      {
        t: 'sqltry', db: SB, experiment: true, sql: "INSERT INTO shops (id, name) VALUES (4, 'Green Basket Grocers');",
        html: '<b>Break it.</b> opened_on is NOT NULL, and this INSERT leaves it out. Run it. Then change it to give <code>NULL</code> for name on purpose: <code>(id, name, opened_on) VALUES (4, NULL, \'2026-03-01\')</code>.',
        after: 'Left out: <code>ERROR 1364 (HY000): Field \'opened_on\' doesn\'t have a default value</code>. Given as NULL: <code>ERROR 1048 (23000): Column \'name\' cannot be null</code>. Two messages, one rule.',
      },
      { t: 'sqltry', db: SB, sql: "INSERT INTO shops (id, name, opened_on) VALUES (4, 'Green Basket Grocers', '2026-03-01');", html: 'Now add shop 4 with every column filled in. Run it once: 1 row added, and shops has 4 rows.' },

      { t: 'say', html: '<b>Idea 11: UPDATE changes cells in rows that already exist.</b><br><code>SET</code> says the new value. <code>WHERE</code> says which rows.<br>Habit: run a SELECT with the same WHERE first, to see exactly which rows you will change.<pre>SELECT id, name FROM shops WHERE id = 1;          1 row: Kettle and Cup\nUPDATE shops SET name = \'Kettle & Cup\' WHERE id = 1;\n→ Done. 1 row changed.</pre>' },
      { t: 'sqltry', db: SB, sql: "UPDATE shops SET name = 'Kettle & Cup' WHERE id = 1;", html: 'Run it, then <code>SELECT * FROM shops;</code> here to see the change.' },

      { t: 'say', html: '<b>Idea 12: UPDATE without WHERE changes every row.</b><br>Forget the WHERE and MySQL changes the whole table, with no warning and no undo.<br>This is a real way people damage live databases.<pre>UPDATE shops SET opened_on = \'2026-01-01\';\n→ Done. 4 rows changed.    every shop now opened on 1 Jan 2026</pre>' },
      {
        t: 'predict', xp: 10, answer: '4',
        ask: 'shops has 4 rows. How many rows does this change? Type a number.',
        code: "UPDATE shops SET opened_on = '2026-01-01';",
        why: '<pre>no WHERE → every row is chosen\nshops has 4 rows (ids 1, 2, 3, 4)\n→ 4 rows changed</pre>The usual slip is 1, as if MySQL knew which shop you meant. Without WHERE there is no "which".',
      },
      {
        t: 'sqltry', db: SB, experiment: true, sql: "UPDATE shops SET opened_on = '2026-01-01';",
        html: '<b>Break it, in your sandbox.</b> Run it, then <code>SELECT * FROM shops;</code>. Every opening date is gone.',
        after: 'MySQL Workbench protects you by default with "safe updates": it refuses an UPDATE or DELETE whose WHERE does not use a key column, with <code>ERROR 1175 (HY000): You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column.</code> Keep it switched on. <span class="later">The real undo for mistakes like this, transactions (ROLLBACK): coming in a later SQL lesson</span>',
      },

      { t: 'say', html: '<b>Idea 13: DELETE removes rows.</b><br><code>DELETE FROM shops WHERE id = 4;</code> removes one row. Without WHERE, every row goes, and the empty table stays.<br>DROP removes the table itself.<pre>DELETE FROM shops WHERE id = 4;    rows: 4 → 3, table still there\nDELETE FROM shops;                 rows: all gone, table still there\nDROP TABLE shops;                  table gone</pre>' },
      {
        t: 'predict', xp: 10, answer: '3',
        ask: 'shops has 4 rows. You run these two statements. How many rows are left? Type a number.',
        code: 'DELETE FROM shops WHERE id = 4;\nDELETE FROM shops WHERE id = 99;',
        why: '<pre>DELETE ... WHERE id = 4    1 row deleted    4 - 1 = 3\nDELETE ... WHERE id = 99   0 rows deleted   (no shop 99, and no error)\nleft: 3</pre>A DELETE that matches nothing is not an error: it says 0 rows deleted.',
      },
      { t: 'sqltry', db: SB, sql: 'DELETE FROM shops WHERE id = 4;', html: 'Run it. Then run it again: 0 rows deleted, because shop 4 is already gone.' },

      {
        t: 'deeper', title: 'four facts about types and changes',
        html: `<b>1. 0.1 + 0.2 in MySQL is exact.</b> MySQL treats a number written with a point, like <code>0.1</code>, as an exact decimal. Written as <code>0.1e0</code> it is a floating-point number:
<pre>SELECT 0.1 + 0.2, 0.1e0 + 0.2e0;    →  0.3   0.30000000000000004</pre>
The trouble starts when a FLOAT or DOUBLE column stores the value: then it is binary.
<br><br><b>2. DECIMAL rounds extra digits.</b> <code>DECIMAL(10,2)</code> keeps 2 digits after the point. Putting in <code>12.345</code> stores <code>12.35</code> with no error. And 10 digits in all means the biggest is <code>99999999.99</code>: <code>123456789.99</code> gives <code>ERROR 1264 (22003): Out of range value for column 'as_decimal' at row 1</code>.
<br><br><b>3. "0 rows changed" is not always a missing row.</b> <code>UPDATE shops SET opened_on = '2026-01-01' WHERE id = 1</code> on a shop that already has that date says 0 rows changed: MySQL found the row but nothing was different.
<br><br><b>4. TRUNCATE.</b> <code>TRUNCATE TABLE shops;</code> empties a table like <code>DELETE FROM shops;</code>, but faster, by making the table again from scratch. It cannot have a WHERE. Interviewers ask "DELETE vs TRUNCATE vs DROP": DELETE removes chosen rows, TRUNCATE removes all rows, DROP removes the table.`,
      },

      {
        t: 'sqltask', db: SB, xp: 60, start: '',
        pre: ['DROP TABLE IF EXISTS wallets'],
        verify: {
          cols: "SELECT column_name AS name, data_type AS type, character_maximum_length AS len, is_nullable AS nullable FROM information_schema.columns WHERE table_schema = 'sandbox' AND table_name = 'wallets' ORDER BY ordinal_position",
          keys: "SELECT index_name AS idx, column_name AS col, non_unique AS nonu FROM information_schema.statistics WHERE table_schema = 'sandbox' AND table_name = 'wallets'",
        },
        html: `Your money tool needs a table of wallets. Write one <code>CREATE TABLE wallets</code> statement with these five columns:
<ul>
<li><code>id</code>: a whole number, the primary key</li>
<li><code>owner</code>: text up to 60 characters, never empty</li>
<li><code>upi_id</code>: text up to 50 characters, never empty, and no two wallets may share one</li>
<li><code>balance_paise</code>: money in whole paise, never empty. It must hold balances up to ₹50 crore. Work out how many paise that is, and compare it with INT's limit (Idea 5).</li>
<li><code>opened_on</code>: a date, never empty</li>
</ul>
Each Run first removes any old <code>wallets</code> table (the lab runs <code>DROP TABLE IF EXISTS wallets</code>), so you can run it again and again. Then the lab reads your table's columns and rules from MySQL and checks them.`,
        hints: [
          'Start from the second CREATE TABLE shops above: name, then each column with its type and its rules, commas between columns, no comma after the last.',
          '₹50 crore = 50,00,00,000 rupees × 100 = 5,000,000,000 paise. INT stops at 2,147,483,647, so which type? "Never empty" is NOT NULL; "no two may share" is UNIQUE.',
          'CREATE TABLE wallets ( id INT PRIMARY KEY, owner VARCHAR(60) NOT NULL, upi_id VARCHAR(__) NOT NULL ______, balance_paise ______ NOT NULL, opened_on ____ NOT NULL );',
        ],
        checks: [
          { label: 'The statement runs without an error', test: r => r.ok, why: createWhy },
          {
            label: 'It makes a table called wallets',
            test: r => r.ok && made(r),
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              if (!r.write) return 'That statement only reads. The task needs CREATE TABLE wallets ( ... ).';
              if (r.verb !== 'CREATE') return 'Your statement starts with ' + r.verb + '. The task needs CREATE TABLE wallets ( ... ).';
              const m = /create\s+table\s+(?:if\s+not\s+exists\s+)?`?(\w+)/i.exec(r.sql || '');
              if (m && m[1].toLowerCase() !== 'wallets') return 'Your table is called ' + m[1] + '. The lab looks for a table called wallets.';
              return 'The lab could not find a table called wallets in your sandbox after your statement.';
            },
          },
          {
            label: 'It has exactly the columns id, owner, upi_id, balance_paise, opened_on',
            test: r => { const c = colsOf(r); if (!c) return false; const names = c.map(x => x[0].toLowerCase()); return names.length === WANT.length && WANT.every(n => names.includes(n)); },
            why: r => {
              const c = colsOf(r);
              if (!c || !c.length) return 'Make the table first.';
              const names = c.map(x => x[0].toLowerCase());
              const missing = WANT.filter(n => !names.includes(n)), extra = names.filter(n => !WANT.includes(n));
              return (missing.length ? 'Missing: ' + missing.join(', ') + '. ' : '') + (extra.length ? 'Not asked for: ' + extra.join(', ') + ' (check the spelling letter by letter).' : '');
            },
          },
          {
            label: 'id is a whole number and the primary key',
            test: r => { const c = col(r, 'id'); return !!c && ['int', 'bigint'].includes(c[1]) && keysOf(r).some(k => k[0] === 'PRIMARY' && k[1].toLowerCase() === 'id'); },
            why: r => {
              const c = col(r, 'id');
              if (!c) return 'There is no id column yet.';
              if (!['int', 'bigint'].includes(c[1])) return 'id is ' + typeText(c) + '. A whole number is INT (or BIGINT).';
              const pk = keysOf(r).find(k => k[0] === 'PRIMARY');
              if (pk) return 'The primary key is on ' + pk[1] + '. It should be on id.';
              return 'id has no PRIMARY KEY, so two wallets could share an id. Write PRIMARY KEY after id INT.';
            },
          },
          {
            label: 'owner is VARCHAR(60) and upi_id is VARCHAR(50)',
            test: r => { const o = col(r, 'owner'), u = col(r, 'upi_id'); return !!o && !!u && o[1] === 'varchar' && o[2] === '60' && u[1] === 'varchar' && u[2] === '50'; },
            why: r => {
              const o = col(r, 'owner'), u = col(r, 'upi_id'), bad = [];
              if (!o || !u) return 'Make both columns first.';
              if (!(o[1] === 'varchar' && o[2] === '60')) bad.push('owner is ' + typeText(o) + ', not varchar(60)');
              if (!(u[1] === 'varchar' && u[2] === '50')) bad.push('upi_id is ' + typeText(u) + ', not varchar(50)');
              return bad.join('; ') + '. Text up to N characters is VARCHAR(N).';
            },
          },
          {
            label: 'balance_paise can hold ₹50 crore exactly',
            test: r => { const c = col(r, 'balance_paise'); return !!c && c[1] === 'bigint'; },
            why: r => {
              const c = col(r, 'balance_paise');
              if (!c) return 'There is no balance_paise column yet.';
              if (c[1] === 'int' || c[1] === 'mediumint' || c[1] === 'smallint' || c[1] === 'tinyint') return 'balance_paise is ' + c[1] + '. ₹50 crore = 5,000,000,000 paise, and INT stops at 2,147,483,647, so it would not fit (ERROR 1264). Use BIGINT.';
              if (c[1] === 'float' || c[1] === 'double') return 'balance_paise is ' + c[1] + '. FLOAT and DOUBLE keep a nearby binary number, not exact money (Idea 6). Whole paise go in BIGINT.';
              if (c[1] === 'decimal') return 'balance_paise is ' + typeText(c) + '. DECIMAL is exact and fine for rupees with a point, but this column is whole paise, like payments.amount_paise. Use BIGINT.';
              return 'balance_paise is ' + typeText(c) + '. Money in whole paise is a whole number that can grow large: BIGINT.';
            },
          },
          {
            label: 'opened_on is a DATE',
            test: r => { const c = col(r, 'opened_on'); return !!c && c[1] === 'date'; },
            why: r => {
              const c = col(r, 'opened_on');
              if (!c) return 'There is no opened_on column yet.';
              if (c[1] === 'datetime' || c[1] === 'timestamp') return 'opened_on is ' + c[1] + ', which stores a time of day too. The task wants a date: DATE.';
              return 'opened_on is ' + typeText(c) + '. As text, MySQL would accept \'30-02-2026\' or \'soon\'. DATE checks it is a real date.';
            },
          },
          {
            label: 'No column may be empty (every column is NOT NULL)',
            test: r => { const c = colsOf(r); return !!c && c.length > 0 && c.every(x => x[3] === 'NO'); },
            why: r => {
              const c = colsOf(r);
              if (!c || !c.length) return 'Make the table first.';
              const open = c.filter(x => x[3] !== 'NO').map(x => x[0]);
              return 'These may still be empty: ' + open.join(', ') + '. Write NOT NULL after the type. (PRIMARY KEY already makes id NOT NULL.)';
            },
          },
          {
            label: 'No two wallets can share a upi_id',
            test: r => keysOf(r).some(k => k[1].toLowerCase() === 'upi_id' && k[2] === '0' && k[0] !== 'PRIMARY'),
            why: r => {
              if (!col(r, 'upi_id')) return 'There is no upi_id column yet.';
              if (keysOf(r).some(k => k[0] === 'PRIMARY' && k[1].toLowerCase() === 'upi_id')) return 'upi_id is the primary key here. The primary key is id; for "no two may share", upi_id needs UNIQUE.';
              return 'Nothing stops two wallets having the same upi_id. Write UNIQUE after upi_id\'s type.';
            },
          },
        ],
      },

      { t: 'sqltry', db: SB, sql: "INSERT INTO wallets (id, owner, upi_id, balance_paise, opened_on) VALUES\n  (1, 'Asha Rao',    'asha@okbank',   250000, '2026-01-12'),\n  (2, 'Vikram Shah', 'vikram@okbank', 0,      '2026-02-03');", html: '<b>Optional: use your table.</b> Add two wallets (made-up UPI ids). Then try a third wallet with <code>\'asha@okbank\'</code> again, and read which rule refuses it.' },

      { t: 'say', html: '<b>Next SQL night, lesson 4:</b> joining tables. Following <code>card_id</code> and <code>merchant_id</code> into the other tables, so one answer shows the shop\'s name next to each payment (JOIN).<br>To revise tonight, open the note <b>"Your own tables: types, keys, INSERT, UPDATE, DELETE"</b> under Notes.' },
    ],
  });
})();
