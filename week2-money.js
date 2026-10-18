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
      if (got[n] === undefined) return 'Line ' + (n + 1) + ' should be "' + want[n] + '", but the output ended.';
      if (got[n] !== want[n] && got[n].replace(/\s+/g, ' ') === want[n].replace(/\s+/g, ' ')) {
        const dots = t => '"' + t.replace(/ /g, '·') + '"';   // a page squeezes double spaces, so show each one as ·
        return 'Line ' + (n + 1) + ': only the spaces differ (each · is one space). It should be ' + dots(want[n]) + ', but it is ' + dots(got[n]) + '.';
      }
      if (got[n] !== want[n]) return 'Line ' + (n + 1) + ' should be "' + want[n] + '", but it is "' + got[n] + '".';
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
  function growthWhy(r) {
    const problem = exact(r, growthWant(r));
    if (!problem) return "";
    const [principal, rate, months] = nums(r), down = [];
    let bal = principal;
    for (let m = 1; m <= months; m++) { bal += Math.floor(bal * rate / 120000); down.push("Month " + m + ": " + bal); }
    const got = r.lines.map(l => l.trim()), n = down.findIndex((l, i) => l !== growthWant(r)[i]);
    if (n >= 0 && got[n] === down[n]) return problem + " Your monthlyInterest rounds down. Add half of 120000 (60000) before dividing.";
    return problem;
  }
  function monthsWant(r) {
    const s = nums(r).slice(0, 12), total = s.reduce((a, b) => a + b, 0), avg = roundDiv(total, 12);
    let hi = 0, lo = 0;
    s.forEach((v, i) => { if (v > s[hi]) hi = i; if (v < s[lo]) lo = i; });
    const above = s.map((v, i) => (v > avg ? i + 1 : 0)).filter(Boolean);
    return ['Total: ' + total, 'Average: ' + avg, 'Highest: month ' + (hi + 1) + ' (' + s[hi] + ')', 'Lowest: month ' + (lo + 1) + ' (' + s[lo] + ')', 'Above average: ' + (above.length ? above.join(' ') : 'none')];
  }
  function monthsWhy(r) {
    const problem = exact(r, monthsWant(r));
    if (!problem) return "";
    const total = nums(r).slice(0, 12).reduce((x, y) => x + y, 0), down = Math.floor(total / 12);
    if ((r.lines[1] || "").trim() === "Average: " + down && down !== roundDiv(total, 12)) return problem + " " + total + " ÷ 12 is " + (total / 12).toFixed(2) + ", which rounds to " + roundDiv(total, 12) + ". Plain / dropped the part after the point. Add half of 12 before dividing.";
    return problem;
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
  // The challenge accepts each share in paise ("Person 1 pays 3334") or as rupees ("Person 1 pays Rs 33.34",
  // or with Indian commas "Rs 16,46,09,053.51").
  function splitProblem(r, rupeesOnly) {
    const [total, people] = nums(r), got = r.lines.map(l => l.trim());
    if (people <= 0) return got.length === 1 && got[0] === 'Nobody to pay.' ? '' : 'With ' + people + ' people the only line should be "Nobody to pay."';
    const base = Math.floor(total / people), extra = total % people;
    for (let k = 1; k <= people; k++) {
      const want = base + (k <= extra ? 1 : 0), line = got[k - 1];
      if (line === undefined) return 'The output ended before person ' + k + '.';
      // Rupees may come with or without Indian commas (his own rupees() method adds them).
      let m = line.match(/^Person (\d+) pays Rs ([\d,]+)\.(\d\d)$/), v = null;
      if (m && /,/.test(m[2])) {
        const plain = m[2].replace(/,/g, ''), right = rupees(Number(plain) * 100).slice(3, -3);
        if (!/^\d+$/.test(plain) || m[2] !== right) return 'Line ' + k + ' has commas in the wrong places: "' + m[2] + '". Write the rupees as ' + (/^\d+$/.test(plain) ? right + ' or ' + plain : 'digits') + '.';
      }
      if (m) v = Number(m[2].replace(/,/g, '')) * 100 + Number(m[3]);
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
            t: 'try', file: DIR + 'Till.java', stdin: lines(2000000000, 2000000000, 0),
            html: '<b>Break it: the wrong box.</b> Change the box that holds the total from <code>long</code> to <code>int</code> and press Run. This adds two prices of 2,000,000,000 paise. What happens depends on how you wrote the adding line.<ul><li><code>total = total + price;</code> Java refuses to run: <code>incompatible types: possible lossy conversion from long to int</code>. A long might not fit in an int, so Java makes you decide.</li><li><code>total += price;</code> Java runs it without a word, squeezes the answer into the int, and the total comes out as <code>-294967296</code>. The short form hides a conversion.</li></ul>Change your line to the other form and run again, so you have seen both. Then put the box back to <code>long</code>.',
          },
          {
            t: 'try',
            html: '<b>Save your work with Git (about 5 minutes).</b> From this week you keep your own history of your code. Git takes snapshots of your files. Each snapshot is called a <b>commit</b> and has a one-line message saying what changed.<ol><li>In VS Code open the terminal: menu <b>Terminal</b>, <b>New Terminal</b>. A terminal is a window where you type commands instead of clicking.</li><li>Type <code>pwd</code> and press Enter. It prints the folder you are in ("print working directory"). It should end in <code>engineering-lab</code>.</li><li>Type <code>ls</code>. It lists what is in that folder. Now <code>cd play</code> moves into the play folder, <code>ls</code> shows your files, and <code>cd ..</code> moves back up one level. Finish back in <code>engineering-lab</code>.</li><li>Type <code>git status</code>. Git lists the files that changed since the last snapshot. <code>play/week2-money/Till.java</code> will be in red. Other files the lab itself writes, such as <code>progress.json</code>, may also be listed. Leave those alone.</li><li>Choose what goes in the snapshot: <code>git add play/week2-money/Till.java</code>, then <code>git status</code> again. Till.java is now green: chosen, not yet saved.</li><li>Take the snapshot: <code>git commit -m "Till: totals in paise"</code></li><li>Run <code>git status</code> once more. Till.java is no longer listed. Its snapshot is saved.</li></ol>Your tutor reads these commits. From now on, commit each program when it passes.',
          },
          {
            t: 'deeper', title: 'The overflow Java does not warn you about, and how real systems carry money',
            html: '<p>Java stopped you from putting a long into an int. It will not stop this:</p><pre>int price = 2000000000;\nlong total = price * 3;\nSystem.out.println(total);</pre><p>This prints <code>1705032704</code>. The box on the left is a long, but the multiplication happens first, between two ints, and it overflows before the answer reaches the long. The fix is to make one side a long before multiplying: <code>long total = (long) price * 3;</code> or keep every money box a long from the start, which is why this week does.</p><p>Real systems work the same way you just did:</p><ul><li><b>Card payment messages</b> carry the amount as a 12-digit whole number of the smallest unit. ₹250.00 travels as <code>000000025000</code>. Payments note 3 shows the whole message.</li><li><b>Not every currency has 100 small units.</b> The Japanese yen has none, so ¥500 is stored as 500. The Kuwaiti dinar has 1,000 fils, so it needs three digits after the point. An international standard (ISO 4217) lists how many each currency has. A program that assumes "always 100" breaks on those.</li><li><b>Java\'s BigDecimal</b> stores decimal numbers exactly and is used in many banking programs, including Spring Boot ones you will write later. It is slower and wordier than a long. Whole paise in a long is the simple, exact choice for this week.</li></ul>',
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
          { t: 'say', html: 'A percentage is "out of 100": 18% of a number is the number × 18 ÷ 100. Rates are often not whole percents, for example 12.5% or 7.25%. So money programs count rates in <b>basis points</b>: one hundredth of a percent. 1% is 100 basis points, 18% is 1800, 7.25% is 725. Now every rate is a whole number, and X percent of an amount is <code>amount × basisPoints ÷ 10000</code>.' },
          { t: 'say', html: 'Whole-number division always throws the leftover away. That rounds <b>down</b>, even 180.99 down to 180. To round to the <b>nearest</b> instead, add half of what you divide by, before dividing. Anything at .5 or above is pushed past the next whole number. Predict:' },
          { t: 'predict', xp: 10, answer: '180 181', code: 'long a = 1003 * 18 / 100;\nlong b = (1003 * 18 + 50) / 100;\nSystem.out.println(a + " " + b);' },
          {
            t: 'stepper',
            code: ['long a = 1003 * 18 / 100;', 'long b = (1003 * 18 + 50) / 100;', 'System.out.println(a + " " + b);'],
            steps: [
              { line: 0, vars: { a: 180 }, out: [], note: '1003 × 18 is 18054. 18054 ÷ 100 is 180.54, and the .54 is thrown away: 180. That is rounding down.' },
              { line: 1, vars: { a: 180, b: 181 }, out: [], note: '18054 + 50 is 18104. 18104 ÷ 100 is 181.04, and the .04 is thrown away: 181. Adding half first turned "throw away" into "round to the nearest".' },
              { line: 2, vars: { a: 180, b: 181 }, out: ['180 181'], note: 'With basis points you divide by 10000, so half is 5000.' },
            ],
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
            html: '<b>Git, part 2.</b> In the terminal, before saving the snapshot, ask Git what changed: <code>git diff play/week2-money/Bill.java</code> shows nothing for a brand-new file, so first run <code>git add play/week2-money/Bill.java</code> and <code>git commit -m "Bill: GST to the nearest paisa"</code>. Then change one line of Bill.java, save, and run <code>git diff</code>: red lines were removed, green lines were added. Undo your change and save. Finally <code>git log --oneline</code> lists your snapshots, newest first. Press <b>q</b> if it waits at the end.',
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
          { t: 'say', html: 'Put money in a savings account and the bank pays you <b>interest</b>: a percentage of your <b>balance</b> (how much is in the account right now), for letting it use your money. There are two ways to pay it.<ul><li><b>Simple:</b> interest only on what you put in.<br>Example: ₹1,000 at 12% a year.<br>12% of ₹1,000 = 1,000 × 12 ÷ 100 = <b>₹120 a year</b>.<br>Shared over 12 months: ₹120 ÷ 12 = <b>₹10 every month</b>, for ever.</li><li><b>Compound:</b> each month\'s interest is added to the balance.<br>Next month\'s interest is worked out on the bigger balance.<br>Interest earns interest.</li></ul><b>The same ₹1,000 at 12% a year, both ways.</b> 12% a year is 1% a month.<br><br><b>Simple</b> (always 1% of the ₹1,000 you put in):<br>Month 1: 1% of ₹1,000 = ₹10. Balance ₹1,010.<br>Month 2: 1% of ₹1,000 = ₹10. Balance ₹1,020.<br>Month 3: 1% of ₹1,000 = ₹10. Balance ₹1,030.<br><br><b>Compound</b> (1% of whatever the balance is now):<br>Month 1: 1% of ₹1,000 = ₹10. Balance ₹1,010.<br>Month 2: 1% of ₹1,010 = ₹10.10. Balance ₹1,020.10.<br>Month 3: 1% of ₹1,020.10 = ₹10.20. Balance ₹1,030.30.<br><br>Month 1 is the same. From month 2, compound pays a little more, because last month\'s interest is now earning interest too. The gap grows every month:<div class="tablewrap"><table class="plain"><tr><th>After</th><th>Simple</th><th>Compound</th><th>Extra from compounding</th></tr><tr><td>1 month</td><td>₹1,010.00</td><td>₹1,010.00</td><td>₹0</td></tr><tr><td>3 months</td><td>₹1,030.00</td><td>₹1,030.30</td><td>₹0.30</td></tr><tr><td>12 months</td><td>₹1,120.00</td><td>₹1,126.84</td><td>₹6.84</td></tr></table></div>Over many years the gap gets huge. Try it below.<b>Try it.</b> Move the sliders. Make the years long and watch the two lines part.<div data-widget="growth" data-key="m3-growth"></div>' },
          { t: 'say', html: 'This mission repeats something a known number of times: 12 months, 24 months. Java has a loop made for counting, the <code>for</code> loop. It is a while loop with its three counting parts written on one line:' },
          { t: 'code', code: 'for (int m = 1; m <= 3; m++) {\n    System.out.println("Month " + m);\n}\n\n// does exactly the same as\nint m = 1;\nwhile (m <= 3) {\n    System.out.println("Month " + m);\n    m++;\n}' },
          { t: 'say', html: 'The three parts, separated by semicolons: <b>start</b> (<code>int m = 1</code>, done once), <b>keep going while</b> (<code>m &lt;= 3</code>, asked before every round), <b>after each round</b> (<code>m++</code>). <code>m++</code> is short for <code>m = m + 1</code> (and <code>m--</code> for <code>m = m - 1</code>). One difference: a box made in the first part only exists inside the loop.<br><br>Predict this one. The balance grows by a tenth of itself each round.' },
          { t: 'predict', xp: 10, answer: '1331', code: 'long b = 1000;\nfor (int m = 1; m <= 3; m++) {\n    b = b + b / 10;\n}\nSystem.out.println(b);' },
          { t: 'say', html: 'The rate is per year, but interest is added every month. Banks quote a yearly rate and add one twelfth of it each month. So one month\'s interest is <code>balance × rate ÷ 10000 ÷ 12</code>: ÷ 10000 because the rate is in basis points, ÷ 12 for the months. Step by step for ₹1,000 (100000 paise) at 12% (1200 basis points):<pre>100000 × 1200   = 120,000,000\n÷ 10000         = 12,000 paise a year    (₹120)\n÷ 12            = 1,000 paise a month    (₹10)</pre>Two divides in a row can be done as one: ÷ 10000 and then ÷ 12 is the same as ÷ (10000 × 12), which is ÷ 120000. Check: 120,000,000 ÷ 120000 = 1,000. The same answer.<br><br>To round to the nearest paisa, use the rule from the last mission: <b>add half of what you divide by</b>, then divide. You divide by 120000, and half of 120000 is 60000:' },
          { t: 'code', code: 'static long monthlyInterest(long balance, int basisPointsPerYear) {\n    return (balance * basisPointsPerYear + 60000) / 120000;\n}' },
          {
            t: 'stepper',
            code: ['long balance = 101050;', 'long top = balance * 1200;', 'long down = top / 120000;', 'long near = (top + 60000) / 120000;', 'System.out.println(down + " " + near);'],
            steps: [
              { line: 0, vars: { balance: 101050 }, out: [], note: '₹1,010.50 in the account, at 12% a year.' },
              { line: 1, vars: { balance: 101050, top: 121260000 }, out: [], note: '101050 × 1200 = 121,260,000.' },
              { line: 2, vars: { balance: 101050, top: 121260000, down: 1010 }, out: [], note: '121,260,000 ÷ 120000 = 1010.5. Whole-number division throws the .5 away: 1010. That is rounding down.' },
              { line: 3, vars: { balance: 101050, top: 121260000, down: 1010, near: 1011 }, out: [], note: '121,260,000 + 60000 = 121,320,000. ÷ 120000 = 1011 exactly. Adding half first pushed 1010.5 up to 1011, the nearest paisa (half rounds up).' },
              { line: 4, vars: { balance: 101050, top: 121260000, down: 1010, near: 1011 }, out: ['1010 1011'], note: 'monthlyInterest(101050, 1200) does the near line: it gives back 1011 paise.' },
            ],
          },
          { t: 'say', html: 'Your turn. ₹2,000 is 200000 paise, and 6% is 600 basis points. Predict one month\'s interest in paise:' },
          { t: 'predict', xp: 10, answer: '1000', code: 'long balance = 200000;\nlong top = balance * 600;\nSystem.out.println((top + 60000) / 120000);' },
          {
            t: 'task', file: DIR + 'Growth.java', xp: 80,
            runs: [
              { name: '₹1,000 at 12% for 12 months', stdin: lines(100000, 1200, 12) },
              { name: '₹50,000 at 7.25% for 24 months', stdin: lines(5000000, 725, 24) },
              { name: 'Zero months', stdin: lines(100000, 1200, 0) },
              { name: 'One paisa at 12% for 3 months', stdin: lines(1, 1200, 3) },
            ],
            html: 'Write <b>play/week2-money/Growth.java</b>.<ul><li>Read the starting amount in paise, the yearly rate in basis points, then the number of months.</li><li>Use a <code>for</code> loop. Each month, add that month\'s interest to the balance and print <code>Month M: B</code>.</li><li>Then print <code>Compound interest: C</code> (how much the balance grew) and <code>Simple interest: S</code> (the first month\'s interest on the starting amount, times the number of months).</li><li>Write and use <code>static long monthlyInterest(long balance, int basisPointsPerYear)</code>. It gives back <b>one month&#39;s interest only</b>, in paise (for 100000 at 1200 that is 1000). It does not add anything to the balance. <code>main</code> does the rest: it calls the method each month, adds the answer to the balance, and prints.<pre>balance, rate  →  monthlyInterest  →  interest\nmain:  balance = balance + interest,  print Month M: balance</pre></li></ul>For 100000, 1200, 12 the output starts and ends like this:<pre>Month 1: 101000\nMonth 2: 102010\nMonth 3: 103030\n...\nMonth 12: 112684\nCompound interest: 12684\nSimple interest: 12000</pre>',
            checks: [
              stops, ran,
              { label: 'Your file uses a for loop', test: r => /\bfor\s*\(/.test(r.src) },
              { label: 'There is a method: static long monthlyInterest(long balance, int basisPointsPerYear)', test: r => /static\s+long\s+monthlyInterest\s*\(\s*long\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'monthlyInterest is used', test: r => count(r.src, /\bmonthlyInterest\s*\(/g) >= 2 },
              { label: 'Every month, and both totals, are right', test: r => exact(r, growthWant(r)) === '', why: growthWhy },
            ],
            hints: [
              'Which number changes every month, and which one must stay as it was typed? You need both at the end.',
              'Keep the typed starting amount in one box and copy it into a second box, the balance, which the loop changes.',
              'Inside the loop: balance gets bigger by monthlyInterest(balance, rate), then print the line.',
              'Compound interest is the final balance minus the starting amount. Simple interest uses the starting amount, not the balance.',
            ],
          },
          { t: 'try', file: DIR + 'Growth.java', stdin: lines(100000, 1200, 72), html: '<b>The rule of 72.</b> This runs ₹1,000 at 12% for 72 months, which is 6 years. Before you press Run, guess the last balance. There is an old rule of thumb (a quick guess, not exact): money roughly doubles in 72 ÷ rate years, with the rate as a percent (12, not 1200 basis points). At 12%, 72 ÷ 12 = 6 years. Doubled, ₹1,000 would be 200000 paise. How close is your run?' },
          {
            t: 'deeper', title: 'How banks really do it',
            html: '<p>Your program adds interest monthly on the closing balance. Real accounts differ in two ways.</p><ul><li><b>When it is worked out.</b> In India, savings-account interest is worked out on the balance at the end of every day, and paid into the account a few times a year. A deposit made on the 20th earns for the days it was there.</li><li><b>How often it compounds.</b> The more often interest is added, the more interest earns interest. 12% added once a year makes ₹1,000 into ₹1,120. Added monthly, it makes about ₹1,126.83 (your program says ₹1,126.84, because it rounds to the paisa every month, and those small roundings add up). Banks therefore quote an "effective" yearly rate as well as the headline rate: what you really earn in a year once monthly compounding is counted. Here ₹126.83 on ₹1,000 is 12.68%, not 12%.</li></ul><p>The growth is <b>exponential</b>: each step multiplies by the same factor, so the curve bends upwards. Here 12% ÷ 12 = 1% a month, and adding 1% to a number is the same as multiplying it by 1.01 (₹1,000 × 1.01 = ₹1,010). Loans work the same way against you, which is lesson 6 of this week. Exponential growth also explains why an algorithm that doubles its work for each extra item becomes useless very quickly, which you will meet in problem solving.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m4',
        title: 'Twelve months in one box',
        skill: 'Arrays',
        blocks: [
          { t: 'say', html: '<b>Idea 1: the average.</b><br>The average shares a total out equally.<br>Average = total ÷ number of months.<pre>months:   ₹100, ₹200, ₹600\ntotal   = ₹100 + ₹200 + ₹600 = ₹900\naverage = ₹900 ÷ 3            = ₹300</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Work it out on paper. Type the average in rupees, just the number.', answer: '250', code: '4 months: ₹200, ₹400, ₹100, ₹300\naverage = ?' },
          { t: 'say', html: '<b>Idea 2: above average.</b><br>A month is above average if it spent <b>more than</b> the average.<br>Equal to the average does not count.<pre>average: ₹300\nmonth 1:  ₹100   no\nmonth 2:  ₹200   no\nmonth 3:  ₹600   yes   ← above average</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type the month numbers that are above average, with a space between.', answer: '2 4', code: '4 months: ₹200, ₹400, ₹100, ₹300\naverage: ₹250\nwhich months are above average?' },
          { t: 'say', html: '<b>Idea 3: highest and lowest.</b><br>Find the month that spent the most, and the one that spent the least.<br>If two months tie, take the <b>earlier</b> one.<pre>months:   ₹300, ₹900, ₹200, ₹900\nhighest:  ₹900 in month 2 and month 4   → tie → month 2\nlowest:   ₹200 in month 3               → month 3</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Which month is the highest? Type just the month number.', answer: '3', code: '5 months: ₹500, ₹100, ₹700, ₹700, ₹100\nhighest = month ?' },
          { t: 'say', html: '<b>Idea 4: rounding to the paisa.</b><br>Money stops at the paisa: two digits after the point.<br>Look at the third digit after the point: under 5 rounds down, 5 or more rounds up.<pre>₹100 ÷ 12 = ₹8.333...    third digit 3 → ₹8.33\n₹200 ÷ 12 = ₹16.666...   third digit 6 → ₹16.67</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Round to the nearest paisa. Type it like 8.33.', answer: '4.17', code: '₹50 ÷ 12 = ₹4.1666...\nnearest paisa = ?' },
          { t: 'say', html: '<b>Idea 5: the same sum in paise.</b><br>The program counts money in paise: ₹1 = 100 paise.<br>Same sum, same answer, just counted in paise.<pre>₹200 = 200 × 100 = 20000 paise\n20000 ÷ 12 = 1666.66... paise\nnearest    = 1667 paise          (= ₹16.67)</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type the nearest whole number of paise.', answer: '417', code: '₹50 = 50 × 100 = 5000 paise\n5000 ÷ 12 = 416.66... paise\nnearest = ? paise' },
          { t: 'say', html: '<b>Now Java. Idea 6: an array.</b><br>To compare every month with the average, the program must keep all twelve.<br>An <b>array</b> is one name for a row of numbered boxes.' },
          { t: 'code', code: 'long[] spent = new long[12];   // a row of 12 long boxes, all starting at 0\nspent[0] = 4500;                // the first box\nspent[11] = 900;                // the last box\nSystem.out.println(spent.length);   // 12' },
          { t: 'say', html: '<code>new long[12]</code> makes 12 boxes. Their number never changes. <span class="later">Coming in weeks 4 to 5: what new does in memory</span><br>The boxes are numbered from <b>0</b>, so 0 to 11. That number is the <b>index</b>.<br><code>spent.length</code> is how many boxes there are.' },
          { t: 'say', html: '<b>Try it.</b> Pick an index and see where Java finds the box.<div data-widget="arraymem" data-key="m4-array"></div>' },
          { t: 'predict', xp: 10, answer: '15', code: 'int[] a = new int[3];\na[0] = 5;\na[2] = a[0] * 2;\nSystem.out.println(a[0] + a[1] + a[2]);' },
          { t: 'say', html: '<b>Idea 7: an array and a loop.</b><br>The index can be a box too: <code>spent[i]</code>.<br>A for loop with i from 0 while i &lt; length visits every box once.' },
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
          { t: 'predict', xp: 10, answer: '40', code: 'long[] a = new long[4];\nfor (int i = 0; i < a.length; i++) {\n    a[i] = i * 10;\n}\nSystem.out.println(a[1] + a[3]);' },
          { t: 'say', html: '<b>Idea 8: rounding in Java.</b><br>Plain <code>/</code> throws away the part after the point, so it always rounds down.<br>To round to the nearest, add half of what you divide by first. Half of 12 is 6.<pre>20000 / 12          = 1666    (.66 thrown away)   ✗\n(20000 + 6) / 12    = 20006 / 12 = 1667          ✓</pre>' },
          { t: 'predict', xp: 10, answer: '416 417', code: 'long total = 5000;   // paise\nSystem.out.println(total / 12 + " " + (total + 6) / 12);' },
          { t: 'say', html: '<b>Idea 9: the highest month in Java.</b><br>Keep the <b>index</b> of the best month so far, starting at box 0.<br>Replace it only when a box is <b>bigger</b> (<code>&gt;</code>), so a tie keeps the earlier month.' },
          {
            t: 'stepper',
            code: ['long[] s = {300, 900, 200, 900};', 'int best = 0;', 'for (int i = 1; i < s.length; i++) {', '    if (s[i] > s[best]) {', '        best = i;', '    }', '}', 'System.out.println("month " + (best + 1));'],
            steps: [
              { line: 0, vars: { s: '[300, 900, 200, 900]' }, out: [], note: 'Curly brackets make an array already filled with these values. Its length is 4. (In the task you fill it from the keyboard instead.)' },
              { line: 1, vars: { s: '[300, 900, 200, 900]', best: 0 }, out: [], note: 'The best so far is box 0, the first month. So the loop can start comparing at box 1.' },
              { line: 4, vars: { s: '[300, 900, 200, 900]', best: 1, i: 1 }, out: [], note: 's[1] is 900, bigger than s[best] = s[0] = 300. best becomes 1.' },
              { line: 3, vars: { s: '[300, 900, 200, 900]', best: 1, i: 2 }, out: [], note: 's[2] is 200. Not bigger than 900. No change.' },
              { line: 3, vars: { s: '[300, 900, 200, 900]', best: 1, i: 3 }, out: [], note: 's[3] is 900. Not BIGGER than 900, only equal. So the earlier month stays the best. That is how a tie names the earlier month.' },
              { line: 7, vars: { s: '[300, 900, 200, 900]', best: 1 }, out: ['month 2'], note: 'Index 1 is the second month. People count months from 1, so add 1 when you show it: index 0 is month 1, index 11 is month 12.' },
            ],
          },
          { t: 'predict', xp: 10, answer: 'month 4', code: '// the same code, but with >= instead of >\nlong[] s = {300, 900, 200, 900};\nint best = 0;\nfor (int i = 1; i < s.length; i++) {\n    if (s[i] >= s[best]) {\n        best = i;\n    }\n}\nSystem.out.println("month " + (best + 1));' },
          { t: 'say', html: 'With <code>&gt;=</code> an equal month wins too, so the later 900 wins: month 4.<br>The task wants the earlier month, so use <code>&gt;</code>.<br>The lowest month is the same pattern with <code>&lt;</code>.' },
          { t: 'say', html: '<b>Idea 10: building the last line.</b><br>A <code>String</code> box holds text. <code>""</code> is empty text.<br>Glue on one month at a time, and count how many you glued.' },
          { t: 'code', code: 'String line = "";           // a box for text, starting empty\nint above = 0;              // how many months were added\nline = line + " " + 3;      // line is now " 3"\nabove = above + 1;\nline = line + " " + 7;      // line is now " 3 7"\nabove = above + 1;\nSystem.out.println("Above average:" + line);   // Above average: 3 7' },
          { t: 'predict', xp: 10, answer: 'Above: 2 5 (2)', code: 'String line = "";\nint above = 0;\nline = line + " " + 2;\nabove = above + 1;\nline = line + " " + 5;\nabove = above + 1;\nSystem.out.println("Above:" + line + " (" + above + ")");' },
          { t: 'say', html: 'In the task the gluing happens inside a loop, once per month above the average.<br>If the counter is still 0 after the loop, print <code>Above average: none</code>.' },
          {
            t: 'task', file: DIR + 'Months.java', xp: 90,
            runs: [
              { name: 'A normal year', stdin: lines(450000, 380000, 520000, 410000, 390000, 610000, 300000, 450000, 470000, 800000, 350000, 400000) },
              { name: 'Every month the same', stdin: lines(...Array(12).fill(250000)) },
              { name: 'Two months tie for highest', stdin: lines(100, 900, 300, 900, 50, 50, 700, 200, 100, 600, 400, 1) },
              { name: 'One huge month', stdin: lines(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 9000000000) },
            ],
            html: 'Write <b>play/week2-money/Months.java</b>. There is no method to write this time: everything happens in <code>main</code>.<ul><li><b>Takes in:</b> twelve amounts in paise, one per line, January first.</li><li><b>Prints</b> five lines:<pre>Total: T\nAverage: A\nHighest: month M (X)\nLowest: month M (X)\nAbove average: M M M</pre></li></ul><b>What main does, in order:</b><pre>read the 12 amounts  →  into a long array, adding each to the total\ntotal                →  the average (tool 1)\nthe array            →  the highest and lowest months (tool 2)\narray and average    →  the months above average (tool 3)\nprint the 5 lines</pre><b>Rules:</b><ul><li>Months are numbered 1 to 12 in the output (index i is month i + 1).</li><li>The average is the total ÷ 12, rounded to the nearest paisa, with exactly half rounding up.</li><li>If two months tie for highest or lowest, name the earlier one.</li><li>The last line lists, in order, every month that spent <b>more than</b> the number on the Average line, with one space between. If there are none: <code>Above average: none</code></li><li>Keep the twelve amounts in a <code>long</code> array.</li></ul><b>A worked example.</b> The lab\'s third run types these twelve amounts, all in paise:<pre>100  900  300  900  50  50  700  200  100  600  400  1</pre>The right output, with what each line means:<pre>Total: 4301                  100 + 900 + ... + 1 = 4301 paise\nAverage: 358                 4301 ÷ 12 = 358.41... paise → nearest 358\nHighest: month 2 (900)       months 2 and 4 tie at 900 paise; the earlier wins\nLowest: month 12 (1)         month 12 spent 1 paisa\nAbove average: 2 4 7 10 11   these spent 900, 900, 700, 600, 400 paise,\n                             each more than 358 paise</pre>',
            checks: [
              stops, ran,
              { label: 'The amounts are kept in a long array', test: r => /long\s*\[\s*\]\s*\w+\s*=\s*new\s+long\s*\[/.test(r.src) },
              { label: 'Your file uses a for loop', test: r => /\bfor\s*\(/.test(r.src) },
              { label: 'All five lines are right for this year', test: r => exact(r, monthsWant(r)) === '', why: monthsWhy },
            ],
            hints: [
              'Which of the five lines can only be worked out after every month has been read? Those need a second loop over the array.',
              'First loop: read each month into spent[i] and add it to the total. Then work out the average. Then a second loop for highest and lowest, and a third (or the same second one) for "above average".',
              'For the highest, keep the index of the best month so far, starting at 0. Replace it only when a month is strictly bigger, so a tie keeps the earlier month.',
              'Build the last line as text (tool 3 above): start with String line = "" and a counter at 0. For each month above the average, glue " " + the month number onto line and add 1 to the counter. After the loop, if the counter is 0, print "Above average: none".',
            ],
          },
          { t: 'try', file: DIR + 'Months.java', stdin: lines(...Array(12).fill(1)), html: '<b>Break it: one box too far.</b><br>Change your first loop\'s question from <code>&lt;</code> to <code>&lt;=</code> and run.<br>Java says <code>ArrayIndexOutOfBoundsException: Index 12 out of bounds for length 12</code>. Put it back.' },
          {
            t: 'deeper', title: 'Optional: why the first box is number 0',
            html: '<p><i>Optional. The task does not need this.</i></p><p><b>The index is a distance.</b> An array is one block of memory, boxes side by side. A long takes 8 bytes.</p><pre>box i starts at:   start + i × 8\nbox 0:             start + 0 × 8  = start\nbox 11:            start + 11 × 8 = start + 88</pre><p>Box 0 is zero steps from the start. Any box is one multiply and one add away, so <code>spent[11]</code> is as fast as <code>spent[0]</code>.</p><p><b>The size is fixed.</b> The memory after the block may belong to something else. Later, <code>ArrayList</code> grows by copying into a bigger block for you.</p><p><b>Two names, one row.</b> <code>long[] b = spent;</code> copies where the row is, not the numbers. Change <code>b[1]</code> and <code>spent[1]</code> changes too.</p><p>Print an array directly and you see something like <code>[J@2698dc7</code>: Java describing that location, not the numbers.</p><p><b>Why Java checks every index.</b> It stops a program reading memory it does not own. C skips this check, and that caused some of the worst security bugs in history.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m5',
        title: 'Rupees, the Indian way',
        skill: 'Strings: length, substring, building text',
        blocks: [
          { t: 'say', html: '<b>Idea 1: commas, the Indian way.</b><br>The last <b>three</b> rupee digits go together. Before them, digits go in <b>twos</b>.<br>₹1,00,000 is one lakh. ₹1,00,00,000 is one crore.<pre>rupees:       1234567\nlast three:   567     → ,567\nleft:         1234\nlast two:     34      → ,34,567\nleft:         12      (two digits or fewer: stop)\nresult:       12,34,567</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type the rupees with Indian commas.', answer: '9,87,65,432', code: '98765432 rupees, with Indian commas = ?' },
          { t: 'say', html: '<b>Idea 2: the paise part.</b><br>Paise are always written with <b>two</b> digits.<br>Three rupee digits or fewer get no comma.<pre>₹12,34,567 and 50 paise   →  Rs 12,34,567.50\n₹0 and 5 paise            →  Rs 0.05     (not Rs 0.5)\n₹999 and 0 paise          →  Rs 999.00</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type it with Rs in front, like Rs 0.05.', answer: 'Rs 7.03', code: '₹7 and 3 paise = ?' },
          { t: 'say', html: '<b>Idea 3: from paise back to rupees.</b><br>Your method is handed the amount in paise.<br><code>/ 100</code> gives the rupees, <code>% 100</code> gives the paise (lesson 1).<pre>123456750 / 100 = 1234567   rupees\n123456750 % 100 = 50        paise\nwritten:          Rs 12,34,567.50</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type it with Rs, Indian commas and two paise digits.', answer: 'Rs 12,345.05', code: '1234505 paise = ?' },
          { t: 'say', html: '<b>Now Java. Idea 4: text is a String.</b><br>Characters are numbered from 0, like an array. <code>s.length()</code> asks how many there are.<br><code>substring(a, b)</code> takes from index a up to, <b>not including</b>, index b.' },
          {
            t: 'code',
            code: 'String s = "123456";\ns.length()                    // 6: how many characters\ns.substring(3)                // "456": from index 3 to the end\ns.substring(0, 3)             // "123": from index 0 up to, not including, index 3\ns.substring(s.length() - 3)   // "456": the last three, for any String\n"" + 1234                     // "1234": a number glued onto text becomes text\n"," + "456"                   // ",456"',
          },
          { t: 'predict', xp: 10, answer: '6 456 123', code: 'String s = "123456";\nSystem.out.println(s.length() + " " + s.substring(3) + " " + s.substring(0, 3));' },
          { t: 'say', html: '<b>Idea 5: watch the brackets.</b><br>An array\'s size: <code>spent.length</code>, no brackets.<br>A String\'s size: <code>s.length()</code>, with brackets, because it is a method you call.<pre>spent.length()   →  error: cannot find symbol ... symbol: method length()\ns.length         →  error: cannot find symbol ... symbol: variable length</pre>' },
          { t: 'predict', xp: 10, answer: '7', code: 'String s = "Rs";\nlong[] a = new long[5];\nSystem.out.println(s.length() + a.length);' },
          { t: 'say', html: '<b>Idea 6: the paper grouping, in Java.</b><br>Take the last three digits, then twos, while more than two digits are left.<br>Each step puts a comma and the digits in front of what is built so far.' },
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
          { t: 'predict', xp: 10, answer: '9,87,65,432', code: 'String digits = "98765432";\nString out = "," + digits.substring(digits.length() - 3);\ndigits = digits.substring(0, digits.length() - 3);\nwhile (digits.length() > 2) {\n    out = "," + digits.substring(digits.length() - 2) + out;\n    digits = digits.substring(0, digits.length() - 2);\n}\nSystem.out.println(digits + out);' },
          {
            t: 'task', file: DIR + 'Rupees.java', xp: 90,
            runs: [
              { name: 'Small amounts', stdin: lines(5, 123450, 5, 100, 0, 99) },
              { name: 'Lakhs and crores', stdin: lines(4, 12345678905, 100000, 10000000, 999999999999) },
              { name: 'Three to five digits', stdin: lines(3, 1234500, 12345, 10) },
            ],
            html: 'Write <b>play/week2-money/Rupees.java</b>.<ul><li><b>The method: <code>static String rupees(long paise)</code></b><br>Takes in: an amount in paise, for example 123450.<br>Gives back: text, so the return type is <code>String</code>. The text is <code>Rs </code>, the rupees with Indian commas, a point, and the paise as <b>two</b> digits: for 123450 it gives back <code>"Rs 1,234.50"</code>. The method prints nothing.</li><li><b>main</b> reads how many amounts follow, then that many amounts in paise, and prints <code>rupees(...)</code> of each on its own line.</li><li><b>Rule:</b> build the text yourself. No <code>String.format</code>, <code>printf</code>, <code>DecimalFormat</code> or <code>NumberFormat</code> (ready-made formatting tools that come with Java).</li></ul><b>The flow:</b><pre>main:    read the count n\n         n times:  read paise  →  rupees(paise)  →  text  →  print it\n\nrupees:  paise  →  split into rupees and paise (/ and %)\n                →  rupees as text, with commas\n                →  give back "Rs " + rupees text + "." + two paise digits</pre><b>A worked example.</b> The lab\'s first run types:<pre>5\n123450\n5\n100\n0\n99</pre>The first number, 5, is how many amounts follow. It is a count, not an amount, so it is not printed. The right output, with what each line means:<pre>Rs 1,234.50    123450 paise = 1234 rupees and 50 paise\nRs 0.05        5 paise      = 0 rupees and 5 paise, shown as 05\nRs 1.00        100 paise    = 1 rupee and 0 paise, shown as 00\nRs 0.00        0 paise\nRs 0.99        99 paise     = 0 rupees and 99 paise</pre>A big one from the second run:<pre>12345678905 paise  →  Rs 12,34,56,789.05     (123456789 rupees and 5 paise)</pre>',
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
          { t: 'try', html: '<b>Optional: read the official Java docs (5 minutes).</b> Open <a href="https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html" target="_blank" rel="noopener">the Java 17 page for String</a>.<ol><li>Scroll to the <b>Method Summary</b> table.</li><li>Find <code>length()</code>. Its <b>Modifier and Type</b> column says <code>int</code>: a whole number comes back.</li><li>Click <code>substring(int beginIndex, int endIndex)</code>.</li><li>Read: <i>beginIndex - inclusive, endIndex - exclusive</i>. Inclusive means taken. Exclusive means not taken.</li><li>Check the example on your fingers: <code>"hamburger".substring(4, 8)</code> is <code>"urge"</code>.</li></ol>' },
          { t: 'try', file: DIR + 'Rupees.java', stdin: lines(1, 123450), html: '<b>Optional: the real ₹ sign.</b><br>In your method, replace <code>"Rs "</code> with <code>"\\u20B9"</code> and run here. The lab shows ₹1,234.50.<br><code>\\u20B9</code> is character number 20B9: the rupee sign.<br>Put <code>"Rs "</code> back afterwards: the checks expect it.' },
          {
            t: 'deeper', title: 'Optional: one more String tool, and the == trap',
            html: '<p><i>Optional. The task does not need this.</i></p><p><b>charAt.</b> <code>"123456".charAt(0)</code> gives back <code>\'1\'</code>, one character. Its type is <code>char</code>, written in single quotes: <code>"1"</code> is a String, <code>\'1\'</code> is a char.</p><p><b>A String never changes.</b> <code>substring</code> makes a <b>new</b> String, and <code>digits = ...</code> moves the name onto it. This is called being <b>immutable</b>.</p><p>For text built in a loop of a million rounds, Java has <code>StringBuilder</code>: text that can change in place.</p><p><b>The == trap.</b> Compare text with <code>.equals</code>, never <code>==</code>. <code>==</code> asks "same place in memory?", not "same letters?". <span class="later">Coming in weeks 4 to 5: what new does in memory</span></p><pre>String a = "Rs";\nString b = new String("Rs");\nSystem.out.println(a == b);       // false\nSystem.out.println(a.equals(b));  // true</pre><p><b>Java\'s own formatter groups in threes.</b> In Java 17, <code>NumberFormat</code> for India writes 12345678905 paise as <code>₹123,456,789.05</code>. That is why you write Indian commas by hand.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w2m6',
        title: 'Pay it back',
        skill: 'Everything together: methods, a loop, a guard',
        blocks: [
          { t: 'say', html: '<b>Idea 1: paying off a loan.</b><br>Each month your payment comes off what you owe.<br>The last payment is only what is left, never more.<pre>owe ₹500, pay ₹200 a month\nmonth 1:   ₹500 − ₹200 = ₹300 left\nmonth 2:   ₹300 − ₹200 = ₹100 left\nmonth 3:   pay only ₹100 → ₹0 left\npaid off in 3 months</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. How many months to pay it off? Type just the number.', answer: '3', code: 'owe ₹700, pay ₹300 a month\nmonths = ?' },
          { t: 'say', html: '<b>Idea 2: interest first, then the payment.</b><br>Each month the bank first adds interest to what you owe.<br>Then your payment comes off.<pre>₹1,00,000 at 12% a year = 1% a month, pay ₹10,000\nmonth 1:   interest = 1% of ₹1,00,000 = ₹1,000\n           ₹1,00,000 + ₹1,000  = ₹1,01,000\n           ₹1,01,000 − ₹10,000 = ₹91,000 left</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Month 2: how many rupees are left after the payment? Type just the number, no commas.', answer: '81910', code: 'month 2 starts with ₹91,000 owed\n1% a month, pay ₹10,000\nleft after paying = ?' },
          { t: 'say', html: '<b>Idea 3: a payment that is too small.</b><br>If the payment is not bigger than the interest, the loan never shrinks.<br>The program must refuse it before it starts. That check is a <b>guard</b>.<pre>₹1,00,000 at 1% a month, pay ₹1,000\nmonth 1:   interest = ₹1,000\n           ₹1,00,000 + ₹1,000 − ₹1,000 = ₹1,00,000 left\nmonth 2:   the same again, for ever</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type yes if it is ever paid off, or no.', answer: 'no', code: 'owe ₹50,000 at 1% a month, pay ₹400 a month\nmonth 1 interest = 1% of ₹50,000\npaid off? (yes or no)' },
          { t: 'say', html: '<b>Idea 4: the same numbers in paise.</b><br>The program counts money in paise and rates in basis points.<br>Both are the paper number × 100.<pre>₹1,00,000  = 100000 × 100 = 10000000 paise\n₹10,000    = 10000 × 100  = 1000000 paise\n12%        = 12 × 100     = 1200 basis points\n\nmonthlyInterest(10000000, 1200)\n= (10000000 × 1200 + 60000) / 120000\n= 100000 paise                 (= ₹1,000, as on paper)</pre>' },
          { t: 'predict', xp: 10, ask: 'Your turn. Type the answer in paise, just the number.', answer: '50000', code: '₹500 = ? paise' },
          { t: 'say', html: '<b>Now Java. Idea 5: Math.min.</b><br><code>Math.min(a, b)</code> gives back the smaller number. <code>Math.max(a, b)</code> gives back the bigger.<br><code>Math</code> comes with Java, like <code>System</code>, so it needs no import.' },
          {
            t: 'stepper',
            code: ['long balance = 50000;     // owed, in paise', 'long payment = 20000;     // paid each month, in paise', 'balance = balance - payment;   // month 1', 'balance = balance - payment;   // month 2', 'long last = Math.min(payment, balance);   // month 3', 'balance = balance - last;'],
            steps: [
              { line: 0, vars: { balance: 50000 }, out: [], note: 'Owed: 50000 paise, the loan from idea 1. No interest, to see the shape.' },
              { line: 1, vars: { balance: 50000, payment: 20000 }, out: [], note: 'Paid each month: 20000 paise.' },
              { line: 2, vars: { balance: 30000, payment: 20000 }, out: [], note: 'Month 1: 50000 − 20000 = 30000 paise left.' },
              { line: 3, vars: { balance: 10000, payment: 20000 }, out: [], note: 'Month 2: 30000 − 20000 = 10000 paise left.' },
              { line: 4, vars: { balance: 10000, payment: 20000, last: 10000 }, out: [], note: 'Month 3: only 10000 paise is owed. Math.min(20000, 10000) gives back the smaller, 10000, so the last payment is only what is owed.' },
              { line: 5, vars: { balance: 0, payment: 20000, last: 10000 }, out: [], note: 'Month 3: 10000 − 10000 = 0. Paid off in 3 months. In the task, each month also adds monthlyInterest(balance, rate) before the payment comes off.' },
            ],
          },
          { t: 'predict', xp: 10, answer: '10000 20000', code: 'System.out.println(Math.min(20000, 10000) + " " + Math.max(20000, 10000));' },
          { t: 'say', html: '<b>Idea 6: stopping the program early.</b><br><code>main</code> is <code>void</code>: it gives nothing back.<br>So <code>return;</code> with no value simply ends main, and with it the program.' },
          { t: 'code', code: 'long payment = 0;\nif (payment <= 0) {\n    System.out.println("No payment.");\n    return;                            // main ends here\n}\nSystem.out.println("Working...");    // reached only when the if is skipped' },
          { t: 'predict', xp: 10, answer: 'A\nB', code: 'System.out.println("A");\nif (5 > 3) {\n    System.out.println("B");\n    return;\n}\nSystem.out.println("C");' },
          { t: 'say', html: 'C never prints: <code>return;</code> left main first. That is the guard\'s shape: an if, a message, <code>return;</code>.<br><code>return 0;</code> in main is an error: <code>incompatible types: unexpected return value</code>.' },
          {
            t: 'task', file: DIR + 'Loan.java', xp: 100,
            runs: [
              { name: 'Rs 1,00,000 at 12%, Rs 10,000 a month', stdin: lines(10000000, 1200, 1000000) },
              { name: 'A payment that only covers the interest', stdin: lines(10000000, 1200, 100000) },
              { name: 'No interest', stdin: lines(50000, 0, 20000) },
              { name: 'Rs 50 lakh at 9.5%, Rs 50,000 a month', stdin: lines(500000000, 950, 5000000) },
            ],
            html: 'Write <b>play/week2-money/Loan.java</b>. Copy your two methods <code>monthlyInterest</code> (lesson 3) and <code>rupees</code> (lesson 5) into the new file. <span class="later">Coming in week 4: how one file can use another\'s methods without copying</span><ul><li><b>monthlyInterest(long balance, int basisPointsPerYear)</b><br>Takes in: what is owed now, in paise, and the yearly rate in basis points.<br>Gives back: one month\'s interest, in paise. It adds nothing to the balance.</li><li><b>rupees(long paise)</b><br>Takes in: an amount in paise.<br>Gives back: text such as <code>"Rs 1,000.00"</code>. It prints nothing.</li><li><b>main</b> reads the loan in paise, the yearly rate in basis points, and the monthly payment in paise. It does everything else.</li></ul><b>What main does:</b><pre>read: loan, rate, payment\n   ↓\nguard: is monthlyInterest(loan, rate) at least the payment?\n       yes → print "This payment never pays it off."  →  return;\n   ↓ no\neach month, until nothing is owed:\n   1. add that month\'s interest to the balance\n   2. take off the payment, but never more than is owed\n   3. print the Month line, every amount written by rupees(...)\n   ↓\nprint the "Paid off" line</pre>The two lines it prints:<pre>Month M: interest I, paid P, left L\nPaid off in N months. Total interest: T</pre>T is the interest of all the months added up.<br><br><b>A worked example.</b> The lab\'s first run types three numbers:<pre>10000000    the loan, in paise           (₹1,00,000)\n1200        the rate, in basis points    (12% a year)\n1000000     the payment, in paise        (₹10,000 a month)</pre>The guard: one month\'s interest is 100000 paise, which is less than the 1000000 paise payment, so the loop runs. The first and last lines of the right output:<pre>Month 1: interest Rs 1,000.00, paid Rs 10,000.00, left Rs 91,000.00\n...\nMonth 11: interest Rs 58.40, paid Rs 5,898.48, left Rs 0.00\nPaid off in 11 months. Total interest: Rs 5,898.48</pre>What each line means:<ul><li><b>Month 1</b> is month 1 of the paper example.</li><li><b>Month 11</b> is the last month. Less than one full payment is owed, so only what is owed is paid:<pre>left after month 10:   ₹5,840.08\n+ interest:            ₹58.40\n= owed:                ₹5,898.48\nMath.min(₹10,000, ₹5,898.48) = ₹5,898.48 paid\nleft:                  ₹0.00</pre></li><li><b>Paid off</b>: the total interest is the same number as the last payment. That is not a mistake:<pre>first 10 payments:  10 × ₹10,000 = ₹1,00,000   (the loan itself)\nso the last payment, ₹5,898.48, is all interest</pre></li></ul>The second run types 10000000, 1200 and 100000: the ₹1,000-a-month payment from the paper example. Its whole output is one line:<pre>This payment never pays it off.</pre>',
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
          { t: 'try', file: DIR + 'Loan.java', stdin: lines(500000000, 950, 10000000), html: '<b>Optional: pay more, pay less.</b><br>The ₹50 lakh loan again, paying ₹1,00,000 a month instead of ₹50,000.<br>Guess the total interest before you run. Compare it with the ₹50,000 run.' },
          {
            t: 'deeper', title: 'Optional: what an EMI is',
            html: '<p><i>Optional. The task does not need this.</i></p><p><b>EMI</b> means equated monthly instalment: the same payment every month, chosen so the last one clears the loan exactly. Banks work it out with a formula. You do not need it yet.</p><p><b>Early payments are mostly interest.</b> From your first run:</p><pre>month 1:    ₹1,000.00 of the ₹10,000 payment was interest\nmonth 10:   ₹156.83 of the ₹10,000 payment was interest</pre><p>So paying extra early in a loan saves far more interest than paying extra late.</p><p><b>The guard is a real pattern.</b> Check that the input makes sense before the work starts. Without it, a bad payment loops for ever. In a server, that is a stuck request.</p>',
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
            html: 'Friends split a bill. The player types the bill in <b>paise</b>, then the number of people.<ul><li>Everyone pays the same whole number of paise, as large as possible. If that leaves some paise over, the first people each pay <b>one paisa more</b>, until the whole bill is covered. Nobody pays a fraction of a paisa.</li><li>Print one line per person, <code>Person K pays P</code>, with P in paise, then <code>Check: T</code>, the sum of what everyone pays.</li><li>If the number of people is 0 or less, print only <code>Nobody to pay.</code></li><li>You must write and use <code>static long shareFor(long total, int people, int person)</code>, which gives back what person number <code>person</code> pays.</li></ul>For 10000 and 3 the output is:<pre>Person 1 pays 3334\nPerson 2 pays 3333\nPerson 3 pays 3333\nCheck: 10000</pre><b>Bonus (+40 XP):</b> write each share as rupees with two digits of paise, for example <code>Person 1 pays Rs 33.34</code>. Indian commas are fine too, so you may use your <code>rupees</code> method from lesson 5: <code>Person 1 pays Rs 16,46,09,053.51</code>. The Check line stays in paise.',
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
