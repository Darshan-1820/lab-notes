// The "From the job" track (Darshan, 2026-10-20; DECISIONS 60): full lessons built from real bugs seen in a
// payments backend, retold with a made-up bank and made-up names. No employer code, names or data.
//
// Placement (his rule, 2026-10-20: "she should first understand that okay Darshan knows till where in SQL,
// if he learns this and this, then he can learn transactions... small lessons where I do not learn much is
// not good. I should be able to at least be comfortable in a topic"): every lesson here has needs: [ids],
// the lessons that teach its prerequisites. It stays locked until they are passed, and "Next" on the last
// of them leads here (app/web/index.html: needsMet, nextMission). So the path is
//   SQL lesson 2 → SQL lesson 3 → Transactions 1 → Transactions 2 → The card handed out twice → SQL lesson 4 …
// months before SQL_PLAN's transactions stage. Each lesson aims at comfort, not a taste: several worked
// examples, practice tasks, a break-it, and a final task that combines the ideas. Grace (lab-teacher)
// schedules them from TEACH_QUEUE.md: at most 1–2 a week, never in place of a Java or SQL night.
//
// Two block types for two connections, handled in app/web/index.html (POST /api/sql-session, Server.java):
//   sqlsession      steps run in order in two windows, A and B (two connections to the sandbox, open for
//                   the whole run). Fields: html, setup (statements the lab runs first in A, shown folded),
//                   steps ['A: ...', 'B: ...'], editable (he can change the steps), experiment (drawn as
//                   "break it"), final (a query run after both windows closed: what is really saved), after.
//   sqlsessiontask  his own steps, checked. Fields: html, setup, start, xp, hints, verify ({ name: query } run
//                   after both windows closed), checks, practice (true = a practice task: its own pass mark,
//                   free hints, 15 XP; the last task without practice passes the lesson). Checks see
//                   r = { ok, blocked, error, lines, steps: [{ n, who, sql, ok, affected, columns, rows,
//                   waited, doneAfter, errno, error }], verify: { name: { ok, rows, ... } } }.
//
// Every result, row count and MySQL message quoted below was produced by running the same steps through
// /api/sql-session on the lab-mysql container (MySQL 8.4.11, database sandbox, REPEATABLE READ) on 2026-10-20.

