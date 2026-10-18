// The SQL track, lesson 2: choosing and sorting rows. ORDER BY (and ties), LIMIT, the order the
// parts are written in, AND / OR / NOT with brackets, DISTINCT, NULL (IS NULL, the <> trap), and the
// habit of checking a column's unit before typing a number.
//
// Block types: see the top of missions/sql1.js. Every predict here has a why (shown when he is wrong).
// Every result and MySQL message quoted below was produced by the lab-mysql container (MySQL 8.4.11),
// database payments_lab (app/sql/seed.sql). The refunds table was added to the seed for this lesson;
// lesson 1's four tables are unchanged.
//
// This file adds its lesson to the SQL week made in missions/sql1.js, so it must load after it.

(function () {
  const W = (window.WEEKS || []).find(w => w.id === 'sql-track');
  if (!W) return;
  const { rupees, cols, column, errorWhy } = window.SQLCHECK;

  // ---- the task: approved payments of more than Rs 500 at merchant 1 or 5, biggest first ----
  // Reference rows (from the reference query, kept out of this repo), as id: [merchant_id, amount_paise, status].
  const PAYMENT_COLUMNS = ['id', 'card_id', 'merchant_id', 'amount_paise', 'status', 'created_at'];
  const P = {
    1: [1, 12000, 'APPROVED'], 2: [2, 45000, 'APPROVED'], 3: [3, 250000, 'APPROVED'], 4: [4, 87550, 'APPROVED'],
    5: [5, 1499900, 'DECLINED'], 6: [4, 32025, 'APPROVED'], 7: [2, 100000, 'APPROVED'], 8: [5, 349900, 'APPROVED'],
    9: [1, 9000, 'DECLINED'], 10: [3, 150050, 'APPROVED'], 11: [1, 99999, 'APPROVED'], 12: [5, 1499900, 'APPROVED'],
  };
  const WANT = [12, 8, 11];   // in this order: biggest first
  const WANT_COLUMNS = ['id', 'merchant_id', 'amount_paise'];
  const idsIn = r => { const v = column(r, 'id'); return v ? v.map(Number) : null; };
  const describe = id => 'payment ' + id + ' (merchant ' + P[id][0] + ', ' + P[id][1] + ' paise = ' + rupees(P[id][1]) + ', ' + P[id][2] + ')';
  const needIds = 'Fix the columns first: the answer needs its id column, so the lab can tell which payments are in it.';
  // Error 1064 because the parts are out of order (Idea 5): say which part must move.
  function partsOrderWhy(r) {
    if (r.errno !== 1064) return '';
    const q = (r.sql || '').toLowerCase();
    const where = q.search(/\bwhere\b/), order = q.search(/\border\s+by\b/), limit = q.search(/\blimit\b/);
    if (where >= 0 && order >= 0 && order < where) return 'WHERE comes after ORDER BY in your query. The parts go in this order: SELECT, FROM, WHERE, ORDER BY. Move the whole WHERE part before ORDER BY.';
    if (limit >= 0 && order >= 0 && limit < order) return 'LIMIT comes before ORDER BY in your query. LIMIT is always the last part.';
    return '';
  }
  const mixesAndOr = sql => /\band\b/i.test(sql) && /\bor\b/i.test(sql) && !/\(/.test(sql.replace(/^\s*select[\s\S]*?\bfrom\b/i, ''));

  W.missions.push({
    id: 'sql1m2',
    title: 'Choosing and sorting rows',
    skill: 'ORDER BY, LIMIT, AND / OR / NOT, DISTINCT, NULL',
    blocks: [
      { t: 'say', html: '<b>SQL night 2.</b> Tonight: sort rows, ask two questions at once, remove repeats, take the top few, and meet NULL, the empty cell.<br>First, two questions from lesson 1, from memory. No scrolling back.' },
      {
        t: 'predict', xp: 10, answer: 'Asha Rao\nRahul Verma',
        ask: 'From memory: which names come back? One per line, in id order.',
        code: "SELECT name FROM customers WHERE city = 'Pune';",
        why: 'WHERE goes through the 6 customers and keeps the ones whose city is Pune:<pre>id 1  Asha Rao     Pune     keep\nid 2  Vikram Shah  Mumbai\nid 3  Meera Iyer   Chennai\nid 4  Rahul Verma  Pune     keep\nid 5  Sara Khan    Delhi\nid 6  Arjun Nair   Mumbai</pre>The table picture in lesson 1 has every customer.',
      },
      {
        t: 'predict', xp: 10, answer: '25000',
        ask: 'Fill the gap so the query finds payments of ₹250 or more. Type the number only.',
        code: 'SELECT id FROM payments WHERE amount_paise >= ______;',
        why: '<pre>₹250 = 250 rupees\n250 × 100 = 25000 paise</pre>The usual slip is typing 250. That is 250 paise, which is only ₹2.50.',
      },

      { t: 'say', html: '<b>Idea 1: read the unit before you type a number.</b><br>In lesson 1 your first try was <code>&gt; 1000</code> for ₹1,000. In paise, that asks for more than ₹10.<br>The column\'s name tells you the unit: <code>amount_<b>paise</b></code>. Convert first, then type.<pre>₹1,000 = 1000 × 100 = 100000 paise   ✓\n1000 paise = 1000 ÷ 100 = ₹10        ✗</pre>' },
      {
        t: 'sqltry', experiment: true, sql: 'SELECT id, amount_paise FROM payments WHERE amount_paise > 1000;',
        html: '<b>The slip, on purpose.</b> Run it. Then change 1000 to 100000 and run again.',
        after: 'With 1000: all 12 payments, because every payment is more than ₹10. With 100000: 5 payments. Neither run gave an error. MySQL cannot know what you meant, so only your unit check catches this.',
      },

      { t: 'say', html: '<b>Idea 2: ORDER BY sorts the answer.</b><br>Without it, MySQL hands back rows in whatever order is quickest for it, and promises nothing.<br><code>ORDER BY amount_paise</code> sorts smallest first. Add <code>DESC</code> (descending) for biggest first.<pre>SELECT id, amount_paise FROM payments ORDER BY amount_paise;\n\nid  amount_paise\n 9          9000      smallest\n 1         12000\n 6         32025\n...\n 5       1499900\n12       1499900      biggest</pre>' },
      { t: 'sqltry', sql: 'SELECT id, amount_paise FROM payments ORDER BY amount_paise;', html: 'Run it. Then type <code>DESC</code> after <code>amount_paise</code> and run again.' },
      {
        t: 'predict', xp: 10, answer: 'Arjun Nair',
        ask: 'Text sorts like a dictionary. Which name comes first?',
        code: 'SELECT name FROM customers ORDER BY name;',
        why: 'Compare letter by letter, like a dictionary:<pre>Asha Rao, Vikram Shah, Meera Iyer, Rahul Verma, Sara Khan, Arjun Nair\n\nfirst letters:   A, V, M, R, S, A   → the two A names come first\nsecond letters:  As-ha, Ar-jun      → r comes before s\nfirst:           Arjun Nair</pre>The usual slip is Asha Rao, because she is customer 1. ORDER BY name looks only at the names.',
      },

      { t: 'say', html: '<b>Idea 3: ties.</b><br>Payments 5 and 12 are both 1499900 paise, so <code>ORDER BY amount_paise DESC</code> may put either one first.<br>Add a second column to break the tie: rows with the same amount are then sorted by it.<pre>ORDER BY amount_paise DESC, id\n\n1. sort by amount, biggest first\n2. same amount? sort those by id, smallest first\n\n→ 5 (1499900), 12 (1499900), 8 (349900), 3 (250000) ...</pre>' },
      {
        t: 'predict', xp: 10, answer: '12\n5',
        ask: 'Which two ids come first? One per line.',
        code: 'SELECT id FROM payments ORDER BY amount_paise DESC, id DESC;',
        why: '<pre>1. amount, biggest first:   5 and 12 tie at 1499900\n2. the tie, by id DESC:     biggest id first → 12, then 5</pre>The usual slip is 5, 12: that is <code>id</code> without DESC. Each column in ORDER BY gets its own DESC.',
      },

      { t: 'say', html: '<b>Idea 4: LIMIT keeps the first few rows.</b><br><code>LIMIT 3</code> cuts the answer after 3 rows.<br>After ORDER BY that is a top 3. Without ORDER BY it is any 3 rows.<pre>SELECT id, amount_paise FROM payments\nORDER BY amount_paise DESC, id LIMIT 3;\n\nid  amount_paise\n 5       1499900\n12       1499900\n 8        349900</pre>' },
      { t: 'sqltry', sql: 'SELECT id, amount_paise FROM payments ORDER BY amount_paise DESC, id LIMIT 3;', html: 'Run it. Then delete <code>DESC</code> to get the 3 smallest instead.' },
      {
        t: 'predict', xp: 10, answer: '9\n1',
        ask: 'Which ids come back? One per line, in the order MySQL shows them.',
        code: 'SELECT id FROM payments ORDER BY amount_paise LIMIT 2;',
        why: '<pre>1. ORDER BY amount_paise (smallest first):\n   9 (9000), 1 (12000), 6 (32025), ...\n2. LIMIT 2: keep the first 2 → 9, 1</pre>The usual slip is 1, 2: the first two ids. LIMIT cuts after the sort.',
      },

      { t: 'say', html: '<b>Idea 5: the parts go in a fixed order.</b><br>Write them as SELECT, FROM, WHERE, ORDER BY, LIMIT. Leave out any you don\'t need.<br>Out of order, MySQL stops with error 1064.<pre>SELECT id, amount_paise\nFROM payments\nWHERE status = \'APPROVED\'\nORDER BY amount_paise DESC\nLIMIT 3;</pre>' },
      {
        t: 'sqltry', experiment: true, sql: "SELECT id FROM payments ORDER BY id WHERE status = 'APPROVED';",
        html: '<b>Break it.</b> WHERE is after ORDER BY here. Guess what MySQL says, then run it.',
        after: 'MySQL read up to <code>ORDER BY id</code>, met <code>WHERE</code> and could not go on. The text after <code>near</code> is where it got stuck. Move <code>WHERE status = \'APPROVED\'</code> before <code>ORDER BY id</code> and run again: 10 rows.',
      },

      { t: 'say', html: '<b>Idea 6: AND joins two tests.</b><br>A row is kept only if <b>both</b> tests say yes. One no is enough to leave it out.<pre>WHERE status = \'APPROVED\' AND amount_paise > 100000\n\nid 3   APPROVED yes   250000 > 100000 yes    keep\nid 5   DECLINED no    1499900 > 100000 yes   out\nid 7   APPROVED yes   100000 > 100000 no     out\n...\nanswer: 3, 8, 10, 12</pre>' },
      {
        t: 'predict', xp: 10, answer: '8\n12',
        ask: 'Which ids come back? One per line, smallest first. (The payments tab of the table picture in lesson 1 has every row, or run SELECT * FROM payments in any box.)',
        code: "SELECT id FROM payments WHERE merchant_id = 5 AND status = 'APPROVED';",
        why: 'Merchant 5 has three payments:<pre>id 5    DECLINED   out (merchant yes, status no)\nid 8    APPROVED   keep\nid 12   APPROVED   keep</pre>',
      },

      { t: 'say', html: '<b>Idea 7: OR keeps a row if at least one test says yes.</b><br>Use it for "this or that": two shops, two cities.<br>Each side is a full test: <code>merchant_id = 1 OR merchant_id = 3</code>.<pre>SELECT id, merchant_id FROM payments\nWHERE merchant_id = 1 OR merchant_id = 3;\n\nid  merchant_id\n 1  1\n 9  1\n11  1\n 3  3\n10  3</pre>MySQL gave them as 1, 9, 11, 3, 10: grouped by shop, not in id order, because there was no ORDER BY.' },
      {
        t: 'predict', xp: 10, answer: 'Meera Iyer\nSara Khan',
        ask: 'Which names come back? One per line, in id order.',
        code: "SELECT name FROM customers WHERE city = 'Delhi' OR city = 'Chennai';",
        why: '<pre>id 3  Meera Iyer  Chennai   Delhi? no  Chennai? yes  → keep\nid 5  Sara Khan   Delhi     Delhi? yes               → keep\nthe other four live in Pune or Mumbai                → out</pre>',
      },

      { t: 'say', html: '<b>Idea 8: brackets, when AND and OR meet.</b><br>MySQL works out AND before OR, like × before + in maths.<br>So <code>A AND B OR C</code> means <code>(A AND B) OR C</code>. Add brackets to say what you mean.<pre>2 + 3 × 4  =  2 + 12  =  14        × first\n\nstatus = \'APPROVED\' AND merchant_id = 1 OR merchant_id = 5\n= (status = \'APPROVED\' AND merchant_id = 1) OR merchant_id = 5</pre>' },
      {
        t: 'predict', xp: 10, answer: '1\n5\n8\n11\n12',
        ask: 'No brackets. Which ids come back? One per line, smallest first.',
        code: "SELECT id FROM payments\nWHERE status = 'APPROVED' AND merchant_id = 1 OR merchant_id = 5;",
        why: 'AND first, so it reads as two groups:<pre>(status = \'APPROVED\' AND merchant_id = 1)   → 1, 11   (9 is DECLINED)\nOR merchant_id = 5                          → 5, 8, 12  (every payment at shop 5)\n\nanswer: 1, 5, 8, 11, 12</pre>The usual slip is 1, 8, 11, 12: reading it left to right as "approved, at shop 1 or 5". Payment 5 is DECLINED, but the OR side does not ask about status.',
      },
      {
        t: 'sqltry', sql: "SELECT id, merchant_id, status FROM payments\nWHERE status = 'APPROVED' AND (merchant_id = 1 OR merchant_id = 5);",
        html: 'The same question with brackets. Run it: payment 5 (DECLINED) is gone. Then delete the two brackets and run again.',
        after: 'With brackets: 1, 11, 8, 12. Without: 1, 11, 5, 8, 12. One pair of brackets changed the answer, and neither run gave an error.',
      },

      { t: 'say', html: '<b>Idea 9: NOT flips a test.</b><br>Yes becomes no, no becomes yes. <code>NOT status = \'APPROVED\'</code> keeps the declined payments.<br>Before a bracket, NOT flips the whole bracket.<pre>NOT (merchant_id = 1 OR merchant_id = 5)\n= every payment that is not at shop 1 and not at shop 5</pre>' },
      {
        t: 'predict', xp: 10, answer: '6',
        ask: 'How many rows come back? Type a number.',
        code: 'SELECT id FROM payments WHERE NOT (merchant_id = 1 OR merchant_id = 5);',
        why: '<pre>payments at shop 1:  1, 9, 11    → 3\npayments at shop 5:  5, 8, 12    → 3\nall payments:                      12\nnot at 1 or 5:       12 - 3 - 3  = 6</pre>',
      },
      {
        t: 'sqltry', sql: 'SELECT id, merchant_id FROM payments WHERE NOT (merchant_id = 1 OR merchant_id = 5);',
        html: 'Run it, and look at the order of the ids.',
        after: 'They came back as 2, 7, 3, 10, 4, 6: grouped by shop, not by id. MySQL found them through a sorted list of merchant ids it keeps beside the table (an index), so that is the quickest order for it. This is what "no order without ORDER BY" means in real life. <span class="later">Indexes: coming in a later SQL lesson</span>',
      },

      { t: 'say', html: '<b>Idea 10: DISTINCT removes repeated rows.</b><br>Write it straight after SELECT. It removes a row only when every column after SELECT repeats.<br>Pune and Mumbai each appear twice in customers:<pre>SELECT city FROM customers;           Pune, Mumbai, Chennai, Pune, Delhi, Mumbai   (6 rows)\nSELECT DISTINCT city FROM customers;  Pune, Mumbai, Chennai, Delhi                 (4 rows)</pre>' },
      {
        t: 'predict', xp: 10, answer: '3',
        ask: 'How many rows come back? Type a number.',
        code: 'SELECT DISTINCT network FROM cards;',
        why: 'The network of each of the 7 cards:<pre>VISA, MASTERCARD, VISA, MASTERCARD, AMEX, VISA, MASTERCARD\n\ndifferent ones: VISA, MASTERCARD, AMEX → 3</pre>',
      },
      {
        t: 'sqltry', experiment: true, sql: 'SELECT DISTINCT city, name FROM customers;',
        html: 'Two columns after DISTINCT. Guess the number of rows, then run it.',
        after: '6 rows, nothing removed. Two customers share Pune, but not Pune <b>and</b> the same name. DISTINCT compares whole rows: all the columns you listed, together.',
      },

      { t: 'say', html: `<b>Idea 11: NULL, the empty cell.</b><br>A new table arrived: <code>refunds</code>, money given back to a customer. Some cells hold <b>NULL</b>.<br>NULL means "no value": not 0, not empty text. Here a NULL <code>reason</code> = no reason given; a NULL <code>refunded_at</code> = the money has not gone back yet.
<div data-widget="sqltable" data-key="sql2-refunds" data-tables="payments,refunds" data-table="refunds"></div>` },
      {
        t: 'predict', xp: 10, answer: '2',
        ask: 'How many refunds are still waiting (refunded_at is NULL)? Type a number.',
        code: 'refunds table → refunded_at column → count the NULLs',
        why: '<pre>id 1   2026-10-03 12:00:00\nid 2   2026-10-05 10:00:00\nid 3   NULL                 waiting\nid 4   NULL                 waiting\nid 5   2026-10-10 09:30:00</pre>',
      },

      { t: 'say', html: '<b>Idea 12: = NULL never matches. Use IS NULL.</b><br>Comparing anything with NULL gives "unknown", not yes. WHERE keeps only yes.<br>So ask with <code>IS NULL</code>, or <code>IS NOT NULL</code> for the cells that have a value.<pre>WHERE refunded_at = NULL     unknown for every row   → 0 rows\nWHERE refunded_at IS NULL    yes for refunds 3 and 4 → 2 rows</pre>' },
      {
        t: 'sqltry', experiment: true, sql: 'SELECT id, refunded_at FROM refunds WHERE refunded_at = NULL;',
        html: '<b>Break it.</b> Run it: no error, and no rows. Then change <code>= NULL</code> to <code>IS NULL</code>.',
        after: '0 rows and no error: the most dangerous kind of mistake, because nothing warns you. With <code>IS NULL</code>: refunds 3 and 4. Try <code>IS NOT NULL</code> too: 1, 2 and 5.',
      },

      { t: 'say', html: '<b>Idea 13: the NULL trap in "not equal".</b><br><code>reason &lt;&gt; \'changed mind\'</code> looks like "every other refund".<br>But for a NULL reason the answer is unknown, so those rows drop out too.<pre>id 1  \'damaged item\' &lt;&gt; \'changed mind\'   yes       keep\nid 2  NULL           &lt;&gt; \'changed mind\'   unknown   out\nid 3  \'changed mind\' &lt;&gt; \'changed mind\'   no        out\nid 4  \'overcharged\'  &lt;&gt; \'changed mind\'   yes       keep\nid 5  NULL           &lt;&gt; \'changed mind\'   unknown   out\n\nanswer: 1, 4    (2 and 5 are lost)</pre>' },
      {
        t: 'predict', xp: 10, answer: '1\n3',
        ask: 'Which ids come back? One per line, smallest first.',
        code: "SELECT id FROM refunds WHERE reason <> 'overcharged';",
        why: '<pre>id 1  \'damaged item\'   yes\nid 2  NULL             unknown → out\nid 3  \'changed mind\'   yes\nid 4  \'overcharged\'    no\nid 5  NULL             unknown → out</pre>The usual slip is 1, 2, 3, 5: counting the NULL reasons as "not overcharged". A NULL is not known, so the test cannot say yes.',
      },
      {
        t: 'sqltry', sql: "SELECT id, reason FROM refunds WHERE reason <> 'changed mind' OR reason IS NULL;",
        html: 'The fix: say you want the NULLs too. Run it.',
        after: 'Refunds 1, 2, 4 and 5: the two NULL reasons are back. When a column can hold NULL, ask yourself what should happen to those rows.',
      },

      { t: 'say', html: '<b>Idea 14: the order MySQL works in.</b><br>You write SELECT first, but MySQL works through a query in this order.<br>That is why LIMIT always cuts after the sort.<pre>1. FROM       take the table\n2. WHERE      keep the rows whose test is yes\n3. SELECT     keep the columns you named\n4. DISTINCT   remove repeated rows\n5. ORDER BY   sort\n6. LIMIT      keep the first few</pre><span class="later">GROUP BY and HAVING, which fit between WHERE and SELECT: coming in the totals lessons</span>' },
      {
        t: 'predict', xp: 10, answer: '5\n4',
        ask: 'Which merchant ids come back? One per line, in the order MySQL shows them.',
        code: 'SELECT DISTINCT merchant_id FROM payments\nORDER BY merchant_id DESC LIMIT 2;',
        why: '<pre>1. FROM payments              12 rows\n3. SELECT merchant_id         1, 2, 3, 4, 5, 4, 2, 5, 1, 3, 1, 5\n4. DISTINCT                   1, 2, 3, 4, 5\n5. ORDER BY merchant_id DESC  5, 4, 3, 2, 1\n6. LIMIT 2                    5, 4</pre>The usual slip is 5, 5: cutting before DISTINCT removed the repeats.',
      },

      {
        t: 'deeper', title: 'three things that bite in real work',
        html: `<b>1. A bare number after OR.</b> <code>WHERE merchant_id = 1 OR 5</code> gives all 12 payments, with no error. MySQL reads it as <code>(merchant_id = 1) OR (5)</code>, and a number other than 0 counts as yes. Each side of OR must be a full test.
<pre>SELECT 5 = 5, 0 OR 0, 5 AND 1;     →  1, 0, 1      (1 means yes, 0 means no)</pre>
<b>2. A shortcut for many ORs on one column.</b> <code>merchant_id IN (1, 5)</code> means <code>merchant_id = 1 OR merchant_id = 5</code>, and needs no extra brackets next to an AND:
<pre>SELECT id FROM payments WHERE status = 'APPROVED' AND merchant_id IN (1, 5);   →  1, 11, 8, 12</pre>
<b>3. Where NULLs go when you sort.</b> In MySQL, NULLs come first in ORDER BY (smallest first) and last with DESC:
<pre>SELECT id, refunded_at FROM refunds ORDER BY refunded_at;
→ 3 NULL, 4 NULL, 1 2026-10-03 ..., 2 2026-10-05 ..., 5 2026-10-10 ...</pre>
PostgreSQL, another free database you will use later in the plan, does the opposite (NULLs last in ascending order). Interviewers like asking about this difference.`,
      },

      {
        t: 'sqltask', xp: 60, start: '',
        html: `The bank checks bigger approved payments at two shops: Kettle and Cup (merchant 1) and Pixel Electronics (merchant 5). Write one query that shows exactly these columns, in this order:
<pre>id | merchant_id | amount_paise</pre>
for every payment that is:
<ul><li>APPROVED,</li><li>at merchant 1 or merchant 5,</li><li>more than ₹500,</li></ul>
with the biggest amount first. Read the unit of the amount column before you type the number.`,
        hints: [
          'Three tests joined with AND, and one of them is an OR between two shops. Which part needs brackets?',
          'The order of the parts: SELECT ... FROM payments WHERE ... ORDER BY ... For biggest first, ORDER BY needs one more word.',
          "SELECT id, merchant_id, amount_paise FROM payments WHERE status = 'APPROVED' AND (merchant_id = 1 OR merchant_id = 5) AND amount_paise > ______ ORDER BY amount_paise ____;   ₹500 in paise is 500 × 100.",
        ],
        checks: [
          { label: 'The query runs without an error', test: r => r.ok, why: r => partsOrderWhy(r) || errorWhy(r, 'payments', PAYMENT_COLUMNS) },
          {
            label: 'The answer has exactly the columns id, merchant_id, amount_paise, in that order',
            test: r => r.ok && cols(r).join(',') === WANT_COLUMNS.join(','),
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const got = cols(r);
              if (got.join(',') === PAYMENT_COLUMNS.join(',')) return 'SELECT * gives every column. Name the three columns instead, with commas between them.';
              const stranger = got.find(c => !PAYMENT_COLUMNS.includes(c));
              if (stranger) return 'Your answer has a column called "' + stranger + '", which payments does not have. A missing comma does this: SELECT id merchant_id shows the id values under the name merchant_id.';
              if (got.length === 3 && WANT_COLUMNS.every(c => got.includes(c))) return 'The right columns, in a different order (' + got.join(', ') + '). The order after SELECT is the order shown.';
              return 'Your answer has the columns: ' + got.join(', ') + '. It should have: ' + WANT_COLUMNS.join(', ') + '.';
            },
          },
          {
            label: 'Only APPROVED payments are in the answer',
            test: r => { const ids = r.ok && idsIn(r); return !!ids && ids.every(id => P[id] && P[id][2] === 'APPROVED'); },
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const ids = idsIn(r);
              if (!ids) return needIds;
              const bad = ids.filter(id => P[id] && P[id][2] !== 'APPROVED');
              if (!/approved/i.test(r.sql || '')) return 'Your query has no test on status, so DECLINED payments come back too: ' + bad.map(describe).join(', ') + '. Add status = \'APPROVED\'.';
              if (mixesAndOr(r.sql || '')) return 'DECLINED payments got in: ' + bad.map(describe).join(', ') + '. Your WHERE mixes AND and OR with no brackets. AND is worked out first, so the OR side does not ask about status. Put brackets around the two shop tests.';
              return 'DECLINED payments got in: ' + bad.map(describe).join(', ') + '. Check how your status test is joined to the others.';
            },
          },
          {
            label: 'Only payments at merchant 1 or merchant 5 are in the answer',
            test: r => { const ids = r.ok && idsIn(r); return !!ids && ids.length > 0 && ids.every(id => P[id] && (P[id][0] === 1 || P[id][0] === 5)); },
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const ids = idsIn(r);
              if (!ids) return needIds;
              if (!ids.length) return 'No rows came back. If you wrote merchant_id = 1 AND merchant_id = 5, no payment can be at two shops at once, so it is never yes. "This shop or that shop" is OR.';
              const bad = ids.filter(id => P[id] && P[id][0] !== 1 && P[id][0] !== 5);
              if (/\bor\s+5\b/i.test(r.sql || '')) return 'Payments from other shops got in. "merchant_id = 1 OR 5" reads as (merchant_id = 1) OR (5), and 5 alone counts as yes. Write the full test on both sides: merchant_id = 1 OR merchant_id = 5.';
              return 'These are at other shops: ' + bad.map(describe).join(', ') + '. Test merchant_id against 1 and 5 only.';
            },
          },
          {
            label: 'Only payments of more than ₹500 are in the answer',
            test: r => { const ids = r.ok && idsIn(r); return !!ids && ids.every(id => P[id] && P[id][1] > 50000); },
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const ids = idsIn(r);
              if (!ids) return needIds;
              const small = ids.filter(id => P[id] && P[id][1] <= 50000);
              if (!/amount_paise\s*>/i.test(r.sql || '')) return 'Small payments got in: ' + small.map(describe).join(', ') + '. Add a test on amount_paise.';
              return 'Small payments got in: ' + small.map(describe).join(', ') + '. Your amount test lets them through. amount_paise is in paise: ₹500 is 500 × 100 = 50000 paise, so the test is amount_paise > 50000.';
            },
          },
          {
            label: 'Every matching payment is in the answer',
            test: r => { const ids = r.ok && idsIn(r); return !!ids && WANT.every(id => ids.includes(id)); },
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const ids = idsIn(r);
              if (!ids) return needIds;
              const missing = WANT.filter(id => !ids.includes(id));
              if (/\blimit\b/i.test(r.sql || '')) return 'Missing: ' + missing.map(describe).join(', ') + '. The task wants every matching payment, so leave out LIMIT.';
              return 'Missing: ' + missing.map(describe).join(', ') + '. Each of these is APPROVED, at shop 1 or 5, and more than ₹500 (50000 paise). Check each test in your WHERE against it.';
            },
          },
          {
            label: 'The biggest amount comes first',
            test: r => { const ids = r.ok && idsIn(r); return !!ids && ids.join(',') === WANT.join(','); },
            why: r => {
              if (!r.ok) return 'Fix the error first.';
              const ids = idsIn(r);
              if (!ids) return needIds;
              if (ids.length !== WANT.length || !WANT.every(id => ids.includes(id))) return 'Fix the rows first; the order is checked once the right 3 payments are there.';
              if (!/order\s+by/i.test(r.sql || '')) return 'Your rows came back as ' + ids.join(', ') + '. Without ORDER BY, MySQL promises no order. Add ORDER BY amount_paise DESC.';
              if (!/\bdesc\b/i.test(r.sql || '')) return 'Your rows came back smallest first (' + ids.join(', ') + '). ORDER BY sorts smallest first unless you add DESC.';
              return 'Your rows came back as ' + ids.join(', ') + '. Biggest amount first is 12, 8, 11. Sort by amount_paise.';
            },
          },
        ],
      },

      { t: 'say', html: '<b>Next SQL night, lesson 3:</b> your own tables. You will create tables in a sandbox database of your own, choose a type for every column, and add, change and delete rows.<br>To revise tonight, open the note <b>"Choosing and sorting rows: ORDER BY, AND / OR, DISTINCT, NULL"</b> under Notes.' },
    ],
  });
})();
