// Week 2: the money tool. Each mission is its own small program in play/week2-money/.
// Block types and the check format are the same as week 1 (see the top of missions/week1-game.js).
//
// This file adds a second week. Pages read window.WEEKS (week 1 first). Week 1's file only sets
// window.WEEK, so the list is started from it here. Mission ids are unique across weeks, so the
// saved progress (progress.json, keyed by mission id) needs no change.
//
// Every amount in this week is whole paise. Every expected output below is worked out from the
// typed input by the functions in this file, and was checked against reference programs in Java.

(function () {
  const DIR = 'week2-money/';
  const ran = { label: 'The program runs without errors', test: r => r.ok };
  const stops = { label: 'The program stops by itself', test: r => !r.timedOut };
  const nums = r => r.input.map(Number);
  const count = (text, re) => (text.match(re) || []).length;

  // Compares every printed line with the lines it should have printed.
  // Returns '' when they match, or one sentence about the first difference.
  function exact(r, want) {
    const got = r.lines.map(l => l.trim());
    for (let n = 0; n < want.length; n++) {
      if (got[n] !== want[n]) return 'Line ' + (n + 1) + ' should be "' + want[n] + '"' + (got[n] === undefined ? ', but the output ended.' : ', but it is "' + got[n] + '".');
    }
    if (got.length > want.length) return 'There is an extra line after the last one: "' + got[want.length] + '".';
    return '';
  }

  // ---- what each program should print, worked out from the typed numbers ----
  const roundDiv = (a, b) => Math.floor((a + Math.floor(b / 2)) / b);   // round half up, for a >= 0
  const percentOf = (paise, bp) => roundDiv(paise * bp, 10000);
  const monthly = (bal, bp) => roundDiv(bal * bp, 120000);
  function rupees(paise) {
    const r = String(Math.floor(paise / 100)), p = paise % 100;
    let digits = r, out = '';
    if (digits.length > 3) {
      out = ',' + digits.slice(-3); digits = digits.slice(0, -3);
      while (digits.length > 2) { out = ',' + digits.slice(-2) + out; digits = digits.slice(0, -2); }
    }
    return 'Rs ' + digits + out + '.' + (p < 10 ? '0' : '') + p;
  }

  function tillWant(r) {
    let total = 0, items = 0;
    for (const v of nums(r)) { if (v === 0) break; total += v; items++; }
    return ['Items: ' + items, 'Total: ' + Math.floor(total / 100) + ' rupees ' + (total % 100) + ' paise'];
  }
  function billWant(r) {
    const [price, rate] = nums(r), gst = percentOf(price, rate);
    return ['Price: ' + price, 'GST: ' + gst, 'Total: ' + (price + gst)];
  }
  function billWhy(r) {
    const problem = exact(r, billWant(r));
    if (!problem) return '';
    const [price, rate] = nums(r), down = Math.floor(price * rate / 10000);
    const line = (r.lines[1] || '').trim();
    if (line === 'GST: ' + down && down !== percentOf(price, rate)) return problem + ' The exact GST is ' + (price * rate / 10000) + ' paise, which rounds to ' + percentOf(price, rate) + '. Your program dropped the part after the point instead of rounding it.';
    return problem;
  }
  function growthWant(r) {
    const [principal, rate, months] = nums(r), want = [];
    let bal = principal;
    for (let m = 1; m <= months; m++) { bal += monthly(bal, rate); want.push('Month ' + m + ': ' + bal); }
    want.push('Compound interest: ' + (bal - principal), 'Simple interest: ' + months * monthly(principal, rate));
    return want;
  }
  function monthsWant(r) {
    const s = nums(r).slice(0, 12), total = s.reduce((a, b) => a + b, 0), avg = roundDiv(total, 12);
    let hi = 0, lo = 0;
    s.forEach((v, i) => { if (v > s[hi]) hi = i; if (v < s[lo]) lo = i; });
    const above = s.map((v, i) => (v > avg ? i + 1 : 0)).filter(Boolean);
    return ['Total: ' + total, 'Average: ' + avg, 'Highest: month ' + (hi + 1) + ' (' + s[hi] + ')', 'Lowest: month ' + (lo + 1) + ' (' + s[lo] + ')', 'Above average: ' + (above.length ? above.join(' ') : 'none')];
  }
  function rupeesWant(r) { const v = nums(r); return v.slice(1, 1 + v[0]).map(rupees); }
  function loanWant(r) {
    let [bal, rate, pay] = nums(r);
    if (monthly(bal, rate) >= pay) return ['This payment never pays it off.'];
    const want = []; let month = 0, total = 0;
    while (bal > 0) {
      month++;
      const i = monthly(bal, rate); bal += i; total += i;
      const paid = Math.min(pay, bal); bal -= paid;
      want.push('Month ' + month + ': interest ' + rupees(i) + ', paid ' + rupees(paid) + ', left ' + rupees(bal));
    }
    want.push('Paid off in ' + month + ' months. Total interest: ' + rupees(total));
    return want;
  }
  // The challenge accepts each share in paise ("Person 1 pays 3334") or as rupees ("Person 1 pays Rs 33.34").
  function splitProblem(r, rupeesOnly) {
    const [total, people] = nums(r), got = r.lines.map(l => l.trim());
    if (people <= 0) return got.length === 1 && got[0] === 'Nobody to pay.' ? '' : 'With ' + people + ' people the only line should be "Nobody to pay."';
    const base = Math.floor(total / people), extra = total % people;
    for (let k = 1; k <= people; k++) {
      const want = base + (k <= extra ? 1 : 0), line = got[k - 1];
      if (line === undefined) return 'The output ended before person ' + k + '.';
      let m = line.match(/^Person (\d+) pays Rs (\d+)\.(\d\d)$/), v = null;
      if (m) v = Number(m[2]) * 100 + Number(m[3]);
      else if (!rupeesOnly && (m = line.match(/^Person (\d+) pays (\d+)$/))) v = Number(m[2]);
      if (v === null) return 'Line ' + k + ' should look like "Person ' + k + ' pays ' + (rupeesOnly ? 'Rs ' + Math.floor(want / 100) + '.' + String(want % 100).padStart(2, '0') : want) + '", but it is "' + line + '".';
      if (Number(m[1]) !== k) return 'Line ' + k + ' should be about person ' + k + ', but it says person ' + m[1] + '.';
      if (v !== want) return 'Person ' + k + ' should pay ' + want + (want === 1 ? ' paisa' : ' paise') + ', but your line says ' + v + '.';
    }
    if (got[people] !== 'Check: ' + total) return 'After the people, the line should be "Check: ' + total + '"' + (got[people] === undefined ? ', but the output ended.' : ', but it is "' + got[people] + '".');
    if (got.length > people + 1) return 'There is an extra line at the end: "' + got[people + 1] + '".';
    return '';
  }

  const lines = (...v) => v.join('\n') + '\n';

  const W2 = {
    id: 'week2-money',
    title: 'Week 2: The Money Tool',
    blurb: 'Money must be exact to the paisa. You build a till, a bill with tax, savings that grow, a year of spending, rupees written the Indian way, and a loan paid back month by month.',
    missions: [
      // ------------------------------------------------------------------
      {
        id: 'w2m1',
        title: 'Count it in paise',
        skill: 'Whole paise in a long, / and %',
        blocks: [
          { t: 'say', html: 'Week 2 is a different build: a money tool. Each mission is a small program of its own, in the folder <b>play/week2-money</b>. Money has one rule games do not have: it must be <b>exact to the paisa</b>. A game can be off by one HP. A bank cannot be off by one paisa.' },
          { t: 'say', html: 'The obvious way to store ₹12.50 is a decimal box, <code>double</code>. Predict what Java does with the simplest sum there is.' },
          { t: 'predict', xp: 10, answer: '0.30000000000000004', code: 'System.out.println(0.1 + 0.2);' },
          { t: 'say', html: 'Not 0.3. A <code>double</code> is built from halves, quarters, eighths and so on, and no mix of those makes exactly one tenth. The note on bits and bytes (section 4) lets you try. Ten payments of ₹0.10 added in a double give 0.9999999999999999, not 1.<br><br>So money programs do not store rupees with a point. They store a <b>whole number of paise</b>: ₹1,234.50 is <code>123450</code>. Whole numbers are always exact.' },
          { t: 'say', html: 'Which box? An <code>int</code> stops at 2,147,483,647 paise, about ₹2.1 crore. One busy shop passes that in a year. So money goes in a <code>long</code>: 64 switches, up to 9,223,372,036,854,775,807.<ul><li><code>long total = 0;</code> makes the box.</li><li><code>keys.nextLong()</code> reads a typed number that may be too big for an int.</li><li>A big number written straight into your code needs an <code>L</code> on the end: <code>long big = 3000000000L;</code> Without it Java says <code>integer number too large</code>.</li></ul>' },
          { t: 'say', html: 'To show paise as rupees, split the number with two signs you met in week 1. <code>/</code> between whole numbers throws the leftover away, and <code>%</code> gives only the leftover.' },
          {
            t: 'stepper',
            code: ['long total = 123450;', 'long rupees = total / 100;', 'long paise = total % 100;', 'System.out.println(rupees + " rupees " + paise + " paise");'],
            steps: [
              { line: 0, vars: { total: 123450 }, out: [], note: '₹1,234.50, stored as whole paise.' },
              { line: 1, vars: { total: 123450, rupees: 1234 }, out: [], note: '123450 / 100 is 1234.5. Whole-number division drops the .5, leaving 1234 full rupees.' },
              { line: 2, vars: { total: 123450, rupees: 1234, paise: 50 }, out: [], note: '% gives what was left over after taking out the 1234 hundreds: 50.' },
              { line: 3, vars: { total: 123450, rupees: 1234, paise: 50 }, out: ['1234 rupees 50 paise'], note: 'Nothing was rounded and nothing was lost.' },
            ],
          },
          {
            t: 'say', html: `<b>What the cashier types, exactly.</b> A <b>paisa</b> is the smallest piece of a rupee: 1 rupee = 100 paise (plural "paise"). So the till never sees a point. Prices go in as whole paise:<div class="tablewrap"><table class="plain"><tr><th>Price on the label</th><th>Typed into the till</th></tr><tr><td>₹25.50</td><td><code>2550</code></td></tr><tr><td>₹99.00</td><td><code>9900</code></td></tr><tr><td>₹10.50</td><td><code>1050</code></td></tr><tr><td>₹0.05</td><td><code>5</code></td></tr></table></div>The cashier types <b>one price, presses Enter, types the next price</b>, and so on. Typing <code>0</code> means "this customer is done". On the screen it looks like this:<pre>2550      ← first item, then Enter
9900      ← second item, then Enter
1050      ← third item, then Enter
0         ← done: print the bill</pre>Each <code>keys.nextLong()</code> takes the next number from what was typed. In the checks the lab types all the lines for you at once (the note "Works when I type, fails in the checks" shows how), so your program must keep reading until it reaches the 0.`,
          },
          {
            t: 'task', file: DIR + 'Till.java', xp: 60,
            runs: [
              { name: 'Customer 1', stdin: lines(2550, 9900, 1050, 0) },
              { name: 'Customer 2: bought nothing', stdin: lines(0) },
              { name: 'Customer 3: small change', stdin: lines(199, 1, 5, 0) },
              { name: 'Customer 4: a very big order', stdin: lines(3000000000, 2500000000, 99, 0) },
            ],
            html: 'Write a shop till in <b>play/week2-money/Till.java</b>. The file is empty apart from the wrapper.<ul><li>The cashier types the price of each item in <b>paise</b>, one number per line. <b>0</b> means the customer is done.</li><li>After the 0, print <code>Items: N</code> and then <code>Total: R rupees P paise</code>.</li></ul>For the typed list 2550, 9900, 1050, 0 the output is:<pre>Items: 3\nTotal: 135 rupees 0 paise</pre>The lab runs four customers. One of them buys something very expensive.',
            checks: [
              stops,
              { label: 'The program runs without errors', test: r => r.ok, why: r => /InputMismatchException/.test(r.stderr) ? 'A typed price was too big for nextInt. Which Scanner method reads bigger numbers?' : /NoSuchElementException/.test(r.stderr) ? 'Your program asked for another price after the 0.' : '' },
              { label: 'Money is kept in a long', test: r => /\blong\s+\w+/.test(r.src) && /\.nextLong\s*\(\s*\)/.test(r.src) },
              { label: 'The output is right for this customer', test: r => exact(r, tillWant(r)) === '', why: r => exact(r, tillWant(r)) },
            ],
            hints: [
              'What has to be remembered between one typed price and the next? Each of those needs a box made before the loop.',
              'This is the same shape as the shop challenge: read a number, and keep going while it is not 0.',
              'Read the first price before the loop, and read the next one as the last line inside the loop. Then the loop question can look at the price just read.',
              'Rupees are total / 100 and paise are total % 100. Put each in round brackets when you glue it into the text.',
            ],
          },
          {
            t: 'say', html: `<b>Before you break it: type conversion.</b> Every box has a type, and the types are different sizes. Putting a value from one type into another is a <b>type conversion</b>. Which way it goes decides whether Java does it for you.<div class="tablewrap"><table class="plain"><tr><th>Type</th><th>Switches</th><th>Holds</th></tr><tr><td><code>byte</code></td><td>8</td><td>-128 to 127</td></tr><tr><td><code>short</code></td><td>16</td><td>-32,768 to 32,767</td></tr><tr><td><code>int</code></td><td>32</td><td>about -2.1 to 2.1 billion</td></tr><tr><td><code>long</code></td><td>64</td><td>about ±9.2 × 10<sup>18</sup></td></tr></table></div><ul><li><b>Small box into a big box: widening.</b> Java does it on its own, with no warning, because it always fits. <code>int n = 5; long big = n;</code> is fine.</li><li><b>Big box into a small box: narrowing.</b> The value might not fit, so Java refuses: <code>int n = 7L;</code> gives <code>incompatible types: possible lossy conversion from long to int</code>. "Lossy" means "something could be lost". Java checks the types, not the value: 7 would fit, but a long <i>might</i> not.</li><li><b>You can force it with a cast.</b> Write the type in round brackets in front: <code>int n = (int) big;</code> This says "I know, squeeze it in". If it doesn't fit, Java keeps only the last 32 switches and you get a wrong number: <code>(int) 3000000000L</code> is <code>-1294967296</code>.</li><li><b>Mixed sums take the bigger type.</b> In <code>total + price</code>, where total is an int and price a long, Java first widens total to a long, so the answer is a long.</li></ul>`,
          },
          {
            t: 'stepper',
            code: ['int total = 0;', 'long price = 2000000000L;', 'total += price;', 'total += price;', 'System.out.println(total);'],
            steps: [
              { line: 0, vars: { total: 0 }, out: [], note: 'An int box: the wrong one for money, on purpose.' },
              { line: 1, vars: { total: 0, price: 2000000000 }, out: [], note: 'Two billion paise (₹2 crore) in a long.' },
              { line: 2, vars: { total: 2000000000, price: 2000000000 }, out: [], note: 'total += price really means total = (int) (total + price). The short form has a cast hidden in it. 0 + 2,000,000,000 is a long, and it still fits in an int, so nothing goes wrong yet.' },
              { line: 3, vars: { total: -294967296, price: 2000000000 }, out: [], note: '2,000,000,000 + 2,000,000,000 = 4,000,000,000, a long. The hidden (int) squeezes it into 32 switches. The top of an int is 2,147,483,647, so it overflows: Java takes away 4,294,967,296 (2 to the power 32) and stores -294,967,296. No error, no warning.' },
              { line: 4, vars: { total: -294967296, price: 2000000000 }, out: ['-294967296'], note: 'A shop that sold ₹4 crore shows a negative total. That is overflow.' },
            ],
          },
          {
            t: 'say', html: `<b>Try it: watch a box run out of room.</b> Press "Add it again" a few times. Then pick <code>long</code>: it never runs out at these sizes. Pick <code>byte</code>, type 127 and add 1: the same thing at a small scale, 127 + 1 = -128.<div data-widget="overflow" data-key="w2m1-overflow" data-type="int" data-total="0" data-add="2000000000"></div>Why <code>total += price</code> is allowed but <code>total = total + price</code> is not: Java's rule book says <code>a += b</code> means <code>a = (type of a) (a + b)</code>. The cast is written into the rule, so Java never asks you. The long form has no cast, so Java stops and makes you decide. The concept note "Type conversion, overflow and autoboxing" has the whole picture.`,
          },
          {
            t: 'try', file: DIR + 'Till.java', stdin: lines(2000000000, 2000000000, 0),
            html: `<b>Break it: the wrong box.</b> Now see both with your own program. The lab types two prices of 2,000,000,000 paise and then 0.<ol><li>Change the box that holds the total from <code>long</code> to <code>int</code>. Keep the price as a long from <code>nextLong()</code>. Save and press Run.</li><li>If your adding line is <code>totalPrice += cost;</code>, Java runs without a word and the bill says <code>Total: -2949672 rupees -96 paise</code>. The total became -294967296 paise, and / and % split that negative number: the hidden cast at work.</li><li>Change the line to <code>totalPrice = totalPrice + cost;</code>, save, and run again. Java refuses to run: <code>incompatible types: possible lossy conversion from long to int</code>, pointing at the <code>+</code>.</li><li>Put the box back to <code>long</code> and press Run once more. Both forms now work and the total is right.</li></ol>The lesson: in money code, every box that holds an amount is a long. Then there is nothing to squeeze.`,
          },
          {
            t: 'try',
            html: `<b>Save your work with Git (about 10 minutes).</b> Git keeps a history of your files. Each saved point in that history is a <b>commit</b>: a snapshot of the chosen files plus a one-line message saying what changed. Later you can see every change you made, compare versions, and go back if something breaks. Every software job uses it every day.<br><br>A file goes through three places:<pre>your folder  --git add-->  staging area  --git commit-->  history
(you edit)                 (chosen for the     (saved snapshots)
                            next snapshot)</pre>The staging area is a waiting room. It lets you pick which changed files go into one snapshot, so the lab's own files (<code>progress.json</code>, <code>activity.jsonl</code>) stay out of yours.<ol><li><b>Open a terminal.</b> In VS Code: menu <b>Terminal</b>, <b>New Terminal</b>. A terminal is a window where you type commands instead of clicking. Each command runs when you press Enter.</li><li><code>pwd</code> ("print working directory") prints the folder you are in. It should end in <code>engineering-lab</code>. Every command works on that folder.</li><li><code>ls</code> ("list") shows what is inside. <code>cd play</code> ("change directory") moves into the play folder. <code>cd ..</code> moves back up one level (<code>..</code> always means "the folder above"). Finish back in <code>engineering-lab</code>.</li><li><code>git status</code> asks Git what changed since the last snapshot. Read its answer from the top. <code>On branch main</code> is the line of history you are on. Under <code>Changes not staged for commit</code> it lists changed files Git already knows, in red, marked <code>modified:</code>. Under <code>Untracked files</code> it lists files Git has never saved, also in red.</li><li><code>git add play/week2-money/Till.java</code> puts the file in the staging area. Run <code>git status</code> again: it is now green, under <code>Changes to be committed</code>. Chosen, not saved yet. If you mistype the name, Git says <code>fatal: pathspec 'play/Tll.java' did not match any files</code> and adds nothing.</li><li><code>git commit -m "Till: totals in paise"</code> takes the snapshot. <code>-m</code> means "the message follows", in double quotes. Git answers with something like <code>[main 49fbc8d] Till: totals in paise</code> and <code>1 file changed, 21 insertions(+)</code>: the branch, the snapshot's short id, your message, and how many lines were added.</li><li><code>git status</code> once more: Till.java is gone from the list. Its snapshot is saved.</li><li><code>git log --oneline</code> lists your snapshots, newest first, one per line. Press <b>q</b> if it waits at the end.</li></ol><b>Common slips:</b> forgetting <code>-m</code> opens a VS Code tab asking for the message (type it on the first line, save, close the tab). <code>no changes added to commit</code> means you skipped <code>git add</code>. Your snapshots are on this computer only until <code>git push</code> copies them to your private GitHub; your tutor pushes for now. The concept note "Git from zero" has all of this with a step-through.<br><br>You already committed Till (<code>49fbc8d Till: Total in paise</code>). Run <code>git log --oneline</code> to see it. From now on, commit each program when it passes.`,
          },
          {
            t: 'deeper', title: 'The overflow Java does not warn you about, and how real systems carry money',
            html: '<p>Java stopped you from putting a long into an int. It will not stop this:</p><pre>int price = 2000000000;\nlong total = price * 3;\nSystem.out.println(total);</pre><p>This prints <code>1705032704</code>. The box on the left is a long, but the multiplication happens first, between two ints, and it overflows before the answer reaches the long. The fix is to make one side a long before multiplying: <code>long total = (long) price * 3;</code> or keep every money box a long from the start, which is why this week does.</p><p>Real systems work the same way you just did:</p><ul><li><b>Card payment messages</b> carry the amount as a 12-digit whole number of the smallest unit. ₹250.00 travels as <code>000000025000</code>. Payments note 3 shows the whole message.</li><li><b>Not every currency has 100 small units.</b> The Japanese yen has none, so ¥500 is stored as 500. The Kuwaiti dinar has 1,000 fils, so it needs three digits after the point. An international standard (ISO 4217) lists how many each currency has. A program that assumes "always 100" breaks on those.</li><li><b>Java\'s BigDecimal</b> stores decimal numbers exactly and is used in many banking programs, including Spring Boot ones you will write later. It is slower and wordier than a long. Whole paise in a long is the simple, exact choice for this week.</li></ul>',
          },
          {
            t: 'deeper', title: 'The other conversion: autoboxing (int and Integer)',
            html: `<p>Java has two kinds of type. <b>Primitive</b> types are plain boxes holding a value: <code>int</code>, <code>long</code>, <code>double</code>, <code>boolean</code>, <code>char</code> (and <code>byte</code>, <code>short</code>, <code>float</code>). Each has an <b>object</b> twin, called a <b>wrapper</b>, spelled with a capital letter: <code>Integer</code>, <code>Long</code>, <code>Double</code>, <code>Boolean</code>, <code>Character</code>. An object can do things a plain box can't: it can be "nothing" (<code>null</code>), and it can go into Java's lists. <span class="later">Coming in weeks 4 to 5: what an object is, and lists.</span></p><ul><li><b>Autoboxing</b>: Java wraps a primitive into its twin for you. <code>Integer boxed = 5;</code></li><li><b>Unboxing</b>: Java takes the value back out. <code>int back = boxed;</code></li></ul><p>"Auto" because you don't write it. The conversion in this lesson (int and long) is between two primitives. Autoboxing is between a primitive and its wrapper. Two traps you will meet in real code, both checked in Java 17:</p><ul><li><code>Integer missing = null; int n = missing;</code> compiles, then crashes with <code>NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because ... is null</code>. Unboxing "nothing" has no value to take out.</li><li><code>==</code> on two <code>Integer</code>s asks "the same object?", not "the same number?". <code>Integer a = 127, b = 127;</code> gives <code>a == b</code> true, because Java reuses objects from -128 to 127. With 1000 it is false. Use <code>a.equals(b)</code>.</li></ul><p>For money this week: plain <code>long</code>, never <code>Long</code>.</p>`,
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m2',
        title: 'Tax to the nearest paisa',
        skill: 'Percentages, rounding, a method that returns',
        blocks: [
          { t: 'say', html: 'A bill adds 18% GST. 18% of 1003 paise is 180.54 paise. Money cannot have 0.54 of a paisa, so the program must <b>round</b>, and rounding is where money programs most often go wrong.' },
          { t: 'say', html: `<b>Why can't money have 0.54 of a paisa?</b> Two separate reasons, and it helps to keep them apart.<ol><li><b>The real world.</b> 1 paisa is the smallest amount that can be paid or stored in an account. There is no coin, note or bank entry for part of a paisa. A bill has to be payable, so the tax must end up as a whole number of paise. That rule comes from money itself, not from Java. (Cash shops even round bills to the nearest rupee, because small coins are no longer used.)</li><li><b>Java.</b> Separately, when both sides of <code>/</code> are whole numbers (int or long), Java throws away the part after the point. It doesn't round it, it just drops it. So even if you wanted 180.54, a long can't hold it.</li></ol>Reason 1 says we <i>must</i> end with whole paise. Reason 2 says plain division picks a way for us (always down) without asking. So we pick the rounding ourselves, on purpose.` },
          {
            t: 'say', html: `<b>Three ways to work out 18% of 1003 paise, all run in Java 17:</b><div class="tablewrap"><table class="plain"><tr><th>Code</th><th>Prints</th><th>What happened</th></tr><tr><td><code>long price = 1003;</code><br><code>price * 18 / 100</code></td><td><code>180</code></td><td>18054 / 100: the .54 is thrown away (rounded down).</td></tr><tr><td><code>price * 18 % 100</code></td><td><code>54</code></td><td>The leftover that was thrown away. Nothing is lost if you keep it.</td></tr><tr><td><code>price * 18 / 100.0</code></td><td><code>180.54</code></td><td><code>100.0</code> is a double, so the sum is done in double. This one prints nicely, but doubles are not exact in general (lesson 1), so money code doesn't keep them.</td></tr><tr><td><code>new BigDecimal("1003")</code><br><code>.multiply(new BigDecimal("18"))</code><br><code>.divide(new BigDecimal("100"))</code></td><td><code>180.54</code></td><td>Exact. BigDecimal keeps decimal digits, not halves and quarters.</td></tr><tr><td>the same, then <code>.setScale(0, RoundingMode.HALF_UP)</code></td><td><code>181</code></td><td>Rounded to whole paise, half going up.</td></tr></table></div><b>So BigDecimal doesn't remove the rounding step.</b> It keeps 180.54 exactly while you work, but the bill still needs whole paise, so you still choose a rounding rule (<code>setScale</code>). It can even refuse: <code>100 / 3</code> with BigDecimal throws <code>Non-terminating decimal expansion; no exact representable decimal result.</code> until you tell it how many digits to keep and how to round. With a long, you round with one trick: add half before dividing (next). Both are used in banks. This week uses long, because you can see every step. BigDecimal needs objects, <span class="later">coming in weeks 4 to 5</span>.` },
          {
            t: 'say', html: `<b>Doing 1003 × 18 in your head.</b> Split the awkward number into easy pieces, multiply each, then add. This works because multiplying a sum is the same as multiplying each part (the <b>distributive rule</b>: 18 × (1000 + 3) = 18 × 1000 + 18 × 3).<pre>1003 × 18 = 1000 × 18  +  3 × 18
          =   18000    +    54
          =   18054</pre>Another split, when the number is close to a round one: 18 = 20 - 2, so 1003 × 18 = 1003 × 20 - 1003 × 2 = 20060 - 2006 = 18054. Then <b>÷ 100</b> just moves the point two places left: 180.54. Your maths drills on the phone practise exactly this.` },
          { t: 'say', html: `<b>Basis points, from zero.</b><ol><li><b>Percent means "out of 100".</b> 18% means 18 out of every 100. So 18% of 1003 paise is 1003 × 18 ÷ 100 = 180.54.</li><li><b>The problem.</b> Many rates are not whole numbers: 12.5%, 7.25%, 0.5%. Then the sum needs a point (1003 × 12.5), and a long can't hold a point.</li><li><b>The fix is a trick you already know.</b> Money had the same problem: ₹25.50 has a point. We cut each rupee into 100 paise, and the point went away: 2550. Do the same to a percent: cut each 1% into 100 tiny pieces. One tiny piece is called a <b>basis point</b> ("bp").</li></ol><div class="tablewrap"><table class="plain"><tr><th>Money</th><th>Rates</th></tr><tr><td>1 rupee = 100 paise</td><td>1% = 100 basis points</td></tr><tr><td>₹25.50 → 2550 paise</td><td>12.5% → 1250 bp</td></tr><tr><td>₹0.05 → 5 paise</td><td>0.05% → 5 bp</td></tr><tr><td>rupees × 100 = paise</td><td>percent × 100 = basis points</td></tr></table></div>More examples: 18% = 1800 bp, 7.25% = 725 bp, 100% = 10,000 bp. Every rate becomes a whole number.<br><br><b>Why the formula divides by 10,000.</b> Percent is "out of 100". Basis points are "out of 10,000", because 100% is 10,000 bp. So:<pre>with percent:       amount × percent ÷ 100
with basis points:  amount × basisPoints ÷ 10000</pre>They give the same answer, because both the top and the bottom are 100 times bigger. 18 out of 100 is the same share as 1800 out of 10,000:<pre>1003 × 18   ÷ 100   = 18,054    ÷ 100    = 180.54
1003 × 1800 ÷ 10000 = 1,805,400 ÷ 10,000 = 180.54</pre>And now a rate like 12.5% works with whole numbers only: 12.5% of 1000 paise is 1000 × 1250 ÷ 10000 = <b>125 paise</b>.` },
          { t: 'say', html: 'Whole-number division always throws the leftover away. That rounds <b>down</b>, even 180.99 down to 180. To round to the <b>nearest</b> instead, add half of what you divide by, before dividing. Anything at .5 or above is pushed past the next whole number. Predict:' },
          { t: 'predict', xp: 10, answer: '180 181', code: 'long a = 1003 * 18 / 100;\nlong b = (1003 * 18 + 50) / 100;\nSystem.out.println(a + " " + b);' },
          {
            t: 'stepper',
            code: ['long a = 1003 * 18 / 100;', 'long b = (1003 * 18 + 50) / 100;', 'System.out.println(a + " " + b);'],
            steps: [
              { line: 0, vars: { a: 180 }, out: [], note: '1003 × 18 is 18054. 18054 ÷ 100 is 180.54, and the .54 is thrown away: 180. That is rounding down.' },
              { line: 1, vars: { a: 180, b: 181 }, out: [], note: '18054 + 50 is 18104. 18104 ÷ 100 is 181.04, and the .04 is thrown away: 181. Adding half first turned "throw away" into "round to the nearest".' },
              { line: 2, vars: { a: 180, b: 181 }, out: ['180 181'], note: 'The rule: add HALF OF THE NUMBER YOU DIVIDE BY. Here you divide by 100, so you add 50. The next block shows the same rule with basis points.' },
            ],
          },
          {
            t: 'say', html: `<b>Why adding half works.</b> Whole-number division always cuts down to the whole number below. Adding half first moves every answer up by exactly 0.5 before the cut:<div class="tablewrap"><table class="plain"><tr><th>Exact answer</th><th>+ 0.5</th><th>Cut down</th><th>Nearest?</th></tr><tr><td>180.54</td><td>181.04</td><td>181</td><td>yes (0.54 is closer to 181)</td></tr><tr><td>180.49</td><td>180.99</td><td>180</td><td>yes (0.49 is closer to 180)</td></tr><tr><td>180.50</td><td>181.00</td><td>181</td><td>a half goes up</td></tr></table></div>Anything at .5 or more crosses the next whole number. Anything below .5 doesn't. You can't add 0.5 to a long, but dividing by 100 shrinks everything 100 times, so adding <b>50 before</b> dividing is the same as adding 0.5 after: (18054 + 50) / 100 = 18104 / 100 = 181.<br><br><b>The same rule with basis points.</b> 18% is 1800 basis points, and the formula divides by 10000 instead of 100. Half of 10000 is 5000, so that's what gets added. Same bill, side by side:<div class="tablewrap"><table class="plain"><tr><th></th><th>Percent</th><th>Basis points</th></tr><tr><td>Rate</td><td>18</td><td>1800</td></tr><tr><td>Multiply</td><td>1003 × 18 = 18,054</td><td>1003 × 1800 = 1,805,400</td></tr><tr><td>Divide by</td><td>100</td><td>10,000</td></tr><tr><td>Exact answer</td><td>180.54</td><td>180.54 (the same)</td></tr><tr><td>Add half of the divisor</td><td>18,054 + 50 = 18,104</td><td>1,805,400 + 5,000 = 1,810,400</td></tr><tr><td>Divide (cut)</td><td>181</td><td>181</td></tr></table></div>Both columns give 181. Basis points just use a scale 100 times finer, so a rate like 12.5% (1250) or 7.25% (725) is still a whole number. Whatever you divide by, add half of it first.`,
          },
          { t: 'say', html: 'This rounding rule belongs in one place, with a name. A method can hand back an answer of any type. This one takes a long and an int and gives back a long:' },
          { t: 'code', code: 'static long percentOf(long paise, int basisPoints) {\n    return (paise * basisPoints + 5000) / 10000;\n}' },
          { t: 'say', html: 'The words before the name are the answer\'s type (<code>long</code>). The boxes in the round brackets are filled by the caller, in order: <code>percentOf(1003, 1800)</code> puts 1003 in <code>paise</code> and 1800 in <code>basisPoints</code>. Inside, <code>paise * basisPoints</code> is a long times an int, which Java works out as a long, so a big bill cannot overflow.' },
          {
            t: 'task', file: DIR + 'Bill.java', xp: 70,
            runs: [
              { name: 'Bill 1: 18% on 1003 paise', stdin: lines(1003, 1800) },
              { name: 'Bill 2: 18% on 1001 paise', stdin: lines(1001, 1800) },
              { name: 'Bill 3: exactly half a paisa', stdin: lines(25, 1800) },
              { name: 'Bill 4: 5% on 99999 paise', stdin: lines(99999, 500) },
              { name: 'Bill 5: 12.5% on a big order', stdin: lines(123456789, 1250) },
            ],
            html: 'Write <b>play/week2-money/Bill.java</b>.<ul><li>Read the price in paise, then the GST rate in basis points.</li><li>Print <code>Price: P</code>, <code>GST: G</code> and <code>Total: T</code>, all in paise. GST is rounded to the nearest paisa, and exactly half a paisa rounds up.</li><li>You must write and use <code>static long percentOf(long paise, int basisPoints)</code>.</li></ul>For 1003 and 1800 the output is:<pre>Price: 1003\nGST: 181\nTotal: 1184</pre>',
            checks: [
              stops, ran,
              { label: 'There is a method: static long percentOf(long paise, int basisPoints)', test: r => /static\s+long\s+percentOf\s*\(\s*long\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'percentOf is used', test: r => count(r.src, /\bpercentOf\s*\(/g) >= 2 },
              { label: 'The bill is right, to the paisa', test: r => exact(r, billWant(r)) === '', why: billWhy },
            ],
            hints: [
              'Where in this program would you be tempted to write the rounding rule twice? That is the line that belongs in percentOf.',
              'main reads two numbers, calls percentOf once, and prints three lines. Total is price plus GST.',
              'Inside percentOf: multiply, add half of 10000, then divide by 10000. Return that.',
              'If bill 5 is wrong but the others pass, look for an int box holding the price. Multiplying two ints overflows before the answer reaches a long.',
            ],
          },
          { t: 'try', file: DIR + 'Bill.java', stdin: lines(1003, 1800), html: '<b>Break it.</b> Delete the <code>+ 5000</code> inside <code>percentOf</code> and run bill 1. You lose a paisa. Over a million bills a day that is ₹10,000 a day missing from the tax, and nobody sees an error. Put it back.' },
          {
            t: 'try',
            html: `<b>Git, part 2: save, see a change, undo it (about 10 minutes).</b> Same terminal as last time, in the <code>engineering-lab</code> folder (<code>pwd</code> to check).<ol><li><b>Save Bill.</b> Once it passes: <code>git status</code> (Bill.java is red, under <code>Untracked files</code>: Git has never saved it), then <code>git add play/week2-money/Bill.java</code>, then <code>git commit -m "Bill: GST to the nearest paisa"</code>.</li><li><b>Make a change.</b> In Bill.java change one line, for example the text <code>"GST: "</code> to <code>"Tax: "</code>, and save the file.</li><li><b>See the change.</b> <code>git diff play/week2-money/Bill.java</code> compares your file with its last snapshot. How to read the answer:<ul><li><code>--- a/play/week2-money/Bill.java</code> is the snapshot, <code>+++ b/...</code> is your file now.</li><li><code>@@ -9,7 +9,7 @@</code> says where: a piece of 7 lines starting at line 9, in the old version and in the new. Git shows 3 unchanged lines above and below your change (starting with a space) so you can find it.</li><li>A line starting with <code>-</code> (red) was removed, and a line starting with <code>+</code> (green) was added. Changing a line shows as one of each.</li></ul><code>git diff</code> shows nothing for a file Git has never saved, which is why Bill had to be committed first.</li><li><b>Undo it.</b> <code>git restore play/week2-money/Bill.java</code> puts the file back exactly as the last snapshot. Careful: the change you throw away is gone for good, because it was never in a snapshot. Look at the file in VS Code: <code>"GST: "</code> is back.</li><li><b>See your history.</b> <code>git log --oneline</code>: Bill and Till, newest first. Press <b>q</b> if it waits at the end.</li></ol>The concept note "Git from zero" has every command and message in one place.`,
          },
          {
            t: 'deeper', title: 'Rounding is a decision, not a detail',
            html: '<p>"Half rounds up" is one rule out of several, and the choice matters when it is repeated millions of times.</p><ul><li><b>Half up</b> (this mission): 0.5 becomes 1. Every half paisa goes the same way, so over many bills the total drifts slightly upwards.</li><li><b>Half to even</b>, also called banker\'s rounding: a half goes to whichever neighbour is even. 0.5 becomes 0, 1.5 becomes 2, 2.5 becomes 2. The halves cancel out on average. Java\'s <code>BigDecimal</code> has it as <code>RoundingMode.HALF_EVEN</code>.</li><li><b>Down</b>: what plain division does.</li></ul><p>The tax authority or the bank\'s own rules say which one to use. A programmer\'s job is to find that out, not to guess.</p><p><b>A trap with negative amounts.</b> A refund is a negative amount. Java\'s division always throws the leftover away towards zero, so <code>-7 / 2</code> is <code>-3</code>, and <code>-7 % 2</code> is <code>-1</code>. The "add half first" trick then rounds the wrong way: <code>(-1003L * 1800 + 5000) / 10000</code> gives <code>-180</code>, while 18% of a ₹10.03 refund is -180.54, which should be -181. Programs that handle refunds round the size of the amount and put the sign back afterwards.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m3',
        title: 'Money that grows',
        skill: 'A for loop that builds a table, compound interest',
        blocks: [
          { t: 'say', html: 'Put money in a savings account and the bank pays you <b>interest</b>: a percentage of your balance, for letting it use your money. There are two ways to pay it.<ul><li><b>Simple:</b> interest only on what you put in. ₹1,000 at 12% a year earns ₹10 every month, for ever.</li><li><b>Compound:</b> each month\'s interest is added to the balance, and next month\'s interest is worked out on the bigger balance. Interest earns interest.</li></ul><b>Try it.</b> Move the sliders. Make the years long and watch the two lines part.<div data-widget="growth" data-key="m3-growth"></div>' },
          { t: 'say', html: 'This mission repeats something a known number of times: 12 months, 24 months. Java has a loop made for counting, the <code>for</code> loop. It is a while loop with its three counting parts written on one line:' },
          { t: 'code', code: 'for (int m = 1; m <= 3; m++) {\n    System.out.println("Month " + m);\n}\n\n// does exactly the same as\nint m = 1;\nwhile (m <= 3) {\n    System.out.println("Month " + m);\n    m++;\n}' },
          { t: 'say', html: 'The three parts, separated by semicolons: <b>start</b> (<code>int m = 1</code>, done once), <b>keep going while</b> (<code>m &lt;= 3</code>, asked before every round), <b>after each round</b> (<code>m++</code>). One difference: a box made in the first part only exists inside the loop.<br><br>Predict this one. The balance grows by a tenth of itself each round.' },
          { t: 'predict', xp: 10, answer: '1331', code: 'long b = 1000;\nfor (int m = 1; m <= 3; m++) {\n    b = b + b / 10;\n}\nSystem.out.println(b);' },
          { t: 'say', html: 'The rate is per year, but interest is added every month, so one month\'s interest is <code>balance × rate ÷ 10000 ÷ 12</code>. That is the same as dividing by 120000 once. Rounded to the nearest paisa, as in the last mission:' },
          { t: 'code', code: 'static long monthlyInterest(long balance, int basisPointsPerYear) {\n    return (balance * basisPointsPerYear + 60000) / 120000;\n}' },
          {
            t: 'task', file: DIR + 'Growth.java', xp: 80,
            runs: [
              { name: '₹1,000 at 12% for 12 months', stdin: lines(100000, 1200, 12) },
              { name: '₹50,000 at 7.25% for 24 months', stdin: lines(5000000, 725, 24) },
              { name: 'Zero months', stdin: lines(100000, 1200, 0) },
              { name: 'One paisa at 12% for 3 months', stdin: lines(1, 1200, 3) },
            ],
            html: 'Write <b>play/week2-money/Growth.java</b>.<ul><li>Read the starting amount in paise, the yearly rate in basis points, then the number of months.</li><li>Use a <code>for</code> loop. Each month, add that month\'s interest to the balance and print <code>Month M: B</code>.</li><li>Then print <code>Compound interest: C</code> (how much the balance grew) and <code>Simple interest: S</code> (the first month\'s interest on the starting amount, times the number of months).</li><li>Write and use <code>static long monthlyInterest(long balance, int basisPointsPerYear)</code>.</li></ul>For 100000, 1200, 12 the output starts and ends like this:<pre>Month 1: 101000\nMonth 2: 102010\nMonth 3: 103030\n...\nMonth 12: 112684\nCompound interest: 12684\nSimple interest: 12000</pre>',
            checks: [
              stops, ran,
              { label: 'Your file uses a for loop', test: r => /\bfor\s*\(/.test(r.src) },
              { label: 'There is a method: static long monthlyInterest(long balance, int basisPointsPerYear)', test: r => /static\s+long\s+monthlyInterest\s*\(\s*long\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'monthlyInterest is used', test: r => count(r.src, /\bmonthlyInterest\s*\(/g) >= 2 },
              { label: 'Every month, and both totals, are right', test: r => exact(r, growthWant(r)) === '', why: r => exact(r, growthWant(r)) },
            ],
            hints: [
              'Which number changes every month, and which one must stay as it was typed? You need both at the end.',
              'Keep the typed starting amount in one box and copy it into a second box, the balance, which the loop changes.',
              'Inside the loop: balance gets bigger by monthlyInterest(balance, rate), then print the line.',
              'Compound interest is the final balance minus the starting amount. Simple interest uses the starting amount, not the balance.',
            ],
          },
          { t: 'try', file: DIR + 'Growth.java', stdin: lines(100000, 1200, 72), html: '<b>The rule of 72.</b> This runs ₹1,000 at 12% for 72 months, which is 6 years. Before you press Run, guess the last balance. There is an old shortcut: money roughly doubles in 72 ÷ rate years. At 12%, that is 6 years. How close is it?' },
          {
            t: 'deeper', title: 'How banks really do it',
            html: '<p>Your program adds interest monthly on the closing balance. Real accounts differ in two ways.</p><ul><li><b>When it is worked out.</b> In India, savings-account interest is worked out on the balance at the end of every day, and paid into the account a few times a year. A deposit made on the 20th earns for the days it was there.</li><li><b>How often it compounds.</b> The more often interest is added, the more interest earns interest. 12% added once a year makes ₹1,000 into ₹1,120. Added monthly, it makes about ₹1,126.83 (your program says ₹1,126.84, because it rounds to the paisa every month, and those small roundings add up). Banks therefore quote an "effective" yearly rate as well as the headline rate.</li></ul><p>The growth is <b>exponential</b>: each step multiplies by the same factor (1.01 a month here), so the curve bends upwards. Loans work the same way against you, which is the next-but-one mission. Exponential growth also explains why an algorithm that doubles its work for each extra item becomes useless very quickly, which you will meet in problem solving.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m4',
        title: 'Twelve months in one box',
        skill: 'Arrays',
        blocks: [
          { t: 'say', html: 'A new kind of question: <b>"In which months did I spend more than my average?"</b> You cannot know the average until all twelve months are read. By then, a loop that keeps only a running total has forgotten the months. You need to keep all twelve numbers.<br><br>Twelve boxes called <code>jan</code>, <code>feb</code>, ... would work, and you would have to write every line twelve times. Java has a better box: an <b>array</b>, one name for a row of numbered boxes.' },
          { t: 'code', code: 'long[] spent = new long[12];   // a row of 12 long boxes, all starting at 0\nspent[0] = 4500;                // the first box\nspent[11] = 900;                // the last box\nSystem.out.println(spent.length);   // 12' },
          { t: 'say', html: '<ul><li><code>long[]</code> means "a row of longs".</li><li><code>new long[12]</code> makes the row. Its size is fixed from then on.</li><li>The boxes are numbered from <b>0</b>, so twelve boxes are 0 to 11. The number in square brackets is the <b>index</b>.</li><li><code>spent.length</code> is how many boxes there are.</li></ul>An index can be a box too: <code>spent[i]</code>. That is what makes arrays and loops a pair.<br><br><b>Try it.</b> Pick an index and see where Java finds the box.<div data-widget="arraymem" data-key="m4-array"></div>' },
          { t: 'predict', xp: 10, answer: '15', code: 'int[] a = new int[3];\na[0] = 5;\na[2] = a[0] * 2;\nSystem.out.println(a[0] + a[1] + a[2]);' },
          {
            t: 'stepper',
            code: ['long[] spent = new long[3];', 'for (int i = 0; i < spent.length; i++) {', '    spent[i] = (i + 1) * 100;', '}', 'System.out.println(spent[0] + spent[2]);'],
            steps: [
              { line: 0, vars: { spent: '[0, 0, 0]' }, out: [], note: 'Three boxes, numbered 0, 1 and 2, all 0.' },
              { line: 1, vars: { spent: '[0, 0, 0]', i: 0 }, out: [], note: 'i starts at 0, the first index. Is 0 < 3? Yes.' },
              { line: 2, vars: { spent: '[100, 0, 0]', i: 0 }, out: [], note: 'spent[i] is spent[0] this time round.' },
              { line: 2, vars: { spent: '[100, 200, 0]', i: 1 }, out: [], note: 'i is 1, so the same line fills box 1.' },
              { line: 2, vars: { spent: '[100, 200, 300]', i: 2 }, out: [], note: 'i is 2, the last index.' },
              { line: 1, vars: { spent: '[100, 200, 300]', i: 3 }, out: [], note: 'i is 3. Is 3 < 3? No. The loop stops exactly after the last box. That is why the question is i < length and not i <= length.' },
              { line: 4, vars: { spent: '[100, 200, 300]' }, out: ['400'], note: 'The numbers are still there after the loop, ready to be used again.' },
            ],
          },
          {
            t: 'task', file: DIR + 'Months.java', xp: 90,
            runs: [
              { name: 'A normal year', stdin: lines(450000, 380000, 520000, 410000, 390000, 610000, 300000, 450000, 470000, 800000, 350000, 400000) },
              { name: 'Every month the same', stdin: lines(...Array(12).fill(250000)) },
              { name: 'Two months tie for highest', stdin: lines(100, 900, 300, 900, 50, 50, 700, 200, 100, 600, 400, 1) },
              { name: 'One huge month', stdin: lines(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 9000000000) },
            ],
            html: 'Write <b>play/week2-money/Months.java</b>. Read twelve amounts in paise, one for each month, January first. Then print:<pre>Total: T\nAverage: A\nHighest: month M (X)\nLowest: month M (X)\nAbove average: M M M</pre><ul><li>Months are numbered 1 to 12 in the output.</li><li>The average is the total ÷ 12, rounded to the nearest paisa with half rounding up.</li><li>If two months tie for highest or lowest, name the earlier one.</li><li>The last line lists, in order, every month that spent <b>more than</b> the average, with one space between. If there are none: <code>Above average: none</code></li><li>Keep the twelve amounts in a <code>long</code> array.</li></ul>',
            checks: [
              stops, ran,
              { label: 'The amounts are kept in a long array', test: r => /long\s*\[\s*\]\s*\w+\s*=\s*new\s+long\s*\[/.test(r.src) },
              { label: 'Your file uses a for loop', test: r => /\bfor\s*\(/.test(r.src) },
              { label: 'All five lines are right for this year', test: r => exact(r, monthsWant(r)) === '', why: r => exact(r, monthsWant(r)) },
            ],
            hints: [
              'Which of the five lines can only be worked out after every month has been read? Those need a second loop over the array.',
              'First loop: read each month into spent[i] and add it to the total. Then work out the average. Then a second loop for highest and lowest, and a third (or the same second one) for "above average".',
              'For the highest, keep the index of the best month so far, starting at 0. Replace it only when a month is strictly bigger, so a tie keeps the earlier month.',
              'Build the last line as text: start with an empty String and add " " + the month number for each month above average. If it is still empty at the end, use "none".',
            ],
          },
          { t: 'try', file: DIR + 'Months.java', stdin: lines(...Array(12).fill(1)), html: '<b>Break it: one box too far.</b> Change your first loop\'s question from <code>&lt;</code> to <code>&lt;=</code> and run. Java says <code>ArrayIndexOutOfBoundsException: Index 12 out of bounds for length 12</code>. It refuses to touch memory outside the row. Put it back.' },
          {
            t: 'deeper', title: 'Why the first box is number 0',
            html: '<p>The diagram above shows the reason. An array is one block of cells in memory, side by side. A long takes 8 bytes, so box <code>i</code> starts at <code>start + i × 8</code>. The index is not a position you count ("the first"), it is a <b>distance from the start</b>. The first box is zero steps away. Finding any box is one multiplication and one addition, however long the array is. That is why reading <code>spent[11]</code> is exactly as fast as reading <code>spent[0]</code>.</p><p>Two more things that follow from it:</p><ul><li><b>The size is fixed.</b> The block was reserved at the size you asked for, and the cells after it may belong to something else. To grow, Java makes a bigger block and copies. Later you will use <code>ArrayList</code>, which does that copying for you.</li><li><b>The box holds where the row is, not the row.</b> <code>long[] b = spent;</code> does not copy twelve numbers. It copies the location, so <code>b</code> and <code>spent</code> are two names for the same row: change <code>b[1]</code> and <code>spent[1]</code> changes too. Print an array directly and you see something like <code>[J@2698dc7</code>, which is Java describing that location rather than the numbers. Week 4\'s objects work the same way.</li></ul><p>Checking an index against the length on every access is what stops a program reading memory it does not own. Languages that skip the check, such as C, have had some of the worst security bugs in history because of it.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m5',
        title: 'Rupees, the Indian way',
        skill: 'Strings: length, substring, building text',
        blocks: [
          { t: 'say', html: 'People should not read <code>12345678905</code>. They should read <b>Rs 1,23,45,678.05</b>. In India the last three digits of the rupees are grouped, then every two before them: thousand, lakh, crore. Other countries group in threes (12,345,678.05).<br><br>You will write that yourself, one method that turns paise into text. It needs a few things a <code>String</code> can do.' },
          {
            t: 'code',
            code: 'String s = "123456";\ns.length()          // 6: how many characters\ns.substring(3)      // "456": from index 3 to the end\ns.substring(0, 3)   // "123": from index 0 up to, not including, index 3\ns.charAt(0)         // \'1\': one character\n"" + 1234           // "1234": a number glued onto text becomes text\n"," + "456"         // ",456"',
          },
          { t: 'say', html: 'Characters in a String are numbered from 0, like an array. <code>substring(a, b)</code> takes from <code>a</code> up to but <b>not</b> including <code>b</code>, so its length is <code>b - a</code>. To take the last three characters of any String: <code>s.substring(s.length() - 3)</code>.' },
          { t: 'predict', xp: 10, answer: '6 456 123', code: 'String s = "123456";\nSystem.out.println(s.length() + " " + s.substring(3) + " " + s.substring(0, 3));' },
          {
            t: 'stepper',
            code: ['String digits = "1234567";', 'String out = "," + digits.substring(digits.length() - 3);', 'digits = digits.substring(0, digits.length() - 3);', 'while (digits.length() > 2) {', '    out = "," + digits.substring(digits.length() - 2) + out;', '    digits = digits.substring(0, digits.length() - 2);', '}', 'System.out.println(digits + out);'],
            steps: [
              { line: 0, vars: { digits: '"1234567"' }, out: [], note: 'Twelve lakh thirty-four thousand five hundred and sixty-seven, as text.' },
              { line: 1, vars: { digits: '"1234567"', out: '",567"' }, out: [], note: 'The last three digits, with a comma in front.' },
              { line: 2, vars: { digits: '"1234"', out: '",567"' }, out: [], note: 'Cut those three off. Four digits remain to be grouped in twos.' },
              { line: 3, vars: { digits: '"1234"', out: '",567"' }, out: [], note: 'More than two digits left? Yes.' },
              { line: 4, vars: { digits: '"1234"', out: '",34,567"' }, out: [], note: 'Take the last two, put a comma before them, and put them in front of what is built so far.' },
              { line: 5, vars: { digits: '"12"', out: '",34,567"' }, out: [], note: 'Cut those two off.' },
              { line: 3, vars: { digits: '"12"', out: '",34,567"' }, out: [], note: 'Two digits left, which is not more than two. Stop. The leftover goes at the front with no comma.' },
              { line: 7, vars: { digits: '"12"', out: '",34,567"' }, out: ['12,34,567'], note: 'This is the core of the method. You still have to handle numbers of three digits or fewer, and the paise.' },
            ],
          },
          {
            t: 'task', file: DIR + 'Rupees.java', xp: 90,
            runs: [
              { name: 'Small amounts', stdin: lines(5, 123450, 5, 100, 0, 99) },
              { name: 'Lakhs and crores', stdin: lines(4, 12345678905, 100000, 10000000, 999999999999) },
              { name: 'Three to five digits', stdin: lines(3, 1234500, 12345, 10) },
            ],
            html: 'Write <b>play/week2-money/Rupees.java</b>.<ul><li>Write <code>static String rupees(long paise)</code>, which gives back the amount as text: <code>Rs </code>, the rupees with Indian commas, a point, and the paise as <b>two</b> digits.</li><li>main reads how many amounts follow, then that many amounts in paise, and prints <code>rupees(...)</code> of each on its own line.</li><li><b>Rule:</b> build the text yourself. No <code>String.format</code>, <code>printf</code>, <code>DecimalFormat</code> or <code>NumberFormat</code>.</li></ul>For the typed numbers 5, 123450, 5, 100, 0, 99 the output is:<pre>Rs 1,234.50\nRs 0.05\nRs 1.00\nRs 0.00\nRs 0.99</pre>and 12345678905 is <code>Rs 1,23,45,678.05</code>.',
            checks: [
              stops, ran,
              { label: 'There is a method: static String rupees(long paise)', test: r => /static\s+String\s+rupees\s*\(\s*long\s+\w+\s*\)/.test(r.src) },
              { label: 'rupees is used', test: r => count(r.src, /\brupees\s*\(/g) >= 2 },
              { label: 'The text is built by hand (no format, printf or NumberFormat)', test: r => !/String\.format|printf|DecimalFormat|NumberFormat|\.formatted\s*\(/.test(r.src) },
              { label: 'Every amount is written correctly', test: r => exact(r, rupeesWant(r)) === '', why: r => exact(r, rupeesWant(r)) },
            ],
            hints: [
              'Which amounts need no comma at all? Try 0, 5 and 99999 paise on paper before you write the method.',
              'Split first: rupees = paise / 100 and the small part = paise % 100. Turn the rupees into text with "" + rupees.',
              'The small part 5 must show as "05". If it is under 10, put a "0" in front.',
              'Only add commas when the rupees text is longer than 3 characters. Then it is the walk-through above: last three, then twos.',
            ],
          },
          { t: 'try', file: DIR + 'Rupees.java', stdin: lines(1, 123450), html: '<b>The real symbol.</b> In your method, replace <code>"Rs "</code> with <code>"\\u20B9"</code> and run here. <code>\\u20B9</code> is how you write character number 20B9 (in hex) inside Java text: the rupee sign. The lab shows ₹1,234.50. Now run the same file in the VS Code terminal with <code>java play/week2-money/Rupees.java</code> and type 1 and 123450. The terminal may show <code>?</code> instead. The character inside your program is the same. The terminal is using an older table of characters that has no rupee sign. Put <code>"Rs "</code> back afterwards: the checks expect it.' },
          {
            t: 'deeper', title: 'Text cannot be changed, and the == trap',
            html: '<p>Every method you used gave back a <b>new</b> String. <code>digits.substring(0, 2)</code> does not shorten <code>digits</code>. It makes a new piece of text, and <code>digits = ...</code> moves the label onto it. A Java String can never be changed after it is made. This is called being <b>immutable</b>.</p><p>So <code>out = "," + part + out;</code> in a loop makes a brand-new String every round and throws the old one away. For a few rounds that is nothing. For text built in a loop of a million rounds, Java has <code>StringBuilder</code>, a box of text that can be changed in place.</p><p><b>The trap.</b> Because a String variable holds where the text is, like an array does, <code>==</code> on two Strings asks "are these the same text in the same place?", not "do they say the same thing?":</p><pre>String a = "Rs";\nString b = new String("Rs");\nSystem.out.println(a == b);       // false\nSystem.out.println(a.equals(b));  // true</pre><p>Always compare text with <code>.equals</code>. This bug often hides because Java reuses identical text written straight in your code, so <code>==</code> happens to work in small tests and fails on text that was typed in or read from a file.</p><p>Real programs format money with the standard library, for example <code>NumberFormat.getCurrencyInstance(new Locale("en", "IN"))</code>, which knows the Indian grouping and the ₹ sign. You wrote it by hand once so you know what such a library does.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m6',
        title: 'Pay it back',
        skill: 'Everything together: methods, a loop, a guard',
        blocks: [
          { t: 'say', html: 'The tool so far grows money, and a loan grows the same way, against you. Each month the bank adds interest to what you owe, then your payment comes off. If the payment is smaller than the interest, the debt grows for ever.<br><br>This mission uses everything from the week. Copy your two methods <code>monthlyInterest</code> and <code>rupees</code> into the new file. (Week 4 shows how one file can use another\'s methods without copying.)' },
          {
            t: 'stepper',
            code: ['long balance = 50000;     // owe Rs 500', 'long payment = 20000;     // pay Rs 200 a month, 0% interest', 'balance = balance - payment;   // month 1', 'balance = balance - payment;   // month 2', 'long last = Math.min(payment, balance);   // month 3', 'balance = balance - last;'],
            steps: [
              { line: 0, vars: { balance: 50000 }, out: [], note: 'A loan of ₹500 with no interest, to see the shape.' },
              { line: 1, vars: { balance: 50000, payment: 20000 }, out: [], note: '₹200 a month.' },
              { line: 2, vars: { balance: 30000, payment: 20000 }, out: [], note: 'Month 1: ₹300 left.' },
              { line: 3, vars: { balance: 10000, payment: 20000 }, out: [], note: 'Month 2: ₹100 left.' },
              { line: 4, vars: { balance: 10000, payment: 20000, last: 10000 }, out: [], note: 'Month 3: paying ₹200 would overpay. Math.min gives back the smaller of two numbers, so the last payment is only what is owed.' },
              { line: 5, vars: { balance: 0, payment: 20000, last: 10000 }, out: [], note: 'Paid off in 3 months. With interest, the same loop adds monthlyInterest(balance, rate) before taking the payment.' },
            ],
          },
          {
            t: 'task', file: DIR + 'Loan.java', xp: 100,
            runs: [
              { name: 'Rs 1,00,000 at 12%, Rs 10,000 a month', stdin: lines(10000000, 1200, 1000000) },
              { name: 'A payment that only covers the interest', stdin: lines(10000000, 1200, 100000) },
              { name: 'No interest', stdin: lines(50000, 0, 20000) },
              { name: 'Rs 50 lakh at 9.5%, Rs 50,000 a month', stdin: lines(500000000, 950, 5000000) },
            ],
            html: 'Write <b>play/week2-money/Loan.java</b>.<ul><li>Read the loan in paise, the yearly rate in basis points, and the monthly payment in paise.</li><li>If one month\'s interest on the loan is <b>at least</b> the payment, print only <code>This payment never pays it off.</code> and stop.</li><li>Otherwise, each month: add the month\'s interest, take off the payment (but never more than is owed), and print<br><code>Month M: interest I, paid P, left L</code><br>with all three amounts written by your <code>rupees</code> method.</li><li>When nothing is left, print <code>Paid off in N months. Total interest: T</code>, with T written by <code>rupees</code>.</li></ul>For the first loan, the first and last lines are:<pre>Month 1: interest Rs 1,000.00, paid Rs 10,000.00, left Rs 91,000.00\n...\nMonth 11: interest Rs 58.40, paid Rs 5,898.48, left Rs 0.00\nPaid off in 11 months. Total interest: Rs 5,898.48</pre>',
            checks: [
              stops, ran,
              { label: 'Your file has monthlyInterest and rupees', test: r => /static\s+long\s+monthlyInterest\s*\(\s*long\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) && /static\s+String\s+rupees\s*\(\s*long\s+\w+\s*\)/.test(r.src) },
              { label: 'Every month and the summary are right, to the paisa', test: r => exact(r, loanWant(r)) === '', why: r => exact(r, loanWant(r)) },
            ],
            hints: [
              'Why would the loop never end for the second loan? Write down the first three months by hand.',
              'The guard comes before the loop: compare monthlyInterest(loan, rate) with the payment. After printing the message, return; ends main.',
              'Inside the loop the order matters: interest is added first, then the payment is worked out with Math.min(payment, balance), then taken off.',
              'Keep a running total of the interest, and a month counter, in boxes made before the loop.',
            ],
          },
          { t: 'try', file: DIR + 'Loan.java', stdin: lines(500000000, 950, 10000000), html: '<b>Pay more, pay less.</b> The Rs 50 lakh loan again, but paying Rs 1,00,000 a month instead of Rs 50,000. Before you run it, guess the total interest. Compare it with the Rs 50,000 run above.' },
          {
            t: 'deeper', title: 'What an EMI is',
            html: '<p>A bank loan in India is usually repaid by an <b>EMI</b>, an equated monthly instalment: the same payment every month, chosen so the last one clears the loan exactly. Your program takes the payment as given. A bank works the payment out from the loan, the rate and the number of months, with a formula built on the same compound growth you programmed: P × r × (1 + r)<sup>n</sup> ÷ ((1 + r)<sup>n</sup> − 1), where r is the monthly rate and n the number of months.</p><p>Look at your first run line by line. In month 1, ₹1,000 of the ₹10,000 payment went on interest. In month 10, only ₹156.83 did. Early payments are mostly interest, late ones are mostly loan. That is why paying extra early in a loan saves far more than paying extra near the end, and why the bigger payment in the experiment cut the total interest by much more than half.</p><p>The guard you wrote is also a real pattern: check that the input makes sense <b>before</b> starting work that depends on it. Without it, the program would loop for ever on a bad payment. In a server, that is one stuck request. Repeated, it is an outage.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m7',
        title: 'Challenge: split the bill',
        skill: 'Remainder, a loop, a method, no help',
        blocks: [
          { t: 'say', html: 'The third timed challenge. <b>No hints</b>, no AI, and a new problem. You write it in <b>play/week2-money/Challenge3.java</b>, which is empty apart from the wrapper.<br><br>Before you start: use the five steps from the note "How to read a problem". Write down, from the problem text alone, what happens when the bill does not divide evenly, and what happens with nobody to pay. The lab runs several bills, including those cases.' },
          {
            t: 'task', file: DIR + 'Challenge3.java', xp: 130, timed: true, parSeconds: 1500,
            runs: [
              { name: 'Rs 100 between 3', stdin: lines(10000, 3) },
              { name: 'Rs 1 between 4', stdin: lines(100, 4) },
              { name: '5 paise between 7', stdin: lines(5, 7) },
              { name: 'Nothing to pay', stdin: lines(0, 2) },
              { name: 'Nobody to pay', stdin: lines(999, 0) },
              { name: 'A big bill between 6', stdin: lines(98765432101, 6) },
            ],
            html: 'Friends split a bill. The player types the bill in <b>paise</b>, then the number of people.<ul><li>Everyone pays the same whole number of paise, as large as possible. If that leaves some paise over, the first people each pay <b>one paisa more</b>, until the whole bill is covered. Nobody pays a fraction of a paisa.</li><li>Print one line per person, <code>Person K pays P</code>, with P in paise, then <code>Check: T</code>, the sum of what everyone pays.</li><li>If the number of people is 0 or less, print only <code>Nobody to pay.</code></li><li>You must write and use <code>static long shareFor(long total, int people, int person)</code>, which gives back what person number <code>person</code> pays.</li></ul>For 10000 and 3 the output is:<pre>Person 1 pays 3334\nPerson 2 pays 3333\nPerson 3 pays 3333\nCheck: 10000</pre><b>Bonus (+40 XP):</b> write each share as rupees with two digits of paise, for example <code>Person 1 pays Rs 33.34</code>. The Check line stays in paise.',
            checks: [
              stops,
              { label: 'The program runs without errors', test: r => r.ok, why: r => /ArithmeticException/.test(r.stderr) ? 'Java says "/ by zero". Which typed number can make your program divide by zero, and what should happen then?' : '' },
              { label: 'There is a method: static long shareFor(long total, int people, int person)', test: r => /static\s+long\s+shareFor\s*\(\s*long\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'shareFor is used', test: r => count(r.src, /\bshareFor\s*\(/g) >= 2 },
              { label: 'Every share and the check are right for this bill', test: r => splitProblem(r, false) === '', why: r => splitProblem(r, false) },
            ],
            bonus: { label: 'Bonus: every share is written as "Rs R.PP", right for every bill', xp: 40, test: r => splitProblem(r, true) === '' },
            hints: [],
          },
          { t: 'say', html: 'The remainder decided who pays a paisa more, and the Check line proved nothing was lost or invented. That is the whole week in one problem: exact whole paise, division and remainder, a method, and a guard for input that makes no sense.<br><br>It is not <b>mastered</b> until you solve something new like it, unaided, on a later day. Your tutor will set a rematch.<br><br>This is the end of week 2. Commit your programs, then open Claude Code in the <b>engineering-lab</b> folder and say <b>"next"</b>.' },
        ],
      },
    ],
  };

  if (!window.WEEKS) window.WEEKS = window.WEEK ? [window.WEEK] : [];
  window.WEEKS.push(W2);
  // Exposed for the tutor's tests only.
  window.WEEK2_CHECKS = { tillWant, billWant, growthWant, monthsWant, rupeesWant, loanWant, splitProblem, exact, rupees };
})();
