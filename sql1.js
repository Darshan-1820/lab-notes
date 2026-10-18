// The SQL track, lesson 1: what a database is, how programs reach it, and the first SELECT.
// Block types are the same as week 1 (see the top of missions/week1-game.js), plus two for SQL,
// handled in app/web/index.html:
//
//   sqltry   a query box with a Run button. Fields: html, sql (the starting text), experiment
//            (true = drawn as a "break it" experiment), after (html shown once it has been run).
//   sqltask  the thing to build: his own query, run on the practice database and checked.
//            Fields: html, start (starting text, usually empty), xp, hints, checks.
//            Checks see r = { ok, columns, rows, count, error, errno, message, blocked, setup, sql }:
//            rows are arrays of strings (null for NULL), exactly as MySQL sent them. why: r => '...'
//            explains a failure in a sentence or two. Compare rows in any order unless the task
//            asks for ORDER BY.
//   predict  may carry ask: '...' to replace "What does this print?" (an SQL answer is a table).
//
// Queries go through POST /api/sql (app/Server.java) to the Docker container lab-mysql
// (app/sql/setup.bat), database payments_lab (app/sql/seed.sql, made-up data), as a read-only
// user. Every query is logged in activity.jsonl as {type:'sql', mission, query, ok, error, rows}.
//
// This "week" is a separate track: independent: true means it is not chained after the Java
// weeks, so it can be opened on an SQL night whatever Java lesson he is on (DECISIONS 44).
// Every MySQL message quoted below was produced by the lab-mysql container (MySQL 8.4.11),
// and the expected rows were produced by running a reference query there.

