// Concept notes for week 2 (the money tool), one per lesson. Same shape as the concept notes in
// missions/notes.js: kind 'concept', the lesson's mission id, and order (its place in the list).
// Loaded after notes.js in the lab and on the phone site. Every code sample and Java message
// below was run through Java 17 before it was written here.

window.NOTES = window.NOTES || [];
window.NOTES.push(
  {
    id: 'concept-paise-long',
    kind: 'concept', lesson: 'w2m1', order: 13,
    date: '2026-10-15',
    title: 'Money as whole paise, in a long',
    from: 'Goes with week 2, lesson 1: Count it in paise',
    widgets: {
      'c13-split': {
        code: ['long total = 5500000099L;', 'long rupees = total / 100;', 'long paise = total % 100;', 'System.out.println(rupees + " rupees " + paise + " paise");'],
        steps: [
          { line: 0, vars: { total: 5500000099 }, out: [], note: 'Too big for an int (the top of an int is 2147483647), so the L on the end is needed when it is typed into code.' },
          { line: 1, vars: { total: 5500000099, rupees: 55000000 }, out: [], note: '/ between whole numbers keeps only the whole part: 55000000 full rupees.' },
          { line: 2, vars: { total: 5500000099, rupees: 55000000, paise: 99 }, out: [], note: '% keeps only what is left over: 99 paise.' },
          { line: 3, vars: { total: 5500000099, rupees: 55000000, paise: 99 }, out: ['55000000 rupees 99 paise'], note: 'rupees × 100 + paise gives back exactly the total. Nothing was rounded.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>Money must be exact to the smallest coin. A <code>double</code> cannot even hold 0.1 exactly, so money programs never keep rupees with a point. They keep a <b>whole number of paise</b>: ₹1,234.50 is stored as <code>123450</code>. Whole numbers are always exact, and adding or subtracting them never loses a paisa.</p>
<p>The box is a <code>long</code>, because an <code>int</code> stops at 2,147,483,647 paise, about ₹2.1 crore.</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>long total = 0;</code></td><td>A box for a whole number of 64 switches: up to 9,223,372,036,854,775,807</td></tr>
<tr><td><code>long big = 3000000000L;</code></td><td>A number typed into code that is too big for an int needs <code>L</code> on the end</td></tr>
<tr><td><code>keys.nextLong()</code></td><td>Read a typed whole number into a long</td></tr>
<tr><td><code>total / 100</code></td><td>The whole rupees (the leftover is thrown away)</td></tr>
<tr><td><code>total % 100</code></td><td>Only the leftover: the paise</td></tr>
</table></div>

<h3>Walk through it</h3>
<div data-widget="stepper" data-ref="c13-split"></div>

<h3>Handy extras</h3>
<ul>
<li><code>total += price;</code> is short for <code>total = total + price;</code>, but see the second mistake below.</li>
<li>Splitting with <code>/</code> and <code>%</code> works for any unit: minutes and seconds (<code>/ 60</code>, <code>% 60</code>), or the last digit of a number (<code>% 10</code>).</li>
<li>Card payment messages carry amounts the same way: ₹250.00 travels as the 12 digits <code>000000025000</code>.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td><code>long big = 3000000000;</code> without the L</td><td class="bad">integer number too large</td></tr>
<tr><td><code>int total</code>, then <code>total = total + price;</code> where price is a long</td><td class="bad">incompatible types: possible lossy conversion from long to int</td></tr>
<tr><td>The same with <code>total += price;</code></td><td>No error. The answer is squeezed into the int and can come out wrong, even negative.</td></tr>
<tr><td><code>keys.nextInt()</code> when 3000000000 is typed</td><td class="bad">java.util.InputMismatchException: For input string: "3000000000"</td></tr>
<tr><td><code>int price = 2000000000; long total = price * 3;</code></td><td>No error. Prints 1705032704: the two ints overflow before the answer reaches the long.</td></tr>
<tr><td>Keeping money in a <code>double</code></td><td>No error. Ten payments of 0.10 add up to 0.9999999999999999.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>How is ₹7.05 stored, and what do <code>/ 100</code> and <code>% 100</code> give for it?</summary><p>As 705 paise. 705 / 100 is 7 rupees and 705 % 100 is 5 paise.</p></details>
<details><summary>Why is <code>long</code> used for money and not <code>int</code>?</summary><p>An int holds at most 2,147,483,647, which is only about ₹2.1 crore in paise. A shop, a bank account or a day of card payments passes that easily. A long goes up to about 9.2 × 10<sup>18</sup>.</p></details>
<details><summary><code>int a = 2000000000; long b = a * 2;</code> Is b right?</summary><p>No. a * 2 is worked out between two ints and overflows to -294967296 before it is stored. Make one side a long first: <code>(long) a * 2</code>, or keep a in a long from the start.</p></details>
<details><summary>Why not store ₹12.50 as the double 12.5?</summary><p>12.5 happens to be exact, because it is 12 and a half. Most amounts are not: 0.1, 0.2 and 0.3 cannot be stored exactly in a double, and small errors build up as amounts are added. Whole paise are always exact.</p></details>`,
  },

  {
    id: 'concept-percent-rounding',
    kind: 'concept', lesson: 'w2m2', order: 14,
    date: '2026-10-15',
    title: 'Percentages, basis points and rounding',
    from: 'Goes with week 2, lesson 2: Tax to the nearest paisa',
    widgets: {
      'c14-round': {
        code: ['static long percentOf(long paise, int basisPoints) {', '    return (paise * basisPoints + 5000) / 10000;', '}', '', 'long gst = percentOf(25, 1800);'],
        steps: [
          { line: 4, vars: {}, out: [], note: '18% of 25 paise. The exact answer is 4.5 paise, exactly half.' },
          { line: 0, vars: { paise: 25, basisPoints: 1800 }, out: [], note: 'The two values are copied into the parameters, in order.' },
          { line: 1, vars: { paise: 25, basisPoints: 1800, 'paise × basisPoints': 45000 }, out: [], note: '25 × 1800 is 45000. Divided by 10000 that would be 4.5.' },
          { line: 1, vars: { paise: 25, basisPoints: 1800, 'plus 5000': 50000 }, out: [], note: 'Add half of 10000 first: 50000.' },
          { line: 4, vars: { gst: 5 }, out: [], note: '50000 / 10000 is exactly 5. Without the 5000 it would have been 45000 / 10000 = 4, rounded down.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A percentage is a number out of 100. Rates such as 12.5% or 7.25% are not whole percents, so money programs count rates in <b>basis points</b>, hundredths of a percent: 1% is 100, 18% is 1800, 7.25% is 725. Then every rate is a whole number, and</p>
<pre>X% of an amount = amount × basisPoints ÷ 10000</pre>
<p>The answer is often not a whole number of paise, so it must be <b>rounded</b>. Whole-number division always rounds down. To round to the <b>nearest</b>, add half of the divisor before dividing.</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Code</th><th>Gives</th><th>Why</th></tr>
<tr><td><code>18054 / 100</code></td><td>180</td><td>180.54 with the .54 thrown away: rounded down</td></tr>
<tr><td><code>(18054 + 50) / 100</code></td><td>181</td><td>181.04 with the .04 thrown away: rounded to the nearest</td></tr>
<tr><td><code>(a * bp + 5000) / 10000</code></td><td></td><td>The same trick for basis points: half of 10000 is 5000</td></tr>
<tr><td><code>static long percentOf(long paise, int basisPoints)</code></td><td></td><td>A method that takes two values and gives back a long</td></tr>
</table></div>

<h3>Walk through a call</h3>
<div data-widget="stepper" data-ref="c14-round"></div>

<h3>Handy extras</h3>
<ul>
<li>A percent you know as a whole number converts by × 100: 18% is 1800 basis points, 5% is 500.</li>
<li>Adding a percentage on: <code>price + percentOf(price, 1800)</code>. Taking a discount off: <code>price - percentOf(price, 1000)</code> for 10% off.</li>
<li>A long times an int is worked out as a long, so <code>paise * basisPoints</code> cannot overflow on any real bill.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Forgetting to add half before dividing</td><td>No error. Every bill is rounded down, and up to a paisa is lost each time.</td></tr>
<tr><td>Calling <code>percentOf(1003, rate)</code> where rate is a long, but the parameter is an int</td><td class="bad">method percentOf in class Bill cannot be applied to given types; ... reason: argument mismatch; possible lossy conversion from long to int</td></tr>
<tr><td>A path through the method with no <code>return</code></td><td class="bad">missing return statement</td></tr>
<tr><td>Rounding a negative amount (a refund) with the same trick</td><td>No error. Java's division throws the leftover away towards zero, so -180.54 comes out as -180, not -181.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>How many basis points is 7.25%?</summary><p>725. One percent is 100 basis points.</p></details>
<details><summary>What is <code>(1001 * 1800 + 5000) / 10000</code>, and is it rounded the right way?</summary><p>180. The exact value is 180.18, and the nearest whole paisa is 180, so yes.</p></details>
<details><summary>Why does adding half before dividing round to the nearest?</summary><p>Anything whose fraction is .5 or more gets pushed past the next whole number, and the division then throws only a small leftover away. Anything under .5 is not pushed far enough, so it rounds down as before.</p></details>
<details><summary>Why keep the rounding rule inside one method rather than writing it where it is needed?</summary><p>So it is written once. If the rule changes, for example to banker's rounding, there is one line to change, and every bill uses the same rule.</p></details>`,
  },

  {
    id: 'concept-for-compound',
    kind: 'concept', lesson: 'w2m3', order: 15,
    date: '2026-10-15',
    title: 'The for loop, and money that grows',
    from: 'Goes with week 2, lesson 3: Money that grows',
    widgets: {
      'c15-for': {
        code: ['long b = 1000;', 'for (int m = 1; m <= 3; m++) {', '    b = b + b / 10;', '}', 'System.out.println(b);'],
        steps: [
          { line: 0, vars: { b: 1000 }, out: [], note: 'The balance starts at 1000.' },
          { line: 1, vars: { b: 1000, m: 1 }, out: [], note: 'Start part: m is made and set to 1. Is 1 <= 3? Yes.' },
          { line: 2, vars: { b: 1100, m: 1 }, out: [], note: 'A tenth of 1000 is added.' },
          { line: 1, vars: { b: 1100, m: 2 }, out: [], note: 'After-each-round part: m++. Then the question again: 2 <= 3? Yes.' },
          { line: 2, vars: { b: 1210, m: 2 }, out: [], note: 'A tenth of 1100 is added: 110, not 100. That is compounding.' },
          { line: 2, vars: { b: 1331, m: 3 }, out: [], note: 'A tenth of 1210, thrown-away leftover included: 121.' },
          { line: 1, vars: { b: 1331, m: 4 }, out: [], note: 'm is 4. 4 <= 3? No. The loop ends, and m no longer exists after it.' },
          { line: 4, vars: { b: 1331 }, out: ['1331'], note: 'Simple interest would have added 100 three times: 1300.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>When something repeats a <b>known number of times</b>, Java has a loop that puts all the counting on one line: the <code>for</code> loop. It is a while loop with its start, its question and its step written together.</p>
<p>The money idea: <b>simple interest</b> is paid only on what you put in. <b>Compound interest</b> is added to the balance, so the next interest is worked out on a bigger amount. Interest earns interest, and the gap grows every year.</p>
<div data-widget="growth" data-key="c15-growth"></div>

<h3>The syntax</h3>
<pre>for (start; keep going while; after each round) {
    ...
}</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>Example</th><th>When it runs</th></tr>
<tr><td>Start</td><td><code>int m = 1</code></td><td>Once, before anything else</td></tr>
<tr><td>Keep going while</td><td><code>m &lt;= 12</code></td><td>Before every round. No means stop.</td></tr>
<tr><td>After each round</td><td><code>m++</code></td><td>At the end of every round, before the question is asked again</td></tr>
</table></div>
<p>A box made in the start part exists only inside the loop.</p>

<h3>Walk through it</h3>
<div data-widget="stepper" data-ref="c15-for"></div>

<h3>Handy extras</h3>
<ul>
<li>Counting down: <code>for (int i = 3; i &gt; 0; i--)</code> gives 3, 2, 1.</li>
<li>Counting from 0 to n - 1, the usual shape for arrays: <code>for (int i = 0; i &lt; n; i++)</code>.</li>
<li>Use <code>while</code> when you do not know how many rounds there will be (until the player types 0, until the loan is paid). Use <code>for</code> when you do.</li>
<li>One month's interest from a yearly rate in basis points: <code>(balance × rate + 60000) / 120000</code>, because ÷ 10000 ÷ 12 is ÷ 120000, and half of that is 60000.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Using the counter after the loop: <code>System.out.println(m);</code></td><td class="bad">cannot find symbol ... symbol: variable m</td></tr>
<tr><td>A semicolon straight after the round brackets: <code>for (...);</code></td><td>No error. The loop repeats nothing, and the block below runs once.</td></tr>
<tr><td><code>m &lt; months</code> where you meant <code>m &lt;= months</code></td><td>No error. One month short.</td></tr>
<tr><td>Simple interest worked out on the balance instead of the starting amount</td><td>No error. The simple total comes out too big, because it has been compounded.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>How many times does <code>for (int i = 0; i &lt; 5; i++)</code> run, and what is i in the last round?</summary><p>5 times, and i is 4 in the last round. It is 5 when the question is asked the final time, which is why the loop stops.</p></details>
<details><summary>Rewrite <code>for (int m = 1; m &lt;= 3; m++) { ... }</code> as a while loop.</summary><p><code>int m = 1; while (m &lt;= 3) { ...; m++; }</code></p></details>
<details><summary>₹1,000 at 10% a year for 2 years. Simple total? Compound total, added yearly?</summary><p>Simple: ₹1,200 (₹100 a year). Compound: ₹1,210, because the second year's 10% is on ₹1,100.</p></details>
<details><summary>Why does the loop in the mission need two boxes, the starting amount and the balance?</summary><p>The balance changes every month, but the simple interest and the final "how much did it grow" both need the amount that was put in. If you only had one box, that number would be gone.</p></details>`,
  },

  {
    id: 'concept-arrays',
    kind: 'concept', lesson: 'w2m4', order: 16,
    date: '2026-10-15',
    title: 'Arrays: one name, many boxes',
    from: 'Goes with week 2, lesson 4: Twelve months in one box',
    widgets: {
      'c16-max': {
        code: ['long[] s = {300, 900, 200, 900};', 'int best = 0;', 'for (int i = 1; i < s.length; i++) {', '    if (s[i] > s[best]) best = i;', '}', 'System.out.println("month " + (best + 1));'],
        steps: [
          { line: 0, vars: { s: '[300, 900, 200, 900]' }, out: [], note: 'Curly brackets make an array already filled. Its length is 4.' },
          { line: 1, vars: { s: '[300, 900, 200, 900]', best: 0 }, out: [], note: 'Remember the INDEX of the best so far, not the value. Start with the first.' },
          { line: 3, vars: { s: '[300, 900, 200, 900]', best: 1, i: 1 }, out: [], note: 's[1] is 900, bigger than s[0] = 300. best becomes 1.' },
          { line: 3, vars: { s: '[300, 900, 200, 900]', best: 1, i: 2 }, out: [], note: '200 is not bigger than 900. No change.' },
          { line: 3, vars: { s: '[300, 900, 200, 900]', best: 1, i: 3 }, out: [], note: '900 is not BIGGER than 900, it is equal. So the earlier month stays. With >= the later one would win.' },
          { line: 5, vars: { s: '[300, 900, 200, 900]', best: 1 }, out: ['month 2'], note: 'Index 1 is the second month, so add 1 when showing it to a person.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>An <b>array</b> is a row of boxes of the same type under one name. Each box has a number, its <b>index</b>, starting from 0. You use an array when you must keep many values and come back to them, for example when you need the average before you can judge each month.</p>
<div data-widget="arraymem" data-key="c16-mem"></div>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>long[] spent = new long[12];</code></td><td>Make a row of 12 longs, all starting at 0</td></tr>
<tr><td><code>int[] dice = {4, 7, 1};</code></td><td>Make a row already filled. Its length is 3.</td></tr>
<tr><td><code>spent[0]</code>, <code>spent[11]</code></td><td>The first box and the last box of 12</td></tr>
<tr><td><code>spent[i] = 500;</code></td><td>Put 500 in box number i</td></tr>
<tr><td><code>spent.length</code></td><td>How many boxes. No round brackets: it is not a method.</td></tr>
<tr><td><code>for (int i = 0; i &lt; spent.length; i++)</code></td><td>Visit every box, in order</td></tr>
</table></div>

<h3>Walk through it: finding the biggest</h3>
<div data-widget="stepper" data-ref="c16-max"></div>

<h3>Handy extras</h3>
<ul>
<li>A new array of numbers starts full of 0. An array of booleans starts full of false.</li>
<li>The size is fixed once the array is made. Java's <code>ArrayList</code>, which you will meet later, can grow.</li>
<li><code>long[] b = spent;</code> does not copy the numbers. Both names now point at the same row.</li>
<li>Printing an array directly shows something like <code>[J@2698dc7</code>, not the numbers. Print them in a loop.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Using index 12 in an array of length 12, often from <code>i &lt;= spent.length</code></td><td class="bad">java.lang.ArrayIndexOutOfBoundsException: Index 12 out of bounds for length 12</td></tr>
<tr><td><code>spent.length()</code></td><td class="bad">cannot find symbol ... symbol: method length() ... location: variable spent of type long[]</td></tr>
<tr><td><code>new long[]</code> with no size</td><td class="bad">array dimension missing</td></tr>
<tr><td>Showing <code>i</code> to a person as the month number</td><td>No error. Every month is off by one, because index 0 is January.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary><code>int[] a = new int[5];</code> What are the first and last valid indexes, and what does each box hold?</summary><p>0 and 4. Every box holds 0 until something is put in it.</p></details>
<details><summary>Why can the "above average" months not be found in the same loop that reads the months?</summary><p>The average needs every month, so it is only known after the reading loop ends. Judging each month against it needs a second pass over the kept values, which is what the array is for.</p></details>
<details><summary>To keep the earlier month when two months tie for highest, should the comparison be <code>&gt;</code> or <code>&gt;=</code>?</summary><p><code>&gt;</code>. Only a strictly bigger value replaces the best so far, so a later equal month does not.</p></details>
<details><summary><code>long[] a = {1, 2}; long[] b = a; b[0] = 9;</code> What is a[0]?</summary><p>9. b is not a copy. a and b are two names for the same row.</p></details>`,
  },

  {
    id: 'concept-strings',
    kind: 'concept', lesson: 'w2m5', order: 17,
    date: '2026-10-15',
    title: 'Strings: taking text apart and building it',
    from: 'Goes with week 2, lesson 5: Rupees, the Indian way',
    widgets: {
      'c17-sub': {
        code: ['String s = "1234567";', 'String last = s.substring(s.length() - 3);', 'String rest = s.substring(0, s.length() - 3);', 'System.out.println(rest + "," + last);'],
        steps: [
          { line: 0, vars: { s: '"1234567"' }, out: [], note: 'Seven characters, at indexes 0 to 6.' },
          { line: 1, vars: { s: '"1234567"', last: '"567"' }, out: [], note: 's.length() is 7, so this is substring(4): from index 4 to the end.' },
          { line: 2, vars: { s: '"1234567"', last: '"567"', rest: '"1234"' }, out: [], note: 'substring(0, 4): from index 0 up to, but not including, index 4. Its length is 4 - 0 = 4.' },
          { line: 3, vars: { s: '"1234567"', last: '"567"', rest: '"1234"' }, out: ['1234,567'], note: 's itself is unchanged. Every substring is a new piece of text.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A <code>String</code> is text: a row of characters, numbered from 0 like an array. You can ask it questions (how long are you, what is at index 3), cut pieces out of it, and glue pieces together. A String can never be changed. Every method gives back a <b>new</b> String.</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Code (s is "123456")</th><th>Gives</th></tr>
<tr><td><code>s.length()</code></td><td>6</td></tr>
<tr><td><code>s.charAt(0)</code></td><td><code>'1'</code>, a single character (a <code>char</code>)</td></tr>
<tr><td><code>s.substring(3)</code></td><td><code>"456"</code>: from index 3 to the end</td></tr>
<tr><td><code>s.substring(0, 3)</code></td><td><code>"123"</code>: from 0 up to, not including, 3</td></tr>
<tr><td><code>s.substring(s.length() - 2)</code></td><td><code>"56"</code>: the last two characters</td></tr>
<tr><td><code>"" + 1234</code></td><td><code>"1234"</code>: a number glued onto text becomes text</td></tr>
<tr><td><code>s.equals("123456")</code></td><td><code>true</code>: the right way to compare text</td></tr>
</table></div>

<h3>Walk through it</h3>
<div data-widget="stepper" data-ref="c17-sub"></div>

<h3>Handy extras</h3>
<ul>
<li>Text in double quotes is a String; one character in single quotes is a <code>char</code>: <code>"A"</code> and <code>'A'</code> are different types.</li>
<li>Glue works left to right: <code>"" + 7 + 3</code> is <code>"73"</code>, but <code>7 + 3 + ""</code> is <code>"10"</code>, because 7 + 3 is added as numbers before any text appears.</li>
<li>Padding to two digits: <code>p &lt; 10 ? "0" + p : "" + p</code>. The <code>? :</code> is a short if and else that gives back a value.</li>
<li>Indian grouping puts a comma after the last three digits, then after every two: 1,23,45,678. International grouping uses threes: 12,345,678.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Comparing text with <code>==</code></td><td>No error. It can say false for two Strings with the same letters. Use <code>.equals</code>.</td></tr>
<tr><td><code>s.length</code> without brackets</td><td class="bad">cannot find symbol ... symbol: variable length ... location: variable s of type String</td></tr>
<tr><td>Cutting past the end: <code>"abc".substring(5)</code></td><td class="bad">java.lang.StringIndexOutOfBoundsException: begin 5, end 3, length 3</td></tr>
<tr><td>Text in single quotes: <code>String s = 'Rs';</code></td><td class="bad">unclosed character literal</td></tr>
<tr><td><code>s.substring(1);</code> on a line by itself</td><td>No error. Nothing changes, because the new String was not stored. Write <code>s = s.substring(1);</code></td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>What is <code>"1234567".substring(2, 4)</code>?</summary><p><code>"34"</code>: index 2 and index 3. Index 4 is not included.</p></details>
<details><summary>Write 1,00,000 rupees the international way.</summary><p>100,000. In Indian grouping it is 1,00,000 (one lakh).</p></details>
<details><summary>Why must the paise 5 be shown as "05"?</summary><p>Because ₹1.5 would read as one rupee fifty. The paise always take two digits after the point.</p></details>
<details><summary>Why can <code>==</code> on two Strings give false even when they say the same thing?</summary><p>A String variable holds where the text is. <code>==</code> asks whether both point at the same place. Two copies of the same text in different places are not ==, but they are .equals.</p></details>`,
  },

  {
    id: 'concept-guards-loan',
    kind: 'concept', lesson: 'w2m6', order: 18,
    date: '2026-10-15',
    title: 'Guarding a loop, and how a loan is paid back',
    from: 'Goes with week 2, lesson 6: Pay it back',
    widgets: {
      'c18-loan': {
        code: ['if (monthlyInterest(balance, rate) >= payment) {', '    System.out.println("This payment never pays it off.");', '    return;', '}', 'while (balance > 0) {', '    balance += monthlyInterest(balance, rate);', '    long paid = Math.min(payment, balance);', '    balance -= paid;', '}'],
        steps: [
          { line: 0, vars: { balance: 10000000, rate: 1200, payment: 100000 }, out: [], note: '₹1 lakh at 12%: one month\'s interest is ₹1,000, which is exactly the payment.' },
          { line: 1, vars: { balance: 10000000, rate: 1200, payment: 100000 }, out: ['This payment never pays it off.'], note: 'Each month ₹1,000 would be added and ₹1,000 taken off. The balance would never move, and the loop below would never end.' },
          { line: 2, vars: { balance: 10000000, rate: 1200, payment: 100000 }, out: ['This payment never pays it off.'], note: 'return; ends main at once. Nothing below runs.' },
          { line: 4, vars: { balance: 10000000, rate: 1200, payment: 1000000 }, out: [], note: 'Now with a ₹10,000 payment, the guard lets it through.' },
          { line: 7, vars: { balance: 9100000, rate: 1200, payment: 1000000, paid: 1000000 }, out: [], note: 'Month 1: ₹1,000 interest added, ₹10,000 paid. ₹91,000 left. Next month\'s interest is smaller, so the debt shrinks faster each month.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A <b>guard</b> is a check at the start that refuses input which makes no sense, before any work depends on it. Here the input that makes no sense is a payment no bigger than the interest: the loop would never end.</p>
<p>The money idea: a loan grows by interest each month, and each payment comes off after the interest is added. Early payments are mostly interest. Late payments are mostly loan.</p>

<h3>The syntax</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>return;</code> inside <code>main</code></td><td>End the program here. main gives back nothing, so there is no value after return.</td></tr>
<tr><td><code>Math.min(a, b)</code></td><td>The smaller of two numbers. <code>Math.min(20000, 10000)</code> is 10000.</td></tr>
<tr><td><code>Math.max(a, b)</code></td><td>The bigger of two numbers</td></tr>
</table></div>

<h3>Walk through it</h3>
<div data-widget="stepper" data-ref="c18-loan"></div>

<h3>Handy extras</h3>
<ul>
<li>Put every guard at the top of the method. The code below can then assume good input, and reads more simply.</li>
<li>Guard against dividing by zero too: Java stops with <code>ArithmeticException: / by zero</code> when a whole number is divided by 0.</li>
<li>A bank's EMI is a fixed payment worked out from the loan, the rate and the number of months, so that the last payment clears the loan exactly.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>No guard, and a payment that only covers the interest</td><td>No error. The loop never ends; the lab cuts it off after 10 seconds.</td></tr>
<tr><td>Taking off the full payment in the last month</td><td>No error. The balance goes negative: the customer overpaid.</td></tr>
<tr><td><code>return 0;</code> inside main</td><td class="bad">incompatible types: unexpected return value</td></tr>
<tr><td>Adding the interest after the payment instead of before</td><td>No error, but every month is slightly wrong, and the bank's statement will not match yours.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>₹1,000 owed at 0% interest, ₹300 a month. How many months, and what is the last payment?</summary><p>4 months: 300, 300, 300, then 100.</p></details>
<details><summary>Why does the debt shrink faster in later months, even though the payment is the same?</summary><p>Interest is worked out on what is still owed. As the balance falls, less of each payment goes on interest and more goes on the loan itself.</p></details>
<details><summary>What does the guard compare, and why "at least" (>=) and not "more than"?</summary><p>The first month's interest against the payment. If they are equal, the balance never changes, so the loop would still never end.</p></details>
<details><summary>Paying extra early in a loan saves more than paying the same extra near the end. Why?</summary><p>Money paid early stops interest from being charged on it for every remaining month. Paid near the end, it only saves the interest of a few months.</p></details>`,
  },
);
