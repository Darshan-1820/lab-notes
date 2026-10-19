// Concept notes for the "From the job" track (missions/job.js), one per lesson: kind 'concept', the lesson's
// mission id, order 201+ (after the SQL notes). Made-up bank and names only, so they are fine for the public
// phone site. The diagrams come from app/web/widgets-job.js. Every statement and MySQL message below was run
// through the lab's two-window runner on the lab-mysql container (MySQL 8.4.11, REPEATABLE READ) on 2026-10-20.

window.NOTES = window.NOTES || [];
window.NOTES.push(
  {
    id: 'concept-job-tx1',
    kind: 'concept', lesson: 'job1m1', order: 201,
    date: '2026-10-20',
    title: 'Transactions 1: all or nothing',
    from: 'Goes with From the job, Transactions 1',
    html: `
<h3>The idea</h3>
<p>Some jobs are several changes that only make sense together: a transfer takes from one account and gives to another. A <b>transaction</b> groups them so the database keeps <b>all of them or none of them</b>, even if the app crashes in the middle.</p>
<pre>without a transaction, crash after step 1:
Asha  1000 − 500 = 500    saved
Ravi  1000                (step 2 never ran)
total 1500                500 rupees gone</pre>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Statement</th><th>What it does</th></tr>
<tr><td><code>BEGIN;</code> (or <code>START TRANSACTION;</code>)</td><td>Opens a draft. Changes after it go into the draft.</td></tr>
<tr><td><code>COMMIT;</code></td><td>Saves the whole draft at once. Everyone can see it now.</td></tr>
<tr><td><code>ROLLBACK;</code></td><td>Throws the whole draft away.</td></tr>
<tr><td><code>SET balance_rupees = balance_rupees - 500</code></td><td>The new value is worked out from the old one, row by row.</td></tr>
</table></div>

<h3>A transfer, step by step</h3>
<div data-widget="txntimeline" data-scenario="draft" data-key="note-job-tx1"></div>
<pre>BEGIN;
UPDATE accounts SET balance_rupees = balance_rupees - 300 WHERE name = 'Asha';
UPDATE accounts SET balance_rupees = balance_rupees + 300 WHERE name = 'Ravi';
COMMIT;

Asha 1000 − 300 = 700
Ravi 1000 + 300 = 1300
total 700 + 1300 = 2000</pre>

<h3>Three rules that surprise people</h3>
<ul>
<li><b>Autocommit.</b> Without BEGIN, every statement is its own tiny transaction and is saved at once. A ROLLBACK then has nothing to undo, and says nothing about it.</li>
<li><b>An error does not end the transaction.</b> MySQL refuses the failing statement only. The draft stays open with the steps that worked; a COMMIT now would save half the job. After an error: ROLLBACK.</li>
<li><b>Closing without COMMIT is a ROLLBACK.</b> If the connection closes (or the app crashes) before COMMIT, the draft is thrown away.</li>
</ul>

<h3>Several tables in one transaction</h3>
<pre>BEGIN;
INSERT INTO transfers (id, from_name, to_name, amount_rupees) VALUES (1, 'Asha', 'Ravi', 300);
UPDATE accounts ... Asha − 300;
UPDATE accounts ... Ravi + 300;
COMMIT;                      all three saved, or none</pre>
<p>A second transfer with id 1 is refused: <code class="bad">ERROR 1062 (23000): Duplicate entry '1' for key 'transfers.PRIMARY'</code>. Payment systems use this on purpose: if the id is already there, the job was already done, so roll back instead of paying twice.</p>

<h3>Common mistakes</h3>
<ul>
<li>Committing after an error: <code class="bad">ERROR 1054 (42S22): Unknown column 'balance' in 'field list'</code> on Ravi's step, then COMMIT, saves Asha's half.</li>
<li>Forgetting BEGIN: each UPDATE is saved on its own, so a crash between them loses money.</li>
<li>Forgetting COMMIT: it "worked" in your own window (you see your draft), but nothing is saved.</li>
</ul>

<h3>Interview words</h3>
<p><b>ACID</b>: Atomicity (all or nothing), Consistency (the rules hold before and after), Isolation (others don't see your draft), Durability (after COMMIT it survives a crash).</p>

<h3>Check yourself</h3>
<details><summary>No BEGIN: <code>UPDATE ... Asha − 500; ROLLBACK; SELECT ...</code> What is Asha's balance?</summary><pre>autocommit saved the UPDATE at once: 1000 − 500 = 500
ROLLBACK found no draft: still 500</pre></details>
<details><summary>Inside BEGIN, step 2 works and step 3 fails. What should the app do next, and why?</summary><p>ROLLBACK. The error ended only step 3; step 2 is still in the draft, and COMMIT would save it without step 3.</p></details>
<details><summary>A shows Asha at 700 inside its transaction, then the window closes without COMMIT. What is saved?</summary><p>Asha 1000. Closing without COMMIT throws the draft away; A only ever saw its own draft.</p></details>
<details><summary>Why record a transfer in a table whose id is the PRIMARY KEY?</summary><p>So the same transfer can't be done twice: the second INSERT with the same id fails with 1062, and the app rolls back.</p></details>`,
  },
  {
    id: 'concept-job-tx2',
    kind: 'concept', lesson: 'job1m2', order: 202,
    date: '2026-10-20',
    title: 'Transactions 2: what others see',
    from: 'Goes with From the job, Transactions 2',
    html: `
<h3>The idea</h3>
<p>Many connections use the database at once. While a transaction is open, its changes are a private <b>draft</b>: other connections see only what is saved (committed). This is <b>isolation</b>, the I in ACID.</p>
<pre>A: BEGIN;  A: Asha − 500
A reads:  Asha 500    (its own draft)
B reads:  Asha 1000   (what is saved)
A: COMMIT;
B reads:  Asha 500</pre>

<h3>Four facts about two connections</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Situation</th><th>What happens</th></tr>
<tr><td>B reads while A's draft is open</td><td>B sees the saved data, not A's draft.</td></tr>
<tr><td>B changes a row A has changed in its draft</td><td>B waits for A's lock. After A commits, B's change runs on A's saved value: 1000 − 500 − 100 = 400.</td></tr>
<tr><td>A never commits</td><td>B gives up: <code class="bad">ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction</code> (the lab waits 4 s; MySQL's default is 50 s).</td></tr>
<tr><td>B reads twice inside its own transaction while A saves a change</td><td>Both of B's reads show the same value: B reads a <b>snapshot</b> (REPEATABLE READ, MySQL's default). A fresh read after B commits shows the change.</td></tr>
</table></div>

<h3>The real bug: the check on another connection</h3>
<div data-widget="txntimeline" data-scenario="wrong" data-key="note-job-tx2"></div>
<p>An approval job wrote "Gold is approved for Pune" inside its transaction, then a safety check asked "is Gold approved?" on a <b>different connection</b>. The check saw only saved data, found nothing, and the job rolled back. Every approval of a new card type failed, although the row was written each time.</p>
<p><b>The fix:</b> one job, one connection. Every step of the job, the check included, runs in the job's own transaction. In code: functions that are part of a job take the job's connection as a parameter instead of borrowing a new one from the pool.</p>

<h3>Isolation levels</h3>
<ul>
<li><b>READ UNCOMMITTED</b>: may see other drafts (dirty reads). Almost never used.</li>
<li><b>READ COMMITTED</b>: each read sees the latest saved data (the default in PostgreSQL and Oracle, two other database programs).</li>
<li><b>REPEATABLE READ</b>: reads inside one transaction come from one snapshot (MySQL default).</li>
<li><b>SERIALIZABLE</b>: as if transactions ran one after another.</li>
</ul>

<h3>Check yourself</h3>
<details><summary>A has inserted Meera inside BEGIN and not committed. B runs <code>SELECT * FROM accounts</code>. Is Meera there?</summary><p>No. Meera is only in A's draft. After A commits, B's next read shows her.</p></details>
<details><summary>A's draft has Asha − 500. B runs Asha − 100 and waits. A commits. What is Asha's balance?</summary><pre>1000 − 500 = 500  (A, saved)
 500 − 100 = 400  (B, after waiting)</pre></details>
<details><summary>B: BEGIN, reads Asha (1000). A saves Asha − 500. B reads Asha again. What does B see?</summary><p>1000: B reads from the snapshot taken at its first read. After B commits, a fresh read shows 500.</p></details>
<details><summary>Why did the approval check say "not approved"?</summary><p>It ran on a different connection, which can't see the open transaction's draft. Run the check in the same transaction.</p></details>`,
  },
  {
    id: 'concept-job-cards',
    kind: 'concept', lesson: 'job1m3', order: 203,
    date: '2026-10-20',
    title: 'The card handed out twice: races and three fixes',
    from: 'Goes with From the job, The card handed out twice',
    html: `
<h3>The idea</h3>
<p><b>Check, then act</b>: an app looks ("is card 7 free?") and then writes ("card 7 is Asha's"). If two apps look before either writes, both see the same free card, both write, and the second overwrites the first: a <b>lost update</b>. Both people are told the card is theirs.</p>
<div data-widget="txntimeline" data-scenario="race" data-key="note-job-race"></div>

<h3>Three fixes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Fix</th><th>How</th><th>The loser sees</th></tr>
<tr><td>1. Guarded UPDATE</td><td><code>... WHERE id = 7 AND status = 'free'</code></td><td>0 rows changed: try the next card</td></tr>
<tr><td>2. Lock while deciding</td><td><code>BEGIN; SELECT ... FOR UPDATE; ... COMMIT;</code></td><td>waits, then reads the next free card (8)</td></tr>
<tr><td>3. A key refuses it</td><td>card_id is the PRIMARY KEY of assignments</td><td><code class="bad">ERROR 1062 (23000): Duplicate entry '7' for key 'assignments.PRIMARY'</code></td></tr>
</table></div>

<h3>Fix 1, step by step</h3>
<div data-widget="txntimeline" data-scenario="guard" data-key="note-job-guard"></div>

<h3>Fix 2, step by step</h3>
<div data-widget="txntimeline" data-scenario="lock" data-key="note-job-lock"></div>
<p>A locking read (FOR UPDATE) always reads the latest saved data, not a snapshot, so after waiting B finds card 8. Keep locking transactions short: everyone who needs those rows waits for you.</p>

<h3>Which one when</h3>
<ul>
<li>Guarded UPDATE (<b>optimistic</b> locking): fast, no waiting; the app must check "rows changed" and retry on 0.</li>
<li>FOR UPDATE (<b>pessimistic</b> locking): no retries; costs waiting. Good when many people want the same rows.</li>
<li>A key: the last line of defence. Use it as well, not instead.</li>
</ul>
<p>In payments the same race is the <b>double payment</b>, and the usual cure is an <b>idempotency key</b>: a unique id per payment request, stored under a UNIQUE key, so a repeated request is recognised.</p>

<h3>Check yourself</h3>
<details><summary>Both apps read "first free card" before either writes. Which id does each get?</summary><p>Both get 7: nothing is taken yet.</p></details>
<details><summary>Card 7 is already taken. <code>UPDATE cards SET status = 'taken', owner = 'Ravi' WHERE id = 7 AND status = 'free';</code> How many rows change?</summary><pre>id = 7          true
status = 'free' false
→ 0 rows changed</pre></details>
<details><summary>A holds a FOR UPDATE lock on card 7 and never commits. What happens to B's FOR UPDATE?</summary><p>It waits, then fails with <code>ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction</code>.</p></details>
<details><summary>Inside a transaction, the INSERT into assignments fails with 1062. What must the app do?</summary><p>ROLLBACK (Transactions 1: an error doesn't end the transaction), then try another card.</p></details>`,
  },
);