(function () {
  // ---- helpers for checks (shared with later SQL lessons through window.SQLCHECK) ----
  function rupees(paise) {
    const r = String(Math.floor(paise / 100)), p = paise % 100;
    let digits = r, out = '';
    if (digits.length > 3) {
      out = ',' + digits.slice(-3); digits = digits.slice(0, -3);
      while (digits.length > 2) { out = ',' + digits.slice(-2) + out; digits = digits.slice(0, -2); }
    }
    return '₹' + digits + out + '.' + String(p).padStart(2, '0');
  }
  const cols = r => r.columns.map(c => c.toLowerCase());
  // The values of one column, by name, or null when the answer has no such column.
  const column = (r, name) => { const k = cols(r).indexOf(name); return k < 0 ? null : r.rows.map(row => row[k]); };

  // One or two sentences about an error, in plain words, for the first check's "why".
  function errorWhy(r, table, tableColumns) {
    if (r.blocked || r.setup || !r.errno) return r.error;
    if (r.errno === 1054) {
      const m = /Unknown column '(.+?)' in '(.+?)'/.exec(r.message || '') || [];
      if (m[2] === 'where clause') return 'MySQL looked for a column called ' + m[1] + ' in the WHERE part and found none. A number needs no quotes, but text needs \'quotes\'. If it is meant to be a column, the columns of ' + table + ' are: ' + tableColumns.join(', ') + '.';
      return 'There is no column called ' + m[1] + ' in ' + table + '. Its columns are: ' + tableColumns.join(', ') + '. Compare the spelling letter by letter.';
    }
    if (r.errno === 1146) return 'There is no table with that name. The table is called ' + table + ', in small letters.';
    if (r.errno === 1064) return 'MySQL could not read the query. The mistake is just before the text quoted after "near": often a missing comma between two columns, an extra comma before FROM, or == where SQL wants one =.';
    return r.error;
  }

  window.SQLCHECK = { rupees, cols, column, errorWhy };

  // ---- the task: payments of more than Rs 1,000 ----
  // Reference rows (from the reference query, kept out of this repo), as id: [merchant_id, amount_paise].
  const PAYMENT_COLUMNS = ['id', 'card_id', 'merchant_id', 'amount_paise', 'status', 'created_at'];
  const AMOUNTS = { 1: 12000, 2: 45000, 3: 250000, 4: 87550, 5: 1499900, 6: 32025, 7: 100000, 8: 349900, 9: 9000, 10: 150050, 11: 99999, 12: 1499900 };
  const WANT_IDS = [3, 5, 8, 10, 12];
  const WANT_COLUMNS = ['id', 'merchant_id', 'amount_paise'];
  const idsIn = r => { const v = column(r, 'id'); return v ? v.map(Number) : null; };
  const describe = id => 'payment ' + id + ' (' + AMOUNTS[id] + ' paise = ' + rupees(AMOUNTS[id]) + ')';
  // Two column names with only a space between them, before FROM: "SELECT id merchant_id, ...".
  // MySQL then takes the second word as a new heading for the first column (it is not an error).
  function missingComma(r) {
    const list = /select\s+([\s\S]*?)\s+from\s/i.exec(r.sql || '');
    if (!list) return null;
    const m = /\b(\w+)\s+(?!as\b)(\w+)\b/i.exec(list[1]);
    return m && PAYMENT_COLUMNS.includes(m[1].toLowerCase()) ? m : null;
  }
  const noIdColumn = 'Fix the columns first: the answer needs its id column, so the lab can tell which payments are in it.';

  const S1 = {
    id: 'sql-track',
    title: 'SQL: Databases from zero',
    blurb: 'A separate track for the SQL evenings. It does not wait for the Java lessons. Your queries run on a practice database on this computer, full of made-up payments.',
    independent: true,
    missions: [
      {
        id: 'sql1m1',
        title: 'The map: what a database is',
        skill: 'Tables, keys, server and port, SELECT and WHERE',
        blocks: [
          { t: 'say', html: '<b>SQL night 1.</b> Tonight you meet the database: what it is, how a program talks to it, and your first questions to one. It runs on your own computer and holds made-up payments, so nothing you do here can hurt anything real.<div class="muted" style="margin-top:8px">If a Run box below says the practice database is not set up or is stopped: start Docker Desktop, double-click <code>app/sql/setup.bat</code> in the lab folder, wait for the line that starts with <code>Ready.</code>, then press Run again.</div>' },

          { t: 'say', html: `A small shop could keep its card payments in a spreadsheet:
<div class="sq-wrap"><table class="sq static"><tr><th>Date</th><th>Card</th><th>Shop</th><th>Amount</th></tr><tr><td>1 Oct</td><td>Visa ...1111</td><td>Kettle and Cup</td><td>120.00</td></tr><tr><td>1 Oct</td><td>Mastercard ...4444</td><td>Page Turner Books</td><td>450.00</td></tr><tr><td>2 Oct</td><td>Visa ...1881</td><td>Fuel Stop 24</td><td>2500.00</td></tr></table></div>
For 20 payments a day, that works. Now the shop grows: three tills, an owner checking from her phone, 1,000 payments a day. Four things start to go wrong. Here is the first.<br><br><b>1. Many people at once.</b> Each cashier opens the file, adds a payment, and saves. Saving writes that cashier's whole copy over the file.` },
          {
            t: 'predict', xp: 10, answer: '101',
            ask: 'The file has 100 rows. Read the timeline. How many rows does the file have at 6:00:13? Type a number.',
            code: '6:00:00  the file has 100 rows\n6:00:01  cashier A opens it (sees 100 rows)\n6:00:02  cashier B opens it (sees 100 rows)\n6:00:03  cashier C opens it (sees 100 rows)\n6:00:10  A adds 1 row and saves\n6:00:11  B adds 1 row and saves\n6:00:12  C adds 1 row and saves',
          },
          { t: 'say', html: `Each save replaces the file with that cashier's copy:
<pre>A's copy: 100 + 1 = 101 rows
B's copy: 100 + 1 = 101 rows   (no row from A)
C's copy: 100 + 1 = 101 rows   (no row from A or B)
C saved last, so the file = C's copy = 101 rows

rows that should be there: 100 + 3 = 103
rows lost:                 103 - 101 = 2</pre>
Two real payments are gone, and nobody saw an error. A <b>database</b> works differently: it is one program that every cashier sends their change to, and it applies each change to the one real copy. All three rows arrive: 103. <span class="later">How it stops two changes from clashing (transactions and locks): coming in a later SQL lesson</span>` },

          { t: 'say', html: `<b>2. Never lose data.</b> The power goes off while the file is being saved. Part of the file is new, part is old, and it may not open at all. A database writes in a careful order, so once it says "saved", the payment survives a crash. <span class="later">How it does that (durability): coming in a later SQL lesson</span>
<br><br><b>3. Find things fast.</b> After three years the shop has 10 lakh payments (1,000,000). To find one card's payments, a spreadsheet checks every row. A database can keep a sorted list on the side and jump into it by halving, like guessing a number from 1 to 1,000,000 with "higher or lower":
<pre>one row at a time:   up to 1,000,000 checks
halving each time:   2 × 2 × 2 ... 20 times = 1,048,576
                     1,048,576 is more than 1,000,000
                     so about 20 checks</pre>
That sorted list is called an <b>index</b>. <span class="later">Indexes: coming in a later SQL lesson</span>` },
          { t: 'say', html: `<b>4. Rules.</b> In a spreadsheet anyone can type <code>abc</code> into the Amount column. A database checks every value against the rules of its column and refuses what breaks them. This is the real answer of the practice database when someone tries to store <code>'abc'</code> as an amount:
<pre class="err">ERROR 1366 (HY000): Incorrect integer value: 'abc' for column 'amount_paise' at row 1</pre>
The rule here is "whole numbers only". That rule is the column's <b>type</b>. <span class="later">Types: coming in SQL lesson 3</span>
<br><br>So a <b>database</b> is a program that keeps data for many users at once, does not lose it, finds it fast and enforces rules. The one you will use is <b>MySQL</b>, one of the most used databases in the world, and free. You ask it questions in a language called <b>SQL</b> (say "S-Q-L" or "sequel").` },

          { t: 'say', html: `Inside the database, the data sits in <b>tables</b>. A table looks like a sheet, with one difference: its columns are fixed, and each column has rules.
<ul><li>A <b>row</b> is one thing: one customer, one payment.</li><li>A <b>column</b> is one fact about every row: every customer's city.</li><li>A <b>cell</b> is where one row meets one column: one value.</li></ul>
The practice database has four tables. Tap around, and open each tab:
<div data-widget="sqltable" data-key="sql1-tables" data-table="customers"></div>` },
          { t: 'say', html: `Two customers could both be called Rahul Verma. So each table has one column whose value is different in every row, and the database refuses a repeat. That column is the <b>primary key</b>. Here it is <code>id</code> in every table (marked KEY), so "customer 4" means exactly one row. In the picture above, on the customers tab, press <b>Add a customer with id 3</b> to see MySQL refuse a repeat.
<br><br>Some columns hold the id of a row in another table. In <code>cards</code>, a <code>customer_id</code> of 1 means "this card belongs to customer 1, Asha Rao". That is how tables point at each other. Such a column is called a <b>foreign key</b>. <span class="later">Following these links in a query (JOIN): coming in SQL lesson 4</span>
<br><br>Amounts are whole paise, like your Till in week 2:
<pre>amount_paise = 250000
250000 ÷ 100 = 2500 rupees
             = ₹2,500.00</pre>` },
          {
            t: 'predict', xp: 10, answer: '2',
            ask: 'Open the cards tab in the picture above. How many cards does customer 1 (Asha Rao) have? Type a number.',
            code: 'cards table → customer_id column → count the rows with 1',
          },

          { t: 'say', html: `<b>How does a program reach the database?</b> Four words, each with a plain meaning:
<ul>
<li><b>Server</b>: a program that runs all the time and waits for questions. The MySQL server is one. On your computer it runs inside Docker (tap the server box below).</li>
<li><b>Client</b>: a program that asks. MySQL Workbench is a client. The lab page is one too, through a small program called <code>mysql</code>.</li>
<li><b>Port</b>: a numbered door on a computer. One computer runs many servers, and each listens at its own door. The lab page is at door 4321; the practice MySQL at door 3308.</li>
<li><b>Connection</b>: an open line between one client and the server, like a phone call. Dial the address and the door, give a user name and password, ask your questions, hang up.</li>
</ul>
<div data-widget="dbmap" data-key="sql1-map"></div>` },
          {
            t: 'sqltry', sql: 'SELECT CONNECTION_ID(), USER();',
            html: 'The server gives every connection a number. This query asks for it, and for the user name this connection logged in with. <code>CONNECTION_ID()</code> and <code>USER()</code> are <b>functions</b>: a name followed by <code>()</code> that gives back an answer, like <code>dice.nextInt(6)</code> in Java. Press Run, then press Run again.',
            after: 'Did the number go up on the second Run? The lab opens a new connection for every Run and hangs up after the answer. Workbench keeps one connection open, so there the number stays the same until you reconnect. <code>lab_app@localhost</code> is the lab\'s own user name; <code>localhost</code> means it connected from the same computer the server runs on.',
          },

          { t: 'say', html: `Now the language. One request to the database is a <b>query</b>. Its first word says what you want, and <code>SELECT</code> means "show me".
<pre>SELECT * FROM customers;</pre>
<ul><li><code>SELECT</code>: show me</li><li><code>*</code>: every column</li><li><code>FROM customers</code>: from the table called customers</li><li><code>;</code>: the end of this query. The lab works without it; Workbench uses it to tell one query from the next.</li></ul>
Capitals: <code>select</code> works the same as <code>SELECT</code>. Writing the SQL words in capitals is a habit that makes them easy to spot. Table names are different: on this server <code>Customers</code> is not <code>customers</code>.` },
          {
            t: 'sqltry', sql: 'SELECT * FROM customers;',
            html: 'Your first query. Run it.',
            after: 'The answer is itself a small table: 6 rows, 4 columns. It is called a <b>result set</b>. The rows came back in id order here, but MySQL does not promise any order unless you ask for one. <span class="later">ORDER BY: coming in SQL lesson 2</span>',
          },
          {
            t: 'predict', xp: 10, answer: '6',
            ask: 'How many rows come back? Type a number.',
            code: 'SELECT city FROM customers;',
          },
          { t: 'say', html: `Six: one row out for every row in, even though Pune and Mumbai each appear twice. A SELECT with no test gives back every row. <span class="later">Removing repeats (DISTINCT): coming in SQL lesson 2</span>
<br><br>To choose columns, list them with commas between them. The order you write them is the order they come back in.` },
          { t: 'sqltry', sql: 'SELECT name, city FROM customers;', html: 'Run it. Then swap the two column names, run again, and compare.' },

          { t: 'say', html: `<b>WHERE keeps only the rows that pass a test.</b> MySQL goes through the rows one at a time, asks the test, and keeps the rows where the answer is yes. Then it shows the columns listed after SELECT.
<pre>SELECT name FROM customers WHERE city = 'Pune';

row 1   'Pune'    = 'Pune'   yes, keep   (Asha Rao)
row 2   'Mumbai'  = 'Pune'   no
row 3   'Chennai' = 'Pune'   no
row 4   'Pune'    = 'Pune'   yes, keep   (Rahul Verma)
row 5   'Delhi'   = 'Pune'   no
row 6   'Mumbai'  = 'Pune'   no

answer: Asha Rao, Rahul Verma</pre>
Three rules:
<ul><li>Equals is <b>one</b> <code>=</code> in SQL. Java uses <code>==</code>.</li><li>Text goes in single quotes: <code>'Pune'</code>. Numbers have no quotes: <code>amount_paise &gt; 50000</code>.</li><li>The other signs are the ones you know from Java: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code>. "Not equal" is <code>&lt;&gt;</code> (MySQL also accepts <code>!=</code>).</li></ul>
Change the column, the sign and the value, and watch every row get its yes or no:
<div data-widget="wherefilter" data-key="sql1-where" data-table="customers" data-column="city" data-op="=" data-value="Pune"></div>` },
          {
            t: 'predict', xp: 10, answer: 'Vikram Shah\nArjun Nair',
            ask: 'Which names come back? One name per line, in id order.',
            code: "SELECT name FROM customers WHERE city = 'Mumbai';",
          },
          { t: 'say', html: `Numbers work the same way, without quotes. Amounts are in paise, so turn rupees into paise first. For "more than ₹3,000":
<pre>₹3,000 = 3000 rupees
3000 × 100 = 300000 paise
WHERE amount_paise > 300000</pre>` },
          {
            t: 'predict', xp: 10, answer: '5\n8\n12',
            ask: 'Which ids come back? One per line, smallest first. The payments tab in the table picture above has the rows.',
            code: 'SELECT id FROM payments WHERE amount_paise > 300000;',
          },
          { t: 'sqltry', sql: 'SELECT id, amount_paise, status FROM payments WHERE amount_paise > 300000;', html: 'Check your prediction. Then change 300000 to other amounts and run again. Payment 5 was DECLINED by the bank, but it is still a row in the table, so WHERE treats it like any other.' },

          {
            t: 'sqltry', experiment: true, sql: 'SELECT nmae FROM customers;',
            html: '<b>Break it on purpose.</b> This query has a typo. Run it, and read what MySQL says.',
            after: `Read the message piece by piece:
<ul><li><code>ERROR</code>: the query failed, and no rows came back.</li><li><code>1054</code>: MySQL's number for this kind of mistake. Searching for "MySQL error 1054" finds it.</li><li><code>(42S22)</code>: the <b>SQLSTATE</b>, a 5-character code from the SQL standard. Other databases use the same code for the same problem.</li><li><code>Unknown column 'nmae'</code>: what it could not find, spelled exactly as you typed it.</li><li><code>in 'field list'</code>: where. The field list is the list of columns after SELECT ("field" is an older word for column).</li></ul>Fix the spelling and run it again.`,
          },
          {
            t: 'sqltry', experiment: true, sql: 'SELECT name FROM customers WHERE city = Pune;',
            html: 'Same error number, different cause. The quotes are missing. Before you press Run, guess what MySQL will say.',
            after: 'Without quotes, MySQL reads <code>Pune</code> as the name of a column. There is no column called Pune, so it says <code>Unknown column \'Pune\' in \'where clause\'</code>: the same 1054, found in the WHERE part this time (a <b>clause</b> is one part of a query: the SELECT clause, the FROM clause, the WHERE clause). Put the quotes back, <code>\'Pune\'</code>, and run again.',
          },
          {
            t: 'deeper', title: 'what happens when you press Run',
            html: `<ol>
<li>The page sends your query to the lab app (Server.java) at localhost, port 4321.</li>
<li>The lab app checks that it is one query that only reads (SELECT, SHOW, DESCRIBE or EXPLAIN). Anything else is not sent.</li>
<li>It starts the <code>mysql</code> program inside the Docker container and hands it the query. That program connects to the server, logs in as <code>lab_app</code> (a user that may only read <code>payments_lab</code>), and sends the query.</li>
<li>The server reads the words and checks the grammar (this is called <b>parsing</b>), checks that the table and the columns exist, plans how to read the rows, reads them, applies WHERE, keeps the columns from SELECT, and sends the rows back.</li>
<li>The mysql program hangs up. The lab app turns the rows into the table you see and writes one line in <code>activity.jsonl</code>: the query, whether it worked, the error, the number of rows.</li>
</ol>
Two safety nets: the server stops any query after 5 seconds (with <code>ERROR 3024 (HY000): Query execution was interrupted, maximum statement execution time exceeded</code>), and the lab stops waiting after 10.
<br><br><b>Your tutor sees Workbench too.</b> MySQL can remember the recent queries it ran, in a part of the server called <code>performance_schema</code>. It is switched on in the practice server, so a query you run in Workbench (user <code>learner</code>) can be read back, with its error number. Like the lab log, it is how your mistakes turn into your next lesson.`,
          },

          {
            t: 'sqltask', xp: 50, start: '',
            html: `The shop owner asks: <b>which payments were more than ₹1,000?</b> Write one query that shows exactly these three columns, in this order:
<pre>id | merchant_id | amount_paise</pre>
and only the payments of more than ₹1,000. Turn the rupees into paise first, as above. The lab runs your query, then checks the columns and every row. The order of the rows does not matter.`,
            hints: [
              'Start from the query two boxes up: SELECT id, amount_paise, status FROM payments WHERE amount_paise > 300000; Two parts of it change.',
              'The columns after SELECT become id, merchant_id, amount_paise. The number: ₹1,000 is 1000 rupees, and each rupee is 100 paise.',
              'SELECT id, merchant_id, amount_paise FROM payments WHERE amount_paise > ______;  Fill in the paise.',
            ],
            checks: [
              { label: 'The query runs without an error', test: r => r.ok, why: r => errorWhy(r, 'payments', PAYMENT_COLUMNS) },
              {
                label: 'The answer has exactly the columns id, merchant_id, amount_paise, in that order',
                test: r => r.ok && cols(r).join(',') === WANT_COLUMNS.join(','),
                why: r => {
                  if (!r.ok) return 'Fix the error first.';
                  const got = cols(r), comma = missingComma(r);
                  if (comma) return 'There is no comma between ' + comma[1] + ' and ' + comma[2] + '. Without it, MySQL takes ' + comma[2] + ' as a new heading for the column ' + comma[1] + ', so your answer shows the ' + comma[1] + ' values under the name ' + comma[2] + '. Put a comma between every two columns.';
                  if (got.join(',') === PAYMENT_COLUMNS.join(',')) return 'SELECT * gives every column. Name the three columns instead, with commas between them.';
                  const stranger = got.find(c => !PAYMENT_COLUMNS.includes(c));
                  if (stranger) return 'Your answer has a column called "' + stranger + '", which payments does not have. A missing comma does this: SELECT id merchant_id shows the id values under the name merchant_id.';
                  if (got.length === 3 && WANT_COLUMNS.every(c => got.includes(c))) return 'The right columns, in a different order (' + got.join(', ') + '). The order after SELECT is the order shown.';
                  return 'Your answer has the columns: ' + got.join(', ') + '. It should have: ' + WANT_COLUMNS.join(', ') + '.';
                },
              },
              {
                label: 'Every payment of more than ₹1,000 is in the answer',
                test: r => { const ids = r.ok && idsIn(r); return !!ids && WANT_IDS.every(id => ids.includes(id)); },
                why: r => {
                  if (!r.ok) return 'Fix the error first.';
                  const ids = idsIn(r);
                  if (!ids) return noIdColumn;
                  if (!ids.length) return 'The answer has no rows at all, so the test in WHERE says no to every payment. Work out ₹1,000 in paise again.';
                  return 'Missing: ' + WANT_IDS.filter(id => !ids.includes(id)).map(describe).join(', ') + '. Each of these is more than ₹1,000. Check the number in your WHERE.';
                },
              },
              {
                label: 'No payment of ₹1,000 or less is in the answer',
                test: r => { const ids = r.ok && idsIn(r); return !!ids && ids.every(id => WANT_IDS.includes(id)); },
                why: r => {
                  if (!r.ok) return 'Fix the error first.';
                  const ids = idsIn(r);
                  if (!ids) return noIdColumn;
                  const extra = ids.filter(id => !WANT_IDS.includes(id));
                  if (!/\bwhere\b/i.test(r.sql || '')) return 'Your query has no WHERE, so every payment comes back. Add WHERE with a test on amount_paise.';
                  if (extra.length === 1 && extra[0] === 7) return 'Payment 7 is exactly 100000 paise = ₹1,000.00. "More than ₹1,000" leaves out exactly ₹1,000. > means "more than"; >= means "more than or equal to".';
                  const small = extra.filter(id => AMOUNTS[id] < 100000);
                  if (small.length) return 'Extra: ' + small.map(describe).join(', ') + (small.length === 1 ? '. That is' : '. These are') + ' less than ₹1,000, so the number in your WHERE is too small. In paise, ₹1,000 is 1000 × 100.';
                  return 'Extra: ' + extra.map(describe).join(', ') + '. These are not more than ₹1,000.';
                },
              },
            ],
          },

          { t: 'say', html: `<b>Optional: the same in MySQL Workbench.</b>
<ol><li>In VS Code open <code>app/sql/lab-mysql.env</code> and copy the text after <code>LAB_LEARNER_PASSWORD=</code>. This file stays on your computer and is never committed.</li>
<li>In Workbench, press the <b>+</b> next to "MySQL Connections". Connection name: <code>lab practice</code>. Hostname: <code>127.0.0.1</code>. Port: <code>3308</code>. Username: <code>learner</code>. Press "Store in Vault ..." and paste the password. Press OK.</li>
<li>Open the connection, type <code>SELECT * FROM payments_lab.payments;</code> and press the lightning button to run it.</li></ol>
<code>payments_lab.payments</code> means "the table payments, in the database payments_lab". The lab already knows which database to use; Workbench needs to be told. (Double-clicking <code>payments_lab</code> in Workbench's list on the left also tells it, and then plain <code>payments</code> works.)
<br><br><b>Next SQL night, lesson 2:</b> choosing the order of the rows, two tests at once (AND, OR) and removing repeats. To revise tonight's lesson later, open the note <b>"The map: databases, connections and your first SELECT"</b> under Notes.` },
        ],
      },
    ],
  };

  if (!window.WEEKS) window.WEEKS = window.WEEK ? [window.WEEK] : [];
  window.WEEKS.push(S1);
})();