(function () {
  // ---------- helpers for the checks ----------
  const verb = s => ((s.sql || '').match(/^\s*(\w+)/) || ['', ''])[1].toUpperCase();
  const isBegin = s => verb(s) === 'BEGIN' || (verb(s) === 'START' && /^\s*start\s+transaction/i.test(s.sql));
  const isEnd = s => verb(s) === 'COMMIT' || verb(s) === 'ROLLBACK';
  const idx = (steps, f) => steps.findIndex(f);
  const lastIdx = (steps, f) => { for (let i = steps.length - 1; i >= 0; i--) if (f(steps[i])) return i; return -1; };
  const rowsOf = (r, name) => (r.verify && r.verify[name] && r.verify[name].ok ? r.verify[name].rows : null);
  const stepsOk = r => r.ok && r.steps.length > 0 && r.steps.every(s => s.ok);
  const has = (s, re) => re.test(s.sql);
  // the transaction (BEGIN .. COMMIT/ROLLBACK) that step k of window w belongs to, or null
  function txOf(steps, k) {
    const w = steps[k].who;
    let b = -1;
    for (let i = k; i >= 0; i--) {
      if (steps[i].who !== w) continue;
      if (i < k && isEnd(steps[i])) break;
      if (isBegin(steps[i])) { b = i; break; }
    }
    if (b < 0) return null;
    let e = -1;
    for (let i = b + 1; i < steps.length; i++) if (steps[i].who === w && isEnd(steps[i])) { e = i; break; }
    return { begin: b, end: e, how: e >= 0 ? verb(steps[e]) : null };
  }
  function stepsWhy(r) {
    if (r.blocked) return r.error;
    if (!r.steps.length) return 'Type your steps first, one per line, each starting with A: or B:.';
    const bad = r.steps.find(s => !s.ok);
    if (!bad) return '';
    let tip = '';
    if (bad.errno === 1054) tip = ' MySQL does not know a column name in that step: compare it with the setup above.';
    if (bad.errno === 1064) tip = ' MySQL could not read the step. Look just before the text after "near": a missing quote or comma is the usual cause.';
    if (bad.errno === 1146) tip = ' MySQL does not know that table name: check the spelling.';
    if (bad.errno === 1062) tip = ' That value is already in a PRIMARY KEY or UNIQUE column. Inside a transaction that means ROLLBACK (Transactions 1), then try another value.';
    if (bad.errno === 1205) tip = ' The step waited 4 seconds for a lock and gave up: the other window held it and never committed.';
    return 'Step ' + bad.n + ' (window ' + bad.who + ') failed: ' + bad.error + tip;
  }
  const bal = (rows, who) => { const r = (rows || []).find(x => x[0] === who); return r ? Number(r[1]) : null; };
  const ownerOf = (rows, id) => { const r = (rows || []).find(x => x[0] === String(id)); return r ? r[2] : undefined; };

  // ---------- the tables (the lab builds them before every run) ----------
  const ACCOUNTS = [
    'DROP TABLE IF EXISTS accounts;',
    'CREATE TABLE accounts (name VARCHAR(20) PRIMARY KEY, balance_rupees INT NOT NULL);',
    "INSERT INTO accounts (name, balance_rupees) VALUES ('Asha', 1000), ('Ravi', 1000);",
  ];
  const TRANSFERS = ACCOUNTS.concat([
    'DROP TABLE IF EXISTS transfers;',
    'CREATE TABLE transfers (id INT PRIMARY KEY, from_name VARCHAR(20) NOT NULL, to_name VARCHAR(20) NOT NULL, amount_rupees INT NOT NULL);',
  ]);
  const APPROVALS = [
    'DROP TABLE IF EXISTS approvals;',
    'CREATE TABLE approvals (branch VARCHAR(20) NOT NULL, card_type VARCHAR(20) NOT NULL);',
    "INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Silver');",
  ];
  const CARDS = [
    'DROP TABLE IF EXISTS cards;',
    'CREATE TABLE cards (id INT PRIMARY KEY, status VARCHAR(10) NOT NULL, owner VARCHAR(20));',
    "INSERT INTO cards (id, status, owner) VALUES (7, 'free', NULL), (8, 'free', NULL);",
  ];
  const CARDS3 = [
    'DROP TABLE IF EXISTS cards;',
    'CREATE TABLE cards (id INT PRIMARY KEY, status VARCHAR(10) NOT NULL, owner VARCHAR(20));',
    "INSERT INTO cards (id, status, owner) VALUES (7, 'free', NULL), (8, 'free', NULL), (9, 'free', NULL);",
    'DROP TABLE IF EXISTS assignments;',
    'CREATE TABLE assignments (card_id INT PRIMARY KEY, person VARCHAR(20) NOT NULL);',
  ];
  const ASSIGN = [
    'DROP TABLE IF EXISTS assignments;',
    'CREATE TABLE assignments (card_id INT PRIMARY KEY, person VARCHAR(20) NOT NULL);',
    'SELECT 1;',
  ];
  const ACC_FINAL = 'SELECT name, balance_rupees FROM accounts ORDER BY name';

  const JOB = {
    id: 'job-track',
    title: 'From the job: real bugs, retold',
    blurb: 'Full lessons built from real bugs in payments backends, with a made-up bank. Each one opens when you have passed the lessons it builds on, so it sits at its place in your path.',
    independent: true,
    missions: [

      // =====================================================================================================
      {
        id: 'job1m1',
        needs: ['sql1m3'],
        title: 'Transactions 1: all or nothing',
        skill: 'UPDATE with sums, BEGIN, COMMIT, ROLLBACK, autocommit, errors inside a transaction',
        blocks: [
          { t: 'say', html: '<b>From the job.</b> These lessons come from real bugs in a payments backend, retold with a made-up bank.<br>This one opens after SQL lesson 3 because it builds on INSERT, UPDATE and PRIMARY KEY.<br>Every Run builds its own tables in your <code>sandbox</code>, so nothing can break.' },
          { t: 'say', html: 'Two questions from SQL lesson 3, from memory.' },
          {
            t: 'predict', xp: 10, answer: '2',
            ask: 'The accounts table has 2 rows. How many rows does this change? Type a number.',
            code: 'UPDATE accounts SET balance_rupees = 0;',
            why: 'No WHERE, so every row is picked: both rows change. That is SQL lesson 3\'s warning: write the WHERE first.',
          },
          {
            t: 'predict', xp: 10, answer: '1062',
            ask: 'name is the PRIMARY KEY of accounts, and Asha is already in it. Which error number does MySQL give? Type the number.',
            code: "INSERT INTO accounts (name, balance_rupees) VALUES ('Asha', 50);",
            why: 'A PRIMARY KEY value can appear only once: <code class="bad">ERROR 1062 (23000): Duplicate entry \'Asha\' for key \'accounts.PRIMARY\'</code>',
          },

          { t: 'say', html: '<b>Two windows.</b> A and B are two separate <b>connections</b> to the same database, like two people\'s apps (SQL lesson 1).<br>Each step says which window runs it, and steps run top to bottom. This lesson mostly uses A; the next one is about B.' },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ['A: SELECT * FROM accounts;'], html: 'The bank. Open "The lab sets up the table first" to see how it was made: you know every word of it from SQL lesson 3.', after: 'Asha and Ravi, 1000 rupees each.' },

          { t: 'say', html: '<b>Idea 1: UPDATE can work out the new value from the old one.</b><br><code>balance_rupees - 500</code> on the right means: read the old value, subtract 500.<br>MySQL does the sum for each row WHERE picks.<pre>UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = \'Asha\';\n\nAsha:  1000 − 500 = 500\nRavi:  not picked, stays 1000</pre>' },
          {
            t: 'predict', xp: 10, answer: '850',
            ask: 'Both steps run one after the other. What is Asha\'s balance at the end? Type a number of rupees.',
            code: "UPDATE accounts SET balance_rupees = balance_rupees - 200 WHERE name = 'Asha';\nUPDATE accounts SET balance_rupees = balance_rupees + 50 WHERE name = 'Asha';",
            why: 'Each UPDATE starts from what the one before left:<pre>start:   1000\n− 200 →   800\n+ 50  →   850</pre>',
          },
          { t: 'sqlsession', setup: ACCOUNTS, editable: true, steps: ["A: UPDATE accounts SET balance_rupees = balance_rupees - 200 WHERE name = 'Asha';", "A: UPDATE accounts SET balance_rupees = balance_rupees + 50 WHERE name = 'Asha';", 'A: SELECT * FROM accounts;'], html: 'Run it and check your answer. Change the numbers and run again if you like.' },

          { t: 'say', html: '<b>The problem.</b> A transfer is two UPDATEs: take 500 from Asha, give 500 to Ravi.<br>If the app crashes between them, the first one has already happened.<br>In the steps below, <code>--</code> starts a note for people: MySQL skips the rest of that line.' },
          {
            t: 'predict', xp: 10, answer: '1500',
            ask: 'The first UPDATE runs, then the app crashes before the second. How many rupees do Asha and Ravi have together now? Type a number.',
            code: "UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\n-- the app crashes here\nUPDATE accounts SET balance_rupees = balance_rupees + 500 WHERE name = 'Ravi';",
            why: '<pre>Asha:   1000 − 500 = 500\nRavi:   1000             (never ran)\ntotal:  500 + 1000 = 1500</pre>500 rupees vanished. The bank needs both changes or neither.',
          },

          { t: 'say', html: '<b>Idea 2: a transaction is all or nothing.</b><br><code>BEGIN</code> opens a <b>draft</b>: changes after it go into the draft.<br><code>COMMIT</code> saves the whole draft at once. <code>ROLLBACK</code> throws the whole draft away.' },
          { t: 'say', html: '<b>Worked example 1: a transfer that is saved.</b><pre>BEGIN;                                 draft open\nAsha − 500   → draft: Asha 500\nRavi + 500   → draft: Ravi 1500\nCOMMIT;                                both saved together\ntotal: 500 + 1500 = 2000</pre>' },
          { t: 'sqlsession', setup: ACCOUNTS, final: ACC_FINAL, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", "A: UPDATE accounts SET balance_rupees = balance_rupees + 500 WHERE name = 'Ravi';", 'A: COMMIT;', 'A: SELECT * FROM accounts;'], html: 'Run it. Under the steps the lab shows the table once more after both windows closed: what is really saved.' },
          {
            t: 'predict', xp: 10, answer: '1000',
            ask: 'Worked example 2: what is Asha\'s balance in the last SELECT? Type a number of rupees.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: SELECT * FROM accounts;     -- shows Asha 500\nA: ROLLBACK;\nA: SELECT * FROM accounts;",
            why: 'ROLLBACK threw the draft away, so the UPDATE never counts:<pre>after BEGIN + UPDATE:  draft says 500\nafter ROLLBACK:        back to 1000</pre>',
          },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", 'A: SELECT * FROM accounts;', 'A: ROLLBACK;', 'A: SELECT * FROM accounts;'], html: 'Run it and check.', after: 'Step 3 shows 500: A sees its own draft. Step 5 shows 1000: the draft is gone. A crash in the middle does the same on its own: MySQL never keeps an unfinished draft.' },
          {
            t: 'sqlsessiontask', practice: true, setup: ACCOUNTS, start: '',
            verify: { final: ACC_FINAL },
            html: '<b>Practice 1: change your mind.</b> Start a transfer of 400 rupees from Asha to Ravi (both UPDATEs), then decide it was a mistake and throw it away. End with a SELECT in A that shows both at 1000.',
            hints: ['BEGIN, the two UPDATEs (− 400 for Asha, + 400 for Ravi), then ROLLBACK, then SELECT * FROM accounts;'],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'Both UPDATEs are inside a transaction in window A', test: r => { const u = r.steps.map((s, k) => verb(s) === 'UPDATE' ? k : -1).filter(k => k >= 0); return u.length >= 2 && u.every(k => r.steps[k].who === 'A' && txOf(r.steps, k)); }, why: r => r.steps.filter(s => verb(s) === 'UPDATE').length < 2 ? 'A transfer has two UPDATEs: one for Asha, one for Ravi.' : 'Open the transaction with BEGIN in window A before the UPDATEs.' },
              { label: 'The transaction ends with ROLLBACK', test: r => { const k = idx(r.steps, s => verb(s) === 'UPDATE'); const t = k >= 0 ? txOf(r.steps, k) : null; return !!t && t.how === 'ROLLBACK'; }, why: r => { const k = idx(r.steps, s => verb(s) === 'UPDATE'); const t = k >= 0 ? txOf(r.steps, k) : null; return t && t.how === 'COMMIT' ? 'COMMIT saves the transfer. Here you throw it away: ROLLBACK.' : 'End the transaction with ROLLBACK.'; } },
              { label: 'A SELECT in A after the ROLLBACK shows Asha and Ravi at 1000', test: r => { const rb = lastIdx(r.steps, s => verb(s) === 'ROLLBACK'); return rb >= 0 && r.steps.some((s, k) => k > rb && s.who === 'A' && verb(s) === 'SELECT' && bal(s.rows, 'Asha') === 1000 && bal(s.rows, 'Ravi') === 1000); }, why: () => 'Add  A: SELECT * FROM accounts;  after the ROLLBACK.' },
              { label: 'Nothing was saved: both still 1000 after the windows closed', test: r => { const f = rowsOf(r, 'final'); return bal(f, 'Asha') === 1000 && bal(f, 'Ravi') === 1000; }, why: r => { const f = rowsOf(r, 'final'); return 'Saved now: Asha ' + bal(f, 'Asha') + ', Ravi ' + bal(f, 'Ravi') + '. Something was saved outside the transaction (a step before BEGIN, or a COMMIT).'; } },
            ],
          },

          { t: 'say', html: '<b>Idea 3: without BEGIN, every step is saved at once.</b> This is called <b>autocommit</b>: MySQL wraps each lone step in its own tiny transaction and commits it.<br>So a ROLLBACK with no BEGIN before it has nothing to throw away.' },
          {
            t: 'predict', xp: 10, answer: '500',
            ask: 'No BEGIN here. What is Asha\'s balance in the SELECT? Type a number of rupees.',
            code: "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: ROLLBACK;\nA: SELECT * FROM accounts;",
            why: 'The UPDATE was its own transaction and was saved at once. The ROLLBACK found no draft:<pre>UPDATE   → saved: Asha 500\nROLLBACK → nothing open, nothing undone\nSELECT   → Asha 500</pre>',
          },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ["A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", 'A: ROLLBACK;', 'A: SELECT * FROM accounts;'], html: 'Run it.', after: 'ROLLBACK said Done, with no error, and undid nothing. That silence is why "I\'ll roll back if it goes wrong" only works when you said BEGIN first.' },

          { t: 'say', html: '<b>Idea 4: an error does not end the transaction.</b> When one step inside BEGIN fails, MySQL refuses that step only. The draft stays open, with the steps that worked.<br>So the app must decide: after an error, ROLLBACK. A COMMIT would save half the job.' },
          {
            t: 'predict', xp: 10, answer: '1500',
            ask: 'Step 3 fails (there is no column balance). Then the app commits anyway. How many rupees are saved for Asha and Ravi together? Type a number.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: UPDATE accounts SET balance = balance + 500 WHERE name = 'Ravi';     -- ERROR 1054\nA: COMMIT;",
            why: 'The failed step changed nothing, but Asha\'s step was in the draft, and COMMIT saved it:<pre>Asha:   1000 − 500 = 500   saved\nRavi:   1000               (his step failed)\ntotal:  500 + 1000 = 1500</pre>The same 500 rupees vanished as in the crash, even with BEGIN.',
          },
          { t: 'sqlsession', experiment: true, setup: ACCOUNTS, final: ACC_FINAL, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", "A: UPDATE accounts SET balance = balance + 500 WHERE name = 'Ravi';", 'A: COMMIT;'], html: '<b>Break it:</b> commit after an error. Run it, then look at what is saved.', after: 'Step 3: <code class="bad">ERROR 1054 (42S22): Unknown column \'balance\' in \'field list\'</code>. Step 4 still committed, and saved Asha at 500 with Ravi at 1000. Rule: <b>an error inside a transaction means ROLLBACK</b>. Real programs do this in a "catch" block. <span class="later">try / catch in Java: coming in the Java track</span>' },
          {
            t: 'sqlsessiontask', practice: true, setup: ACCOUNTS,
            start: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: UPDATE accounts SET balance = balance + 500 WHERE name = 'Ravi';",
            verify: { final: ACC_FINAL },
            html: '<b>Practice 2: the error happened, finish safely.</b> The first three steps are given, and step 3 fails on purpose. Keep them as they are and add what the app must do next, so nothing is half done. Then read the table in A.',
            hints: ['After an error inside a transaction: ROLLBACK, never COMMIT. Then  A: SELECT * FROM accounts;'],
            checks: [
              { label: 'The given failing step is still there (step 3 fails with ERROR 1054)', test: r => r.steps.some(s => s.errno === 1054 && /balance\s*=\s*balance/i.test(s.sql)), why: () => 'Keep the three given steps as they are: the lesson is what you do AFTER the failure.' },
              { label: 'After the error, the transaction ends with ROLLBACK, not COMMIT', test: r => { const e = idx(r.steps, s => s.errno === 1054); if (e < 0) return false; const end = idx(r.steps, (s, k) => k > e && s.who === 'A' && isEnd(s)); return end >= 0 && verb(r.steps[end]) === 'ROLLBACK'; }, why: r => { const e = idx(r.steps, s => s.errno === 1054); const end = idx(r.steps, (s, k) => k > e && s.who === 'A' && isEnd(s)); return end >= 0 ? 'A COMMIT after the error saves Asha\'s half of the transfer. Use ROLLBACK.' : 'Add a ROLLBACK after the failing step.'; } },
              { label: 'Nothing is half done: both still 1000 after the windows closed', test: r => { const f = rowsOf(r, 'final'); return bal(f, 'Asha') === 1000 && bal(f, 'Ravi') === 1000; }, why: r => { const f = rowsOf(r, 'final'); return 'Saved now: Asha ' + bal(f, 'Asha') + ', Ravi ' + bal(f, 'Ravi') + '.'; } },
              { label: 'A reads the table after the ROLLBACK', test: r => { const rb = lastIdx(r.steps, s => verb(s) === 'ROLLBACK'); return rb >= 0 && r.steps.some((s, k) => k > rb && s.who === 'A' && verb(s) === 'SELECT'); }, why: () => 'Add  A: SELECT * FROM accounts;  at the end.' },
            ],
          },

          { t: 'say', html: '<b>Idea 5: one transaction can change several tables.</b> A real transfer also writes a record of itself, so the bank can show it later.<br>The record and both balances go in the same draft: all three saved, or none.' },
          { t: 'say', html: '<b>Worked example 3.</b> The setup now also makes <code>transfers</code>, with <code>id</code> as its PRIMARY KEY.<pre>BEGIN;\nINSERT transfer 1: Asha → Ravi, 250      draft: 1 record\nAsha − 250 → 750                          draft\nRavi + 250 → 1250                         draft\nCOMMIT;                                   all three saved</pre>' },
          { t: 'sqlsession', setup: TRANSFERS, editable: true, steps: ['A: BEGIN;', "A: INSERT INTO transfers (id, from_name, to_name, amount_rupees) VALUES (1, 'Asha', 'Ravi', 250);", "A: UPDATE accounts SET balance_rupees = balance_rupees - 250 WHERE name = 'Asha';", "A: UPDATE accounts SET balance_rupees = balance_rupees + 250 WHERE name = 'Ravi';", 'A: COMMIT;', 'A: SELECT * FROM transfers;', 'A: SELECT * FROM accounts;'], html: 'Run it. Then add the same INSERT a second time just before the COMMIT, and run again: what does the PRIMARY KEY say, and what should the app do?', after: 'A second transfer 1 gives <code class="bad">ERROR 1062 (23000): Duplicate entry \'1\' for key \'transfers.PRIMARY\'</code>. Real systems use exactly this: if the transfer\'s id is already there, the transfer was already done, so the app rolls back instead of paying twice.' },

          {
            t: 'deeper', title: 'the interview words, and what a program does',
            html: `<p><b>ACID</b> is what a transaction promises: <b>A</b>tomicity (all or nothing: this lesson), <b>C</b>onsistency (the rules, like PRIMARY KEY and NOT NULL, hold before and after), <b>I</b>solation (others don't see your draft: next lesson), <b>D</b>urability (after COMMIT it survives a crash or power cut).</p>
<p><b>In a program</b> the pattern is always the same: begin, do the steps, commit; if any step throws an error, roll back. In Java with JDBC (later in the roadmap) that is <code>setAutoCommit(false)</code>, the statements, <code>commit()</code>, and <code>rollback()</code> in the catch block.</p>
<p><b>Why MySQL doesn't roll back by itself on an error:</b> some errors are expected and fine to continue after (a duplicate you meant to skip). Only the app knows, so the app decides.</p>`,
          },

          {
            t: 'sqlsessiontask', xp: 60, setup: TRANSFERS, start: '',
            verify: { accounts: ACC_FINAL, transfers: 'SELECT id, from_name, to_name, amount_rupees FROM transfers ORDER BY id' },
            html: `<b>The real thing.</b> Asha sends Ravi <b>300 rupees</b>. Write it as one transaction in window A that:
<ul>
<li>records it in <code>transfers</code> as transfer <b>1</b> (from Asha, to Ravi, 300),</li>
<li>takes 300 from Asha and gives 300 to Ravi,</li>
<li>and saves all of it.</li>
</ul>
Then, in window B, read <code>accounts</code>: what everyone else sees. The lab builds both tables first (Asha 1000, Ravi 1000, no transfers) and looks again after both windows closed.`,
            hints: [
              'Steps in A: BEGIN, the INSERT INTO transfers, two UPDATEs, COMMIT. Then one SELECT in B.',
              "INSERT INTO transfers (id, from_name, to_name, amount_rupees) VALUES (1, 'Asha', 'Ravi', 300);",
              "A: BEGIN;\nA: INSERT INTO transfers (id, from_name, to_name, amount_rupees) VALUES (1, 'Asha', 'Ravi', 300);\nA: UPDATE accounts SET balance_rupees = balance_rupees - 300 WHERE name = 'Asha';\nA: UPDATE accounts SET ______ WHERE name = 'Ravi';\nA: ______;\nB: SELECT * FROM accounts;",
            ],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              {
                label: 'The INSERT and both UPDATEs are inside one transaction in window A',
                test: r => {
                  const ks = r.steps.map((s, k) => (verb(s) === 'UPDATE' || verb(s) === 'INSERT') ? k : -1).filter(k => k >= 0);
                  if (ks.length < 3 || !ks.every(k => r.steps[k].who === 'A')) return false;
                  const t = ks.map(k => txOf(r.steps, k));
                  return t.every(x => x && x.begin === t[0].begin);
                },
                why: r => {
                  const ks = r.steps.filter(s => verb(s) === 'UPDATE' || verb(s) === 'INSERT');
                  if (ks.length < 3) return 'The job has three changes: the INSERT into transfers and two UPDATEs.';
                  if (!ks.every(s => s.who === 'A')) return 'A change in window B is outside A\'s transaction: it is saved at once and would stay even if A rolled back.';
                  return 'Put one BEGIN before the first change, and no COMMIT until after the last one.';
                },
              },
              {
                label: 'The transaction ends with COMMIT',
                test: r => { const k = idx(r.steps, s => verb(s) === 'INSERT' || verb(s) === 'UPDATE'); const t = k >= 0 ? txOf(r.steps, k) : null; return !!t && t.how === 'COMMIT'; },
                why: r => { const k = idx(r.steps, s => verb(s) === 'INSERT' || verb(s) === 'UPDATE'); const t = k >= 0 ? txOf(r.steps, k) : null; if (!t) return 'Your first change runs before BEGIN, so it is outside the transaction. BEGIN comes first.'; return t.how === 'ROLLBACK' ? 'ROLLBACK throws the transfer away. Here it must be saved.' : 'There is no COMMIT, so the draft is thrown away when the window closes.'; },
              },
              {
                label: 'Saved: Asha 700 and Ravi 1300 rupees',
                test: r => { const f = rowsOf(r, 'accounts'); return bal(f, 'Asha') === 700 && bal(f, 'Ravi') === 1300; },
                why: r => {
                  const f = rowsOf(r, 'accounts'); if (!stepsOk(r)) return 'Fix the failing step first.';
                  const a = bal(f, 'Asha'), v = bal(f, 'Ravi');
                  if (a === 1000 && v === 1000) return 'Nothing was saved: Asha 1000, Ravi 1000. Did the transaction COMMIT?';
                  if (a === 1300 && v === 700) return 'The money went the wrong way. Asha pays: − 300 for her, + 300 for Ravi.';
                  if (a + v !== 2000) return 'Asha ' + a + ' + Ravi ' + v + ' = ' + (a + v) + ' rupees, not 2000: take exactly what you give.';
                  return 'Asha ' + a + ', Ravi ' + v + '. The task moves exactly 300 rupees.';
                },
              },
              {
                label: 'Saved: exactly one transfer, 1, Asha → Ravi, 300',
                test: r => { const t = rowsOf(r, 'transfers'); return !!t && t.length === 1 && t[0][0] === '1' && t[0][1] === 'Asha' && t[0][2] === 'Ravi' && t[0][3] === '300'; },
                why: r => { const t = rowsOf(r, 'transfers') || []; if (!t.length) return 'No transfer was saved. The INSERT must be inside the transaction that COMMITs.'; return 'Saved transfers: ' + t.map(x => x.join(' ')).join('; ') + '. Expected one: 1 Asha Ravi 300.'; },
              },
              {
                label: 'Window B reads accounts after the COMMIT and sees Asha\'s 700',
                test: r => { const c = lastIdx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return c >= 0 && r.steps.some((s, k) => k > c && s.who === 'B' && verb(s) === 'SELECT' && bal(s.rows, 'Asha') === 700); },
                why: r => {
                  const bs = r.steps.filter(s => s.who === 'B' && verb(s) === 'SELECT');
                  if (!bs.length) return 'Add a step in window B that reads the table: B: SELECT * FROM accounts;';
                  const c = lastIdx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT');
                  if (c < 0) return 'There is no COMMIT in window A, so B can only ever see the old 1000.';
                  if (r.steps.indexOf(bs[bs.length - 1]) < c) return 'B read before A committed. Move B\'s SELECT below the COMMIT.';
                  const a = bal(bs[bs.length - 1].rows, 'Asha');
                  return a != null ? 'B saw Asha with ' + a + ' rupees. Fix the transfer first (the checks above).' : 'B must read accounts: B: SELECT * FROM accounts;';
                },
              },
            ],
          },
          { t: 'say', html: '<b>Next in this track:</b> Transactions 2, what other connections see while your draft is open. That is where the real bug from the bank lives.' },
        ],
      },

      // =====================================================================================================
      {
        id: 'job1m2',
        needs: ['job1m1'],
        title: 'Transactions 2: what others see',
        skill: 'drafts are private, writes wait for each other, snapshot reads, one job = one connection',
        blocks: [
          { t: 'say', html: '<b>From the job.</b> Transactions 1 was about one window. This one is about two: what B sees while A\'s draft is open.<br>The real bug is in the middle of this lesson. First, two questions from last time.' },
          {
            t: 'predict', xp: 10, answer: '500',
            ask: 'Step 3 fails, then the app commits. What is Asha\'s saved balance? Type a number of rupees.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: UPDATE accounts SET balance = 0 WHERE name = 'Ravi';     -- ERROR 1054\nA: COMMIT;",
            why: 'An error does not end the transaction, and COMMIT saved the step that worked: Asha 500. After an error: ROLLBACK.',
          },
          {
            t: 'predict', xp: 10, answer: '500',
            ask: 'No BEGIN. What is Asha\'s balance in the SELECT? Type a number of rupees.',
            code: "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nA: ROLLBACK;\nA: SELECT * FROM accounts;",
            why: 'Autocommit saved the UPDATE at once; the ROLLBACK had nothing open to undo.',
          },

          { t: 'say', html: '<b>Idea 1: a draft is private.</b> Other connections see only what is <b>saved</b> (committed). The window with the draft sees its own changes.<br>So until A commits, A and B can read the same table and get different answers.' },
          { t: 'say', html: 'Tap through it. The three boxes: what is saved, A\'s draft, B\'s draft.<div data-widget="txntimeline" data-scenario="draft" data-key="job2-draft"></div>' },
          {
            t: 'predict', xp: 10, answer: '1000',
            ask: 'A has run BEGIN and taken 500 from Asha, but not committed. Window B reads. What balance does B see for Asha? Type a number of rupees.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nB: SELECT * FROM accounts;",
            why: '<pre>A\'s draft:  Asha 500\nsaved:      Asha 1000   ← what B sees</pre>',
          },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", 'B: SELECT * FROM accounts;', 'A: SELECT * FROM accounts;', 'A: COMMIT;', 'B: SELECT * FROM accounts;'], html: 'Run it. Compare step 3 (B) with step 4 (A), then step 6.', after: 'Step 3: B sees 1000. Step 4: A sees its draft, 500. Step 6, after COMMIT: B sees 500 too. This is <b>isolation</b>, the I in ACID.' },
          { t: 'sqlsession', experiment: true, setup: ACCOUNTS, final: ACC_FINAL, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", 'A: SELECT * FROM accounts;'], html: '<b>Break it:</b> forget the COMMIT. The lab closes both windows when the run ends. Predict what is saved, then run.', after: 'A saw 500 in its draft, but after the window closed the saved table says <b>1000</b>. Closing a connection without COMMIT is a ROLLBACK. "It worked on my screen" is not "it is saved".' },
          {
            t: 'sqlsessiontask', practice: true, setup: ACCOUNTS, start: '',
            verify: { final: ACC_FINAL },
            html: '<b>Practice 1: prove it.</b> A new customer, Meera, opens an account with 300 rupees. Write steps that show B cannot see her until A commits:<ol><li>A opens a transaction and inserts Meera.</li><li>B reads accounts (no Meera yet).</li><li>A commits.</li><li>B reads accounts again (Meera is there).</li></ol>',
            hints: ["A: BEGIN;\nA: INSERT INTO accounts (name, balance_rupees) VALUES ('Meera', 300);\nB: SELECT * FROM accounts;\nA: ______;\nB: SELECT * FROM accounts;"],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'Meera is inserted inside a transaction in window A', test: r => { const k = idx(r.steps, s => verb(s) === 'INSERT' && /meera/i.test(s.sql)); return k >= 0 && r.steps[k].who === 'A' && !!txOf(r.steps, k); }, why: r => idx(r.steps, s => verb(s) === 'INSERT') < 0 ? 'Insert Meera: INSERT INTO accounts (name, balance_rupees) VALUES (\'Meera\', 300);' : 'The INSERT must be in window A, after A: BEGIN;' },
              { label: 'B reads before the COMMIT and does not see Meera', test: r => { const c = idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return c >= 0 && r.steps.some((s, k) => k < c && s.who === 'B' && verb(s) === 'SELECT' && bal(s.rows, 'Asha') != null && bal(s.rows, 'Meera') == null); }, why: () => 'Put a B: SELECT * FROM accounts; between the INSERT and the COMMIT.' },
              { label: 'B reads after the COMMIT and sees Meera with 300', test: r => { const c = idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return c >= 0 && r.steps.some((s, k) => k > c && s.who === 'B' && verb(s) === 'SELECT' && bal(s.rows, 'Meera') === 300); }, why: r => idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT') < 0 ? 'A must COMMIT before B can ever see Meera.' : 'Put another B: SELECT * FROM accounts; after the COMMIT.' },
            ],
          },

          { t: 'say', html: '<b>Idea 2: writes wait for writes.</b> When A changes a row inside a draft, A holds a <b>lock</b> on that row until it commits or rolls back.<br>If B tries to change the same row, B <b>waits</b>. When A commits, B\'s change runs on A\'s saved value.' },
          {
            t: 'predict', xp: 10, answer: '400',
            ask: 'B\'s UPDATE waits for A. A commits. Then B\'s UPDATE runs. What is Asha\'s balance at the end? Type a number of rupees.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nB: UPDATE accounts SET balance_rupees = balance_rupees - 100 WHERE name = 'Asha';     -- waits\nA: COMMIT;",
            why: 'B waited, so it subtracted from the saved 500, not the old 1000:<pre>start:              1000\nA − 500, COMMIT →    500\nB − 100        →     400</pre>No change is lost.',
          },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", "B: UPDATE accounts SET balance_rupees = balance_rupees - 100 WHERE name = 'Asha';", 'A: COMMIT;', 'B: SELECT * FROM accounts;'], html: 'Run it. Step 3 will say it had to wait.', after: 'Step 3 waited for A\'s lock and finished after step 4. Asha ends at 400. The lock is what keeps two writers from overwriting each other.' },
          { t: 'sqlsession', experiment: true, setup: ACCOUNTS, steps: ['A: BEGIN;', "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", "B: UPDATE accounts SET balance_rupees = balance_rupees - 100 WHERE name = 'Asha';"], html: '<b>Break it:</b> A never commits. This run takes about 5 seconds.', after: 'B waits, then gives up: <code class="bad">ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction</code>. The lab makes MySQL give up after 4 seconds; MySQL\'s own default is 50. A transaction left open makes everyone who needs its rows wait: keep transactions short.' },

          { t: 'say', html: '<b>Idea 3: inside a transaction, your reads stay the same.</b> When B opens a transaction and reads, MySQL gives B a <b>snapshot</b>: a photo of the saved data at that moment.<br>Changes others save later don\'t show up in B\'s reads until B\'s transaction ends. (This is MySQL\'s usual setting, REPEATABLE READ.)' },
          {
            t: 'predict', xp: 10, answer: '1000\n500',
            ask: 'Steps 4 and 6 both read Asha. What do they show? Type two numbers, one per line: step 4, then step 6.',
            code: "1 B: BEGIN;\n2 B: SELECT * FROM accounts WHERE name = 'Asha';      -- 1000\n3 A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';   -- saved at once\n4 B: SELECT * FROM accounts WHERE name = 'Asha';\n5 B: COMMIT;\n6 B: SELECT * FROM accounts WHERE name = 'Asha';",
            why: '<pre>step 2: B\'s snapshot is taken: Asha 1000\nstep 3: A saves Asha 500\nstep 4: B still reads its snapshot → 1000\nstep 5: B\'s transaction ends\nstep 6: a fresh read → 500</pre>',
          },
          { t: 'sqlsession', setup: ACCOUNTS, steps: ['B: BEGIN;', "B: SELECT * FROM accounts WHERE name = 'Asha';", "A: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';", "B: SELECT * FROM accounts WHERE name = 'Asha';", 'B: COMMIT;', "B: SELECT * FROM accounts WHERE name = 'Asha';"], html: 'Run it and check.', after: 'Step 4 shows 1000 although 500 is already saved. A report that adds up many rows inside one transaction gets numbers that all belong to the same moment. That is the point of the snapshot.' },

          { t: 'say', html: '<b>The real bug.</b> A bank approves a new card type, Gold, for its Pune branch.<br>The approval job opens a transaction and writes the approval. Then a safety check asks: "is Gold approved for Pune?"<br>The check ran on a <b>different connection</b>.' },
          {
            t: 'predict', xp: 10, answer: '0',
            ask: 'How many rows does the check in window B find? Type a number.',
            code: "A: BEGIN;\nA: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');\nB: SELECT * FROM approvals WHERE card_type = 'Gold';",
            why: 'The Gold row is only in A\'s draft. B sees what is saved:<pre>saved:      Pune Silver\nA\'s draft:  Pune Silver, Pune Gold\nB finds:    0 rows</pre>',
          },
          { t: 'say', html: '<div data-widget="txntimeline" data-scenario="wrong" data-key="job2-wrong"></div>' },
          { t: 'sqlsession', setup: APPROVALS, steps: ['A: BEGIN;', "A: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');", "B: SELECT * FROM approvals WHERE card_type = 'Gold';", 'A: ROLLBACK;', 'B: SELECT * FROM approvals;'], html: 'Run the bug. Step 3 is the check; step 4 is the job giving up because the check said no.', after: 'The check found nothing, the job rolled back, and the approval just written was lost. Every new card-type approval failed this way, and the logs showed the row being written, which made it very confusing to find.' },
          { t: 'say', html: '<b>The fix: one job, one connection.</b> Every step of the job, the check included, runs in the same transaction.<br>In window terms: the check moves from B to A. Then it sees A\'s own draft.' },
          { t: 'sqlsession', setup: APPROVALS, steps: ['A: BEGIN;', "A: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');", "A: SELECT * FROM approvals WHERE card_type = 'Gold';", 'A: COMMIT;', 'B: SELECT * FROM approvals;'], html: 'Run the fix.', after: 'Step 3 finds the Gold row, so the job commits. Step 5: B sees both rows, because they are saved.' },
          {
            t: 'deeper', title: 'how a program ends up using "window B" by mistake',
            html: `<p>A program does not type "A:" or "B:". It keeps a few connections open, a <b>pool</b>, and each query borrows one. Inside a transaction the program holds one connection and must hand it to every function that is part of the job.</p>
<p>The bug: the function that wrote the approval received the transaction's connection; the check was written to borrow "any connection from the pool". A different connection is window B.</p>
<p>The habit that prevents it: a function that is part of a job takes the job's connection (or transaction) as a parameter, and never borrows its own.</p>`,
          },
          {
            t: 'sqlsessiontask', practice: true, setup: APPROVALS,
            start: "A: BEGIN;\nA: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');\nB: SELECT * FROM approvals WHERE card_type = 'Gold';\nA: ROLLBACK;",
            verify: { final: "SELECT branch, card_type FROM approvals WHERE card_type = 'Gold'" },
            html: '<b>Practice 2: fix the job yourself.</b> The broken job is written for you. Change it so the check runs in the job\'s own transaction, finds the Gold row, and the job saves the approval.',
            hints: ['Change the window of the check from B to A, and the ROLLBACK to COMMIT (the check now finds the row, so the job goes ahead).'],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'The check (the SELECT for Gold) runs in window A, inside the transaction, after the INSERT', test: r => { const ins = idx(r.steps, s => verb(s) === 'INSERT'); const k = idx(r.steps, (s, i) => i > ins && verb(s) === 'SELECT' && /gold/i.test(s.sql)); return ins >= 0 && k > ins && r.steps[k].who === 'A' && !!txOf(r.steps, k) && txOf(r.steps, k).begin === txOf(r.steps, ins).begin; }, why: () => 'Move the check to window A: A: SELECT * FROM approvals WHERE card_type = \'Gold\'; between the INSERT and the end of the transaction.' },
              { label: 'The check finds the Gold row (1 row)', test: r => r.steps.some(s => s.who === 'A' && verb(s) === 'SELECT' && /gold/i.test(s.sql) && s.rows.length === 1), why: () => 'The check finds Gold only if it runs in A, after the INSERT, before the transaction ends.' },
              { label: 'The approval is saved', test: r => (rowsOf(r, 'final') || []).length === 1, why: () => 'The job must end with COMMIT so the approval is saved.' },
            ],
          },

          {
            t: 'sqlsessiontask', xp: 60, setup: APPROVALS, start: '',
            verify: { final: 'SELECT branch, card_type FROM approvals ORDER BY card_type' },
            html: `<b>The whole job, and who sees what.</b> Approve Gold for Pune correctly, and show the two views:
<ol>
<li>A: open the transaction and write the approval (Pune, Gold).</li>
<li>A: the safety check finds it.</li>
<li>B: another connection looks for Gold before the job is saved, and finds nothing.</li>
<li>A: the job saves.</li>
<li>B: looks again, and finds Gold.</li>
</ol>`,
            hints: [
              "Steps 2, 3 and 5 are the same query, SELECT * FROM approvals WHERE card_type = 'Gold'; in different windows and places.",
              "A: BEGIN;\nA: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');\nA: SELECT * FROM approvals WHERE card_type = 'Gold';\nB: ______;\nA: ______;\nB: ______;",
            ],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'A writes Pune, Gold inside a transaction', test: r => { const k = idx(r.steps, s => verb(s) === 'INSERT' && /gold/i.test(s.sql) && /pune/i.test(s.sql)); return k >= 0 && r.steps[k].who === 'A' && !!txOf(r.steps, k); }, why: () => 'A: BEGIN; then A: INSERT INTO approvals (branch, card_type) VALUES (\'Pune\', \'Gold\');' },
              { label: 'A\'s check finds the Gold row before the COMMIT', test: r => { const ins = idx(r.steps, s => verb(s) === 'INSERT'); const c = idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return ins >= 0 && c > ins && r.steps.some((s, k) => k > ins && k < c && s.who === 'A' && verb(s) === 'SELECT' && s.rows.some(x => x.includes('Gold'))); }, why: () => 'Between the INSERT and the COMMIT, A runs the check and finds Gold.' },
              { label: 'B looks for Gold before the COMMIT and finds nothing', test: r => { const ins = idx(r.steps, s => verb(s) === 'INSERT'); const c = idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return ins >= 0 && c > ins && r.steps.some((s, k) => k > ins && k < c && s.who === 'B' && verb(s) === 'SELECT' && /gold/i.test(s.sql) && s.rows.length === 0); }, why: () => 'Between the INSERT and the COMMIT, B runs the same Gold query and gets no rows.' },
              { label: 'B looks again after the COMMIT and finds Gold', test: r => { const c = idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT'); return c >= 0 && r.steps.some((s, k) => k > c && s.who === 'B' && verb(s) === 'SELECT' && s.rows.some(x => x.includes('Gold'))); }, why: r => idx(r.steps, s => s.who === 'A' && verb(s) === 'COMMIT') < 0 ? 'A must COMMIT before B can see Gold.' : 'After the COMMIT, B runs the Gold query again.' },
              { label: 'Saved: Pune has Gold and Silver', test: r => { const f = rowsOf(r, 'final') || []; return f.length === 2 && f.some(x => x[1] === 'Gold') && f.some(x => x[1] === 'Silver'); }, why: r => 'Saved approvals: ' + ((rowsOf(r, 'final') || []).map(x => x.join(' ')).join('; ') || 'none') + '.' },
            ],
          },
          {
            t: 'deeper', title: 'isolation levels, for interviews',
            html: `<p>How much one transaction sees of another is the <b>isolation level</b>. MySQL's default is <b>REPEATABLE READ</b> (the snapshot you saw). Others: <b>READ COMMITTED</b> (every read sees the latest saved data; PostgreSQL and Oracle, two other database programs, use it by default), <b>READ UNCOMMITTED</b> (can see other drafts: a "dirty read"), <b>SERIALIZABLE</b> (as if transactions ran one after another).</p>
<p>The classic interview list of what can go wrong: <b>dirty read</b> (seeing a draft that is later rolled back), <b>non-repeatable read</b> (the same row reads differently twice in one transaction), <b>phantom</b> (new rows appear in a repeated query), and <b>lost update</b> (two writers, one change disappears: the next lesson).</p>`,
          },
          { t: 'say', html: '<b>Next in this track:</b> the card handed out twice. Two apps check, then act, at the same moment.' },
        ],
      },

      // =====================================================================================================
      {
        id: 'job1m3',
        needs: ['job1m2'],
        title: 'The card handed out twice',
        skill: 'check-then-act races, guarded UPDATE, SELECT … FOR UPDATE, a PRIMARY KEY as the last guard',
        blocks: [
          { t: 'say', html: '<b>From the job.</b> A real bug from a card system: two people were told "this card is yours" for the same card.<br>First, two questions from Transactions 2.' },
          {
            t: 'predict', xp: 10, answer: '400',
            ask: 'B\'s UPDATE waits for A\'s lock. A commits. What is Asha\'s balance at the end? Type a number of rupees.',
            code: "A: BEGIN;\nA: UPDATE accounts SET balance_rupees = balance_rupees - 500 WHERE name = 'Asha';\nB: UPDATE accounts SET balance_rupees = balance_rupees - 100 WHERE name = 'Asha';     -- waits\nA: COMMIT;",
            why: '<pre>1000 − 500 = 500   (A, saved)\n 500 − 100 = 400   (B, after waiting)</pre>',
          },
          {
            t: 'predict', xp: 10, answer: '0',
            ask: 'A has not committed. How many rows does B find? Type a number.',
            code: "A: BEGIN;\nA: INSERT INTO approvals (branch, card_type) VALUES ('Pune', 'Gold');\nB: SELECT * FROM approvals WHERE card_type = 'Gold';",
            why: 'A draft is private: B sees only what is saved.',
          },

          { t: 'say', html: '<b>The table.</b> A stock of blank cards: <code>status</code> is <code>\'free\'</code> or <code>\'taken\'</code>, and <code>owner</code> stays NULL until someone gets the card.<br>One new piece: <code>SET a = x, b = y</code> changes two columns in one UPDATE, with a comma between them.' },
          { t: 'sqlsession', setup: CARDS, editable: true, steps: ['A: SELECT * FROM cards;', "A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", "A: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;", 'A: SELECT * FROM cards;'], html: 'One app, one person: find the first free card (ORDER BY id and LIMIT 1, from SQL lesson 2: without ORDER BY, "first" is not guaranteed), then take it. Run it.', after: 'Step 2 answers 7. Step 3 changes 1 row. This shape is called <b>check, then act</b>: first look, then write.' },

          { t: 'say', html: '<b>The race.</b> Asha and Ravi press "give me a card" at the same moment: two apps, two connections, A and B.<br>Both look before either one writes.' },
          {
            t: 'predict', xp: 10, answer: '7',
            ask: 'B\'s SELECT runs after A\'s SELECT but before A\'s UPDATE. Which card id does B get? Type a number.',
            code: "A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;\nB: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;",
            why: 'Nothing is taken yet, so 7 is still the first free card for B too:<pre>A reads:  7\nB reads:  7    ← same card</pre>',
          },
          { t: 'say', html: '<div data-widget="txntimeline" data-scenario="race" data-key="job3-race"></div>' },
          { t: 'sqlsession', setup: CARDS, steps: ["A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", "B: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", "A: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;", "B: UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7;", 'A: SELECT * FROM cards;'], html: 'Run the race.', after: 'Both UPDATEs said <b>1 row changed</b> and no error, so both apps said "card 7 is yours". The table says Ravi: Asha\'s record was silently overwritten, and card 8 is still free. This is a <b>lost update</b>. In the real system, one button sent several card requests at once, and the same card landed twice.' },
          { t: 'say', html: '<b>Why it happens.</b> The check (is 7 free?) and the act (take 7) are two separate steps, and the world can change in between.<br>Whatever the check said may already be out of date when the act runs. There are three ways to close the gap.' },

          { t: 'say', html: '<b>Fix 1: put the check inside the write.</b> Add the condition to the UPDATE\'s WHERE with AND (SQL lesson 2): the row is changed only if it is still free.<pre>UPDATE cards SET status = \'taken\', owner = \'Ravi\'\nWHERE id = 7 AND status = \'free\';\n\ncard 7 already taken:  id = 7 true,  status = \'free\' false  →  0 rows changed</pre>' },
          {
            t: 'predict', xp: 10, answer: '0',
            ask: 'A has already taken card 7 with a guarded UPDATE. Now B runs its guarded UPDATE on card 7. How many rows does it change? Type a number.',
            code: "A: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7 AND status = 'free';\nB: UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7 AND status = 'free';",
            why: '<pre>id = 7           → true\nstatus = \'free\'  → false (A took it)\nboth true?       → no: 0 rows changed</pre>',
          },
          { t: 'say', html: '<div data-widget="txntimeline" data-scenario="guard" data-key="job3-guard"></div>' },
          { t: 'sqlsession', setup: CARDS, steps: ["A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", "B: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1;", "A: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7 AND status = 'free';", "B: UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7 AND status = 'free';", 'B: SELECT * FROM cards;'], html: 'Run it. Watch the rows changed in step 4.', after: 'Step 4 changes <b>0 rows</b>. That 0 is the app\'s signal: "I lost the race". The app must read it and try the next free card. Doing that is your practice.' },
          {
            t: 'sqlsessiontask', practice: true, setup: CARDS, start: '',
            verify: { final: 'SELECT id, status, owner FROM cards ORDER BY id' },
            html: `<b>Practice 1: lose the race, then win.</b> Asha's app is window A, Ravi's is window B. In this order:
<ol>
<li>A reads the first free card.</li>
<li>B reads the first free card (both get 7).</li>
<li>A takes card 7 with a guarded UPDATE.</li>
<li>B tries card 7 with a guarded UPDATE (0 rows).</li>
<li>B reads the first free card again.</li>
<li>B takes that card with a guarded UPDATE.</li>
</ol>`,
            hints: ["Steps 1, 2 and 5 are the same SELECT. Steps 3, 4 and 6 are guarded UPDATEs: WHERE id = ... AND status = 'free'."],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'Both apps read a free card before either one takes one', test: r => { const u = idx(r.steps, s => verb(s) === 'UPDATE'), a = idx(r.steps, s => s.who === 'A' && verb(s) === 'SELECT'), b = idx(r.steps, s => s.who === 'B' && verb(s) === 'SELECT'); return u >= 0 && a >= 0 && b >= 0 && a < u && b < u; }, why: () => 'Steps 1 and 2: a SELECT in A and a SELECT in B, both before the first UPDATE.' },
              { label: "Every UPDATE is guarded with AND status = 'free'", test: r => { const u = r.steps.filter(s => verb(s) === 'UPDATE'); return u.length >= 3 && u.every(s => /\bwhere\b[\s\S]*\bstatus\s*=\s*'free'/i.test(s.sql)); }, why: r => r.steps.filter(s => verb(s) === 'UPDATE').length < 3 ? 'Three UPDATEs: A takes 7, B tries 7, B takes the next card.' : "Add AND status = 'free' to every UPDATE's WHERE." },
              { label: "B's first try on card 7 changes 0 rows", test: r => { const b = r.steps.find(s => s.who === 'B' && verb(s) === 'UPDATE'); return !!b && b.ok && b.affected === 0 && /\bid\s*=\s*7\b/.test(b.sql); }, why: r => { const b = r.steps.find(s => s.who === 'B' && verb(s) === 'UPDATE'); return !b ? 'Step 4 is an UPDATE in B on card 7.' : !/\bid\s*=\s*7\b/.test(b.sql) ? "B's first UPDATE tries card 7." : "B's first UPDATE changed " + b.affected + ' row(s): it must come after A\'s and be guarded.'; } },
              { label: "At the end card 7 is Asha's and card 8 is Ravi's", test: r => { const f = rowsOf(r, 'final'); return ownerOf(f, 7) === 'Asha' && ownerOf(f, 8) === 'Ravi'; }, why: r => { const f = rowsOf(r, 'final'); const o7 = ownerOf(f, 7), o8 = ownerOf(f, 8); if (o8 == null && o7 === 'Asha') return 'Card 8 is still free: after losing 7, B reads again and takes what it finds.'; return 'Card 7: ' + (o7 == null ? 'nobody' : o7) + ', card 8: ' + (o8 == null ? 'nobody' : o8) + '. Asha (A) should have 7, Ravi (B) 8.'; } },
            ],
          },

          { t: 'say', html: '<b>Fix 2: lock the row while you decide.</b> Inside a transaction, <code>SELECT ... FOR UPDATE</code> reads the rows and locks them, like an UPDATE does (Transactions 2).<br>Another app that wants to lock the same rows waits until the first one commits. Then it reads the saved data.' },
          {
            t: 'predict', xp: 10, answer: '8',
            ask: 'B\'s locking SELECT waits for A. A takes card 7 and commits. Then B\'s SELECT finishes. Which card id does B get? Type a number.',
            code: "A: BEGIN;\nA: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;\nB: BEGIN;\nB: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;   -- waits\nA: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;\nA: COMMIT;",
            why: 'B\'s read runs after A\'s COMMIT, on the saved table, where 7 is taken:<pre>card 7:  taken (Asha)\ncard 8:  free   ← first free card for B</pre>A locking read always reads the latest saved data, not the snapshot.',
          },
          { t: 'say', html: '<div data-widget="txntimeline" data-scenario="lock" data-key="job3-lock"></div>' },
          { t: 'sqlsession', setup: CARDS, steps: ['A: BEGIN;', "A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;", 'B: BEGIN;', "B: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;", "A: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;", 'A: COMMIT;', "B: UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 8;", 'B: COMMIT;', 'B: SELECT * FROM cards;'], html: 'Run it. Step 4 will say it had to wait.', after: 'Step 4 waited for A\'s lock and finished after step 6 with card <b>8</b>. Nobody had to try twice: B simply waited its turn.' },
          { t: 'sqlsession', experiment: true, setup: CARDS, steps: ['A: BEGIN;', "A: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;", 'B: BEGIN;', "B: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;"], html: '<b>Break it:</b> A takes the lock and never commits. This run takes about 5 seconds.', after: 'Same as in Transactions 2: B waits, then <code class="bad">ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction</code>. Locks are only safe in short transactions.' },
          {
            t: 'sqlsessiontask', practice: true, setup: CARDS, start: '',
            verify: { final: 'SELECT id, status, owner FROM cards ORDER BY id' },
            html: '<b>Practice 2: take turns with a lock.</b> Write the race with Fix 2: each app opens a transaction, locks the first free card with FOR UPDATE, takes it, and commits. Put B\'s locking SELECT <b>before</b> A\'s COMMIT, so B really has to wait.',
            hints: ["A: BEGIN;\nA: SELECT ... FOR UPDATE;\nB: BEGIN;\nB: SELECT ... FOR UPDATE;\nA: UPDATE ... card 7 ...;\nA: COMMIT;\nB: UPDATE ... card 8 ...;\nB: COMMIT;"],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'Both apps lock with SELECT ... FOR UPDATE inside a transaction', test: r => ['A', 'B'].every(w => r.steps.some((s, k) => s.who === w && verb(s) === 'SELECT' && /for\s+update/i.test(s.sql) && txOf(r.steps, k))), why: () => 'In each window: BEGIN, then SELECT id FROM cards WHERE status = \'free\' ORDER BY id LIMIT 1 FOR UPDATE;' },
              { label: 'B\'s locking SELECT had to wait for A (the race really happened)', test: r => r.steps.some(s => s.who === 'B' && /for\s+update/i.test(s.sql) && s.waited), why: () => 'Put B\'s locking SELECT before A\'s COMMIT. Then the lab shows "Had to wait" on it.' },
              { label: 'Both transactions end with COMMIT', test: r => ['A', 'B'].every(w => { const k = idx(r.steps, s => s.who === w && verb(s) === 'UPDATE'); const t = k >= 0 ? txOf(r.steps, k) : null; return !!t && t.how === 'COMMIT'; }), why: () => 'Each app: BEGIN … UPDATE … COMMIT, with the UPDATE inside the transaction.' },
              { label: "At the end card 7 is Asha's and card 8 is Ravi's", test: r => { const f = rowsOf(r, 'final'); return ownerOf(f, 7) === 'Asha' && ownerOf(f, 8) === 'Ravi'; }, why: r => { const f = rowsOf(r, 'final'); return 'Card 7: ' + (ownerOf(f, 7) || 'nobody') + ', card 8: ' + (ownerOf(f, 8) || 'nobody') + '. B\'s locking read found card 8, so B takes 8.'; } },
            ],
          },

          { t: 'say', html: '<b>Fix 3: let a key refuse the second one.</b> Record each hand-out in a table whose PRIMARY KEY is the card id (SQL lesson 3). A card can be in it only once.<br>Whatever the apps got wrong, the database refuses the second record with ERROR 1062, and the app tries another card.' },
          {
            t: 'predict', xp: 10, answer: '1062',
            ask: 'card_id is the PRIMARY KEY of assignments. Which error number does B get? Type the number.',
            code: "A: INSERT INTO assignments (card_id, person) VALUES (7, 'Asha');\nB: INSERT INTO assignments (card_id, person) VALUES (7, 'Ravi');",
            why: 'Card 7 is already in the table: <code class="bad">ERROR 1062 (23000): Duplicate entry \'7\' for key \'assignments.PRIMARY\'</code>',
          },
          { t: 'sqlsession', setup: ASSIGN, steps: ["A: INSERT INTO assignments (card_id, person) VALUES (7, 'Asha');", "B: INSERT INTO assignments (card_id, person) VALUES (7, 'Ravi');", 'B: SELECT * FROM assignments;'], html: 'Run it.', after: 'B\'s INSERT is refused; the table keeps one row, card 7 for Asha. A key is the last line of defence: even code with a race in it cannot save the double hand-out.' },
          {
            t: 'deeper', title: 'which fix, when, and the double payment',
            html: `<p><b>Guarded UPDATE</b> (optimistic locking): no lock, very fast; the app must read "rows changed" and retry on 0. Good when collisions are rare.</p>
<p><b>SELECT … FOR UPDATE</b> (pessimistic locking): the second app waits instead of failing; keep the transaction short, because everyone else waits too. Good when people often want the same rows.</p>
<p><b>A key</b> (PRIMARY KEY or UNIQUE): the database itself refuses a duplicate. Use it as well as one of the other two, never instead of thinking about the race.</p>
<p><b>In payments</b> the same bug is the <b>double payment</b>: two requests both check "is this order unpaid?" and both charge the card. The usual cure is an <b>idempotency key</b>: the client sends a unique id with the payment, and the server stores it under a UNIQUE key, so a second request with the same id is recognised and refused.</p>`,
          },

          {
            t: 'sqlsessiontask', xp: 60, setup: CARDS3, start: '',
            verify: { cards: 'SELECT id, status, owner FROM cards ORDER BY id', assignments: 'SELECT card_id, person FROM assignments ORDER BY card_id' },
            html: `<b>Hand out cards safely.</b> Cards 7, 8 and 9 are free, and <code>assignments</code> (card_id is the PRIMARY KEY) is empty. Asha's app is window A, Ravi's is window B. Each app, in one transaction:
<ul>
<li>locks the first free card (FOR UPDATE),</li>
<li>marks it taken with the person's name,</li>
<li>records it in <code>assignments</code>,</li>
<li>and commits.</li>
</ul>
Put B's locking SELECT before A's COMMIT, so the race really happens. At the end Asha has card 7 and Ravi card 8, in both tables.`,
            hints: [
              'Each app: BEGIN; SELECT ... FOR UPDATE; UPDATE cards ...; INSERT INTO assignments ...; COMMIT;',
              "A: BEGIN;\nA: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;\nB: BEGIN;\nB: SELECT id FROM cards WHERE status = 'free' ORDER BY id LIMIT 1 FOR UPDATE;\nA: UPDATE cards SET status = 'taken', owner = 'Asha' WHERE id = 7;\nA: INSERT INTO assignments (card_id, person) VALUES (7, 'Asha');\nA: COMMIT;\nB: ______;\nB: ______;\nB: COMMIT;",
            ],
            checks: [
              { label: 'Every step runs without an error', test: stepsOk, why: stepsWhy },
              { label: 'Each app locks its card with SELECT ... FOR UPDATE inside a transaction', test: r => ['A', 'B'].every(w => r.steps.some((s, k) => s.who === w && verb(s) === 'SELECT' && /for\s+update/i.test(s.sql) && txOf(r.steps, k))), why: () => 'In each window: BEGIN, then the locking SELECT.' },
              { label: 'B\'s locking SELECT had to wait for A', test: r => r.steps.some(s => s.who === 'B' && /for\s+update/i.test(s.sql) && s.waited), why: () => 'Put B\'s locking SELECT before A\'s COMMIT, so it has to wait.' },
              {
                label: 'In each app, the UPDATE and the INSERT are in the same transaction as its lock, and it commits',
                test: r => ['A', 'B'].every(w => {
                  const l = idx(r.steps, s => s.who === w && /for\s+update/i.test(s.sql)), u = idx(r.steps, s => s.who === w && verb(s) === 'UPDATE'), i = idx(r.steps, s => s.who === w && verb(s) === 'INSERT');
                  if (l < 0 || u < 0 || i < 0) return false;
                  const t = txOf(r.steps, l);
                  return !!t && t.how === 'COMMIT' && [u, i].every(k => { const x = txOf(r.steps, k); return x && x.begin === t.begin; });
                }),
                why: () => 'Each app: BEGIN, the locking SELECT, the UPDATE, the INSERT into assignments, then COMMIT, all in that window.',
              },
              { label: "Saved in cards: 7 is Asha's, 8 is Ravi's, 9 still free", test: r => { const f = rowsOf(r, 'cards'); return ownerOf(f, 7) === 'Asha' && ownerOf(f, 8) === 'Ravi' && ownerOf(f, 9) === null; }, why: r => { const f = rowsOf(r, 'cards') || []; return 'Saved cards: ' + f.map(x => x[0] + ' ' + x[1] + ' ' + (x[2] == null ? '-' : x[2])).join('; ') + '.'; } },
              { label: 'Saved in assignments: exactly 7 Asha and 8 Ravi', test: r => { const a = rowsOf(r, 'assignments') || []; return a.length === 2 && a[0][0] === '7' && a[0][1] === 'Asha' && a[1][0] === '8' && a[1][1] === 'Ravi'; }, why: r => 'Saved assignments: ' + ((rowsOf(r, 'assignments') || []).map(x => x.join(' ')).join('; ') || 'none') + '.' },
            ],
          },
          { t: 'say', html: '<b>Done with this story.</b> Next in your path: SQL lesson 4, joining tables. The interview words from these three lessons are in their concept notes, for revision on the phone.' },
        ],
      },
    ],
  };

  if (!window.WEEKS) window.WEEKS = window.WEEK ? [window.WEEK] : [];
  window.WEEKS.push(JOB);
})();
