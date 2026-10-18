// Concept notes for the SQL track, one per lesson. Same shape as missions/notes.js: kind 'concept',
// the lesson's mission id, and order (SQL notes start at 101 so they sit after the Java notes).
// Loaded after notes-week2.js in the lab and on the phone site. The diagrams come from
// app/web/widgets-sql.js. Every query and MySQL message below was run on the lab-mysql
// container (MySQL 8.4.11, database payments_lab) before it was written here.

window.NOTES = window.NOTES || [];
window.NOTES.push(
  {
    id: 'concept-sql-map',
    kind: 'concept', lesson: 'sql1m1', order: 101,
    date: '2026-10-18',
    title: 'The map: databases, connections and your first SELECT',
    from: 'Goes with SQL lesson 1: The map: what a database is',
    html: `
<h3>The idea</h3>
<p>A <b>database</b> is a program that keeps data for many users at once, does not lose it, finds it fast, and refuses values that break its rules. A spreadsheet does none of these well:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Problem</th><th>Spreadsheet</th><th>Database</th></tr>
<tr><td>3 cashiers save at once</td><td>The last save wins: 100 + 3 payments become 101 rows, 2 lost</td><td>Every change goes to the one real copy: 103 rows</td></tr>
<tr><td>Power cut while saving</td><td>The file can be half old, half new</td><td>A payment it called "saved" survives the crash</td></tr>
<tr><td>Find one card in 1,000,000 rows</td><td>Up to 1,000,000 checks</td><td>About 20 checks with an index (2 multiplied by itself 20 times = 1,048,576)</td></tr>
<tr><td>Someone types abc as an amount</td><td>Accepted</td><td class="bad">ERROR 1366 (HY000): Incorrect integer value: 'abc' for column 'amount_paise' at row 1</td></tr>
</table></div>
<p>The lab uses <b>MySQL</b>. You ask it questions in <b>SQL</b>. <span class="later">How it does the four things (transactions, durability, indexes, types): coming in later SQL lessons</span></p>

<h3>Who talks to whom</h3>
<ul>
<li><b>Server</b>: a program that runs all the time and waits for questions. The MySQL server runs inside the Docker container <code>lab-mysql</code>.</li>
<li><b>Client</b>: a program that asks: MySQL Workbench, or the lab page through the <code>mysql</code> program.</li>
<li><b>Address</b>: <code>127.0.0.1</code>, also called <code>localhost</code>, means "this same computer".</li>
<li><b>Port</b>: a numbered door. The lab page is at 4321; the practice MySQL at 3308. MySQL's usual door is 3306.</li>
<li><b>Connection</b>: an open line between one client and the server: dial address and port, log in, ask, hang up. Each one gets a number: <code>SELECT CONNECTION_ID();</code></li>
</ul>
<div data-widget="dbmap" data-key="note-sql-map"></div>

<h3>Tables, rows, columns, keys</h3>
<ul>
<li><b>Table</b>: data in rows and columns. The columns are fixed, and each has rules.</li>
<li><b>Row</b>: one thing (one payment). <b>Column</b>: one fact about every row. <b>Cell</b>: one value.</li>
<li><b>Primary key</b>: the column whose value is different in every row (<code>id</code> here). MySQL refuses a repeat: <code class="bad">ERROR 1062 (23000): Duplicate entry '3' for key 'customers.PRIMARY'</code></li>
<li><b>Foreign key</b>: a column holding another table's id. <code>cards.customer_id = 1</code> means "belongs to customer 1". <span class="later">Following it in a query (JOIN): coming in SQL lesson 4</span></li>
</ul>
<div data-widget="sqltable" data-key="note-sql-tables" data-table="payments"></div>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Write</th><th>Meaning</th></tr>
<tr><td><code>SELECT * FROM customers;</code></td><td>Every column, every row of customers</td></tr>
<tr><td><code>SELECT name, city FROM customers;</code></td><td>Only these columns, in this order. Commas between them.</td></tr>
<tr><td><code>WHERE city = 'Pune'</code></td><td>Keep only rows where the test is yes. One <code>=</code>. Text in single quotes.</td></tr>
<tr><td><code>WHERE amount_paise &gt; 300000</code></td><td>Numbers have no quotes and no commas</td></tr>
<tr><td><code>&gt;  &lt;  &gt;=  &lt;=</code></td><td>The same signs as Java</td></tr>
<tr><td><code>&lt;&gt;</code> (or <code>!=</code>)</td><td>Not equal: <code>WHERE city &lt;&gt; 'Pune'</code> gives the 4 customers outside Pune</td></tr>
<tr><td><code>;</code></td><td>Ends one query. Workbench needs it between queries.</td></tr>
<tr><td><code>CONNECTION_ID()</code>, <code>USER()</code></td><td>Functions: a name with <code>()</code> that gives back an answer</td></tr>
</table></div>

<h3>How MySQL reads a SELECT</h3>
<p>You write SELECT first, but MySQL works in a different order: first the table, then the test, then the columns.</p>
<pre>SELECT name FROM customers WHERE city = 'Pune';

1. FROM customers        all 6 rows
2. WHERE city = 'Pune'   2 rows left (ids 1 and 4)
3. SELECT name           keep only the name column

answer: 2 rows × 1 column
        Asha Rao
        Rahul Verma</pre>
<p>This is why WHERE can test a column that SELECT does not show (city, here). Interviewers ask about this order; the full version has more steps. <span class="later">The full order (GROUP BY, HAVING, ORDER BY, LIMIT): coming in later SQL lessons</span></p>
<p>Money in the payments table is whole paise. Turn rupees into paise before you write the test:</p>
<pre>"more than ₹1,000"
1000 × 100 = 100000 paise
WHERE amount_paise > 100000</pre>
<div data-widget="wherefilter" data-key="note-sql-where" data-table="payments" data-column="amount_paise" data-op=">" data-value="100000"></div>

<h3>Handy extras</h3>
<ul>
<li>SQL words work in small letters too: <code>select name from customers</code> runs. Capitals are a habit for reading.</li>
<li>Table names must match exactly on this server: <code>Customers</code> and <code>customer</code> are both errors (see below).</li>
<li>Text comparisons ignore capitals in this database: <code>WHERE city = 'pune'</code> finds the same 2 customers as <code>'Pune'</code>. The setting that decides this is called the <b>collation</b>.</li>
<li>MySQL also accepts double quotes for text (<code>"Pune"</code>), but single quotes are the SQL standard and work in every database. Use single quotes.</li>
<li>An answer with no rows is not an error. <code>WHERE city = 'Agra'</code> returns the column name and 0 rows.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What MySQL says</th></tr>
<tr><td><code>SELECT nmae FROM customers;</code></td><td class="bad">ERROR 1054 (42S22): Unknown column 'nmae' in 'field list'</td></tr>
<tr><td><code>WHERE city = Mumbai</code> (no quotes)</td><td class="bad">ERROR 1054 (42S22): Unknown column 'Mumbai' in 'where clause'</td></tr>
<tr><td><code>SELECT name FROM customers WHERE amount_paise &gt; 100;</code> (that column is in payments)</td><td class="bad">ERROR 1054 (42S22): Unknown column 'amount_paise' in 'where clause'</td></tr>
<tr><td><code>SELECT * FROM Customers;</code></td><td class="bad">ERROR 1146 (42S02): Table 'payments_lab.Customers' doesn't exist</td></tr>
<tr><td><code>SELECT * FROM customer;</code></td><td class="bad">ERROR 1146 (42S02): Table 'payments_lab.customer' doesn't exist</td></tr>
<tr><td><code>SELECT name, FROM customers;</code> (extra comma)</td><td class="bad">ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'FROM customers' at line 1</td></tr>
<tr><td><code>WHERE city == 'Pune'</code></td><td class="bad">ERROR 1064 (42000): ... near '== 'Pune'' at line 1</td></tr>
<tr><td><code>WHERE amount_paise &gt; 100,000</code></td><td class="bad">ERROR 1064 (42000): ... near ',000' at line 1</td></tr>
<tr><td><code>SELECT name city FROM customers;</code> (missing comma)</td><td>No error. One column headed <code>city</code> that holds the names: MySQL took city as a new heading for name.</td></tr>
<tr><td><code>WHERE amount_paise &gt; 1000</code> meant as ₹1,000</td><td>No error, wrong rows: 1000 paise is only ₹10.</td></tr>
</table></div>
<p>How to read an error: <code>1054</code> is MySQL's number for the kind of mistake. <code>(42S22)</code> is the SQLSTATE, the standard 5-character code that other databases share. Then the message names what it could not find and where: <code>'field list'</code> is the columns after SELECT, <code>'where clause'</code> is the WHERE part. For 1064, look just before the text after "near".</p>

<h3>Check yourself</h3>
<details><summary>What is the difference between a server and a client? Name one of each from the lab.</summary><p>A server runs all the time and waits for questions: the MySQL server in the lab-mysql container. A client connects and asks: MySQL Workbench, or the lab page through the mysql program.</p></details>
<details><summary>Connecting to port 3309 gives <code>Can't connect to MySQL server on '127.0.0.1:3309' (10061)</code>. What is wrong?</summary><p>Nobody is listening at door 3309, so the connection is refused (10061 is Windows' "connection refused"). The practice server is at 3308. If 3308 also fails, the server is not running: start Docker Desktop and run app/sql/setup.bat.</p></details>
<details><summary><code>SELECT name FROM customers WHERE city = Mumbai;</code> What does MySQL say, and why?</summary><p><code>ERROR 1054 (42S22): Unknown column 'Mumbai' in 'where clause'</code>. Without quotes, Mumbai is read as a column name. Text needs quotes: <code>'Mumbai'</code>.</p></details>
<details><summary>Why can't two customers both have id 3?</summary><p>id is the primary key: its value must be different in every row, so "customer 3" always means one row. MySQL refuses the second one with <code>ERROR 1062 (23000): Duplicate entry '3' for key 'customers.PRIMARY'</code>.</p></details>
<details><summary>Write a query for payments of ₹500 or more, showing id and amount_paise. How many rows come back?</summary><div><pre>₹500 = 500 × 100 = 50000 paise
"or more" includes ₹500 itself, so >=

SELECT id, amount_paise FROM payments WHERE amount_paise >= 50000;</pre>8 rows: ids 3, 4, 5, 7, 8, 10, 11 and 12.</div></details>`,
  },
  {
    id: 'concept-sql-order-filter',
    kind: 'concept', lesson: 'sql1m2', order: 102,
    date: '2026-10-19',
    title: 'Choosing and sorting rows: ORDER BY, AND / OR, DISTINCT, NULL',
    from: 'Goes with SQL lesson 2: Choosing and sorting rows',
    html: `
<h3>The idea</h3>
<p>Lesson 1 asked one question of a table. Now you shape the answer: sort it, combine tests, remove repeats, keep the top few, and handle cells with no value (NULL).</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Write</th><th>Meaning</th></tr>
<tr><td><code>ORDER BY amount_paise</code></td><td>Sort smallest first (ASC is the default)</td></tr>
<tr><td><code>ORDER BY amount_paise DESC</code></td><td>Sort biggest first</td></tr>
<tr><td><code>ORDER BY amount_paise DESC, id</code></td><td>Equal amounts are sorted by id</td></tr>
<tr><td><code>LIMIT 3</code></td><td>Keep the first 3 rows of the answer</td></tr>
<tr><td><code>WHERE a AND b</code></td><td>Keep a row if both tests say yes</td></tr>
<tr><td><code>WHERE a OR b</code></td><td>Keep a row if at least one says yes</td></tr>
<tr><td><code>WHERE NOT a</code></td><td>Flip the test</td></tr>
<tr><td><code>a AND (b OR c)</code></td><td>Brackets: work out the OR first</td></tr>
<tr><td><code>SELECT DISTINCT city</code></td><td>Remove repeated rows from the answer</td></tr>
<tr><td><code>WHERE x IS NULL</code> / <code>IS NOT NULL</code></td><td>The only way to test for "no value"</td></tr>
<tr><td><code>merchant_id IN (1, 5)</code></td><td>Short for <code>merchant_id = 1 OR merchant_id = 5</code></td></tr>
</table></div>

<h3>Write it in this order</h3>
<pre>SELECT id, amount_paise
FROM payments
WHERE status = 'APPROVED'
ORDER BY amount_paise DESC
LIMIT 3;</pre>
<p>Out of order, MySQL stops: <code class="bad">ERROR 1064 (42000): ... near 'WHERE status = 'APPROVED'' at line 1</code> (WHERE after ORDER BY).</p>

<h3>MySQL works in a different order</h3>
<pre>1. FROM       take the table
2. WHERE      keep rows whose test is yes
3. SELECT     keep the named columns
4. DISTINCT   remove repeats
5. ORDER BY   sort
6. LIMIT      keep the first few

SELECT DISTINCT merchant_id FROM payments ORDER BY merchant_id DESC LIMIT 2;
3. 1, 2, 3, 4, 5, 4, 2, 5, 1, 3, 1, 5
4. 1, 2, 3, 4, 5
5. 5, 4, 3, 2, 1
6. 5, 4</pre>
<p><span class="later">GROUP BY and HAVING, between WHERE and SELECT: coming in the totals lessons</span></p>

<h3>AND before OR</h3>
<p>Like × before + in maths. Without brackets:</p>
<pre>status = 'APPROVED' AND merchant_id = 1 OR merchant_id = 5
= (status = 'APPROVED' AND merchant_id = 1) OR merchant_id = 5
→ 1, 11, 5, 8, 12      payment 5 is DECLINED but gets in

status = 'APPROVED' AND (merchant_id = 1 OR merchant_id = 5)
→ 1, 11, 8, 12</pre>

<h3>NULL: no value</h3>
<p>NULL is not 0 and not empty text. Any comparison with NULL gives "unknown", and WHERE keeps only yes:</p>
<pre>WHERE refunded_at = NULL            0 rows, no error
WHERE refunded_at IS NULL           refunds 3, 4
WHERE reason &lt;&gt; 'changed mind'      1, 4        (NULL reasons 2 and 5 drop out)
... OR reason IS NULL               1, 2, 4, 5</pre>
<div data-widget="sqltable" data-key="note-sql2-refunds" data-tables="payments,refunds" data-table="refunds"></div>

<h3>Handy extras</h3>
<ul>
<li>No ORDER BY means no promised order. <code>WHERE NOT (merchant_id = 1 OR merchant_id = 5)</code> came back as 2, 7, 3, 10, 4, 6: grouped by shop, because MySQL used its sorted list of merchant ids.</li>
<li>LIMIT without ORDER BY gives "any" few rows. For a top 3, always sort first.</li>
<li>DISTINCT works on whole rows: <code>SELECT DISTINCT city, name</code> removes nothing here.</li>
<li>In MySQL, NULLs sort first with ORDER BY and last with DESC. PostgreSQL (another free database, used later in the plan) puts them last in ascending order.</li>
<li>Read the unit in the column name before typing a number: <code>amount_paise &gt; 1000</code> means more than ₹10.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td><code>... ORDER BY id WHERE status = 'APPROVED'</code></td><td class="bad">ERROR 1064 (42000): ... near 'WHERE status = 'APPROVED'' at line 1</td></tr>
<tr><td><code>... LIMIT 3 ORDER BY amount_paise DESC</code></td><td class="bad">ERROR 1064 (42000): ... near 'ORDER BY amount_paise DESC' at line 1</td></tr>
<tr><td><code>ORDER BY amount DESC</code> (no such column)</td><td class="bad">ERROR 1054 (42S22): Unknown column 'amount' in 'order clause'</td></tr>
<tr><td><code>SELECT city DISTINCT FROM customers</code></td><td class="bad">ERROR 1064 (42000): ... near 'DISTINCT FROM customers' at line 1</td></tr>
<tr><td><code>WHERE refunded_at IS NUL</code></td><td class="bad">ERROR 1064 (42000): ... near 'NUL' at line 1</td></tr>
<tr><td><code>WHERE refunded_at = NULL</code></td><td>No error, 0 rows. Use IS NULL.</td></tr>
<tr><td><code>WHERE merchant_id = 1 OR 5</code></td><td>No error, all 12 rows: 5 on its own counts as yes.</td></tr>
<tr><td>AND and OR mixed with no brackets</td><td>No error, extra rows (payment 5 above).</td></tr>
<tr><td><code>amount_paise &gt; 1000</code> meant as ₹1,000</td><td>No error, all 12 payments: 1000 paise is ₹10.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>Which two ids come first: <code>SELECT id FROM payments ORDER BY amount_paise DESC, id DESC;</code></summary><pre>amount, biggest first: 5 and 12 tie at 1499900
tie by id DESC:        12, then 5</pre></details>
<details><summary>Why does <code>WHERE refunded_at = NULL</code> return nothing?</summary><p>Comparing with NULL gives "unknown" for every row, and WHERE keeps only rows where the test is yes. Use <code>IS NULL</code>.</p></details>
<details><summary>Which refunds does <code>WHERE reason &lt;&gt; 'overcharged'</code> return, and which are lost?</summary><pre>returned: 1 ('damaged item'), 3 ('changed mind')
lost:     2 and 5, whose reason is NULL (unknown, not "different")</pre></details>
<details><summary>Write the 2 smallest approved payments, smallest first, showing id and amount_paise.</summary><pre>SELECT id, amount_paise FROM payments
WHERE status = 'APPROVED'
ORDER BY amount_paise
LIMIT 2;

→ 1 (12000), 6 (32025)     payment 9 (9000) is DECLINED</pre></details>
<details><summary>What does <code>SELECT DISTINCT network FROM cards</code> return?</summary><p>3 rows: VISA, MASTERCARD, AMEX (from 7 cards).</p></details>`,
  },
  {
    id: 'concept-sql-tables',
    kind: 'concept', lesson: 'sql1m3', order: 103,
    date: '2026-10-19',
    title: 'Your own tables: types, keys, INSERT, UPDATE, DELETE',
    from: 'Goes with SQL lesson 3: Your own tables',
    html: `
<h3>The idea</h3>
<p>A table is made with CREATE TABLE: a name, then each column with a <b>type</b> (what values it accepts) and its <b>rules</b> (keys, NOT NULL). Then INSERT adds rows, UPDATE changes them, DELETE removes them. In the lab you do this in your own database, <code>sandbox</code>.</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Write</th><th>Meaning</th></tr>
<tr><td><code>CREATE TABLE shops ( id INT PRIMARY KEY, name VARCHAR(40) NOT NULL UNIQUE, opened_on DATE NOT NULL );</code></td><td>A new empty table. Commas between columns, none after the last.</td></tr>
<tr><td><code>DESCRIBE shops;</code></td><td>Its columns, types, Null, Key</td></tr>
<tr><td><code>INSERT INTO shops (id, name, opened_on) VALUES (1, 'Kettle and Cup', '2025-06-01'), (2, ...);</code></td><td>Add rows: one bracket per row, values in column order</td></tr>
<tr><td><code>UPDATE shops SET name = 'Kettle &amp; Cup' WHERE id = 1;</code></td><td>Change cells in the rows WHERE picks</td></tr>
<tr><td><code>DELETE FROM shops WHERE id = 4;</code></td><td>Remove the rows WHERE picks</td></tr>
<tr><td><code>DROP TABLE shops;</code></td><td>Remove the whole table. No undo.</td></tr>
</table></div>

<h3>Types</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Type</th><th>Holds</th><th>Refuses</th></tr>
<tr><td><code>INT</code></td><td>Whole numbers up to 2,147,483,647 (about ₹2.1 crore in paise)</td><td class="bad">ERROR 1264 (22003): Out of range value for column 'as_int' at row 1</td></tr>
<tr><td><code>BIGINT</code></td><td>Whole numbers up to 9,223,372,036,854,775,807. Money in paise.</td><td></td></tr>
<tr><td><code>VARCHAR(40)</code></td><td>Text up to 40 characters</td><td class="bad">ERROR 1406 (22001): Data too long for column 'name' at row 1</td></tr>
<tr><td><code>DATE</code></td><td><code>'YYYY-MM-DD'</code></td><td class="bad">ERROR 1292 (22007): Incorrect date value: '2026-02-30' for column 'opened_on' at row 1</td></tr>
<tr><td><code>DATETIME</code></td><td><code>'YYYY-MM-DD hh:mm:ss'</code></td><td></td></tr>
<tr><td><code>DECIMAL(10,2)</code></td><td>Exact decimals: 10 digits, 2 after the point (up to 99999999.99)</td><td>Extra digits are rounded: 12.345 → 12.35</td></tr>
<tr><td><code>FLOAT</code>, <code>DOUBLE</code></td><td>A nearby binary number</td><td>Never for money</td></tr>
</table></div>
<pre>₹2.1 crore check:
2,147,483,647 paise ÷ 100 = ₹2,14,74,836.47

₹50 crore in paise:
50,00,00,000 rupees × 100 = 5,000,000,000 paise   → more than INT, so BIGINT</pre>

<h3>Why money is never FLOAT</h3>
<pre>put 0.1 in a FLOAT and in a DECIMAL(10,2), then:

               FLOAT                  DECIMAL
shows          0.1                    0.10
+ 0.2          0.30000000149011613    0.30
= 0.1 ?        no (0 rows)            yes</pre>
<p>MySQL itself treats <code>0.1</code> typed in a query as an exact decimal (<code>SELECT 0.1 + 0.2</code> gives 0.3). Written <code>0.1e0</code> it is floating point: <code>0.1e0 + 0.2e0</code> gives 0.30000000000000004, the same as Java's double.</p>

<h3>Rules on columns</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Rule</th><th>Means</th><th>Broken</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>Different in every row, never empty. One per table.</td><td class="bad">ERROR 1062 (23000): Duplicate entry '1' for key 'shops.PRIMARY'</td></tr>
<tr><td><code>UNIQUE</code></td><td>Different in every row. A table can have many.</td><td class="bad">ERROR 1062 (23000): Duplicate entry 'Kettle and Cup' for key 'shops.name'</td></tr>
<tr><td><code>NOT NULL</code></td><td>Never empty</td><td class="bad">ERROR 1048 (23000): Column 'name' cannot be null</td></tr>
<tr><td>NOT NULL, left out of INSERT</td><td></td><td class="bad">ERROR 1364 (HY000): Field 'opened_on' doesn't have a default value</td></tr>
</table></div>
<p>A statement either fully happens or not at all: an INSERT of two rows where the second repeats an id adds neither.</p>

<h3>UPDATE and DELETE need WHERE</h3>
<pre>UPDATE shops SET opened_on = '2026-01-01' WHERE id = 1;   1 row changed
UPDATE shops SET opened_on = '2026-01-01';                every row changed
DELETE FROM shops WHERE id = 4;                           1 row deleted
DELETE FROM shops;                                        every row deleted, table stays
DROP TABLE shops;                                         table gone</pre>
<p>Habit: run <code>SELECT * FROM shops WHERE id = 1;</code> first, then turn SELECT * into UPDATE or DELETE. Workbench's "safe updates" refuses an UPDATE without a key in WHERE: <code class="bad">ERROR 1175 (HY000): You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column.</code> <span class="later">Undoing a mistake with a transaction (ROLLBACK): coming in a later SQL lesson</span></p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What MySQL says</th></tr>
<tr><td><code>CREATE TABLE shops (id INT);</code> when shops exists</td><td class="bad">ERROR 1050 (42S01): Table 'shops' already exists</td></tr>
<tr><td>A comma after the last column</td><td class="bad">ERROR 1064 (42000): ... near ')' at line 4</td></tr><tr><td></td><td>(the line number is where the closing bracket is; in a one-line statement it says line 1)</td></tr>
<tr><td>3 columns named, 2 values given</td><td class="bad">ERROR 1136 (21S01): Column count doesn't match value count at row 1</td></tr>
<tr><td><code>'three'</code> into an INT</td><td class="bad">ERROR 1366 (HY000): Incorrect integer value: 'three' for column 'id' at row 1</td></tr>
<tr><td><code>'30-01-2026'</code> into a DATE</td><td class="bad">ERROR 1292 (22007): Incorrect date value: '30-01-2026' for column 'opened_on' at row 1</td></tr>
<tr><td><code>SELECT * FROM shops;</code> after DROP TABLE</td><td class="bad">ERROR 1146 (42S02): Table 'sandbox.shops' doesn't exist</td></tr>
<tr><td>UPDATE or DELETE with no WHERE</td><td>No error: every row changed or gone</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>Why is payments.amount_paise BIGINT and not INT?</summary><p>INT stops at 2,147,483,647 paise, about ₹2.1 crore. Totals and big balances go past that, and INT would refuse them with error 1264.</p></details>
<details><summary>A shop table has no primary key. What goes wrong?</summary><p>Two rows can share an id (the same INSERT run twice gave ids 1, 2, 1, 2), so "shop 1" no longer means one row.</p></details>
<details><summary>shops has 4 rows. How many does <code>UPDATE shops SET opened_on = '2026-01-01';</code> change?</summary><p>All 4: without WHERE every row is chosen.</p></details>
<details><summary>Write a table cards_lite: id whole number primary key, network text up to 20 never empty, expires a date never empty.</summary><pre>CREATE TABLE cards_lite (
  id       INT PRIMARY KEY,
  network  VARCHAR(20) NOT NULL,
  expires  DATE NOT NULL
);</pre></details>
<details><summary>DELETE, TRUNCATE, DROP: what does each remove?</summary><p>DELETE removes the rows WHERE picks (all of them without WHERE). TRUNCATE removes all rows, faster, and cannot have a WHERE. DROP removes the table itself.</p></details>`,
  },
);
