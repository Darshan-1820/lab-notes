// Notes: answers to questions asked during study, saved so they are not lost in the terminal.
// Newest first. The tutor adds a note here whenever he asks about a concept.
//
// A note's html may contain a switch board:
//   <div data-widget="bits" data-key="unique-name" data-bits="8" data-signed="true"></div>
// The widgets are defined in app/web/widgets.js. After changing this file, republish the
// phone page (see CLAUDE.md, "Notes").

// Other widgets: intmem (a number in four memory cells), text (characters as numbers),
// rgb (one pixel), run (data-file="Scratch.java": a Run button for a file in play/).

// Two kinds of note:
//   kind: 'concept'  one per lesson, written like a short lecture for revising. Needs lesson
//                    (the mission id) and order (its place in the list).
//   kind: 'payments' the payments track, read on the phone. Needs order.
//   anything else    an answer to a question he asked. Needs asked (his words).

window.NOTES = [
  // ======================= concept notes =======================
  {
    id: 'concept-printing',
    kind: 'concept', lesson: 'w1m1', order: 1,
    date: '2026-10-12',
    title: 'Printing, and how a Java program runs',
    from: 'Goes with lesson 1: Make it speak',
    widgets: {
      'c1-order': {
        code: ['System.out.println("Stay Alive");', 'System.out.println("Hero: " + "Arjun");', 'System.out.print("A monster ");', 'System.out.println("appears.");'],
        steps: [
          { line: 0, vars: {}, out: ['Stay Alive'], note: 'println shows the text, then moves to a new line.' },
          { line: 1, vars: {}, out: ['Stay Alive', 'Hero: Arjun'], note: 'The + glues two pieces of text into one before it is shown.' },
          { line: 2, vars: {}, out: ['Stay Alive', 'Hero: Arjun', 'A monster '], note: 'print (no "ln") shows the text and stays on the same line.' },
          { line: 3, vars: {}, out: ['Stay Alive', 'Hero: Arjun', 'A monster appears.'], note: 'So this text continues where the last one stopped.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A program is a list of instructions in a text file. The computer carries them out one at a time, from top to bottom. One instruction is called a <b>statement</b>, and in Java every statement ends with a semicolon.</p>

<h3>Showing text</h3>
<div class="tablewrap"><table class="plain">
<tr><th>You write</th><th>What it does</th></tr>
<tr><td><code>System.out.println("Hi");</code></td><td>Shows Hi, then moves to a new line</td></tr>
<tr><td><code>System.out.print("Hi");</code></td><td>Shows Hi and stays on the same line</td></tr>
<tr><td><code>System.out.println();</code></td><td>Shows nothing, only moves to a new line</td></tr>
<tr><td><code>"Hero: " + "Arjun"</code></td><td>Glues two pieces of text into one</td></tr>
</table></div>
<p>Text goes inside double quotes. Java calls a piece of text a <b>String</b>.</p>
<div data-widget="stepper" data-ref="c1-order"></div>

<h3>What happens when you press Run</h3>
<ol>
<li><b>Check.</b> Java reads the whole file and checks every line against the rules of the language. If one line breaks a rule, it stops here and nothing runs, not even the lines that were correct.</li>
<li><b>Translate.</b> The file is turned into a compact form called <b>bytecode</b>, which the machine side understands and people do not read.</li>
<li><b>Run.</b> A program called the <b>Java Virtual Machine</b> (JVM) starts, finds the part named <code>main</code>, and carries out its statements in order.</li>
</ol>
<p>Steps 1 and 2 together are called <b>compiling</b>. That is why an error found in step 1 is called a compile error.</p>

<h3>The wrapper around your code</h3>
<pre>public class Game {
    public static void main(String[] args) {
        // your statements go here
    }
}</pre>
<p>Every Java file has this. The outer part gives the file's contents a name, <code>Game</code>, which must match the file name <code>Game.java</code>. The inner part, <code>main</code>, is where the JVM starts. The curly braces mark where each part begins and ends. You will take this apart properly in week 4.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Missing semicolon</td><td class="bad">';' expected</td></tr>
<tr><td>Missing closing quote</td><td class="bad">unclosed string literal</td></tr>
<tr><td><code>system</code> with a small s</td><td class="bad">package system does not exist</td></tr>
<tr><td>Forgetting the quotes round text</td><td class="bad">cannot find symbol</td></tr>
</table></div>
<p>Java treats capital and small letters as different, everywhere.</p>

<h3>Check yourself</h3>
<details><summary>What do these two lines show? <code>System.out.print("A"); System.out.println("B");</code></summary><p>AB on one line. The first statement does not move to a new line, so B follows A directly.</p></details>
<details><summary>A file has 50 correct lines and one missing semicolon on line 20. How many lines run?</summary><p>None. The check happens before anything runs, and it fails.</p></details>
<details><summary>Why is the starting point called main?</summary><p>It is only a name the JVM is built to look for. Every Java program starts at the part with exactly that name.</p></details>`,
  },
  {
    id: 'concept-variables',
    kind: 'concept', lesson: 'w1m2', order: 2,
    date: '2026-10-12',
    title: 'Variables: boxes with a name and a type',
    from: 'Goes with lesson 2: Give them a life bar',
    widgets: {
      'c2-life': {
        code: ['int heroHp;', 'heroHp = 100;', 'String hero = "Arjun";', 'System.out.println(hero + " has " + heroHp);', 'heroHp = 80;', 'System.out.println(hero + " has " + heroHp);'],
        steps: [
          { line: 0, vars: { heroHp: '?' }, out: [], note: 'Declaring: a box is reserved and named. It holds nothing you may read yet.' },
          { line: 1, vars: { heroHp: 100 }, out: [], note: 'Assigning: 100 goes into the box.' },
          { line: 2, vars: { heroHp: 100, hero: '"Arjun"' }, out: [], note: 'Declaring and assigning in one line. This is the usual way.' },
          { line: 3, vars: { heroHp: 100, hero: '"Arjun"' }, out: ['Arjun has 100'], note: 'Reading: Java looks inside both boxes and glues the pieces together.' },
          { line: 4, vars: { heroHp: 80, hero: '"Arjun"' }, out: ['Arjun has 100'], note: 'Assigning again replaces the old value. The 100 is gone. No "int" this time: the box already exists.' },
          { line: 5, vars: { heroHp: 80, hero: '"Arjun"' }, out: ['Arjun has 100', 'Arjun has 80'], note: 'The same statement as before now shows a different result, because the box changed.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A <b>variable</b> is a named box in memory that holds one value. A program remembers things by putting them in variables.</p>
<pre>int heroHp = 100;</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>Meaning</th></tr>
<tr><td><code>int</code></td><td>The <b>type</b>: what kind of value the box may hold</td></tr>
<tr><td><code>heroHp</code></td><td>The <b>name</b>: you choose it</td></tr>
<tr><td><code>=</code></td><td>Put the value on the right into the box on the left</td></tr>
<tr><td><code>100</code></td><td>The value</td></tr>
</table></div>

<h3>Three things you do with a box</h3>
<p><b>Declare</b> it (create it), <b>assign</b> to it (put a value in), and <b>read</b> it (use its value). Step through this:</p>
<div data-widget="stepper" data-ref="c2-life"></div>

<h3>Types you will use first</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Type</th><th>Holds</th><th>Example</th><th>Size</th></tr>
<tr><td><code>int</code></td><td>Whole numbers up to about 2 billion</td><td><code>int hp = 100;</code></td><td>4 bytes</td></tr>
<tr><td><code>long</code></td><td>Much bigger whole numbers</td><td><code>long paise = 25000L;</code></td><td>8 bytes</td></tr>
<tr><td><code>double</code></td><td>Numbers with a decimal point, stored approximately</td><td><code>double speed = 1.5;</code></td><td>8 bytes</td></tr>
<tr><td><code>boolean</code></td><td>Only true or false</td><td><code>boolean alive = true;</code></td><td>1 switch is enough</td></tr>
<tr><td><code>char</code></td><td>One character, in single quotes</td><td><code>char grade = 'A';</code></td><td>2 bytes</td></tr>
<tr><td><code>String</code></td><td>Text, in double quotes</td><td><code>String hero = "Arjun";</code></td><td>Grows with the text</td></tr>
</table></div>
<p>The type is fixed for the life of the box. An <code>int</code> box can never hold text. What the bytes look like inside is in the note on bits and bytes.</p>

<h3>Rules for names</h3>
<ul>
<li>Letters, digits and underscore only. A name cannot start with a digit.</li>
<li>Capital and small letters are different: <code>heroHp</code> and <code>herohp</code> are two boxes.</li>
<li>By habit, Java names start small and each new word starts with a capital: <code>monsterHp</code>, <code>goldLeft</code>. This is called camelCase.</li>
<li>Choose names that say what is inside. <code>damage</code> is better than <code>d</code>.</li>
</ul>

<h3>Why bother: one place to change</h3>
<p>If 100 is typed in ten places and the hero's health changes to 120, you must find all ten. If it is in one box that ten statements read, you change one number. A value typed directly into the code in many places is called a <b>magic number</b>, and programmers avoid it.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>Using a box you never declared</td><td class="bad">cannot find symbol</td></tr>
<tr><td>Reading a box before giving it a value</td><td class="bad">variable hp might not have been initialized</td></tr>
<tr><td>Declaring the same name twice</td><td class="bad">variable hp is already defined</td></tr>
<tr><td>Putting text in a number box: <code>int hp = "ten";</code></td><td class="bad">incompatible types: String cannot be converted to int</td></tr>
<tr><td>Quotes round the name: <code>println("heroHp")</code></td><td>No error. It prints the word heroHp, not the value.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary><code>int a = 5; int b = a; a = 9;</code> What is in b?</summary><p>5. The second statement copied the value that was in a at that moment. The boxes are not linked, so changing a later does not touch b.</p></details>
<details><summary>Why does <code>heroHp = 80;</code> have no <code>int</code> in front?</summary><p>Writing the type creates a new box. The box already exists, so you only assign to it. Writing <code>int heroHp = 80;</code> a second time gives the "already defined" error.</p></details>
<details><summary>Which type would you use for an amount of money?</summary><p>A whole-number type, <code>int</code> or <code>long</code>, counting the smallest unit such as paise. Not <code>double</code>, because decimals are stored only approximately.</p></details>`,
  },
  {
    id: 'concept-arithmetic',
    kind: 'concept', lesson: 'w1m3', order: 3,
    date: '2026-10-12',
    title: 'Arithmetic, and changing what is in a box',
    from: 'Goes with lesson 3: First blood',
    widgets: {
      'c3-assign': {
        code: ['int monsterHp = 60;', 'int damage = 25;', 'monsterHp = monsterHp - damage;', 'monsterHp -= damage;', 'System.out.println(monsterHp);'],
        steps: [
          { line: 0, vars: { monsterHp: 60 }, out: [], note: 'The box starts at 60.' },
          { line: 1, vars: { monsterHp: 60, damage: 25 }, out: [], note: 'A second box.' },
          { line: 2, vars: { monsterHp: 35, damage: 25 }, out: [], note: 'Right side first: read monsterHp (60), read damage (25), subtract, get 35. Only then store 35 in monsterHp.' },
          { line: 3, vars: { monsterHp: 10, damage: 25 }, out: [], note: 'The short form does exactly the same thing again: 35 minus 25 is 10.' },
          { line: 4, vars: { monsterHp: 10, damage: 25 }, out: ['10'], note: 'damage was only read. Reading never changes a box.' },
        ],
      },
    },
    html: `
<h3>The five signs</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Sign</th><th>Does</th><th>Example</th><th>Gives</th></tr>
<tr><td><code>+</code></td><td>Add</td><td><code>7 + 2</code></td><td>9</td></tr>
<tr><td><code>-</code></td><td>Subtract</td><td><code>7 - 2</code></td><td>5</td></tr>
<tr><td><code>*</code></td><td>Multiply</td><td><code>7 * 2</code></td><td>14</td></tr>
<tr><td><code>/</code></td><td>Divide</td><td><code>7 / 2</code></td><td>3, not 3.5</td></tr>
<tr><td><code>%</code></td><td>Remainder (what is left over)</td><td><code>7 % 2</code></td><td>1</td></tr>
</table></div>
<p><b>Try it.</b> Change the numbers and the sign. Try 7 / 2, then 7 % 2, then anything divided by 0.</p>
<div data-widget="calc" data-key="c3-calc" data-a="7" data-b="2" data-op="/"></div>

<h3>Whole-number division throws the leftover away</h3>
<p>When both sides are whole numbers, <code>/</code> gives a whole number. It does not round: <code>7 / 2</code> is 3, and <code>99 / 100</code> is 0. The leftover is not lost if you ask for it with <code>%</code>.</p>
<p>The two work as a pair. 135 minutes is how many hours and minutes?</p>
<pre>int minutes = 135;
int hours = minutes / 60;   // 2
int rest  = minutes % 60;   // 15</pre>
<p>Other everyday uses of <code>%</code>: a number is even when <code>n % 2</code> is 0, and the last digit of a number is <code>n % 10</code>.</p>
<p>If you want 3.5, at least one side must be a decimal number: <code>7 / 2.0</code> gives 3.5.</p>

<h3>Which sign goes first</h3>
<p>The same order as in school maths: brackets first, then <code>*</code> <code>/</code> <code>%</code>, then <code>+</code> <code>-</code>. Signs of the same level go left to right.</p>
<pre>2 + 3 * 4      // 14   (3 * 4 first)
(2 + 3) * 4    // 20   (brackets first)</pre>
<p>When in doubt, add brackets. They cost nothing and make the order obvious to the next reader.</p>

<h3>= means store, not equals</h3>
<p>Java works out everything on the right side first, then stores the answer in the box on the left. That is why <code>monsterHp = monsterHp - damage</code> makes sense: read the old value, work out the new one, put it back.</p>
<div data-widget="stepper" data-ref="c3-assign"></div>

<h3>The short ways to change a box</h3>
<p>Changing a box using its own value is so common that Java has shorter spellings. They mean exactly the same as the long form. Use whichever you read more easily.</p>
<div data-widget="compound" data-key="c3-compound"></div>
<div class="tablewrap"><table class="plain">
<tr><th>Short</th><th>Long</th></tr>
<tr><td><code>x += 5;</code></td><td><code>x = x + 5;</code></td></tr>
<tr><td><code>x -= 3;</code></td><td><code>x = x - 3;</code></td></tr>
<tr><td><code>x *= 2;</code></td><td><code>x = x * 2;</code></td></tr>
<tr><td><code>x /= 2;</code></td><td><code>x = x / 2;</code></td></tr>
<tr><td><code>x++;</code></td><td><code>x = x + 1;</code></td></tr>
<tr><td><code>x--;</code></td><td><code>x = x - 1;</code></td></tr>
</table></div>

<h3>A trap when text and numbers meet</h3>
<p>The <code>+</code> sign adds numbers but glues text, and Java goes left to right.</p>
<pre>System.out.println("HP: " + 2 + 3);     // HP: 23
System.out.println("HP: " + (2 + 3));   // HP: 5
System.out.println(2 + 3 + " HP");      // 5 HP</pre>
<p>In the first line, "HP: " + 2 is done first and becomes the text "HP: 2". Then 3 is glued on. Brackets force the adding to happen first. This is the reason the experiment in lesson 2 told you to write <code>(heroHp + 1)</code> in brackets.</p>

<h3>Common mistakes</h3>
<ul>
<li>Expecting <code>7 / 2</code> to be 3.5.</li>
<li>Dividing a whole number by zero. The program compiles, then stops while running with <span class="bad">ArithmeticException: / by zero</span>.</li>
<li>Writing <code>monsterHp - damage;</code> on its own. It works out the answer and throws it away. Nothing is stored without <code>=</code>.</li>
<li>Letting a number grow past about 2 billion. See the note on the 32 switches.</li>
</ul>

<h3>Check yourself</h3>
<details><summary>What is <code>17 / 5</code> and <code>17 % 5</code>?</summary><p>3 and 2. Five goes into seventeen three times, with two left over.</p></details>
<details><summary><code>int x = 4; x *= 3; x -= 2; x++;</code> What is in x?</summary><p>11. It goes 4, then 12, then 10, then 11.</p></details>
<details><summary>What does <code>System.out.println(1 + 2 + "3");</code> show?</summary><p>33. Left to right: 1 + 2 is the number 3, and then the text "3" is glued on.</p></details>
<details><summary>How would you get the paise part of 12345 paise?</summary><p><code>12345 % 100</code>, which is 45. And <code>12345 / 100</code> is 123, the rupees.</p></details>`,
  },
  {
    id: 'concept-errors',
    kind: 'concept', lesson: 'w1m4', order: 4,
    date: '2026-10-12',
    title: 'Reading error messages, and the two kinds of bug',
    from: 'Goes with lesson 4: Bug hunt',
    html: `
<h3>The idea</h3>
<p>A <b>bug</b> is anything that makes a program do something other than what you meant. Finding and fixing bugs is called <b>debugging</b>, and it is a normal part of every programmer's day, not a sign that something went wrong with you.</p>

<h3>Kind 1: Java refuses to run it</h3>
<p>You broke a rule of the language. Java catches this during the check, before anything runs. This is a <b>compile error</b>, and it comes with a message:</p>
<pre>BugHunt1.java:3: error: ';' expected
        int gold = 40
                     ^</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>What it tells you</th></tr>
<tr><td><code>BugHunt1.java</code></td><td>Which file</td></tr>
<tr><td><code>:3</code></td><td>Which line</td></tr>
<tr><td><code>';' expected</code></td><td>What Java wanted and did not find</td></tr>
<tr><td>The copied line</td><td>The line as Java saw it</td></tr>
<tr><td><code>^</code></td><td>The exact spot where Java got confused</td></tr>
</table></div>
<p>Read the message before touching the code. Most of the time it names the line and the problem outright.</p>

<h3>Kind 2: it runs, and the answer is wrong</h3>
<p>Every rule is followed, so Java is satisfied, but the program does the wrong thing. This is a <b>logic error</b>.</p>
<pre>gold = gold + swordPrice;   // you meant minus</pre>
<p>Java cannot know you meant minus. No message appears. The only way to notice is to know what the output <i>should</i> be and compare. This is why you predict before you run, and it is the reason programmers write tests.</p>

<h3>A third kind you met in the last note</h3>
<p>Some errors pass the check and then stop the program while it is running, such as dividing by zero. These are called <b>runtime errors</b>. Their message names the line where the program stopped:</p>
<pre>Exception in thread "main" java.lang.ArithmeticException: / by zero
        at Game.main(Game.java:5)</pre>

<h3>A method for hunting</h3>
<ol>
<li><b>Fix the first error only.</b> One real mistake can confuse Java into reporting several. Fix the top one and run again.</li>
<li><b>Look one line up.</b> A missing semicolon or quote is often reported on the line after the one where it is missing.</li>
<li><b>Change one thing, then run.</b> If you change three things and it works, you do not know which one fixed it.</li>
<li><b>When the output is wrong, print the boxes.</b> Add a line that prints a variable just before the wrong result. You will see where the value stops being what you expected.</li>
<li><b>Say what each line does, out loud.</b> Explaining code line by line finds a surprising number of bugs.</li>
</ol>

<h3>Messages you have met so far</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Message</th><th>Usual cause</th></tr>
<tr><td class="bad">';' expected</td><td>A statement does not end with a semicolon</td></tr>
<tr><td class="bad">cannot find symbol</td><td>A name Java does not know: a typo, wrong capital letter, or never declared</td></tr>
<tr><td class="bad">unclosed string literal</td><td>Text that starts with a quote and never ends with one</td></tr>
<tr><td class="bad">incompatible types</td><td>The wrong kind of value for the box</td></tr>
<tr><td class="bad">already defined</td><td>The same variable declared twice</td></tr>
<tr><td class="bad">reached end of file while parsing</td><td>A closing curly brace is missing</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>A program prints "Gold left: gold". Which kind of bug is it, and what is wrong?</summary><p>A logic error. The name is inside quotes, so Java prints the word and never looks in the box.</p></details>
<details><summary>Java reports an error on line 8, but line 8 looks perfect. Where do you look?</summary><p>Line 7. Something there was not finished, most often a missing semicolon, quote or bracket.</p></details>
<details><summary>Why can Java not find logic errors for you?</summary><p>It checks whether the code follows the rules of the language. It has no way to know what you wanted the code to do.</p></details>`,
  },

  {
    id: 'concept-if',
    kind: 'concept', lesson: 'w1m5', order: 5,
    date: '2026-10-12',
    title: 'Decisions: if, else, and yes-or-no questions',
    from: 'Goes with lesson 5: Is it dead yet?',
    widgets: {
      'c5-paths': {
        code: ['int monsterHp = 35;', 'if (monsterHp > 50) {', '    System.out.println("healthy");', '} else if (monsterHp > 0) {', '    System.out.println("hurt");', '} else {', '    System.out.println("down");', '}', 'System.out.println("next turn");'],
        steps: [
          { line: 0, vars: { monsterHp: 35 }, out: [], note: 'The box holds 35.' },
          { line: 1, vars: { monsterHp: 35 }, out: [], note: 'First question: is 35 greater than 50? No. Skip this block.' },
          { line: 3, vars: { monsterHp: 35 }, out: [], note: 'Second question, asked only because the first was no: is 35 greater than 0? Yes.' },
          { line: 4, vars: { monsterHp: 35 }, out: ['hurt'], note: 'This block runs.' },
          { line: 8, vars: { monsterHp: 35 }, out: ['hurt', 'next turn'], note: 'One block has run, so the rest of the chain is skipped. The program carries on below it.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>Until now every statement ran every time. An <code>if</code> lets the program choose: run this block only when a question has the answer yes.</p>
<pre>if (monsterHp > 0) {
    System.out.println("The monster is still standing.");
} else {
    System.out.println("The monster falls. You win!");
}</pre>
<p>The question goes in round brackets. Each block of statements goes in its own curly braces. Exactly one of the two blocks runs, never both and never neither. The <code>else</code> part is optional: without it, a "no" simply skips the block.</p>

<h3>The questions you can ask</h3>
<p>A question compares two values and its answer is <code>true</code> or <code>false</code>. <b>Try it.</b> Change the numbers. Make them equal and see which answers flip.</p>
<div data-widget="compare" data-key="c5-compare" data-a="35" data-b="0"></div>
<p>The edge is where mistakes hide. With 0 on both sides, <code>&gt;</code> says false and <code>&gt;=</code> says true. Whenever you write a comparison, ask yourself what should happen when the two values are exactly equal.</p>

<h3>The answer is a value too</h3>
<p>True and false can live in a box of their own, of type <code>boolean</code>.</p>
<pre>boolean alive = monsterHp > 0;
if (alive) {
    System.out.println("still fighting");
}</pre>
<p>A well-named boolean often makes an <code>if</code> read like a sentence.</p>

<h3>More than two paths</h3>
<p>Chain the questions with <code>else if</code>. Java asks them from the top and runs the block of the <b>first</b> one that is true. The rest are not even asked.</p>
<div data-widget="stepper" data-ref="c5-paths"></div>
<p>Because the first true one wins, the order matters. If the questions above were swapped, 80 HP would print "hurt", since 80 is also greater than 0.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td><code>if (hp = 0)</code> with one equals sign</td><td class="bad">incompatible types: int cannot be converted to boolean</td></tr>
<tr><td>A semicolon straight after the brackets: <code>if (hp > 10);</code></td><td>No error. The if ends at the semicolon, and the block below it runs every time.</td></tr>
<tr><td>Leaving out the curly braces</td><td>No error. Only the one statement after the if belongs to it. The next line runs every time, however it is indented.</td></tr>
<tr><td>Comparing text with <code>==</code></td><td>No error, but unreliable. Text is compared with <code>a.equals(b)</code>. You will see why in week 4.</td></tr>
<tr><td>Checking after the wrong line</td><td>The if judges the value the box holds at that moment. Put it after the statement that changes the box.</td></tr>
</table></div>
<p>Always write the curly braces, even for a single statement. It removes two of these mistakes for good.</p>

<h3>Check yourself</h3>
<details><summary><code>int hp = 20; hp = hp - 20; if (hp > 0) { ... } else { ... }</code> Which block runs?</summary><p>The else block. The box holds exactly 0, and 0 is not greater than 0.</p></details>
<details><summary>What is the difference between <code>=</code> and <code>==</code>?</summary><p><code>=</code> stores a value in a box. <code>==</code> asks whether two values are the same, and gives true or false.</p></details>
<details><summary>In an if, else if, else chain with three blocks, how many blocks can run?</summary><p>Exactly one. With no final else it could also be none.</p></details>
<details><summary>A shop gives a discount to anyone spending 500 or more. Which sign?</summary><p><code>&gt;=</code>. With <code>&gt;</code>, someone spending exactly 500 would be left out.</p></details>`,
  },
  {
    id: 'concept-while',
    kind: 'concept', lesson: 'w1m6', order: 6,
    date: '2026-10-12',
    title: 'Loops: doing something until a question says stop',
    from: 'Goes with lesson 6: Fight to the end',
    widgets: {
      'c6-count': {
        code: ['int round = 1;', 'while (round <= 3) {', '    System.out.println("Round " + round);', '    round = round + 1;', '}', 'System.out.println("Done");'],
        steps: [
          { line: 0, vars: { round: 1 }, out: [], note: 'Part 1, the start: a box the loop will count with.' },
          { line: 1, vars: { round: 1 }, out: [], note: 'Part 2, the question: is 1 at most 3? Yes, so go inside.' },
          { line: 2, vars: { round: 1 }, out: ['Round 1'], note: 'The work.' },
          { line: 3, vars: { round: 2 }, out: ['Round 1'], note: 'Part 3, the change: without this line the question would stay true for ever.' },
          { line: 1, vars: { round: 2 }, out: ['Round 1'], note: 'Back to the top. Is 2 at most 3? Yes.' },
          { line: 2, vars: { round: 2 }, out: ['Round 1', 'Round 2'], note: 'The work.' },
          { line: 3, vars: { round: 3 }, out: ['Round 1', 'Round 2'], note: 'The change.' },
          { line: 1, vars: { round: 3 }, out: ['Round 1', 'Round 2'], note: 'Is 3 at most 3? Yes. This is the edge.' },
          { line: 2, vars: { round: 3 }, out: ['Round 1', 'Round 2', 'Round 3'], note: 'The work.' },
          { line: 3, vars: { round: 4 }, out: ['Round 1', 'Round 2', 'Round 3'], note: 'The change.' },
          { line: 1, vars: { round: 4 }, out: ['Round 1', 'Round 2', 'Round 3'], note: 'Is 4 at most 3? No. The loop is over.' },
          { line: 5, vars: { round: 4 }, out: ['Round 1', 'Round 2', 'Round 3', 'Done'], note: 'The program carries on after the closing brace. Notice the box ended at 4, one past the last round.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A loop runs the same block of statements again and again. A <code>while</code> loop is an <code>if</code> that goes back to the top and asks its question again.</p>
<pre>while (monsterHp > 0) {
    monsterHp = monsterHp - damage;
}</pre>
<p>Ask the question. If yes, run the block and come back to ask again. If no, carry on below the closing brace.</p>

<h3>Every loop has three parts</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>What it is</th><th>If you forget it</th></tr>
<tr><td>The start</td><td>The box the question looks at, set up before the loop</td><td>The loop starts from the wrong place</td></tr>
<tr><td>The question</td><td>What must be true to go round again</td><td>There is no loop</td></tr>
<tr><td>The change</td><td>A statement inside the block that moves the box toward "no"</td><td>The loop never ends</td></tr>
</table></div>
<div data-widget="stepper" data-ref="c6-count"></div>

<h3>How many times does it run?</h3>
<p><b>Try it.</b> Start with 60 and 25. Then try 50 and 25: is it two rounds or three? Then set the damage to 0. Then set monsterHp to 0.</p>
<div data-widget="loop" data-key="c6-loop"></div>
<p>Three things to take from that:</p>
<ul>
<li>A loop can run <b>zero times</b>. The question is asked before the first round.</li>
<li>If nothing inside moves the box toward "no", the loop is <b>endless</b>. In a terminal you stop a runaway program with Ctrl + C.</li>
<li>The question is the loop's <b>stop rule</b>. Take it from the problem before you write any code: "three potions" means count to three, and "until full" means watch the HP. They can give the same output for one input and different output for another.</li>
<li>Whether the edge counts decides the last round. Being wrong by exactly one round is so common it has a name: an <b>off-by-one error</b>.</li>
</ul>

<h3>What you know when a loop ends</h3>
<p>The program can only get past the closing brace at the moment the question is false. So on the first line after a <code>while (monsterHp > 0)</code> loop, one fact is guaranteed: monsterHp is 0 or less.</p>
<pre>while (monsterHp > 0) {
    monsterHp = monsterHp - damage;
}
if (monsterHp > 0) {
    System.out.println("still standing");   // can never run
} else {
    System.out.println("You win!");
}</pre>
<p>Asking the same question again straight after the loop is pointless: the answer is always no. The first message can never print, whatever numbers you use. Code that can never run is called <b>dead code</b>. Remove it, and print the win message directly. Shorter code that says the same thing is easier to read and has fewer places for bugs to hide.</p>

<h3>Running totals</h3>
<p>Some boxes are meant to <b>add up</b> across the rounds of a loop. Such a box is called an <b>accumulator</b>. It starts at 0 before the loop, and each round adds to it with <code>+=</code>.</p>
<p>The classic slip is to write <code>=</code> where <code>+=</code> was meant. Then each round replaces the total, and at the end the box holds only what the last round put there.</p>
<p>A hero with 50 HP drinks three potions of 30 each, HP cannot go above 100, and you want the total HP wasted:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Potion</th><th>HP before</th><th>HP + 30</th><th>HP after the cap</th><th>Wasted this round</th></tr>
<tr><td>1</td><td>50</td><td>80</td><td>80</td><td>0</td></tr>
<tr><td>2</td><td>80</td><td>110</td><td>100</td><td>10</td></tr>
<tr><td>3</td><td>100</td><td>130</td><td>100</td><td>30</td></tr>
</table></div>
<pre>wasted += heroHp - 100;   // adds each round:      0, then 10, then 40
wasted = heroHp - 100;    // replaces each round:  0, then 10, then 30</pre>
<p>The right answer is 40. The second version prints 30, and with a starting HP of 20 it happens to print the correct 10, because only one potion wastes anything. A bug like this hides until you try an input where the difference shows. Writing the table by hand for a second starting value is how you catch it.</p>

<h3>Why loops matter so much</h3>
<p>A loop is how a short program does a large amount of work: ten lines can process ten million payments. It is also where a program spends nearly all its time. When software is slow, the cause is almost always a loop that runs more times than it needs to. Counting how many times a loop runs is the beginning of a subject you will meet in week 3.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td>No statement inside that changes the box</td><td>Endless loop</td></tr>
<tr><td>The change moves the wrong way, for example adding when the question waits for a smaller number</td><td>Endless loop, or one that only ends when the number overflows</td></tr>
<tr><td><code>&lt;</code> where <code>&lt;=</code> was needed, or the other way round</td><td>One round too few or too many</td></tr>
<tr><td>A semicolon after the brackets: <code>while (hp > 0);</code></td><td>The loop has an empty body and never ends</td></tr>
<tr><td>Putting a statement inside the loop that should run once, after it</td><td>It runs every round</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary><code>int n = 0; while (n < 5) { n++; }</code> How many times does the block run, and what is n afterwards?</summary><p>Five times. Afterwards n is 5, the first value for which the question is false.</p></details>
<details><summary><code>int m = 5; while (m > 5) { ... }</code> How many times does the block run?</summary><p>Zero. 5 is not greater than 5, so the block is skipped at the first check.</p></details>
<details><summary>A monster has 100 HP and takes 30 damage a round. How many rounds until its HP is 0 or less?</summary><p>Four. After three rounds it has 10 left, so a fourth is needed, which takes it to -20.</p></details>
<details><summary>Where does the "You win!" message go: inside the loop or after it?</summary><p>After it. The program only gets past the closing brace when the question has become false, which means the monster is down.</p></details>`,
  },

  {
    id: 'concept-read-problem',
    kind: 'concept', lesson: 'w1m7', order: 7,
    date: '2026-10-12',
    title: 'How to read a problem before you code it',
    from: 'Goes with lesson 7: the timed challenge, and every challenge after it',
    html: `
<h3>The idea</h3>
<p>Most wrong programs are not wrong because of the code. They solve a slightly different problem from the one that was asked. The fix is not to read faster or think harder. It is five small steps you do <b>before</b> typing, and they take about three minutes.</p>

<h3>The example: the potion problem</h3>
<p>"A hero has 20 HP and finds 3 potions. Each potion heals 30 HP, but HP can never go above 100. Drink the potions one at a time and print the HP after each one."</p>
<p>A natural first program keeps drinking <b>while the HP is below 100</b>. It prints exactly the expected three lines, and it is wrong. The five steps show why.</p>

<h3>Step 1: pull out the givens</h3>
<p>Write down every number and what it is. Do not skip the ones that look obvious.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Given</th><th>Value</th><th>Will it become</th></tr>
<tr><td>Starting HP</td><td>20</td><td>a box that changes</td></tr>
<tr><td>Number of potions</td><td>3</td><td>how many times the loop runs</td></tr>
<tr><td>Heal per potion</td><td>30</td><td>a box that stays the same</td></tr>
<tr><td>Most HP allowed</td><td>100</td><td>the limit in an if</td></tr>
</table></div>
<p>The "3" is in the list, so the program must use it somewhere. A program that never mentions one of the givens is almost always solving a different problem.</p>

<h3>Step 2: find the stop rule</h3>
<p>For anything that repeats, ask: <b>according to the problem, what makes it stop?</b> Here the words are "finds 3 potions" and "drink the potions". It stops when the potions run out. It does not say "until the hero is healed".</p>
<p>This one sentence decides the loop's question: count potions, not HP.</p>

<h3>Step 3: say it back in one sentence</h3>
<p>"Three times: add 30 to the HP, cut it back to 100 if it went over, print it." If you cannot say it in one or two plain sentences, you are not ready to code it, and that is useful to find out now.</p>

<h3>Step 4: do one small case by hand</h3>
<p>Before any code, work the example on paper as a table. One row per round, one column per box.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Potion</th><th>HP before</th><th>After healing</th><th>Cut back to</th></tr>
<tr><td>1</td><td>20</td><td>50</td><td>50</td></tr>
<tr><td>2</td><td>50</td><td>80</td><td>80</td></tr>
<tr><td>3</td><td>80</td><td>110</td><td>100</td></tr>
</table></div>
<p>Now you know what the right output is before the program exists, so you can tell whether the program is right.</p>

<h3>Step 5: pick a second input that could prove you wrong</h3>
<p>One example is not enough, because two different readings of a problem can agree on it. Choose another starting value where they would disagree.</p>
<p><b>Try it.</b> Start at 20: the two readings print the same thing. Now try 50, then 95.</p>
<div data-widget="readings" data-key="c7-readings" data-start="20"></div>
<p>With 20 HP the wrong reading is invisible. With 50 HP it drinks only two potions and the mistake is obvious. A good second input is one that sits on an edge: already nearly full, exactly at the limit, zero, or one more than the example.</p>

<h3>Then compare, row by row</h3>
<p>Run the program on the second input and put its output next to your hand-made table. The first row that differs points at the line of code that is wrong. This is faster and more reliable than staring at the code.</p>

<h3>The five steps</h3>
<ol>
<li>List the givens. Each one should appear in the program.</li>
<li>Find the stop rule in the problem's own words.</li>
<li>Say the whole thing back in one sentence.</li>
<li>Work one small case by hand, as a table.</li>
<li>Choose a second input that would expose a misreading, and compare by table.</li>
</ol>

<h3>Check yourself</h3>
<details><summary>"A shop has 5 customers. Each buys items until their basket holds 4 items." What stops the outer loop, and what stops the inner one?</summary><p>The outer loop stops after 5 customers: a count. The inner loop stops when the basket holds 4 items: a condition on the basket. Two different stop rules, each taken from the wording.</p></details>
<details><summary>Your program prints the sample output exactly. Is it correct?</summary><p>Not yet known. It agrees with the problem on one input. Try a second input chosen to sit on an edge before trusting it.</p></details>
<details><summary>The potion program gives the right lines for 20 HP. Which starting HP would you try next, and why?</summary><p>Something close to full, such as 95 or 50. Then the HP reaches 100 before the potions run out, and the two readings print different numbers of lines.</p></details>
<details><summary>A problem mentions the number 7, and your finished program has no 7 in it and no box holding 7. What does that suggest?</summary><p>That the program ignores something the problem asked for. Go back to step 1.</p></details>`,
  },

  {
    id: 'concept-and-or',
    kind: 'concept', lesson: 'w1m8', order: 8,
    date: '2026-10-12',
    title: 'Joining questions: and, or, not',
    from: 'Goes with lesson 8: The monster hits back',
    widgets: {
      'c7-exit': {
        code: ['int heroHp = 30;', 'int monsterHp = 25;', 'while (heroHp > 0 && monsterHp > 0) {', '    monsterHp = monsterHp - 25;', '    if (monsterHp > 0) {', '        heroHp = heroHp - 20;', '    }', '}', 'if (monsterHp <= 0) {', '    System.out.println("You win!");', '} else {', '    System.out.println("You lose.");', '}'],
        steps: [
          { line: 1, vars: { heroHp: 30, monsterHp: 25 }, out: [], note: 'Two boxes, and the loop cares about both.' },
          { line: 2, vars: { heroHp: 30, monsterHp: 25 }, out: [], note: 'Is the hero alive? Yes. Is the monster alive? Yes. Both yes, so go inside.' },
          { line: 3, vars: { heroHp: 30, monsterHp: 0 }, out: [], note: 'The hero hits. The monster is down.' },
          { line: 4, vars: { heroHp: 30, monsterHp: 0 }, out: [], note: 'Is the monster still alive? No, so it does not hit back.' },
          { line: 2, vars: { heroHp: 30, monsterHp: 0 }, out: [], note: 'Hero alive: yes. Monster alive: no. One no is enough to make the joined answer no. The loop ends.' },
          { line: 8, vars: { heroHp: 30, monsterHp: 0 }, out: [], note: 'The loop could have ended because of either box. So this question is not dead code: you have to ask.' },
          { line: 9, vars: { heroHp: 30, monsterHp: 0 }, out: ['You win!'], note: 'With other starting numbers the other ending would print.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>One comparison answers one question. Real decisions often need two at once: keep fighting while the hero is alive <i>and</i> the monster is alive. Java has three signs for building a bigger question out of smaller ones.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Sign</th><th>Read as</th><th>True when</th></tr>
<tr><td><code>a &amp;&amp; b</code></td><td>and</td><td>both a and b are true</td></tr>
<tr><td><code>a || b</code></td><td>or</td><td>at least one of them is true</td></tr>
<tr><td><code>!a</code></td><td>not</td><td>a is false</td></tr>
</table></div>
<p><b>Try it.</b> Flip the two answers and watch all three joined questions change.</p>
<div data-widget="logic" data-key="c7-logic" data-a="heroHp > 0" data-b="monsterHp > 0"></div>

<h3>A loop with two ways out</h3>
<p>A loop with <code>&amp;&amp;</code> in its question ends as soon as <b>either</b> side becomes false. So when the program gets past it, you know one of the two is false, but not which one. That is why the question after the loop is real work here, and was dead code in lesson 6.</p>
<div data-widget="stepper" data-ref="c7-exit"></div>

<h3>Turning a question round</h3>
<p>"Keep going while both are alive" and "stop when either one is down" say the same thing. In code:</p>
<pre>!(heroHp > 0 && monsterHp > 0)
heroHp <= 0 || monsterHp <= 0</pre>
<p>These two always give the same answer. The rule: when you put "not" in front of a joined question, each part flips and "and" swaps with "or". It is worth knowing because the stop rule of a loop is always the opposite of its question.</p>

<h3>Java stops as soon as it knows</h3>
<p>In <code>a &amp;&amp; b</code>, if a is false the answer is already no, so Java never looks at b. In <code>a || b</code>, if a is true the answer is already yes. This lets the first part protect the second:</p>
<pre>if (count != 0 && total / count > 5) { ... }</pre>
<p>When count is 0 the division is never attempted, so the program does not stop with a divide by zero error.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td><code>||</code> where <code>&amp;&amp;</code> was meant in a loop question</td><td>No error. The loop keeps going while either side is true, often for ever.</td></tr>
<tr><td>Writing a range the school way: <code>if (0 &lt; hp &lt; 10)</code></td><td class="bad">bad operand types for binary operator '&lt;'</td></tr>
<tr><td>The right way to write that range</td><td><code>if (hp &gt; 0 &amp;&amp; hp &lt; 10)</code></td></tr>
<tr><td>A single <code>&amp;</code> in place of <code>&amp;&amp;</code></td><td>It compiles, but both sides are always worked out, so the protection above is lost.</td></tr>
<tr><td>Letting a fighter act after it has fallen</td><td>No error. Check who is alive in the middle of the round too, not only at the top of the loop.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>heroHp is 10 and monsterHp is 0. What is <code>heroHp > 0 && monsterHp > 0</code>? And with <code>||</code>?</summary><p>With && it is false, because the second part is false. With || it is true, because the first part is true.</p></details>
<details><summary>A loop runs <code>while (gold > 0 && items < 5)</code>. Write the question that is true exactly when the loop has stopped.</summary><p><code>gold <= 0 || items >= 5</code>. Each part flips, and "and" becomes "or".</p></details>
<details><summary>Why is <code>count != 0 && total / count > 5</code> safe, but the same two parts the other way round is not?</summary><p>Java works from left to right and stops when it knows the answer. With the check first, the division is skipped when count is 0. The other way round, the division happens first and stops the program.</p></details>`,
  },
  {
    id: 'concept-random',
    kind: 'concept', lesson: 'w1m9', order: 9,
    date: '2026-10-12',
    title: 'Random numbers, and why they are not really random',
    from: 'Goes with lesson 9: Roll the dice',
    html: `
<h3>The idea</h3>
<p>A program that always does the same thing makes a dull game. Java has a tool, <code>Random</code>, that hands out numbers you cannot predict in advance. Unlike <code>System.out</code>, it has to be loaded first.</p>
<pre>import java.util.Random;              // first line of the file

Random dice = new Random();           // make one dice, once
int damage = dice.nextInt(21) + 10;   // roll it: 10 to 30</pre>

<h3>The recipe for a range</h3>
<p><code>nextInt(n)</code> gives one of n numbers and starts at zero: 0 up to n - 1. It never gives n itself.</p>
<div class="tablewrap"><table class="plain">
<tr><th>You want</th><th>How many values</th><th>You write</th></tr>
<tr><td>0 to 5</td><td>6</td><td><code>dice.nextInt(6)</code></td></tr>
<tr><td>1 to 6</td><td>6</td><td><code>dice.nextInt(6) + 1</code></td></tr>
<tr><td>10 to 30</td><td>21</td><td><code>dice.nextInt(21) + 10</code></td></tr>
<tr><td>low to high</td><td>high - low + 1</td><td><code>dice.nextInt(high - low + 1) + low</code></td></tr>
</table></div>
<p><b>Try it.</b> Set it up for 1 to 6. Roll once a few times, then roll 100 times and look at how even the bars are. Then try to make 50 to 59.</p>
<div data-widget="dice" data-key="c8-dice" data-n="6" data-k="1"></div>
<p>The "+ 1" in "high - low + 1" is easy to forget. From 10 to 30 there are 21 numbers, not 20, because both ends count.</p>

<h3>Make the dice once, roll it many times</h3>
<p>Create the <code>Random</code> above the loop. Call <code>nextInt</code> inside the loop, every time you need a new number. A roll stored in a box before the loop is one number, however many rounds read it.</p>

<h3>Why it is called pseudo-random</h3>
<p>A computer only follows instructions, so it cannot roll real dice. <code>Random</code> starts from one number, the <b>seed</b>, and pushes it through a fixed formula to get the next number, then again to get the one after. The results look random, but the seed decides all of them.</p>
<pre>Random dice = new Random(7);
System.out.println(dice.nextInt(21) + 10);   // 20
System.out.println(dice.nextInt(21) + 10);   // 15
System.out.println(dice.nextInt(21) + 10);   // 28</pre>
<p>That prints 20, 15, 28 on every run, on every computer. With plain <code>new Random()</code> Java chooses a different seed each time, using things that keep changing such as the clock.</p>
<p>A fixed seed is useful when you want the same "random" events again: replaying a game, or repeating the exact run that showed a bug.</p>

<h3>Never for secrets</h3>
<p>Anyone who learns the seed can work out every number that follows. So <code>Random</code> must not be used for passwords, one-time codes or keys. For those Java has <code>SecureRandom</code>, which gathers real unpredictability from the machine. In payments this matters a great deal: the codes a card and a bank exchange are only safe if nobody can predict them.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td>No import line</td><td class="bad">cannot find symbol ... symbol: class Random</td></tr>
<tr><td><code>dice.nextInt(0)</code></td><td class="bad">IllegalArgumentException: bound must be positive</td></tr>
<tr><td><code>nextInt(30) + 10</code> when you wanted 10 to 30</td><td>No error. It gives 10 to 39.</td></tr>
<tr><td>Rolling once, above the loop</td><td>No error. Every round uses the same number.</td></tr>
<tr><td>Leaving a fixed seed in by accident</td><td>No error. The "random" game is identical every time.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>What are the smallest and largest numbers <code>dice.nextInt(6) + 1</code> can give?</summary><p>1 and 6. nextInt(6) gives 0 to 5, and adding 1 moves that to 1 to 6.</p></details>
<details><summary>Write the roll for a number from 50 to 59.</summary><p><code>dice.nextInt(10) + 50</code>. There are 10 values, starting at 50.</p></details>
<details><summary>Two programs both use <code>new Random(42)</code> and make the same calls. Do they get the same numbers?</summary><p>Yes, exactly the same, in the same order. The seed decides everything.</p></details>
<details><summary>Why can you not test a random program by comparing its output with one fixed expected output?</summary><p>The output differs on every run. You check rules that must always hold: every roll is inside its range, and every HP line follows from the one before it. This is how your dice lesson is checked.</p></details>`,
  },
  {
    id: 'concept-input',
    kind: 'concept', lesson: 'w1m10', order: 10,
    date: '2026-10-12',
    title: 'Input: reading what someone types',
    from: 'Goes with lesson 10: Your move',
    widgets: {
      'c9-queue': {
        code: ['Scanner keys = new Scanner(System.in);', 'System.out.println("Your move:");', 'int move = keys.nextInt();', 'System.out.println("Amount:");', 'int amount = keys.nextInt();', 'System.out.println(move + " then " + amount);'],
        steps: [
          { line: 0, vars: { 'typed, not yet read': '(nothing)' }, out: [], note: 'A reader is connected to the input. Nothing has been typed yet.' },
          { line: 1, vars: { 'typed, not yet read': '(nothing)' }, out: ['Your move:'], note: 'Ask first. A program that waits without saying what it wants looks frozen.' },
          { line: 2, vars: { 'typed, not yet read': '(nothing)' }, out: ['Your move:'], note: 'nextInt finds nothing to read, so the program stops here and waits.' },
          { line: 2, vars: { 'typed, not yet read': '1', move: '?' }, out: ['Your move:'], note: 'The player types 1 and presses Enter. Now there is something in the queue.' },
          { line: 2, vars: { 'typed, not yet read': '(nothing)', move: 1 }, out: ['Your move:'], note: 'nextInt takes it out of the queue, turns the character 1 into the number 1, and hands it back.' },
          { line: 4, vars: { 'typed, not yet read': '(nothing)', move: 1 }, out: ['Your move:', 'Amount:'], note: 'The same again: ask, then wait.' },
          { line: 4, vars: { 'typed, not yet read': '(nothing)', move: 1, amount: 250 }, out: ['Your move:', 'Amount:'], note: 'The player typed 250 and Enter. Three characters became one number.' },
          { line: 5, vars: { 'typed, not yet read': '(nothing)', move: 1, amount: 250 }, out: ['Your move:', 'Amount:', '1 then 250'], note: 'From here on they are ordinary boxes.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>Output is the program talking. Input is the program listening. With input, the same program can do different things each time, depending on the person using it.</p>
<pre>import java.util.Scanner;                 // at the top, with the other imports

Scanner keys = new Scanner(System.in);    // make one reader, once
int move = keys.nextInt();                // wait for a whole number</pre>

<h3>What a Scanner can read</h3>
<div class="tablewrap"><table class="plain">
<tr><th>You write</th><th>It hands back</th></tr>
<tr><td><code>keys.nextInt()</code></td><td>The next whole number</td></tr>
<tr><td><code>keys.next()</code></td><td>The next word, as text</td></tr>
<tr><td><code>keys.nextLine()</code></td><td>Everything up to the end of the line, as text</td></tr>
</table></div>

<h3>Typed input waits in a queue</h3>
<p>What is typed does not go straight into your boxes. It waits in a queue, and each read takes the next thing out. Something that has been read is gone from the queue.</p>
<div data-widget="stepper" data-ref="c9-queue"></div>

<h3>Three channels every program has</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Channel</th><th>In Java</th><th>Used for</th></tr>
<tr><td>Standard input</td><td><code>System.in</code></td><td>What the program reads</td></tr>
<tr><td>Standard output</td><td><code>System.out</code></td><td>The normal results</td></tr>
<tr><td>Standard error</td><td><code>System.err</code></td><td>Problem reports, kept apart from the results</td></tr>
</table></div>
<p>Normally the keyboard feeds the input and both outputs go to the screen, which is why <code>System.err.println</code> looks the same as <code>System.out.println</code> in a terminal. But they are separate channels, and a tool that reads a program's results only reads the output channel. The lab's checks work that way.</p>
<p>The input channel does not have to be a keyboard either. A file or another program can feed it. That is how the lab plays scripted games against your code, and how real systems connect programs together.</p>

<h3>Never trust input</h3>
<p>Everything that comes from outside can be wrong: a letter where a number should be, a move that does not exist, a negative price. Decide what your program does in each case. An <code>else</code> that says "Not a move." is the simplest form of this. A large share of real security problems start with input that nobody checked.</p>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What happens</th></tr>
<tr><td>No import line</td><td class="bad">cannot find symbol ... symbol: class Scanner</td></tr>
<tr><td>Reading when no more input will ever come</td><td class="bad">java.util.NoSuchElementException</td></tr>
<tr><td>A word is typed where <code>nextInt</code> expects a number</td><td class="bad">java.util.InputMismatchException</td></tr>
<tr><td>Reading before asking</td><td>No error. The program sits silent and looks frozen.</td></tr>
<tr><td>Making a new Scanner inside the loop</td><td>Often loses input that was already typed. Make one, above the loop.</td></tr>
<tr><td><code>nextLine()</code> straight after <code>nextInt()</code></td><td>It hands back empty text. nextInt took the number but left the Enter, and nextLine reads up to that Enter.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>The player types 4, Enter, 9, Enter. The program calls <code>nextInt()</code> three times. What happens on the third call?</summary><p>If the keyboard is still connected, the program waits for more typing. If the input has ended, as in a scripted run, it stops with NoSuchElementException.</p></details>
<details><summary>Why did <code>System.err.println</code> fail the checks in the potion challenge although the lines looked right?</summary><p>It writes to the error channel. The checks read only the output channel, so they saw one line where they expected four.</p></details>
<details><summary>The player types the digit 7. What arrives in the input queue, and what does nextInt hand back?</summary><p>The character 7 arrives, which is stored as the number 55. nextInt turns the characters into the value 7.</p></details>`,
  },
  {
    id: 'concept-methods',
    kind: 'concept', lesson: 'w1m11', order: 11,
    date: '2026-10-12',
    title: 'Methods: naming a piece of work',
    from: 'Goes with lesson 11: Give the moves names',
    widgets: {
      'c10-stack': {
        code: ['static int heal(int hp) {', '    int after = hp + 30;', '    if (after > 100) {', '        return 100;', '    }', '    return after;', '}', '', 'public static void main(String[] args) {', '    int heroHp = 90;', '    heroHp = heal(heroHp);', '    System.out.println(heroHp);', '}'],
        steps: [
          { line: 9, frames: [{ name: 'main', vars: { heroHp: 90 } }], out: [], note: 'main has one box.' },
          { line: 10, frames: [{ name: 'main', vars: { heroHp: 90 } }], out: [], note: 'To work out the right side, main must call heal. It pauses here.' },
          { line: 0, frames: [{ name: 'main', vars: { heroHp: 90 } }, { name: 'heal', vars: { hp: 90 } }], out: [], note: 'A new frame goes on top. The value 90 is copied into the parameter hp. The two boxes are now separate.' },
          { line: 1, frames: [{ name: 'main', vars: { heroHp: 90 } }, { name: 'heal', vars: { hp: 90, after: 120 } }], out: [], note: 'heal works with its own boxes. main cannot see them, and heal cannot see heroHp.' },
          { line: 3, frames: [{ name: 'main', vars: { heroHp: 90 } }, { name: 'heal', vars: { hp: 90, after: 120 } }], out: [], note: '120 is above 100, so the method returns 100 and ends at once. The last line of heal never runs this time.' },
          { line: 10, frames: [{ name: 'main', vars: { heroHp: 100 } }], out: [], note: 'The frame for heal is thrown away. main continues where it paused and stores the answer.' },
          { line: 11, frames: [{ name: 'main', vars: { heroHp: 100 } }], out: ['100'], note: 'Without "heroHp =" on the line above, the 100 would have been lost and this would print 90.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>A <b>method</b> is a block of code with a name. You write it once and <b>call</b> it by name wherever you need it. Methods remove repetition, and they let you read a program as a list of named steps.</p>

<h3>The parts</h3>
<pre>static int roll(Random dice, int low, int high) {
    return dice.nextInt(high - low + 1) + low;
}</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>Meaning</th></tr>
<tr><td><code>static</code></td><td>Needed for a method that main calls directly. Explained in week 4.</td></tr>
<tr><td><code>int</code></td><td>The <b>return type</b>: the kind of answer the method gives back</td></tr>
<tr><td><code>roll</code></td><td>The name. Use a verb that says what it does.</td></tr>
<tr><td><code>(Random dice, int low, int high)</code></td><td>The <b>parameters</b>: boxes the caller fills in</td></tr>
<tr><td><code>return ...;</code></td><td>Hands back the answer and ends the method at once</td></tr>
</table></div>
<p>A method goes inside the class and outside <code>main</code>. The order of methods in the file does not matter.</p>

<h3>Three kinds you will write</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Gives back</th><th>Example</th><th>Called like</th></tr>
<tr><td>A number</td><td><code>static int heal(int hp)</code></td><td><code>heroHp = heal(heroHp);</code></td></tr>
<tr><td>Yes or no</td><td><code>static boolean alive(int hp)</code></td><td><code>if (alive(heroHp)) { ... }</code></td></tr>
<tr><td>Nothing: it only does something</td><td><code>static void showHp(String who, int hp)</code></td><td><code>showHp("Hero", heroHp);</code></td></tr>
</table></div>
<p><code>void</code> means there is no answer. A void method needs no <code>return</code>.</p>

<h3>What happens during a call</h3>
<p>Every call gets its own set of boxes, called a <b>frame</b>. Frames are stacked: the newest call is on top, and when it returns it is removed and the one below carries on. This pile is the <b>call stack</b>.</p>
<div data-widget="callstack" data-ref="c10-stack"></div>
<p>Three rules fall out of that picture.</p>
<ul>
<li><b>Values are copied in.</b> The method gets a copy of the number, not the caller's box. Changing a parameter does not change anything in main.</li>
<li><b>Only the returned value comes back.</b> If you do not store or use it, it is lost. <code>heal(heroHp);</code> on a line by itself changes nothing.</li>
<li><b>A method cannot see main's boxes.</b> Whatever it needs must be passed in as a parameter.</li>
</ul>

<h3>Why it is worth the effort</h3>
<ul>
<li><b>One place to change.</b> If potions should heal 40, you edit one line in <code>heal</code>.</li>
<li><b>Names explain.</b> <code>heroHp = heal(heroHp);</code> says what is happening. The five lines it replaced had to be read and understood.</li>
<li><b>Small pieces can be tested alone.</b> You can check that <code>heal(90)</code> gives 100 without playing a whole game. That is what the tests you will write later do.</li>
</ul>

<h3>Common mistakes</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Mistake</th><th>What Java says</th></tr>
<tr><td>A path through the method that reaches the end without <code>return</code></td><td class="bad">missing return statement</td></tr>
<tr><td>Calling with the wrong number of values</td><td class="bad">method ... cannot be applied to given types</td></tr>
<tr><td>Leaving out <code>static</code></td><td class="bad">non-static method ... cannot be referenced from a static context</td></tr>
<tr><td>Storing the answer of a <code>void</code> method</td><td class="bad">incompatible types: void cannot be converted to int</td></tr>
<tr><td>Writing a method inside main</td><td class="bad">illegal start of expression</td></tr>
<tr><td>Calling a method and ignoring what it returns</td><td>No error. Nothing changes.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary><code>int heroHp = 90; heal(heroHp); System.out.println(heroHp);</code> What is printed?</summary><p>90. heal worked out 100 and handed it back, but nothing stored it. The fix is <code>heroHp = heal(heroHp);</code></p></details>
<details><summary>A method changes its parameter: <code>hp = hp - 50;</code>. Does the caller's box change?</summary><p>No. The parameter is a separate box holding a copy. Inside the method it becomes 50 less, and outside nothing changes.</p></details>
<details><summary>Which return type would you give a method that answers "can the hero afford this"?</summary><p><code>boolean</code>, because the answer is yes or no. For example <code>static boolean canAfford(int gold, int price)</code>.</p></details>
<details><summary>What is a frame, and when is it thrown away?</summary><p>The set of boxes belonging to one call of a method: its parameters and anything declared inside it. It is thrown away when that call returns.</p></details>`,
  },

  // ======================= payments (kind: 'payments', in reading order) =======================
  {
    id: 'pay-tap-journey',
    kind: 'payments', order: 1,
    date: '2026-10-12',
    title: 'What happens when you tap a card',
    from: 'Payments note 1',
    widgets: {
      'pay1-auth': {
        parties: [
          { short: 'Card', name: 'The card' },
          { short: 'Shop', name: 'The shop' },
          { short: "Shop's bank", name: "The shop's bank" },
          { short: 'Network', name: 'The card network' },
          { short: "Card's bank", name: "The card's bank" },
        ],
        steps: [
          { from: 0, to: 1, msg: 'tap', title: 'The card meets the terminal', note: 'For less than a second the chip and the terminal talk to each other. The terminal learns the card number, and the chip produces a one-time code that only the real card could make.' },
          { from: 1, to: 2, msg: 'May I charge 250?', title: 'The shop asks its own bank', note: 'The terminal builds a request: the card number, the amount, who the shop is, and the chip\'s one-time code. It sends this to the bank that the shop has an account with.' },
          { from: 2, to: 3, msg: 'May I charge 250?', title: 'The shop\'s bank passes it on', note: 'The shop\'s bank has no direct line to every other bank in the world. It hands the request to the card network, the company whose logo is on the card.' },
          { from: 3, to: 4, msg: 'May I charge 250?', title: 'The network finds the right bank', note: 'The first digits of a card number say which bank gave out the card. The network reads them and delivers the request to that bank.' },
          { from: 4, to: 4, msg: 'checking...', title: 'The card\'s bank decides', note: 'Is the one-time code genuine? Is the card blocked? Is there enough money or credit? Does this look like fraud? If all is well, the bank sets 250 aside so it cannot be spent twice.' },
          { from: 4, to: 3, msg: 'Approved', title: 'The answer starts back', note: 'The bank replies "approved" along with an approval code. A "declined" reply travels the same way.' },
          { from: 3, to: 2, msg: 'Approved', title: 'Back through the network', note: 'The network passes the reply to the shop\'s bank.' },
          { from: 2, to: 1, msg: 'Approved', title: 'The terminal shows the result', note: 'The shop\'s bank tells the terminal, which shows "Approved" and prints a receipt. The whole round trip usually takes one or two seconds.' },
        ],
      },
      'pay1-settle': {
        parties: [
          { short: 'Card', name: 'The cardholder' },
          { short: 'Shop', name: 'The shop' },
          { short: "Shop's bank", name: "The shop's bank" },
          { short: 'Network', name: 'The card network' },
          { short: "Card's bank", name: "The card's bank" },
        ],
        steps: [
          { from: 1, to: 2, msg: "today's sales", title: 'End of the day: the shop sends its list', note: 'The terminal sends the day\'s approved payments to the shop\'s bank in one batch.' },
          { from: 2, to: 3, msg: "today's sales", title: 'Clearing, part one', note: 'The shop\'s bank passes the details of every payment to the network.' },
          { from: 3, to: 4, msg: 'you owe 250', title: 'Clearing, part two', note: 'The network sorts millions of payments by bank and tells each card\'s bank exactly what it owes, and for which cards.' },
          { from: 4, to: 2, msg: 'money', title: 'Settlement: the money moves', note: 'The card\'s bank pays, and the money reaches the shop\'s bank through the network. Banks settle the totals for the day, not one payment at a time.' },
          { from: 2, to: 1, msg: 'money, less a fee', title: 'The shop is paid', note: 'The shop\'s bank puts the money in the shop\'s account, usually a day or so after the sale, keeping a small percentage as a fee. That fee is shared between the banks and the network.' },
          { from: 4, to: 0, msg: 'statement', title: 'The cardholder sees it', note: 'The payment appears on the cardholder\'s statement. On a debit card the money leaves the account. On a credit card it is added to the bill.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>You tap a card for 250 rupees and two seconds later the terminal says Approved. In those two seconds a question travelled to a bank that may be in another city and an answer came back. The shop and that bank have never dealt with each other. This note follows that question.</p>

<h3>Who is involved</h3>
<div class="tablewrap"><table class="plain">
<tr><th>In plain words</th><th>The term people use</th><th>What they do</th></tr>
<tr><td>You</td><td>Cardholder</td><td>Own the card</td></tr>
<tr><td>The shop</td><td>Merchant</td><td>Wants to be paid</td></tr>
<tr><td>The shop's bank</td><td>Acquirer</td><td>Gives the shop its card terminal. Collects the shop's card payments from the other banks and pays them into the shop's account.</td></tr>
<tr><td>The card network</td><td>Scheme</td><td>Connects all the banks and sets the rules. Its logo is on the card.</td></tr>
<tr><td>The card's bank</td><td>Issuer</td><td>Gave you the card and holds your money or your credit</td></tr>
</table></div>
<p>Real names for each of these, and how a card number points to its bank, are in <a href="#pay-who-is-who">payments note 2</a>.</p>

<h3>Part 1: asking permission</h3>
<p>This is called <b>authorisation</b>. Press Next step and watch the question travel out and the answer travel back.</p>
<div data-widget="flow" data-ref="pay1-auth"></div>
<p>Notice what did <b>not</b> happen: no money moved. The card's bank only promised that the 250 is good and set it aside. The shop hands over the goods on the strength of that promise.</p>
<p>Two things here are bigger than they look, and each gets its own note. The request in steps 2 to 4 is a message with a fixed layout: what is in it, and in what format, is payments note 3. Step 1, the tap, hides a whole conversation between the chip and the terminal, made of small commands and replies: that is note 4. How the one-time code is made and checked is note 5.</p>

<h3>Part 2: moving the money</h3>
<p>The money moves later, in two stages. <b>Clearing</b> is the banks agreeing on who owes what. <b>Settlement</b> is the money moving.</p>
<div data-widget="flow" data-ref="pay1-settle"></div>

<h3>Why it is built this way</h3>
<ul>
<li><b>Speed.</b> Asking permission must take a second or two, because someone is standing at the counter. Moving money between banks is slower, so it is done afterwards in bulk.</li>
<li><b>Reach.</b> There are thousands of banks. Each one connects once, to the network, and can then deal with all the others.</li>
<li><b>Trust.</b> The shop never needs to trust you or your bank. It trusts the approval, and the network's rules say who carries the loss if something goes wrong.</li>
</ul>

<h3>Words to keep</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Word</th><th>Meaning</th></tr>
<tr><td>Authorisation</td><td>Asking the card's bank for a yes or no, in real time</td></tr>
<tr><td>Clearing</td><td>Exchanging the details of the day's payments so everyone agrees who owes what</td></tr>
<tr><td>Settlement</td><td>The money actually moving between banks</td></tr>
<tr><td>Acquirer, issuer</td><td>The shop's bank, the card's bank</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>The terminal says Approved. Has the shop been paid?</summary><p>No. The card's bank has promised the money and set it aside. The shop is paid after clearing and settlement, usually a day or so later.</p></details>
<details><summary>How does the network know which bank to send the request to?</summary><p>From the first digits of the card number, which identify the bank that gave out the card. Those digits are called the BIN, and payments note 2 looks at them closely.</p></details>
<details><summary>Why does the shop's bank not ask the card's bank directly?</summary><p>It would need a connection and an agreement with every bank in the world. The network gives each bank one connection that reaches all the others.</p></details>
<details><summary>A payment is approved at 6 pm and the shop's list is sent at 11 pm. Which stage is the 11 pm one?</summary><p>The start of clearing. Authorisation happened at 6 pm.</p></details>`,
  },

  {
    id: 'pay-who-is-who',
    kind: 'payments', order: 2,
    date: '2026-10-12',
    title: 'Who is who, with real names',
    from: 'Payments note 2',
    widgets: {
      'pay2-route': {
        parties: [
          { short: "Shop's bank", name: "The shop's bank" },
          { short: 'Visa', name: 'Visa' },
          { short: 'Master card', name: 'Mastercard' },
          { short: 'RuPay', name: 'RuPay' },
          { short: "Card's bank", name: "The card's bank" },
        ],
        steps: [
          { from: 0, to: 0, msg: '4111 11..', title: 'First customer: the card starts with 4', note: 'The request has reached the shop\'s bank. It reads the first digits of the card number. A number starting with 4 is a Visa card.' },
          { from: 0, to: 1, msg: 'May I charge 250?', title: 'Out through Visa', note: 'The shop\'s bank has a connection to each network it works with. It sends this request down the Visa one.' },
          { from: 1, to: 4, msg: 'May I charge 250?', title: 'Visa finds the bank', note: 'Visa keeps a table of which bank owns which starting digits. It looks up this card\'s first digits and delivers the request to the bank that gave out the card.' },
          { from: 0, to: 0, msg: '6078 26..', title: 'Next customer: the card starts with 60', note: 'Same shop, same terminal, same shop\'s bank. This number starts with 60, which is a RuPay range.' },
          { from: 0, to: 3, msg: 'May I charge 90?', title: 'Out through RuPay', note: 'So this request leaves by a different door.' },
          { from: 3, to: 4, msg: 'May I charge 90?', title: 'RuPay finds the bank', note: 'RuPay looks in its own table and delivers to the bank behind this card. That is usually a different bank from the first customer\'s. Mastercard is connected too. It carried nothing here because neither card was a Mastercard.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>Note 1 used plain labels: the shop's bank, the network, the card's bank. This note puts real names on them, and shows how a string of digits on a card is enough to steer a request to the right bank out of thousands.</p>

<h3>Real names in India</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Role</th><th>The term</th><th>Examples</th></tr>
<tr><td>The shop's bank</td><td>Acquirer</td><td>HDFC Bank, Axis Bank, ICICI Bank, State Bank of India</td></tr>
<tr><td>The card network</td><td>Scheme</td><td>Visa, Mastercard, RuPay, American Express</td></tr>
<tr><td>The card's bank</td><td>Issuer</td><td>Any bank that gave out the card: State Bank of India, HDFC Bank, ICICI Bank, Kotak Mahindra Bank and many more</td></tr>
</table></div>
<p>Notice that the same names appear in two rows. "Shop's bank" and "card's bank" are <b>roles in one payment</b>, not kinds of bank. If your card is from HDFC Bank and the shop banks with Axis Bank, then HDFC Bank is the card's bank and Axis Bank is the shop's bank. In the next shop it can be the other way round.</p>
<p>Three more things you will meet:</p>
<ul>
<li><b>Payment companies.</b> A shop often gets its terminal or its online checkout from a payment company such as Pine Labs or Razorpay. Behind that company there is still a bank doing the acquirer's job.</li>
<li><b>A network that is also a bank.</b> American Express runs its network and also gives out many of its own cards, so it can be the network and the card's bank in the same payment.</li>
<li><b>RuPay</b> is India's own network. It is run by the National Payments Corporation of India (NPCI).</li>
</ul>

<h3>The card number is an address</h3>
<p>A card number is not a random string. Different parts of it mean different things. <b>Try it.</b> Press the test-number buttons, then change the first digits by hand and watch the network change.</p>
<div data-widget="cardnum" data-key="pay2-card"></div>
<div class="tablewrap"><table class="plain">
<tr><th>Part</th><th>What it tells you</th></tr>
<tr><td>The first digit or two</td><td>Which network. For example 4 is Visa, and 51 to 55 is Mastercard.</td></tr>
<tr><td>The first 6 digits, or 8 on newer ranges</td><td>Which bank gave out the card. This part is called the <b>BIN</b>.</td></tr>
<tr><td>The digits after that</td><td>Which account at that bank</td></tr>
<tr><td>The last digit</td><td>A check digit, worked out from all the others</td></tr>
</table></div>
<p><b>BIN</b> stands for Bank Identification Number. You will also see it called an IIN, Issuer Identification Number, which is the same thing. For decades it was 6 digits. The world was running short of 6-digit combinations, so the international standard was changed to allow 8 digits. From April 2022 Visa and Mastercard required the systems that handle payments to cope with 8-digit BINs. Both lengths are in use today, and the card number itself stayed the same length.</p>

<h3>How the request finds its way</h3>
<p>The shop's bank is connected to several networks. For each payment it reads the first digits and picks the network. The network then uses the BIN to find the card's bank.</p>
<div data-widget="flow" data-ref="pay2-route"></div>
<p>So there are two lookups, done by two different parties: the shop's bank chooses the <b>network</b>, and the network chooses the <b>bank</b>. Neither needs to know anything about the customer. The digits carry it all.</p>

<h3>The last digit: a small algorithm</h3>
<p>The last digit of a card number is not free. It is calculated from the other digits by a method called the <b>Luhn check</b>, invented by Hans Peter Luhn at IBM and described in a patent granted in 1960. It catches typing mistakes. It is not a security measure. The diagram above works it out live. The method:</p>
<ol>
<li>Start from the right-hand end and move left.</li>
<li>Double every second digit. If doubling gives a number above 9, subtract 9.</li>
<li>Add everything up.</li>
<li>If the total ends in 0, the number passes.</li>
</ol>
<p><b>Try it.</b> In the diagram above, take the Visa test number and change any one digit. The check fails. Change it back and it passes.</p>
<p>This check is <b>not security</b>. Anyone can calculate it. Its job is to catch slips: one wrong digit, or two neighbouring digits swapped, when a number is typed by hand. A terminal or a website can reject the number at once, before any request is sent. You will write this algorithm yourself in Java later. It needs a loop, an if and the % sign, all of which you already have.</p>

<h3>Words to keep</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Word</th><th>Meaning</th></tr>
<tr><td>BIN, or IIN</td><td>The first 6 or 8 digits of a card number. They identify the bank that gave out the card.</td></tr>
<tr><td>Routing</td><td>Deciding where to send a request next</td></tr>
<tr><td>Check digit</td><td>A digit worked out from the others, used to catch typing mistakes</td></tr>
<tr><td>NPCI</td><td>The organisation that runs RuPay</td></tr>
</table></div>

<h3>Where your other questions are answered</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Your question</th><th>Where</th></tr>
<tr><td>What data travels in the request, and in what format?</td><td>Payments note 3</td></tr>
<tr><td>What do the chip and the terminal say to each other during the tap?</td><td>Payments note 4</td></tr>
<tr><td>Which algorithms and keys prove the card is genuine?</td><td>Payments note 5</td></tr>
<tr><td>How is a PIN kept secret on its way to the bank?</td><td>Payments note 6</td></tr>
<tr><td>What is in the end-of-day files, and who pays whom?</td><td>Payments note 7</td></tr>
</table></div>
<p>Those notes are not written yet. They come one at a time as you finish the one before.</p>

<h3>Check yourself</h3>
<details><summary>Your card is from Kotak Mahindra Bank. You pay at a shop that banks with ICICI Bank. Who is the issuer and who is the acquirer?</summary><p>Kotak Mahindra Bank is the issuer, the card's bank. ICICI Bank is the acquirer, the shop's bank.</p></details>
<details><summary>Who decides which network a request goes through, and what do they look at?</summary><p>The shop's bank. It looks at the first digits of the card number.</p></details>
<details><summary>What is the BIN, and how long is it?</summary><p>The first digits of the card number, which identify the bank that gave out the card. 6 digits on older ranges, 8 on newer ones.</p></details>
<details><summary>A card number passes the Luhn check. Does that prove the card is real?</summary><p>No. It only shows the digits are consistent with each other. Anyone can make up a number that passes. Proving the card is real needs the chip's one-time code, which is note 5.</p></details>`,
  },

  // ======================= questions he asked =======================
  {
    id: 'bits-bytes-everything',
    date: '2026-10-12',
    title: 'Bits, bytes, and how numbers, text, decimals and pictures are stored',
    from: 'Week 1, Mission 2: Give them a life bar',
    asked: 'So these are bits and bytes? How exactly is an int or a number stored in this memory? How are strings, decimals, images and other stuff stored in memory?',
    html: `
<h3>1. Bit and byte</h3>
<p>Yes. One switch is a <b>bit</b>. Eight switches side by side are a <b>byte</b>. A byte has 256 possible patterns, so it can hold a number from 0 to 255.</p>
<p><b>Try it.</b> These 8 switches start as the pattern for 65. Flip a few and watch all four readings change together.</p>
<div data-widget="bits" data-key="note2-byte" data-bits="8" data-signed="false" data-meanings="true" data-start="65"></div>
<p>This is the most important idea on the page: <b>the switches have no meaning of their own.</b> The same pattern is 65, or the letter A, or a shade of grey, depending on how the program reads it. A type such as <code>int</code> or <code>String</code> is an instruction to Java: read these switches this way.</p>
<p>Hex is only a shorter way to write a byte: two characters in place of eight. The card data you see at work is written in hex, and every pair of characters there is one byte like this one.</p>

<h3>2. Where an int lives</h3>
<p>Memory is one very long row of cells. Each cell is one byte, and each cell has a number called its <b>address</b>, like house numbers on a street.</p>
<p>When your game says <code>int heroHp = 100;</code> Java reserves <b>4 cells in a row</b> (4 bytes, 32 switches) and writes the pattern for 100 across them. The name <code>heroHp</code> is Java's label for where those 4 cells are.</p>
<p><b>Try it.</b> Type 100, then 255, then 256, and watch the number spill into the next cell. Then try 2147483647 and -1.</p>
<div data-widget="intmem" data-key="note2-int" data-start="100"></div>
<p>The cell numbers 1000 to 1003 are made up for the picture. The real ones are chosen by Java while the program runs.</p>

<h3>3. Text</h3>
<p>Memory can only hold numbers, so every character has an agreed number. A is 65, a is 97, a space is 32. A <code>String</code> is those numbers stored one after another. Java gives each character 16 switches so that letters from every language fit.</p>
<p><b>Try it.</b> Type your own name. Then type the digit 7. Then a letter from Hindi or Kannada.</p>
<div data-widget="text" data-key="note2-text" data-start="Hero"></div>
<p>Look at the digit 7: as a character it is stored as 55, not 7. The text "7" and the number 7 are different things in memory. Mixing them up is a common real bug.</p>

<h3>4. Decimals</h3>
<p>For decimals the switches are worth halves, quarters, eighths and so on.</p>
<p><b>Try it.</b> Make 0.75. Easy. Now try to make exactly 0.1.</p>
<div data-widget="bits" data-key="note2-frac" data-bits="8" data-mode="fraction" data-target="0.1"></div>
<p>You cannot. No mix of halves, quarters and eighths adds up to exactly one tenth, in the same way that 1/3 cannot be written exactly with decimal digits (0.3333...). Java's <code>double</code> has 64 switches, 52 of them for the fraction, and it still cannot. It stores the nearest value it can reach, which is slightly more than 0.1.</p>
<p><b>See it in Java.</b> Open <b>play/Scratch.java</b> in VS Code. It is an empty file for experiments, and nothing in it is checked. Inside <code>main</code>, type <code>System.out.println(0.1 + 0.2);</code> then save and press Run. Predict the output first.</p>
<div data-widget="run" data-file="Scratch.java"></div>
<p>This is why systems that handle money do not store amounts as decimals. They store a whole number of the smallest unit: 250 rupees is stored as 25000 paise. Card payment messages carry amounts this way too.</p>

<h3>5. Pictures</h3>
<p>A picture is a grid of tiny dots called <b>pixels</b>. Each pixel is three numbers: how much red, how much green, how much blue, each from 0 to 255. That is one byte per colour, so <b>3 bytes per pixel</b>.</p>
<p><b>Try it.</b> Mix a colour. Make white, then black, then yellow.</p>
<div data-widget="rgb" data-key="note2-rgb"></div>
<p>A phone photo has about 12 million pixels, so it needs about 36 million bytes before any shrinking. Formats such as JPEG store the same picture in far fewer bytes by describing it more cleverly.</p>

<h3>6. Everything else</h3>
<ul>
<li><b>Sound:</b> the loudness of the sound wave, measured about 44,000 times every second, each measurement a number.</li>
<li><b>Video:</b> many pictures in a row, plus sound.</li>
<li><b>Your program:</b> the instructions are numbers too. <code>Game.java</code> is text, and Java turns it into bytes the machine can carry out.</li>
</ul>

<h3>What to remember</h3>
<ul>
<li>A bit is one switch. A byte is 8 bits. An <code>int</code> is 4 bytes.</li>
<li>Memory is a long row of numbered byte cells.</li>
<li>Everything is stored as numbers. The type says how to read them.</li>
<li>Decimals are stored approximately. Never use them for money.</li>
</ul>`,
  },
  {
    id: 'int-32-switches',
    date: '2026-10-11',
    title: 'What are the 32 switches inside an int?',
    from: 'Week 1, Mission 2: Give them a life bar',
    asked: 'What do you mean 32 tiny on/off switches? Can you help me visualize it with a diagram?',
    html: `
<h3>1. Memory is made of switches</h3>
<p>A computer's memory is billions of tiny parts, and each one can only be <b>off</b> or <b>on</b>. We write off as 0 and on as 1. One of these switches is called a <b>bit</b>. There is nothing else in there: every number, letter, photo and game is stored as a pattern of switches.</p>

<h3>2. Counting with switches</h3>
<p>Each switch is given a worth, and each worth is double the one to its right: 1, 2, 4, 8. The number stored is the worth of every switch that is on, added up.</p>
<p><b>Try it.</b> Click the switches to make 5. Then make 15. Then press <b>+1</b>.</p>
<div data-widget="bits" data-key="note1-4" data-bits="4" data-signed="false"></div>
<p>With 4 switches the biggest number is 8 + 4 + 2 + 1 = 15. Add one more and every switch flips to off, which is 0. There was no pattern left for 16, so it rolled over, like a car's distance counter going from 9999 back to 0000.</p>

<h3>3. How negative numbers fit in</h3>
<p>Java needs negative numbers too, so it makes one change: the <b>leftmost switch counts as negative</b>. Here are 8 switches. The leftmost is worth -128 and the rest are worth 64, 32, 16, 8, 4, 2, 1.</p>
<p><b>Try it.</b> Press <b>Fill to max</b>. That is every positive switch on: 127. Now press <b>+1</b> and watch which switches change.</p>
<div data-widget="bits" data-key="note1-8" data-bits="8" data-signed="true"></div>
<p>Adding 1 turned all seven positive switches off and carried into the leftmost one, which is the negative one. So 127 + 1 became -128. Nothing went wrong inside the machine. It did ordinary adding, and the answer landed on the switch that means "negative".</p>

<h3>4. An int is the same thing with 32 switches</h3>
<p>The leftmost switch is worth -2,147,483,648. The other 31 add up to 2,147,483,647, which is the biggest number an <code>int</code> can hold.</p>
<p><b>Try it.</b> Press <b>Fill to max</b>, then <b>+1</b>. This is exactly what your game did when you printed <code>heroHp + 1</code>. Then press <b>+1</b> again to see what <code>heroHp + 2</code> would give.</p>
<div data-widget="bits" data-key="note1-32" data-bits="32" data-signed="true"></div>

<h3>What to remember</h3>
<ul>
<li>An <code>int</code> is 32 switches. It holds whole numbers from -2,147,483,648 to 2,147,483,647.</li>
<li>Going past the top does not give an error. It rolls over to the bottom. This is called <b>overflow</b>.</li>
<li>When a number might get bigger than about 2 billion, use <code>long</code>, which is 64 switches.</li>
</ul>`,
  },
];
