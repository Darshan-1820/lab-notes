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
);
