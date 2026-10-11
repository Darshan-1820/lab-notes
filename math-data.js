// The maths track: short visual explanations, each followed by drills.
// The drills themselves (question generators, checking, levels, lock-in) live in app/web/math.js;
// a module only lists which drills it uses. On the phone site this file is published as math-data.js.
//
// A module is shown through Lab.noteCard, so its h3 sections get "Mark this section" and the page
// gets "Mark as read", exactly like a note. Diagrams: placevalue, pctgrid, powers, halve, ring
// (defined in app/web/math.js) and any widget from app/web/widgets.js.

window.MATH = {
  modules: [
    {
      id: 'math-place',
      order: 1,
      short: 'Place value',
      title: 'Place value, binary and hex',
      date: '2026-10-12',
      from: 'Maths 1 · used in: bits and bytes, card data written in hex',
      where: 'binary and hex',
      drills: ['bin-to-dec', 'dec-to-bin', 'hex'],
      html: `
<h3>The idea</h3>
<p>In the number 307, the 3 is not worth three. It is worth three <b>hundreds</b>, because of where it stands. That is <b>place value</b>: a digit's worth depends on its column.</p>
<p>In everyday numbers each column is worth 10 times the one to its right: 1s, 10s, 100s. That is called <b>base 10</b>. Computers use the same idea with two other bases.</p>
<p><b>Try it.</b> Type a number, then switch between the three bases. The number stays the same. Only the way of writing it changes.</p>
<div data-widget="placevalue" data-key="m1-pv" data-start="307" data-base="10"></div>

<h3>Base 2: binary</h3>
<p>A switch has only two states, so a computer's natural columns are worth 1, 2, 4, 8, 16 and so on: each column is worth <b>2 times</b> the one to its right, and a column can hold only 0 or 1.</p>
<p>To read a binary number, add up the worth of every column that holds a 1.</p>
<p><b>Try it.</b> Click switches to make 5, then 10, then 15.</p>
<div data-widget="bits" data-key="m1-bits" data-bits="4" data-signed="false"></div>
<p>To <b>write</b> a number in binary, start from the biggest column that fits and work right. For 13: 8 fits (5 left), 4 fits (1 left), 2 does not fit, 1 fits. So 13 is <code>1101</code>.</p>

<h3>Base 16: hex</h3>
<p>Binary is long. Eight switches need eight digits. Hex is a shorter way to write the same thing: each column is worth <b>16 times</b> the one to its right, and one column can hold 0 to 15.</p>
<p>There are only ten ordinary digits, so hex borrows six letters:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Number</th><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td></tr>
<tr><th>Hex digit</th><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td></tr>
</table></div>
<p>Hex <code>2F</code> is 2 sixteens plus 15 ones: 32 + 15 = 47.</p>

<h3>Why hex fits a byte so well</h3>
<p>Four switches can show exactly 0 to 15, which is exactly one hex digit. A byte is eight switches, so it is always <b>two hex digits</b>: split the byte in half and write each half as one digit.</p>
<pre>0100 0001
  4    1      the byte is hex 41</pre>
<p>This is why card data, memory dumps and colour codes are written in hex. When you see <code>9F 26 08</code> in a trace, that is three bytes.</p>

<h3>What to remember</h3>
<ul>
<li>A digit's worth comes from its column.</li>
<li>Binary columns: 1, 2, 4, 8, 16, 32, 64, 128. Hex columns: 1, 16, 256.</li>
<li>A to F mean 10 to 15.</li>
<li>One byte is two hex digits.</li>
</ul>`,
    },
    {
      id: 'math-percent',
      order: 2,
      short: 'Percentages',
      title: 'Percentages',
      date: '2026-10-12',
      from: 'Maths 2 · used in: fees, discounts, tax, interest',
      where: 'money',
      drills: ['pct-of', 'pct-what', 'pct-undo'],
      html: `
<h3>The idea</h3>
<p><b>Percent</b> means "out of every hundred". 25% is 25 out of every 100.</p>
<p>Picture the amount shared equally over 100 squares. A percentage is how many of those squares you take.</p>
<p><b>Try it.</b> Drag the slider, and change the amount. Watch what one square is worth.</p>
<div data-widget="pctgrid" data-key="m2-grid" data-p="25" data-n="200"></div>

<h3>Four percentages worth knowing by heart</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Percent</th><th>Same as</th><th>How to get it</th></tr>
<tr><td>50%</td><td>a half</td><td>divide by 2</td></tr>
<tr><td>25%</td><td>a quarter</td><td>divide by 4</td></tr>
<tr><td>10%</td><td>a tenth</td><td>divide by 10</td></tr>
<tr><td>1%</td><td>a hundredth</td><td>divide by 100</td></tr>
</table></div>
<p>Almost any other percentage can be built from these. 35% of 240: 10% is 24, so 30% is 72, and 5% is half of 24, which is 12. Together 84.</p>

<h3>Three kinds of question</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Question</th><th>Example</th><th>How</th></tr>
<tr><td>A percent of an amount</td><td>2% fee on 1,500</td><td>1% is 15, so 2% is 30</td></tr>
<tr><td>What percent is it?</td><td>20 out of 80</td><td>20 × 100 ÷ 80 = 25%</td></tr>
<tr><td>Undo a percentage</td><td>After 20% off it costs 400</td><td>400 is 80%, so 1% is 5, so 100% is 500</td></tr>
</table></div>

<h3>The two traps</h3>
<p><b>Trap 1: a change is measured against the old value.</b> A price going from 80 to 100 went up by 20. Compare 20 with the old price, 80: that is 25%, not 20%.</p>
<p><b>Trap 2: you cannot undo a percentage by reversing it.</b> A price cut by 20% and then raised by 20% does not come back. 500 less 20% is 400. But 400 plus 20% is 480, because the second 20% is taken from a smaller number.</p>

<h3>Where you will use it</h3>
<ul>
<li>A shop pays a small percentage of every card sale as a fee. On a 2% fee, a 1,500 rupee sale costs the shop 30 rupees.</li>
<li>Tax is added as a percentage, so working back from a total means undoing one.</li>
<li>Interest is a percentage of what you owe, added again and again. That is week 2's build.</li>
</ul>`,
    },
    {
      id: 'math-powers',
      order: 3,
      short: 'Powers of two',
      title: 'Powers of two, doubling and halving',
      date: '2026-10-12',
      from: 'Maths 3 · used in: how much a box can hold, why some searches are fast',
      where: 'sizes and speed',
      drills: ['pow2', 'halvings', 'switches'],
      html: `
<h3>The idea</h3>
<p>Start at 1 and keep doubling: 1, 2, 4, 8, 16, 32, 64. These are the <b>powers of two</b>. "2 to the power 5" means: start at 1 and double 5 times, which gives 32.</p>
<p>Doubling grows much faster than it feels like it should. Ten doublings pass a thousand. Twenty pass a million. Thirty pass a billion.</p>

<h3>Why computers are full of them</h3>
<p>One switch has 2 patterns: off, on. Add a second switch and each of those can be paired with off or on, so 4 patterns. Every extra switch <b>doubles</b> the count.</p>
<p><b>Try it.</b> Drag from 1 switch up to 8, then 16, then 32.</p>
<div data-widget="powers" data-key="m3-pow" data-start="8"></div>
<p>That is where the limits you have already met come from. A byte is 8 switches: 256 patterns, so 0 to 255. An <code>int</code> is 32 switches: about 4.3 billion patterns, half of them used for negative numbers.</p>

<h3>Halving is doubling backwards</h3>
<p>If doubling grows fast, halving shrinks fast.</p>
<p><b>Try it.</b> Start at 1000 and count the halvings. Then make the number a thousand times bigger.</p>
<div data-widget="halve" data-key="m3-halve" data-start="1000"></div>
<p>A thousand needs about 10 halvings. A million needs about 20. A billion needs about 30.</p>

<h3>Why that matters later</h3>
<p>Suppose a list of a million names is sorted, and you want one of them. Open it in the middle: your name is either in the first half or the second, so throw the other half away. Do it again. After about 20 looks you have found it, out of a million. Checking every name could take a million looks.</p>
<p>That method is called <b>binary search</b>, and you will write it in week 3. The reason it is fast is this page.</p>

<h3>What to remember</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Power</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>10</td><td>16</td></tr>
<tr><th>Value</th><td>2</td><td>4</td><td>8</td><td>16</td><td>32</td><td>64</td><td>128</td><td>256</td><td>1,024</td><td>65,536</td></tr>
</table></div>
<ul>
<li>n switches give 2 to the power n patterns.</li>
<li>Counting from 0, the largest number is one less than that.</li>
<li>The number of halvings to get down to 1 is small, even for huge numbers.</li>
</ul>`,
    },
    {
      id: 'math-remainders',
      order: 4,
      short: 'Remainders',
      title: 'Remainders: counting that goes round',
      date: '2026-10-12',
      from: 'Maths 4 · used in: the % sign, wrap-around, the check digit on a card',
      where: 'the % sign',
      drills: ['rem', 'clock', 'digits'],
      html: `
<h3>The idea</h3>
<p>Share 17 sweets among 5 people. Each gets 3, and 2 are left over. That leftover is the <b>remainder</b>. In code it is written <code>17 % 5</code>, and the answer is 2.</p>
<p>The remainder is never as big as the number you divide by. Dividing by 5, it can only be 0, 1, 2, 3 or 4.</p>

<h3>A clock is remainders</h3>
<p>Counting on a clock never gets past 12. It goes round. Four hours after 10 o'clock is 2 o'clock, not 14. Anything that counts in a circle works this way: hours, days of the week, minutes, a counter that overflows.</p>
<p><b>Try it.</b> Change how far you count on. Then switch the ring to a week, and to last digits.</p>
<div data-widget="ring" data-key="m4-ring" data-size="12" data-start="9" data-add="5"></div>
<p>Going all the way round any number of times changes nothing. Only the leftover moves you. That is exactly what <code>%</code> works out.</p>

<h3>Three things it is used for all the time</h3>
<div class="tablewrap"><table class="plain">
<tr><th>You want</th><th>You write</th><th>Example</th></tr>
<tr><td>Even or odd</td><td><code>n % 2</code></td><td>0 means even, 1 means odd</td></tr>
<tr><td>The last digit</td><td><code>n % 10</code></td><td>4738 % 10 is 8</td></tr>
<tr><td>Split into big and small units</td><td><code>n / 100</code> and <code>n % 100</code></td><td>12345 paise is 123 rupees and 45 paise</td></tr>
</table></div>

<h3>When the first number is smaller</h3>
<p><code>3 % 7</code> is 3. Seven does not fit into three even once, so all three are left over. This catches people out.</p>

<h3>The same idea you have already met</h3>
<ul>
<li><b>Overflow.</b> An <code>int</code> that passes its largest value starts again from the bottom. A one-byte counter at 255 goes to 0. It is a ring with 256 places.</li>
<li><b>The last digit of a card number.</b> The check adds up the digits in a set way, then picks the last digit so the total lands on a multiple of 10. "How far to the next multiple of 10" is a remainder question.</li>
</ul>

<h3>What to remember</h3>
<ul>
<li><code>a % b</code> is what is left after taking out as many whole b as fit.</li>
<li>The answer is always from 0 up to b - 1.</li>
<li>Use it whenever counting goes round, or when you need the last digits of a number.</li>
</ul>`,
    },
  ],
};
