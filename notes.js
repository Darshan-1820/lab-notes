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

<h3>Every piece of the two lines</h3>
<p>Here is what each word does. Some of it is only the outline for now; those parts are marked, and they are taught properly in the lesson named on the mark.</p>
<pre>Random dice = new Random();
int damage = dice.nextInt(21) + 10;</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Piece</th><th>What it means</th></tr>
<tr><td><code>Random</code> (first word)</td><td>The <b>type</b> of the box, like <code>int</code> in <code>int heroHp</code>. An <code>int</code> box holds a whole number; a <code>Random</code> box holds a dice machine. <code>Random</code> is a <b>class</b>: a blueprint for a kind of thing, written by the people who made Java and kept in <code>java.util</code>, which is why the file needs the import line. <span class="later">Coming in weeks 4 to 5: what a class is, by writing your own (Hero and Monster)</span></td></tr>
<tr><td><code>dice</code></td><td>The name of the box. Your choice: <code>roller</code> or <code>d</code> would work the same.</td></tr>
<tr><td><code>new Random()</code></td><td><code>new</code> builds one real dice machine from the blueprint, in memory. A thing built from a class is called an <b>object</b>. The empty brackets mean "no settings"; <code>new Random(7)</code> passes one setting, the seed (see below). <span class="later">Coming in weeks 4 to 5: what new does in memory, and constructors</span></td></tr>
<tr><td><code>dice.</code></td><td>The dot means "ask this object to do something". You are talking to the machine in the box called <code>dice</code>, the same way <code>System.out.println</code> asks <code>System.out</code> to print.</td></tr>
<tr><td><code>nextInt</code></td><td>The name of the action you ask for. An action that belongs to an object is a <b>method</b>. The name says what it does: give me the <b>next int</b> (whole number) from your sequence of random numbers. <span class="later">Coming in lesson 11: writing your own methods</span></td></tr>
<tr><td><code>(21)</code></td><td>The value you hand to the method, called an <b>argument</b>. For <code>nextInt</code> it means "how many different numbers may come out". With 21 you get one of 0, 1, 2 ... 20. It starts at 0 and never reaches 21.</td></tr>
<tr><td><code>+ 10</code></td><td>Ordinary adding. It slides 0 to 20 up to 10 to 30.</td></tr>
<tr><td>the whole <code>dice.nextInt(21)</code></td><td>Java runs the method and puts its answer where the call was, the way <code>3 + 4</code> is replaced by 7. If the machine produced 5, the line becomes <code>int damage = 5 + 10;</code>. That answer is called the <b>return value</b>. <span class="later">Coming in lesson 11 and week 2: methods that return values</span></td></tr>
</table></div>
<p><b>Why 21?</b> The game wants damage from 10 to 30. Count them: 10, 11, ... 30 is 30 - 10 + 1 = <b>21</b> numbers. <code>nextInt</code> only knows how to give "one of n numbers, starting at 0", so you ask for 21 of them and then add 10.</p>
<p><b>Why <code>nextInt</code> and not something else?</b> A Random object has several methods, one per kind of answer:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Call</th><th>Gives</th></tr>
<tr><td><code>dice.nextInt(21)</code></td><td>a whole number from 0 to 20</td></tr>
<tr><td><code>dice.nextInt(10, 31)</code></td><td>a whole number from 10 to 30 directly (the second number is still left out). This form exists from Java 17, which is what you have. The lesson uses the other one because almost all Java code you will read does.</td></tr>
<tr><td><code>dice.nextBoolean()</code></td><td><code>true</code> or <code>false</code>, like a coin</td></tr>
<tr><td><code>dice.nextDouble()</code></td><td>a decimal from 0.0 up to, but not including, 1.0</td></tr>
</table></div>
<p>Damage is a whole number, so <code>nextInt</code> is the one that fits.</p>
<p><b>What "random" means here.</b> Random means you cannot know the result before it happens, like a real dice. A computer cannot do that: it only follows instructions. So the dice machine keeps one big secret number inside it (the seed). Every call to <code>nextInt</code> pushes that number through a fixed scrambling formula, keeps the new number for next time, and gives you a piece of it, cut down with the remainder <code>%</code> to the size you asked for. The section "Inside Random" below shows it step by step, with Java's real formula.</p>

<h3>What is java.util.Random?</h3>
<p>Java comes with thousands of classes already written: tools for text, dates, files, networks, lists, random numbers. Together they are called the <b>Java standard library</b>, and they were installed on your computer with Java itself. Nobody writes their own dice machine; you use the one in the library.</p>
<p>Thousands of tools need some order, so they are sorted into <b>packages</b>. A package is like a folder with a name.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Part of the name</th><th>Means</th></tr>
<tr><td><code>java</code></td><td>The top folder: part of Java itself, not something someone else made</td></tr>
<tr><td><code>java.util</code></td><td>The "utilities" folder: small general tools. <code>Random</code> and <code>Scanner</code> live here, and later <code>ArrayList</code> and <code>HashMap</code>.</td></tr>
<tr><td><code>java.util.Random</code></td><td>The full name of the class: the <code>Random</code> in the <code>java.util</code> folder</td></tr>
</table></div>
<p>It really is a folder. Inside your Java installation there is a file <code>lib/src.zip</code>, and in it <code>java.base/java/util/Random.java</code>: the real source code, 947 lines, written by Java's makers. The next section shows the important part of it.</p>

<h3>What the import line does</h3>
<pre>import java.util.Random;</pre>
<p>It is a <b>name shortcut</b>, nothing more. It tells Java: "in this file, when I write <code>Random</code>, I mean <code>java.util.Random</code>." Without it, you could still use the class by writing its full name every time. This works, with no import line at all:</p>
<pre>java.util.Random dice = new java.util.Random();</pre>
<p>With neither the import nor the full name, Java does not know which <code>Random</code> you mean, and stops with:</p>
<pre>error: cannot find symbol
  symbol:   class Random</pre>
<p>(Both were run in Java before going into this note.) Things that import does <b>not</b> do: it does not copy any code into your file, and it does not make your program bigger or slower. It only saves typing.</p>
<p><b>Why does <code>System</code> not need an import?</b> <code>System</code> and <code>String</code> live in the package <code>java.lang</code> ("language"), and Java imports that one into every file automatically, because almost every program needs it. Everything else, you import.</p>
<p><b>Where to look up what a class can do.</b> Every class in the library has an official page listing all its methods: for this one, search "Java 17 Random" and open the docs.oracle.com page. It lists <code>nextInt</code>, <code>nextBoolean</code>, <code>nextDouble</code> and the rest, each with a line on what it returns. Reading these pages is a skill every Java developer uses daily; you will start doing it in week 2. <span class="later">Coming in weeks 4 to 5: making your own packages, when your programs grow past one file</span></p>

<h3>Inside Random: what nextInt really does</h3>
<p>This is the real formula from <code>Random.java</code>, written in plain steps. The machine keeps one secret number inside it.</p>
<ol>
<li><b>When you build it</b> (<code>new Random(7)</code>), the secret number starts from your seed, mixed once with a fixed number. With plain <code>new Random()</code>, Java makes up a seed from the clock.</li>
<li><b>Every roll</b>, the secret number is multiplied by 25,214,903,917, then 11 is added, and only the last 48 switches of the answer are kept. That is the new secret number.</li>
<li>The top 31 switches of it are read as a whole number, somewhere from 0 to about 2.1 billion.</li>
<li><code>nextInt(21)</code> cuts that down with the remainder: the number <code>% 21</code> is always 0 to 20. You know <code>%</code> from lesson 3.</li>
</ol>
<p><b>Try it.</b> This machine uses Java's exact formula. With seed 7, <code>nextInt(21) + 10</code> gives 20, then 15, then 28, the same as Java on any computer. Roll and follow each step. Then change the seed.</p>
<div data-widget="seedmachine" data-key="c8-seed" data-seed="7" data-n="21" data-k="10"></div>
<p>Two details you will see in the machine:</p>
<ul>
<li><b>Fairness.</b> 2.1 billion does not divide evenly by 21, so the last few numbers at the very top would give the small results one extra chance. Java throws those rare numbers away and takes the next one. It almost never happens, but it keeps every value equally likely.</li>
<li><b>Powers of 2.</b> For 2, 4, 8, 16 and so on, Java uses a faster trick that takes the top switches instead of the remainder. Try 16.</li>
</ul>
<p>The real code is written with symbols you have not met yet (<code>long</code>, <code>&amp;</code>, <code>&gt;&gt;&gt;</code>, <code>private static final</code>), so it is described here in steps rather than shown. <span class="later">Coming in week 2: long</span> <span class="later">Coming in week 3: working with switches (&amp;, &gt;&gt;, &gt;&gt;&gt;) when you decode card bytes</span> <span class="later">Coming in weeks 4 to 5: static and final</span></p>

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

<h3>Every piece of the Scanner line</h3>
<pre>Scanner keys = new Scanner(System.in);
int move = keys.nextInt();</pre>
<div class="tablewrap"><table class="plain">
<tr><th>Piece</th><th>What it means</th></tr>
<tr><td><code>Scanner</code></td><td>The type of the box: a reader that turns typed characters into values. A class from <code>java.util</code>, like <code>Random</code>. <span class="later">Coming in weeks 4 to 5: classes</span></td></tr>
<tr><td><code>keys</code></td><td>The name of the box. Your choice.</td></tr>
<tr><td><code>new Scanner(System.in)</code></td><td>Build one reader. The argument says what to read from: <code>System.in</code> is the keyboard (the program's input), the partner of <code>System.out</code>, the screen. <span class="later">Coming in weeks 4 to 5: objects and constructors</span></td></tr>
<tr><td><code>keys.nextInt()</code></td><td>Ask the reader for the next whole number that was typed. Empty brackets: it needs no extra information. It waits until something is typed, and its return value is the number. Same idea as <code>dice.nextInt(21)</code>: an object, a dot, a method. <span class="later">Coming in lesson 11: methods</span></td></tr>
</table></div>

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
<p>Notes 3 and 4 are written (you asked for more payments on 15 October). Notes 5 to 7 come one at a time after those.</p>

<h3>Check yourself</h3>
<details><summary>Your card is from Kotak Mahindra Bank. You pay at a shop that banks with ICICI Bank. Who is the issuer and who is the acquirer?</summary><p>Kotak Mahindra Bank is the issuer, the card's bank. ICICI Bank is the acquirer, the shop's bank.</p></details>
<details><summary>Who decides which network a request goes through, and what do they look at?</summary><p>The shop's bank. It looks at the first digits of the card number.</p></details>
<details><summary>What is the BIN, and how long is it?</summary><p>The first digits of the card number, which identify the bank that gave out the card. 6 digits on older ranges, 8 on newer ones.</p></details>
<details><summary>A card number passes the Luhn check. Does that prove the card is real?</summary><p>No. It only shows the digits are consistent with each other. Anyone can make up a number that passes. Proving the card is real needs the chip's one-time code, which is note 5.</p></details>`,
  },

  {
    id: 'pay-the-message',
    kind: 'payments', order: 3,
    date: '2026-10-15',
    title: 'What the request carries, and in what format',
    from: 'Payments note 3',
    html: `
<h3>The idea</h3>
<p>Notes 1 and 2 drew the request as a speech bubble: "May I charge 250?". This note opens the bubble. The real thing is a short message in a format called <b>ISO 8583</b>, and almost every card payment in the world, at a shop or an ATM, travels as one of these between the shop's bank, the network and the card's bank.</p>
<p>You already know everything you need to read one: digits, bytes, hex, and switches that mean "yes" or "no". This note is where those meet money.</p>

<h3>Why such an odd format</h3>
<p>ISO 8583 was designed when networks were slow and every byte cost money. The version most networks still build on is from <b>1987</b>. So the message has no labels and no spaces. Where a modern system would send <code>"amount": 250.00</code>, ISO 8583 sends 12 digits at a known position and both sides agree what they mean. Short, fast, and unreadable without the rule book. Each network (Visa, Mastercard, RuPay) publishes its own rule book on top of the standard, so their messages differ in details. This note shows the shape they share.</p>
<p>A message has three parts, always in this order:</p>
<ol>
<li><b>Message type</b>: 4 digits that say what kind of message this is.</li>
<li><b>Bitmap</b>: 64 switches that say which fields are present.</li>
<li><b>The fields</b>: only the ones the bitmap switched on, in number order.</li>
</ol>

<h3>Open a real-shaped message</h3>
<p><b>Try it.</b> This is a ₹250 contactless payment, the one from note 1. Tap the lit switches in the bitmap, or tap the rows, and read what each field carries. Then switch to the answer.</p>
<div data-widget="iso8583" data-key="pay3-msg"></div>
<p>The card number, terminal and shop are made up. The card number is a well-known test number that passes the Luhn check.</p>

<h3>The bitmap is just switches</h3>
<p>This is the part that uses your bits and bytes. There are 128 possible fields, but a message carries only the 10 to 20 it needs. Instead of labelling each one, the message starts with 64 switches: switch 2 on means "field 2 is here", switch 3 off means "field 3 is not". Eight switches make a byte, so the 64 switches are 8 bytes, and written in hex that is 16 characters.</p>
<p>Look at the first row of the bitmap in the diagram: switches 2, 3, 4 and 7 are on. As a pattern that is <code>0111 0010</code>. The left half is 7, the right half is 2, so the byte is hex <b>72</b>. If you can read that row, you can read any bitmap.</p>
<p>Switch 1 is special. When it is on, a <b>second</b> bitmap follows for fields 65 to 128. Our message needs none of those, so switch 1 is off.</p>

<h3>Lengths: fixed or told</h3>
<p>Because there are no labels, the reader must know where each field ends. Two ways:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Kind</th><th>How the reader knows the length</th><th>Example</th></tr>
<tr><td>Fixed</td><td>The rule book says so. Field 4 is always 12 digits, so a small amount is padded with zeros.</td><td><code>000000025000</code></td></tr>
<tr><td>LLVAR</td><td>The first two digits give the length, then the value follows</td><td>Field 2: <code>16</code> then <code>4111111111111111</code></td></tr>
<tr><td>LLLVAR</td><td>The same with three digits of length, for longer fields</td><td>Field 55, the chip data</td></tr>
</table></div>
<p>The format codes you saw in the diagram: <b>n</b> digits only, <b>an</b> letters and digits, <b>ans</b> letters, digits and special characters, <b>b</b> raw bytes. "n12" means exactly 12 digits; "n..19" means up to 19.</p>

<h3>The amount has no decimal point</h3>
<p>Field 4 is the answer to your question about decimals. ₹250.00 travels as <code>000000025000</code>: twenty-five thousand <b>paise</b>, a whole number. Field 49, the currency, says which smallest unit the number is counted in. 356 is the rupee, which has 2 digits after the point, so the last two digits are paise. The Japanese yen has none, so a yen amount has no "paise" digits at all. Nothing in the message is ever a <code>double</code>.</p>

<h3>The answer</h3>
<p>The card's bank answers with message type <b>0110</b>. It copies the fields that identify the question (most importantly the trace number in field 11, so the shop's bank can match question to answer) and adds two of its own: field 38, the approval code, and field 39, the <b>response code</b>.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Field 39</th><th>Means</th></tr>
<tr><td><code>00</code></td><td>Approved</td></tr>
<tr><td><code>05</code></td><td>Do not honour: a "no" without a reason</td></tr>
<tr><td><code>14</code></td><td>No such card number</td></tr>
<tr><td><code>51</code></td><td>Not enough money</td></tr>
<tr><td><code>54</code></td><td>The card has expired</td></tr>
<tr><td><code>55</code></td><td>Wrong PIN</td></tr>
<tr><td><code>91</code></td><td>The card's bank could not be reached</td></tr>
</table></div>
<p>When a terminal shows "Declined", it is one of these two-character codes, turned into words.</p>

<h3>Other message types you will meet</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Type</th><th>What it is</th></tr>
<tr><td>0100 / 0110</td><td>Authorisation: "may I?" and the answer. The money does not move yet.</td></tr>
<tr><td>0200 / 0210</td><td>A financial message: the money is meant to move. ATMs use these.</td></tr>
<tr><td>0400 / 0410</td><td>Reversal: "cancel that one". Sent when, for example, the answer never arrived and the terminal gave up.</td></tr>
<tr><td>0800 / 0810</td><td>Network check: "are you still there?", with no customer involved</td></tr>
</table></div>
<p>The moving of money at the end of the day happens in files, not in these messages. That is note 7.</p>

<h3>What is not in the message</h3>
<ul>
<li><b>The PIN in plain digits.</b> When a PIN is needed, it travels encrypted in a field of its own. Note 6.</li>
<li><b>The CVV from the back of the card.</b> A chip payment does not use it. It exists for typing card details into websites.</li>
<li><b>Your name.</b> The bank does not need it to decide, so a normal tap does not send it.</li>
</ul>
<p>Field 55 is the chip's part of the conversation, and its cryptogram is what makes the payment hard to fake. Where field 55 comes from is note 4. How the cryptogram is computed and checked is note 5.</p>

<h3>Where this is used in code</h3>
<p>Java has a well-known open-source library for exactly this, <b>jPOS</b>, which builds and reads ISO 8583 messages. It is on your roadmap as a possible open-source project. Later on, writing a small reader for the bitmap is a good exercise for your arrays and bytes lessons.</p>

<h3>Words to keep</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Word</th><th>Meaning</th></tr>
<tr><td>ISO 8583</td><td>The message format used between banks and networks for card payments</td></tr>
<tr><td>MTI</td><td>Message type indicator: the 4 digits at the front, such as 0100</td></tr>
<tr><td>Bitmap</td><td>64 switches saying which fields are present</td></tr>
<tr><td>Data element (DE)</td><td>A numbered field. "DE 4" is the amount.</td></tr>
<tr><td>STAN</td><td>Trace number, field 11: matches an answer to its question</td></tr>
<tr><td>RRN</td><td>Reference number, field 37: follows the payment through refunds and disputes</td></tr>
<tr><td>Response code</td><td>Field 39: 00 approved, anything else a refusal</td></tr>
<tr><td>Minor units</td><td>The smallest unit of a currency, such as paise. Amounts travel as whole numbers of these.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>A bitmap's first byte is hex 72. Which of fields 1 to 8 are present?</summary><p>72 is 0111 0010. Reading the switches left to right as fields 1 to 8: 2, 3, 4 and 7 are on. Field 1 is off, so there is no second bitmap.</p></details>
<details><summary>Field 4 says 000000150075 and field 49 says 356. How much is the payment?</summary><p>150075 paise, which is ₹1,500.75.</p></details>
<details><summary>The answer to a payment comes back with field 39 = 51. What happened?</summary><p>Refused: not enough money in the account (or over the credit limit).</p></details>
<details><summary>The shop's bank has sent thousands of questions and answers arrive in any order. How does it know which question an answer belongs to?</summary><p>By the trace number, field 11 (together with the terminal and the time). The answer copies it from the question.</p></details>
<details><summary>Why does field 2 have a length in front of it, but field 4 does not?</summary><p>Card numbers can have different lengths, so the reader has to be told. The amount is always exactly 12 digits, so its length is in the rule book.</p></details>`,
  },
  {
    id: 'pay-the-tap',
    kind: 'payments', order: 4,
    date: '2026-10-15',
    title: 'The tap: what the card and the terminal say to each other',
    from: 'Payments note 4',
    widgets: {
      'pay4-tap': {
        parties: [
          { short: 'Card', name: 'The card' },
          { short: 'Terminal', name: 'The terminal' },
          { short: "Shop's bank", name: "The shop's bank" },
        ],
        steps: [
          { from: 1, to: 1, msg: 'field on', title: 'The terminal makes a field', note: 'The terminal\'s antenna sends out a radio field at 13.56 MHz all the time, waiting. It reaches only a few centimetres.' },
          { from: 1, to: 0, msg: 'power', title: 'The card wakes up', note: 'The card has no battery. A loop of wire around the edge of the card picks up energy from the field, enough to run the chip for a moment. Bring the card close and the chip switches on.' },
          { from: 1, to: 0, msg: 'SELECT 2PAY.SYS.DDF01', title: '"Which payment apps do you have?"', note: 'The first command. The terminal asks for the list of payment apps by a name every contactless card knows.' },
          { from: 0, to: 1, msg: 'Visa A0000000031010', title: 'The card lists its apps', note: 'Each app has an ID called an AID. Most cards have one; some have two, for example a network\'s own app and a domestic one.' },
          { from: 1, to: 0, msg: 'SELECT A0000000031010', title: 'The terminal picks one', note: 'It chooses an app both sides support and selects it. The card answers with a list of what it needs to know before it can start, called the PDOL.' },
          { from: 1, to: 0, msg: 'GPO: 250.00, INR, random', title: 'The terminal answers the card\'s list', note: 'GET PROCESSING OPTIONS carries what the card asked for: the amount, the currency, today\'s date, and a random number made fresh for this tap.' },
          { from: 0, to: 1, msg: 'records + cryptogram', title: 'The card does its work', note: 'The card says which records the terminal should read. Many contactless cards also compute the cryptogram right here, to save time. On others, it comes after the records, with GENERATE AC.' },
          { from: 1, to: 0, msg: 'READ RECORD', title: 'The terminal reads the card data', note: 'Card number, expiry date, and certificates the terminal uses to check the card is genuine. Then the card can go: the whole conversation usually takes well under half a second, which is why you hear the beep so fast.' },
          { from: 1, to: 2, msg: '0100 + field 55', title: 'Off to the bank', note: 'The terminal builds the message from note 3. The card\'s answers become field 55. The cryptogram goes with it, so the card\'s bank can check it was made by the real chip.' },
        ],
      },
    },
    html: `
<h3>The idea</h3>
<p>Note 1 said "you tap, the terminal reads the chip". This note shows what that reading is. The chip is a tiny computer. The terminal sends it <b>commands</b>, the chip answers each one, and the two take turns until the terminal has what it needs for the message in note 3. The rules for this conversation are a standard called <b>EMV</b>, written by the card networks together.</p>

<h3>Where the power comes from</h3>
<p>A contactless card has no battery. Around its edge, inside the plastic, is a loop of wire, an antenna. The terminal sends out a radio field at 13.56 MHz. When the card comes within a few centimetres, the field makes a small current flow in the loop, and that powers the chip. Move the card away and the chip switches off mid-sentence. That is why the terminal asks you to hold the card still until it beeps.</p>
<p>The short range is on purpose: a card in your pocket a metre away cannot be read by mistake.</p>

<h3>The conversation, step by step</h3>
<p><b>Try it.</b> Press Next step and follow the bubble.</p>
<div data-widget="flow" data-ref="pay4-tap"></div>

<h3>A command is a few bytes</h3>
<p>Each command the terminal sends is a short row of bytes called an <b>APDU</b> (application protocol data unit). The first four bytes are always the same four parts, then comes data if the command needs any. <b>Try it.</b> Pick a command and tap its bytes.</p>
<div data-widget="apdu" data-key="pay4-apdu"></div>
<p>Look at the first command. Its data is the name <code>2PAY.SYS.DDF01</code> sent as text bytes, using the same numbers for letters you saw in the bits and bytes note: hex 50 is 80, the letter P. Everything in this conversation is bytes, written in hex.</p>

<h3>Answers come as tag, length, value</h3>
<p>The card's answers are not fixed positions like ISO 8583. They are a list of small packets, each made of:</p>
<ol>
<li>a <b>tag</b>: one or two bytes saying what this is, for example <code>9F02</code> for the amount;</li>
<li>a <b>length</b>: one byte saying how many bytes the value has;</li>
<li>the <b>value</b>.</li>
</ol>
<p>This is called <b>TLV</b>. You have seen it already: field 55 in note 3 is a TLV list, <code>9F02 06 000000025000</code> meaning "amount, 6 bytes, 250.00". The terminal copies the important packets from the card's answers into field 55, and that is how the chip's words reach the card's bank.</p>
<p>Why the tag decides how long it is: if the low five switches of the first byte are all on (hex <code>1F</code>), the tag continues into a second byte. <code>9F</code> is <code>1001 1111</code>, so <code>9F02</code> is a two-byte tag. <code>95</code> is <code>1001 0101</code>, so it is a one-byte tag.</p>

<h3>The random number is the clever part</h3>
<p>Remember the random number the terminal sent in GET PROCESSING OPTIONS. The card mixes it, with the amount and its own tap counter, into the cryptogram. So the cryptogram from one tap is useless for any other: a copy recorded today will not match tomorrow's random number. This is why a stolen chip conversation cannot be replayed, while a magnetic stripe, which says the same thing every time, could be copied. How the chip makes the cryptogram, and how the bank checks it without ever seeing the chip's secret key, is note 5.</p>

<h3>Words to keep</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Word</th><th>Meaning</th></tr>
<tr><td>EMV</td><td>The standard for how chip cards and terminals talk. Named after Europay, Mastercard and Visa, who started it.</td></tr>
<tr><td>NFC</td><td>The short-range radio used for contactless, at 13.56 MHz</td></tr>
<tr><td>APDU</td><td>One command or one answer in the conversation</td></tr>
<tr><td>AID</td><td>The ID of a payment app on the card, such as A0000000031010 for Visa</td></tr>
<tr><td>PPSE</td><td>The list of payment apps, asked for by the name 2PAY.SYS.DDF01</td></tr>
<tr><td>PDOL</td><td>The card's list of things it needs to know before it starts</td></tr>
<tr><td>TLV</td><td>Tag, length, value: how the card packs its answers</td></tr>
<tr><td>Status word</td><td>The last two bytes of every answer. 90 00 means done.</td></tr>
<tr><td>Cryptogram</td><td>A one-time code from the chip, proving it is genuine. Note 5.</td></tr>
</table></div>

<h3>Check yourself</h3>
<details><summary>Where does a contactless card get its power?</summary><p>From the terminal's radio field. Its antenna picks up the energy, enough to run the chip while it is close.</p></details>
<details><summary>Why does every tap need a fresh random number from the terminal?</summary><p>The card mixes it into the cryptogram, so each tap's cryptogram is different and a recorded one cannot be reused.</p></details>
<details><summary>An answer from the card ends in 6A 82. What does that mean?</summary><p>"Not found": the card has no app or file by that name. 90 00 would have meant success.</p></details>
<details><summary>Split this TLV packet: 5F2A 02 0356.</summary><p>Tag 5F2A (the currency), length 2 bytes, value 0356: the Indian rupee, code 356.</p></details>
<details><summary>How do the chip's answers end up at the card's bank?</summary><p>The terminal copies them into field 55 of the ISO 8583 message, as a TLV list.</p></details>`,
  },

  // ======================= questions he asked =======================
  {
    id: 'why-5000-not-50',
    date: '2026-10-18',
    title: 'Why + 5000 and not + 50?',
    from: 'Week 2, lesson 2: Tax to the nearest paisa',
    asked: 'Why are we doing 5000 and not 50?',
    widgets: {
      'q-5000': {
        code: ['long big = 1003 * 1800;', 'long right = (big + 5000) / 10000;', 'long wrong = (big + 50) / 10000;'],
        steps: [
          { line: 0, vars: { big: 1805400 }, out: [], note: 'Price × rate in basis points. This number is 10,000 times too big: the real tax is 180.54 paise.' },
          { line: 1, vars: { big: 1805400, right: 181 }, out: [], note: '1,805,400 + 5,000 = 1,810,400. ÷ 10,000 = 181.04, cut to 181. The 5,000 was worth half a paisa, enough to push .54 up.' },
          { line: 2, vars: { big: 1805400, right: 181, wrong: 180 }, out: [], note: '1,805,400 + 50 = 1,805,450. ÷ 10,000 = 180.545, cut to 180. The 50 was worth only 0.005 of a paisa, too small to change anything.' },
        ],
      },
    },
    html: `
<h3>The short answer</h3>
<p>The rule is: <b>add half of the number you divide by.</b> Lesson 2's predict divided by 100, so it added 50. <code>percentOf</code> divides by <b>10,000</b>, so it adds half of 10,000: <b>5,000</b>.</p>

<h3>Why the size of "half" changes</h3>
<p>You want to add <b>half a paisa</b> before cutting. How much "half a paisa" is depends on the units the number is in at that moment. You already know this from money: to add half a rupee to an amount kept in paise, you add <b>50</b>, not 0.5, because the amount is counted in hundredths.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Before dividing, the number is counted in</th><th>Then divide by</th><th>Half a paisa is</th></tr>
<tr><td>hundredths of a paisa (percent: 1003 × 18 = 18,054)</td><td>100</td><td><b>50</b></td></tr>
<tr><td>ten-thousandths of a paisa (basis points: 1003 × 1800 = 1,805,400)</td><td>10,000</td><td><b>5,000</b></td></tr>
</table></div>
<p>With basis points the multiplied number is 100 times bigger (1800 instead of 18), so half a paisa is 100 times bigger too: 50 × 100 = 5,000.</p>

<h3>Watch both</h3>
<div data-widget="stepper" data-ref="q-5000"></div>

<h3>Check yourself</h3>
<details><summary>A program divides by 1,000 at the end. What does it add to round to the nearest?</summary><p>500, half of 1,000.</p></details>
<details><summary>To round 25 ÷ 12 to the nearest whole number with long division, what do you add first?</summary><p>6, half of 12: (25 + 6) / 12 = 31 / 12 = 2. Check: 25 ÷ 12 = 2.08, nearest is 2.</p></details>`,
  },

  {
    id: 'paise-typed-input',
    date: '2026-10-18',
    title: 'What a paisa is, and how the till reads one price per line',
    from: 'Week 2, lesson 1: Count it in paise',
    asked: 'The cashier types the price of each item in paise - Unclear? Paise? The cashier types the price of each item in one line right? then moves to the next line until the input is 0',
    widgets: {
      'q-paise-read': {
        code: ['long price = keys.nextLong();', 'price = keys.nextLong();', 'price = keys.nextLong();', 'price = keys.nextLong();'],
        steps: [
          { line: 0, vars: { 'still waiting': '9900 1050 0', price: 2550 }, out: [], note: 'Typed: 2550 Enter 9900 Enter 1050 Enter 0 Enter. nextLong takes the first number, 2550 (₹25.50).' },
          { line: 1, vars: { 'still waiting': '1050 0', price: 9900 }, out: [], note: 'The next call takes the next number. The Enter between them only separates them.' },
          { line: 2, vars: { 'still waiting': '0', price: 1050 }, out: [], note: 'Third item, ₹10.50.' },
          { line: 3, vars: { 'still waiting': '(nothing)', price: 0 }, out: [], note: '0: the customer is done. Your loop stops here and prints the bill. Asking for another number now would crash with NoSuchElementException.' },
        ],
      },
    },
    html: `
<h3>What a paisa is</h3>
<p>A rupee is split into 100 <b>paise</b> (one <b>paisa</b>, many paise), the way a metre is 100 centimetres. ₹25.50 is 25 rupees and 50 paise, which is 25 × 100 + 50 = <b>2550 paise</b>. The till only ever deals in paise, so it never needs a decimal point, and whole numbers are always exact.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Label</th><th>Sum</th><th>Typed</th></tr>
<tr><td>₹25.50</td><td>25 × 100 + 50</td><td><code>2550</code></td></tr>
<tr><td>₹99</td><td>99 × 100 + 0</td><td><code>9900</code></td></tr>
<tr><td>₹0.05</td><td>0 × 100 + 5</td><td><code>5</code></td></tr>
<tr><td>₹1,234.50</td><td>1234 × 100 + 50</td><td><code>123450</code></td></tr>
</table></div>
<p>Going back is / and %: 2550 / 100 = 25 rupees, 2550 % 100 = 50 paise.</p>

<h3>One price per line: yes</h3>
<p>Exactly as you said. The cashier types a price and presses Enter, then the next, and <code>0</code> ends the customer. Each <code>keys.nextLong()</code> takes the next number from what is waiting:</p>
<div data-widget="stepper" data-ref="q-paise-read"></div>
<p>In the checks, the lab types every line for you in one go before your program starts. The numbers sit in a queue, and each nextLong takes the next one. That is why the program must stop at the 0: the queue is empty after it.</p>

<h3>Check yourself</h3>
<details><summary>How is ₹7.05 typed into the till?</summary><p>705: 7 × 100 + 5.</p></details>
<details><summary>The till reads 1999, 1, 0. What is the bill?</summary><p>Items: 2. Total: 2000 paise, which prints as 20 rupees 0 paise.</p></details>`,
  },

  {
    id: 'no-part-paisa',
    date: '2026-10-18',
    title: 'Why there is no 0.54 of a paisa: long, double and BigDecimal compared',
    from: 'Week 2, lesson 2: Tax to the nearest paisa',
    widgets: {
      'q-bigdecimal': {
        code: ['BigDecimal price = new BigDecimal("1003");', 'BigDecimal times = price.multiply(new BigDecimal("18"));', 'BigDecimal gst = times.divide(new BigDecimal("100"));', 'BigDecimal paise = gst.setScale(0, RoundingMode.HALF_UP);', 'System.out.println(paise);'],
        steps: [
          { line: 0, vars: { price: '1003' }, out: [], note: 'A BigDecimal box called price, holding exactly 1003. The quotes hand the digits over as text.' },
          { line: 1, vars: { price: '1003', times: '18054' }, out: [], note: 'price.multiply(...) means price × 18. The answer comes back as a new BigDecimal: 18054.' },
          { line: 2, vars: { price: '1003', times: '18054', gst: '180.54' }, out: [], note: 'divide by 100. A long would cut this to 180. BigDecimal keeps every digit: 180.54, exactly.' },
          { line: 3, vars: { price: '1003', times: '18054', gst: '180.54', paise: '181' }, out: [], note: 'Now the rounding decision. setScale(0, ...) means "keep 0 digits after the point". HALF_UP means .5 and above go up. 180.54 becomes 181.' },
          { line: 4, vars: { price: '1003', times: '18054', gst: '180.54', paise: '181' }, out: ['181'], note: 'Same answer as the long trick (18054 + 50) / 100. Two routes, one result.' },
        ],
      },
    },
    asked: 'Money cannot have 0.54 of a paisa, -> Why? Because Int division does not store point/decimal values? Gap again. This is confusing. What happens if I store money as long and then divide? Or big decimal and then do the maths? How to multiply this in my head quickly? 1003 * 18 ?? With basis points you divide by 10000, so half is 5000. -> Did not understand. (later) Did not understand much about the basis points.',
    html: `
<h3>The short answer</h3>
<p>Two different reasons, and both are true at once:</p>
<ol>
<li><b>Money itself.</b> 1 paisa is the smallest amount that exists for paying. No coin, note or account entry holds part of one. A bill has to be payable, so tax always ends as whole paise. This would be true in any language, or on paper.</li>
<li><b>Java.</b> Whole-number division (int or long on both sides of <code>/</code>) drops the part after the point. It doesn't round, it cuts. So yes, a long can't hold 180.54.</li>
</ol>
<p>Reason 1 means we <i>must</i> round to whole paise. Reason 2 means plain division would quietly round <i>down</i> for us. So the lesson makes the rounding a choice you write on purpose.</p>

<h3>Long, double, BigDecimal: three calculators</h3>
<p>Think of three calculators doing the same sum, 18% of 1003 paise. The exact answer is 180.54.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Calculator</th><th>How it works inside</th><th>Gives</th><th>Good for money?</th></tr>
<tr><td><b>long</b></td><td>Whole numbers only. When it divides, it cuts off everything after the point.</td><td><code>180</code></td><td>Yes: exact. But you must choose how to round yourself (add half first).</td></tr>
<tr><td><b>double</b></td><td>Stores numbers with a point, built from halves, quarters, eighths... (lesson 1). Most decimals are stored as "very close", not exact.</td><td><code>180.54</code></td><td>No. It looks right here, but tiny errors add up: ten 0.1s give 0.9999999999999999.</td></tr>
<tr><td><b>BigDecimal</b></td><td>Stores the decimal digits themselves, like you write them on paper: 1, 8, 0, point, 5, 4.</td><td><code>180.54</code></td><td>Yes: exact. Ten 0.1s give exactly 1.0. You still choose the rounding at the end.</td></tr>
</table></div>
<p><b>The key point.</b> BigDecimal doesn't make 0.54 of a paisa payable. It just keeps 180.54 exactly while you calculate. When the bill is printed you still round it to whole paise, and you have to say how.</p>

<h3>What BigDecimal code looks like, line by line</h3>
<p>You don't need to write this yet. It uses objects, <span class="later">coming in weeks 4 to 5</span>. But you should be able to read it. Press Next to step through it:</p>
<div data-widget="stepper" data-ref="q-bigdecimal"></div>
<p>Three new things in it, each in one line:</p>
<ul>
<li><code>new BigDecimal("1003")</code> makes a BigDecimal holding 1003. The number goes in double quotes, as text, so Java never turns it into a double first. (Without quotes, <code>new BigDecimal(0.1)</code> holds 0.1000000000000000055511151231257827021181583404541015625: the double's error is copied in.)</li>
<li><code>price.multiply(x)</code> means price × x. With BigDecimal you can't write <code>*</code>, <code>+</code> or <code>/</code>. You call a method instead: <code>add</code>, <code>subtract</code>, <code>multiply</code>, <code>divide</code>. Each one gives back a new BigDecimal with the answer.</li>
<li><code>setScale(0, RoundingMode.HALF_UP)</code>: "scale" means how many digits after the point to keep. 0 means none, so whole paise. <code>HALF_UP</code> is the rounding rule: .5 and above goes up. <code>DOWN</code> would give 180, the same as long division.</li>
</ul>

<h3>Which one should I use?</h3>
<p>This week: <b>long paise</b>. It's simple, fast, exact, and you can see every step. Later, in Spring Boot projects: <b>BigDecimal</b>, which most banking code uses. <b>double</b>: never for money.</p>

<h3>What a basis point is</h3>
<p>Percent means "out of 100". Rates like 12.5% have a point, and a long can't hold a point. So we use the same trick as paise: 1 rupee = 100 paise, and <b>1% = 100 basis points</b>. One basis point is a hundredth of a percent.</p>
<div class="tablewrap"><table class="plain">
<tr><th>Money</th><th>Rates</th></tr>
<tr><td>₹25.50 → 2550 paise</td><td>12.5% → 1250 basis points</td></tr>
<tr><td>rupees × 100 = paise</td><td>percent × 100 = basis points</td></tr>
<tr><td>₹1 = 100 paise</td><td>100% = 10,000 basis points</td></tr>
</table></div>
<p>Percent is "out of 100", so you divide by 100. Basis points are "out of 10,000", so you divide by 10,000. 18 out of 100 and 1800 out of 10,000 are the same share, so both give 180.54 for 1003 paise.</p>

<h3>"With basis points you divide by 10000, so half is 5000"</h3>
<p>The rounding rule is <b>add half of the number you divide by, then divide</b>. Why it works: division cuts down to the whole number below, and adding half first lifts every answer by exactly 0.5 before the cut. 180.54 becomes 181.04 and is cut to 181. 180.49 becomes 180.99 and is cut to 180. So it lands on the nearest whole number.</p>
<div class="tablewrap"><table class="plain">
<tr><th></th><th>Percent (÷ 100)</th><th>Basis points (÷ 10000)</th></tr>
<tr><td>18% written as</td><td>18</td><td>1800</td></tr>
<tr><td>1003 × rate</td><td>18,054</td><td>1,805,400</td></tr>
<tr><td>Half of the divisor</td><td>50</td><td>5,000</td></tr>
<tr><td>Add it</td><td>18,104</td><td>1,810,400</td></tr>
<tr><td>Divide (cut)</td><td><b>181</b></td><td><b>181</b></td></tr>
</table></div>
<p>The same answer. Basis points are a scale 100 times finer (1% = 100 basis points), so the multiply step gives a number 100 times bigger, the divide step divides by 100 times more, and "half" is 100 times bigger too: 50 becomes 5000. The scale exists so rates like 12.5% (1250) stay whole numbers.</p>

<h3>1003 × 18 in your head</h3>
<p>Split the awkward number into easy parts, multiply each part, then add. This is the <b>distributive rule</b>: 18 × (1000 + 3) = 18 × 1000 + 18 × 3.</p>
<pre>1003 × 18 = 1000 × 18  +  3 × 18
          =   18000    +    54
          =   18054</pre>
<p>Or use a round neighbour: 18 = 20 - 2, so 1003 × 20 - 1003 × 2 = 20060 - 2006 = 18054. Dividing by 100 moves the point two places left: 180.54. Try the same on 2005 × 12 (2000 × 12 + 5 × 12 = 24000 + 60 = 24060).</p>

<h3>Check yourself</h3>
<details><summary>18% of 1001 paise: what do <code>1001 * 18 / 100</code> and <code>(1001 * 18 + 50) / 100</code> give?</summary><p>1001 × 18 = 18018. 18018 / 100 = 180 (180.18 cut). (18018 + 50) / 100 = 18068 / 100 = 180. Both give 180, because 0.18 rounds down anyway.</p></details>
<details><summary>Does storing money in BigDecimal mean you never have to round?</summary><p>No. It keeps exact decimals while you work, but a payable amount must be whole paise, so you still round once, with setScale and a rule.</p></details>
<details><summary>In your head: 504 × 25?</summary><p>500 × 25 + 4 × 25 = 12500 + 100 = 12600.</p></details>`,
  },
  {
    id: 'scanner-in-loop',
    date: '2026-10-16',
    title: 'Works when I type, fails in the checks: a new Scanner every round',
    from: 'Week 1, lesson 12: Challenge: the shop',
    asked: 'How are these checks failing? For the same inputs I checked, I did not get any exception/error and my code ran as expected.',
    html: `
<h3>The short answer</h3>
<p>Your program made a <b>new Scanner every time round the loop</b>. When you type, that happens to work. When the lab hands over all the numbers at once, the first Scanner swallows all of them, and the second Scanner finds nothing left. So it fails on the second number with <code>NoSuchElementException</code>.</p>

<h3>How a Scanner really reads</h3>
<p>A Scanner does not take one number from the keyboard. It grabs <b>everything that is waiting</b> (up to about a thousand characters) into its own private box, called a <b>buffer</b>, and then hands you numbers from that box one at a time.</p>
<ul>
<li><b>You typing in the terminal:</b> when Scanner 1 looks, only <code>30</code> is waiting, because you have not typed the rest yet. It takes just that. Next round, Scanner 2 looks, and your next number is waiting. Every Scanner gets its one number. It works by luck.</li>
<li><b>The lab:</b> it puts <code>30 50 40 10 0</code> in the queue before your program even starts. Scanner 1 grabs all five into its box and gives you 30. Next round your code makes Scanner 2. Scanner 1, with 50, 40, 10, 0 still inside, is thrown away. Scanner 2 looks at the queue: empty, and closed. Crash.</li>
</ul>
<p>That is why the red message names line 16 and why only the first line, "Bought for 30", was printed.</p>
<p>List 2 (just <code>0</code>) did not crash, because one Scanner was enough: it read the 0 and the loop ended.</p>

<h3>The rule</h3>
<p><b>One Scanner per program</b>, made once, before the loop. Every round asks <i>the same</i> Scanner for its next number.</p>
<p>Real programs get typed input from files and other programs all the time, not only from a person, so "it works when I type it" is not proof. That is exactly why the lab runs four lists.</p>

<h3>The other failure</h3>
<p>List 2 also said <i>There is an unexpected extra line: "Most Expensive: 0"</i>. The task says <code>Most expensive</code> with a small e. To a computer, E and e are different characters, so the line did not match.</p>

<h3>Check yourself</h3>
<ol><li>A program makes a Scanner inside a loop. Typed by hand, it works. Why does it break when all the input arrives at once?</li>
<li>Why did List 2 not crash?</li></ol>
<p>Answers: the first Scanner grabs all the waiting input into its buffer, and the next Scanner finds the queue empty. List 2 only needed one number, so one Scanner was enough.</p>`,
  },
  {
    id: 'run-java-vscode',
    date: '2026-10-16',
    title: 'Running a Java program in VS Code',
    from: 'Week 1, lesson 11: Give the moves names',
    asked: 'How to run java program in vs code',
    html: `
<h3>The short answer</h3>
<p>Open the file, then click the small <b>Run</b> link that VS Code shows just above <code>public static void main</code> (or the ▶ button in the top right corner). The program runs in the <b>Terminal</b> panel at the bottom, and that is where you type your moves.</p>

<h3>Or type it yourself in the terminal</h3>
<p>Open a terminal with <b>Ctrl + \`</b> (the key left of 1), go to the folder, and run the file:</p>
<pre>cd "play/week1-game"
java Game.java</pre>
<p><code>java Game.java</code> does two jobs in one: it turns your code into instructions the computer understands (compiling) and then runs them. Older tutorials do it in two steps, <code>javac Game.java</code> then <code>java Game</code>. Both work.</p>

<h3>If it goes wrong</h3>
<ul>
<li><b>No Run link appears:</b> wait a few seconds after opening the file. The Java extension is still starting up (bottom bar shows it loading).</li>
<li><b>It stops at the first question with a red NoSuchElementException:</b> it was run somewhere with no keyboard attached, like the lab's plain Run button. Run it in the terminal instead. See the note "Reading the red message when nobody types".</li>
<li><b>"error: ... expected":</b> a typing mistake. The message names the line; fix it, save, run again.</li>
</ul>

<h3>Check yourself</h3>
<ol><li>Which panel do you type your moves into?</li>
<li>What does <code>java Game.java</code> do before it runs anything?</li></ol>
<p>Answers: the Terminal. It compiles the file first.</p>`,
  },
  {
    id: 'roll-formula',
    date: '2026-10-16',
    title: 'The maths in dice.nextInt(high - low + 1) + low',
    from: 'Week 1, lesson 11: Give the moves names',
    asked: 'Can you explain the math: return dice.nextInt(high - low + 1) + low;',
    html: `
<h3>Two questions, in this order</h3>
<p>The line answers two questions, one after the other:</p>
<ol><li><b>How many different numbers do I want?</b> That is <code>high - low + 1</code>.</li>
<li><b>Where should they start?</b> That is <code>+ low</code>.</li></ol>
<p><code>nextInt(n)</code> already gives you the right <i>count</i>: n numbers, from 0 to n - 1. It always starts at 0. Adding <code>low</code> slides all of them up so they start where you want.</p>

<h3>Walk through it for a real die: low = 1, high = 6</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Piece</th><th>Works out to</th><th>Why</th></tr>
<tr><td><code>high - low</code></td><td>6 - 1 = 5</td><td>the <b>gap</b> between the two ends</td></tr>
<tr><td><code>+ 1</code></td><td>5 + 1 = 6</td><td>the <b>count</b> of numbers: 1, 2, 3, 4, 5, 6 is six numbers</td></tr>
<tr><td><code>dice.nextInt(6)</code></td><td>0, 1, 2, 3, 4 or 5</td><td>six numbers, but starting at 0</td></tr>
<tr><td><code>+ low</code></td><td>1, 2, 3, 4, 5 or 6</td><td>every one moved up by 1</td></tr>
</table></div>

<h3>Why the + 1? Fence posts</h3>
<p>A fence 5 metres long with a post every metre has <b>6</b> posts, not 5: one at 0 m and one at 5 m, plus the four in between. Subtracting gives the number of <b>gaps</b>. You want the number of <b>posts</b>, and when both ends count, that is always one more.</p>
<pre>  1 --- 2 --- 3 --- 4 --- 5 --- 6
  posts: 6        gaps: 5 = 6 - 1</pre>
<p>Forgetting this + 1 has a name: an <b>off-by-one</b> error. It is one of the most common bugs in all of programming, at every level.</p>

<h3>Your fight, with your own numbers</h3>
<div class="tablewrap"><table class="plain">
<tr><th>Who</th><th>low to high</th><th>high - low + 1</th><th>So roll(dice, low, high) does</th></tr>
<tr><td>Hero</td><td>10 to 30</td><td>30 - 10 + 1 = 21</td><td><code>dice.nextInt(21) + 10</code></td></tr>
<tr><td>Monster</td><td>5 to 25</td><td>25 - 5 + 1 = 21</td><td><code>dice.nextInt(21) + 5</code></td></tr>
</table></div>
<p>Those are exactly the two lines already in your Game.java. The method does the same sum, once, for any low and high.</p>

<h3>See the bug: leave out the + 1</h3>
<p>Here is <code>dice.nextInt(5) + 1</code>, the version without the + 1. Roll it 100 times and look for a 6.</p>
<div data-widget="dice" data-key="q-roll-bug" data-n="5" data-k="1"></div>
<p>There is none, ever. The program still runs and looks fine, which is why this bug survives: the largest value simply never comes up. Now the correct one:</p>
<div data-widget="dice" data-key="q-roll-ok" data-n="6" data-k="1"></div>

<h3>How you could find this formula yourself</h3>
<p>Nobody "sees" a formula like this out of thin air. You build it from examples you already understand:</p>
<div class="tablewrap"><table class="plain">
<tr><th>low</th><th>high</th><th>You already wrote</th></tr>
<tr><td>10</td><td>30</td><td><code>nextInt(21) + 10</code></td></tr>
<tr><td>5</td><td>25</td><td><code>nextInt(21) + 5</code></td></tr>
<tr><td>1</td><td>6</td><td><code>nextInt(6) + 1</code></td></tr>
</table></div>
<p>Now ask two questions of the table. <b>The number added at the end: where does it come from?</b> It is always <code>low</code>. <b>The number inside nextInt: how does it relate to low and high?</b> 21 = 30 - 10 + 1, 21 = 25 - 5 + 1, 6 = 6 - 1 + 1. The same pattern every time, so swap the numbers for their names. That is all a formula is: the pattern your examples share, written with names.</p>
<p><b>The habit:</b> stuck on a general rule? Do three concrete cases by hand, put them in a table, and look for what changes and what stays the same.</p>

<h3>Check yourself</h3>
<ol><li>You want 50 to 59. What goes inside <code>nextInt( )</code>, and what do you add?</li>
<li>Someone writes <code>dice.nextInt(high - low) + low</code> for 10 to 30. Which single number can never appear?</li>
<li>What does <code>roll(dice, 7, 7)</code> give back, and why?</li></ol>
<p>Answers: 10 and + 50 (50 to 59 is ten numbers). 30. Always 7: 7 - 7 + 1 = 1, and nextInt(1) can only give 0.</p>`,
  },
  {
    id: 'no-input-error',
    date: '2026-10-15',
    title: 'Reading the red message when nobody types',
    from: 'Week 1, lesson 10: Your move',
    asked: 'Break it: nobody at the keyboard. Press Run here. This button gives your program no input at all. Read the red message and find the line of your file it names. (He asked: please explain.)',
    html: `
<h3>The short answer</h3>
<p>Your program reached line 31, <code>int userKey = key.nextInt();</code>, and asked for a number. There was no number, and none could ever come, so Java stopped the program there and printed a report of where it was. Nothing is wrong with your code: the experiment was to see this happen.</p>

<h3>What happened, in order</h3>
<ol>
<li>Everything up to "Round 1" and the question ran normally. That is why those lines are printed.</li>
<li>Line 31 called <code>key.nextInt()</code>. Remember the queue from lesson 10: the Scanner looks in the queue of typed characters.</li>
<li>The queue was empty. In the VS Code terminal, an empty queue just means "wait": the keyboard is still connected, so you might type something. But this Run button connects <b>nothing</b>, and tells the program "there will never be any input". So waiting is pointless.</li>
<li><code>nextInt</code> cannot hand back a number it does not have, and it is not allowed to invent one. Its only choice is to stop the program and say why.</li>
</ol>
<p>That is the difference between the two buttons. "Run and check" types a prepared list of moves into the queue. "Run" here types nothing and closes the queue.</p>

<h3>Every piece of the red message</h3>
<pre>Exception in thread "main" java.util.NoSuchElementException</pre>
<ul>
<li><b>Exception</b>: Java's word for "something went wrong and this line cannot carry on". When it happens and nothing in your code deals with it, the program stops and prints this report.</li>
<li><b>in thread "main"</b>: a program can do several jobs at the same time, and each job is called a thread. Your program has only one, and Java names it "main", after your <code>main</code> method. <span class="later">Coming much later: programs that do several jobs at once (threads)</span></li>
<li><b>java.util.NoSuchElementException</b>: the name of what went wrong, in the same <code>java.util</code> folder as <code>Scanner</code> and <code>Random</code>. It reads like a sentence: "no such element", meaning "there is no next item to give you". Exception names are chosen to be read like this, so read the name first: it usually tells you the problem.</li>
</ul>
<p>Then come the <code>at</code> lines. This list is called the <b>stack trace</b>. Each line is one method that was still running at the moment it stopped, written as</p>
<pre>at  folder.Class.method(File.java:line)</pre>
<p>The list goes from where it stopped (top) back to where it began (bottom). Read it from the bottom up and it is the story of the calls:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Line of the report, bottom first</th><th>What it means</th></tr>
<tr><td><code>at Game.main(Game.java:31)</code></td><td><b>Your code.</b> Your <code>main</code>, on line 31, called <code>key.nextInt()</code>.</td></tr>
<tr><td><code>at ...Scanner.nextInt(Scanner.java:2212)</code></td><td>Inside Java's own Scanner. The <code>nextInt()</code> you called does one thing: it calls another method that is also named nextInt, but takes a number saying which counting system to use, and passes 10, for normal decimal numbers. <span class="later">Coming in weeks 4 to 5: two methods with the same name but different brackets (overloading)</span></td></tr>
<tr><td><code>at ...Scanner.nextInt(Scanner.java:2258)</code></td><td>That second nextInt asks for the next piece of text that looks like a whole number.</td></tr>
<tr><td><code>at ...Scanner.next(Scanner.java:1594)</code></td><td><code>next</code> looks for that piece, finds nothing, and calls the method that reports the problem.</td></tr>
<tr><td><code>at ...Scanner.throwFor(Scanner.java:937)</code></td><td>The top: where it actually stopped. Line 937 of Java's Scanner.java reads, in plain words: "if the input is closed and everything in it has been read, stop with NoSuchElementException". That is exactly your situation.</td></tr>
</table></div>
<p>(Those four Scanner lines were checked against the real Scanner.java of your Java 17, from the <code>lib/src.zip</code> file mentioned in the java.util.Random note.)</p>
<p><code>java.base/</code> at the front of the Scanner lines is the name of the part of Java those files are in; you can ignore it.</p>

<h3>The rule for finding your line</h3>
<p>Most of a stack trace is Java's own code, which is not where the mistake is. So: <b>read the exception name, then go down the list to the first line that names one of your files.</b> Here that is <code>Game.java:31</code>. Open your file at line 31 and ask: "what does this line need that it did not get?" Here: a typed number.</p>
<p>Real error reports from big programs can have fifty <code>at</code> lines. The rule stays the same, and it is one of the most used skills in a developer's day.</p>

<h3>Why the stack trace is a pile</h3>
<p>Each method that calls another pauses until it gets an answer, so the paused methods pile up: main at the bottom, the newest call on top. When something goes wrong, Java prints the pile from the top down. You will see this pile drawn step by step in lesson 11, where it is called the <b>call stack</b>.</p>

<h3>What to remember</h3>
<ul>
<li>The first line names what went wrong. Read the name like a sentence.</li>
<li>Go down the <code>at</code> lines to the first one naming your file. That is where to look.</li>
<li><code>NoSuchElementException</code> from a Scanner means: you asked for input that is not there. In the "Run and check" games it would mean your loop asked for more moves than a game needs.</li>
</ul>`,
  },
  {
    id: 'seed7-no-fail',
    date: '2026-10-15',
    title: 'With new Random(7), why did no check fail?',
    from: 'Week 1, lesson 9: Roll the dice',
    asked: 'Break the randomness. Change new Random() to new Random(7) and press Run three times. Compare the fights. Then press "Run and check" above and read which check fails. None of the checks failed.',
    html: `
<h3>What should have happened</h3>
<p>With <code>new Random(7)</code> the dice machine starts from the same secret number every time, so it rolls the same numbers in the same order every time (the seed machine in the Random concept note shows this: seed 7 always gives 20, 15, 28). So all three fights come out <b>exactly the same</b>, line for line. Your tutor ran your own Game.java with seed 7 three times: the three outputs were identical.</p>
<p>The lesson runs your program three times and checks two kinds of things:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Kind of check</th><th>With seed 7</th></tr>
<tr><td>Each fight on its own: follows the rules, rolls inside the ranges, hero rolls again each round</td><td><span class="yes">passes</span>. One fight with seed 7 is a perfectly legal fight.</td></tr>
<tr><td>The three fights compared: "The three fights are not identical"</td><td><span class="bad">fails</span>. They are identical.</td></tr>
</table></div>
<p>That is the point of the experiment: no single run can show that a program is random. Only <b>comparing several runs</b> can. The same idea is used to test real systems that involve randomness, like the random number in every card tap.</p>

<h3>Why the three fights are identical, step by step</h3>
<p><b>Try it first.</b> This is your lesson 9 fight, run three times, using Java's exact dice formula. With <code>new Random(7)</code> it prints exactly what your own Game.java printed with seed 7: Round 1, hero hits for 20, monster hits for 10, and so on. Switch between the two lines and press "Run three times again".</p>
<div data-widget="threeruns" data-key="q-three-runs"></div>
<p>Now the reason, as a chain. Each link follows from the one before it.</p>
<ol>
<li><b>Your program has no chance in it of its own.</b> Everything else in Game.java is fixed: the starting HP, the order of the lines, the rules. The only thing that can differ between two runs is the numbers the dice hands back.</li>
<li><b>The dice is not chance either: it is a formula.</b> As the seed machine in the Random concept note shows, each roll is "take the secret number, multiply, add, keep 48 switches, cut it down with %". A formula always gives the same answer for the same input, like 6 × 7 is always 42.</li>
<li><b>The first secret number comes from the seed.</b> <code>new Random(7)</code> means "start from 7". So in every run the machine starts in exactly the same state.</li>
<li><b>Same start, same formula, so the same chain.</b> Same first secret number, so the same first roll (20). The formula turns the same number into the same next number, so the same second roll (10). And so on, for every roll, in every run.</li>
<li><b>Same rolls, so the same fight.</b> Same damage each round, so the same HP after each hit, the same number of rounds, the same winner. Every printed line is the same.</li>
</ol>
<p>So "identical" is not a coincidence that might go away if you run it more often. It is guaranteed: run it a thousand times, on any computer in the world, and seed 7 gives this fight.</p>

<h3>Then why does <code>new Random()</code> give a different fight each time?</h3>
<p>Because the chain starts somewhere new. With empty brackets, Java makes up the seed itself, from two things that change all the time:</p>
<ul>
<li>the computer's clock, counted in <b>billionths of a second</b> (<code>System.nanoTime()</code>). Two runs of your program never start in the same billionth of a second;</li>
<li>a counter that changes every time any <code>Random</code> is built, so even two dice made in the same instant get different seeds.</li>
</ul>
<p>Different seed, different first secret number, and from there every roll can differ. That is what the "new Random()" button above does: it builds each run's seed the same way. (This is from Java's own source code, the <code>Random()</code> constructor in <code>Random.java</code>.)</p>
<p><b>A useful picture:</b> the formula is a very long, fixed list of numbers, the same on every computer. The seed only chooses <b>where on the list you start reading</b>. Seed 7 always starts at the same place. <code>new Random()</code> starts at a place picked by the clock.</p>

<h3>Why you saw no failure</h3>
<p>Two likely reasons, and the first one is the app's fault:</p>
<ol>
<li><b>The failing check was hidden at the bottom.</b> The page listed Fight 1, Fight 2 and Fight 3, each with every check ticked, and only below those, under "Comparing the runs", the one cross. Easy to miss. This is fixed: the results now start with one line that says either "Every check passed" or, in red, exactly which check failed.</li>
<li><b>The file was not saved.</b> The lab runs the file as it is on disk. If <code>Random(7)</code> was typed but not saved with Ctrl + S, the program that ran still had <code>new Random()</code>, and every check really did pass. (The lesson text also said "Run and check", but after passing, that button is called "Run again". The text now says both.)</li>
</ol>
<p><b>Try it again:</b> change it to <code>new Random(7)</code>, save, press "Run again", and read the line at the top. Then put it back to <code>new Random()</code> and save.</p>`,
  },
  {
    id: 'dice-max-50',
    date: '2026-10-15',
    title: 'nextInt(50) + 1: is the largest 40 or 50?',
    from: 'Week 1, lesson 9: Roll the dice',
    asked: 'When I changed the values to 50 and 1, dice.nextInt(50) + 1, it says the smallest is 1, which is correct, since nextInt will give 0 and 0 + 1 will be 1. But the largest it says is 40, which I am confused about. It cannot give 50, but it can give 49, and 49 + 1 is 50. So the max should be 50, right?',
    html: `
<h3>You were right. The diagram was wrong.</h3>
<p>Your reasoning is exactly correct:</p>
<div class="tablewrap"><table class="plain">
<tr><th>Step</th><th>Smallest</th><th>Largest</th></tr>
<tr><td><code>dice.nextInt(50)</code></td><td>0</td><td>49 (it never gives 50 itself)</td></tr>
<tr><td><code>+ 1</code></td><td>0 + 1 = <b>1</b></td><td>49 + 1 = <b>50</b></td></tr>
</table></div>
<p>So <code>dice.nextInt(50) + 1</code> gives 1 to 50: 50 different numbers.</p>

<h3>What went wrong in the diagram</h3>
<p>The diagram draws one bar per possible number. Whoever built it (your tutor) limited it to 40 bars so they would fit on a phone, and wrote it so that any bigger number was quietly changed to 40. You typed 50; the diagram used 40 without telling you, and 40 values starting at 1 end at 40.</p>
<p>That is a real kind of bug: a program that <b>silently changes your input</b>. It is worse than an error message, because nothing tells you anything happened. It is fixed: the diagram now draws up to 100 bars, and for anything it cannot draw it says so instead of changing your number. Try 50 and 1 again.</p>
<div data-widget="dice" data-key="q-dice-50" data-n="50" data-k="1"></div>

<h3>The habit you just used</h3>
<p>You did not trust the screen. You worked it out from the rule (nextInt(n) gives 0 to n - 1), got a different answer, and asked. That is how real bugs are found, at work too: when a tool and your own careful reasoning disagree, check both, and say so.</p>
<p><b>Prove it in Java yourself (optional).</b> In <code>play/Scratch.java</code>, roll <code>dice.nextInt(50) + 1</code> 100,000 times in a <code>while</code> loop and keep the largest and smallest roll seen so far in two boxes. Print both at the end. Predict the two numbers first. You have every tool for this already: Random, while, if, and a box that remembers a running value.</p>
<div data-widget="run" data-file="Scratch.java"></div>`,
  },
  {
    id: 'bits-bytes-everything',
    date: '2026-10-12',
    title: 'Bits, bytes, and how numbers, text, decimals and pictures are stored',
    from: 'Week 1, Mission 2: Give them a life bar',
    asked: 'So these are bits and bytes? How exactly is an int or a number stored in this memory? How are strings, decimals, images and other stuff stored in memory?',
    html: `
<h3>1. Bit and byte</h3>
<p>Yes. One switch is a <b>bit</b>. Eight switches side by side are a <b>byte</b>. A byte has 256 possible patterns, so it can hold a number from 0 to 255. The next three sections take that sentence apart slowly, because you marked it: why 256, what "41" means, and how a number can be a shade of grey.</p>
<p><b>Try it.</b> These 8 switches start as the pattern for 65. Flip a few and watch all four readings change together.</p>
<div data-widget="bits" data-key="note2-byte" data-bits="8" data-signed="false" data-meanings="true" data-start="65"></div>
<p>This is the most important idea on the page: <b>the switches have no meaning of their own.</b> The same pattern is 65, or the letter A, or a shade of grey, depending on how the program reads it. A type such as <code>int</code> or <code>String</code> is an instruction to Java: read these switches this way.</p>

<h3>1a. Why 8 switches make 256 patterns</h3>
<p>Start small and count by hand.</p>
<ul>
<li><b>1 switch:</b> off or on. <code>0</code>, <code>1</code>. That is 2 patterns.</li>
<li><b>2 switches:</b> the first can be off or on, and <i>for each of those</i> the second can be off or on. <code>00</code>, <code>01</code>, <code>10</code>, <code>11</code>. That is 2 × 2 = 4.</li>
<li><b>3 switches:</b> take all 4 patterns of two switches. Put a 0 in front of each: 4 patterns. Put a 1 in front of each: 4 more. 4 + 4 = 8, which is 2 × 2 × 2.</li>
</ul>
<p>Every new switch does the same thing: the whole old list appears twice, once with the new switch off and once with it on. So every switch <b>doubles</b> the count: 2, 4, 8, 16, 32, 64, 128, <b>256</b>.</p>
<p><b>Try it.</b> Start at 3 switches and add one at a time. Watch the list split into two halves that are the same apart from the first switch.</p>
<div data-widget="patterns" data-key="note2-patterns" data-n="3"></div>
<p><b>The maths has a name, and it is simpler than permutations.</b> It is the <b>multiplication rule</b> of counting: if one choice has <i>a</i> options and a second, separate choice has <i>b</i> options, the two together have <i>a × b</i> combined outcomes. Eight switches are eight separate choices of 2 options each:</p>
<pre>2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 2⁸ = 256</pre>
<p>The same rule counts other things you know. A 4-digit PIN is four choices of 10 digits: 10 × 10 × 10 × 10 = 10,000 PINs. A 3-letter code from 26 letters: 26 × 26 × 26 = 17,576.</p>
<p><b>Where permutations and combinations do come in.</b> They answer a different question. "How many patterns have <i>exactly 3</i> switches on?" means "in how many ways can I <i>choose</i> 3 of the 8 switches?". That is a combination, written C(8, 3), and it is 56. The bars in the diagram above are exactly these counts. For 8 switches they are 1, 8, 28, 56, 70, 56, 28, 8, 1, and they add up to 256, because every pattern has some number of switches on. You do not need combinations to understand a byte; the multiplication rule is enough. The maths track will reach them later.</p>
<p><b>Why 0 to 255, and not 1 to 256?</b> One of the 256 patterns is all switches off, and that pattern means 0. 0 plus 255 more numbers is 256 numbers.</p>

<h3>1b. Hex: two characters for one byte</h3>
<p>Writing <code>01000001</code> every time is slow and easy to misread. So programmers write bytes in <b>hexadecimal</b>, "hex" for short: counting in sixteens instead of tens.</p>
<p>Normal counting has 10 digits, 0 to 9. Hex needs 16 digits, so after 9 it borrows letters: <b>A</b> is 10, <b>B</b> 11, <b>C</b> 12, <b>D</b> 13, <b>E</b> 14, <b>F</b> 15.</p>
<p>Here is the trick that makes hex fit bytes perfectly. Split the byte into two halves of 4 switches. 4 switches make 2 × 2 × 2 × 2 = <b>16</b> patterns, from 0 to 15, which is exactly one hex digit. So every byte is exactly two hex digits: one for the left half, one for the right half.</p>
<p>Take 65:</p>
<div class="tablewrap"><table class="plain">
<tr><th></th><th>Left half</th><th>Right half</th></tr>
<tr><td>Switches</td><td><code>0100</code></td><td><code>0001</code></td></tr>
<tr><td>Worth (8, 4, 2, 1)</td><td>4</td><td>1</td></tr>
<tr><td>Hex digit</td><td><b>4</b></td><td><b>1</b></td></tr>
</table></div>
<p>So 65 is written <b>41</b> in hex. To turn it back: the left digit counts sixteens, the right digit counts ones. 4 × 16 + 1 = 65. It is the same idea as 65 in normal counting meaning 6 × 10 + 5, only with 16 in place of 10.</p>
<p><b>Try it.</b> Make the byte for 255 (every switch on). Its hex is FF. Then make 10, then 16, and say the hex before you look.</p>
<div data-widget="hexbyte" data-key="note2-hex" data-start="65"></div>
<p>Hex looks like a normal number, so programs mark it. Java and many languages write <code>0x41</code>. Card data at work is written as one long run of hex with no marks at all, like <code>9F0206000000025000</code>. Split it into pairs, and each pair is one byte: <code>9F 02 06 00 00 00 02 50 00</code>. Payments notes 3 and 4 read exactly this kind of data.</p>

<h3>1c. How a number can be a shade of grey</h3>
<p>A screen makes every colour from three lights: red, green and blue. When all three are at the same brightness, you see grey. All three off is black; all three at full is white; anything between is a grey.</p>
<p>So a program that wants a grey needs only <b>one</b> number, and uses it for all three lights. If it reads our byte as a grey, it sets red, green and blue to 65 each: a dark grey, about a quarter of the way from black to white. The byte did not change; the program chose to read it as a brightness. That is the meaning of "read as a shade of grey" in the diagram, and it is how black-and-white photos are stored: one byte per dot.</p>
<p>Move the switches in the hex diagram above and watch the grey bar: the marker slides from black at 0 to white at 255.</p>

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
<p>Look at your phone screen through a magnifying glass, or a drop of water on the glass, and you see that it is not smooth. It is a grid of tiny dots, millions of them. One dot is called a <b>pixel</b>.</p>
<p>Each pixel is really three tiny lights sitting side by side: one <b>red</b>, one <b>green</b>, one <b>blue</b>. They are so small that your eye mixes them into one colour. Each light can be off, full, or anywhere between, and its brightness is stored as a number from 0 (off) to 255 (full). That is one byte per light.</p>
<p>So one pixel is three bytes: how bright the red is, how bright the green is, how bright the blue is.</p>
<p><b>Try it.</b> Here is a tiny picture, 8 dots across and 8 down, made big so you can see the dots. Tap any dot to see its three bytes, then slide them to repaint it. Then press "See it at real size".</p>
<div data-widget="pixels" data-key="note2-pixels"></div>
<p>Light mixes differently from paint. With paint, red and green make brown. With light, red and green at full make <b>yellow</b>, and all three at full make <b>white</b>. <b>Try it</b> on a single pixel: make white, then black, then yellow.</p>
<div data-widget="rgb" data-key="note2-rgb"></div>
<p>Now count the bytes. Our tiny picture: 64 pixels × 3 = 192 bytes. A phone photo is about 4000 × 3000 = 12 million pixels, so about 36 million bytes before any shrinking. Formats such as JPEG store the same picture in far fewer bytes by describing it more cleverly, for example "this whole patch is the same blue" instead of listing every dot.</p>

<h3>6. Everything else</h3>
<ul>
<li><b>Sound:</b> the loudness of the sound wave, measured about 44,000 times every second, each measurement a number.</li>
<li><b>Video:</b> many pictures in a row, plus sound.</li>
<li><b>Your program:</b> the instructions are numbers too. <code>Game.java</code> is text, and Java turns it into bytes the machine can carry out.</li>
</ul>

<h3>7. Your question: should a money system allow decimals at all?</h3>
<p>You asked whether a system is wrong to allow decimals in a budget or a transaction limit, and how banks handle decimals. Short answer: <b>allowing decimals is right. Money really has them: ₹1,500.75 is a real amount. What matters is how the system stores them and how it does sums with them.</b></p>
<p><b>Try it.</b> Type 0.10 and add it up 10 times. Then try 1500.75, and 0.25.</p>
<div data-widget="money" data-key="note2-money" data-start="0.10"></div>
<p>0.25 comes out exact, because a quarter is one of the fractions switches can make (section 4). 0.10 does not. The error is tiny, but it piles up, and one wrong paisa in a bank is a bug that someone has to explain.</p>
<p><b>The three safe ways, all used by real banks:</b></p>
<div class="tablewrap"><table class="plain">
<tr><th>Way</th><th>How</th><th>Where you meet it</th></tr>
<tr><td>Whole minor units</td><td>Store paise in a whole-number type: ₹1,500.75 is <code>long paise = 150075;</code></td><td>Card payment messages (payments note 3), many payment systems. Week 2 of the lab builds your money tool this way.</td></tr>
<tr><td>An exact decimal type in the database</td><td>A column of type <code>DECIMAL(15,2)</code> stores decimal digits exactly: up to 15 digits, 2 of them after the point</td><td>Bank and business databases</td></tr>
<tr><td>An exact decimal type in Java</td><td><code>BigDecimal</code>, made from text: <code>new BigDecimal("0.10")</code></td><td>Java banking code (Spring Boot services, Apache Fineract)</td></tr>
</table></div>
<p>The unsafe way is <code>float</code> or <code>double</code>, for the reason in section 4.</p>

<p><b>The trap that catches real systems.</b> Storing the amount exactly is not enough if the program then turns it into a <code>double</code> to do a sum. Picture a limit check in Java:</p>
<pre>double used = 0.10, amount = 0.20, limit = 0.30;
System.out.println(used + amount &gt; limit);   // prints true</pre>
<p>The customer is exactly at the limit, which should be allowed, but the check says they are over it, because <code>0.10 + 0.20</code> is <code>0.30000000000000004</code> as a <code>double</code>. The same check in paise is always right:</p>
<pre>long used = 10, amount = 20, limit = 30;
System.out.println(used + amount &gt; limit);   // prints false</pre>
<p>(Both outputs were run in Java before going into this note.)</p>
<p><b>One more trap, inside BigDecimal itself:</b> make it from text, never from a <code>double</code>. <code>new BigDecimal(0.1)</code> receives the double's nearest value and keeps all of it: <code>0.1000000000000000055511151231257827021181583404541015625</code>. <code>new BigDecimal("0.10")</code> is exactly 0.10.</p>

<p><b>Not every currency has two decimals.</b> The list of currencies, ISO 4217, also says how many digits each one has after the point. The rupee, dollar and euro have 2. The Japanese yen has 0: there is no smaller unit. The Kuwaiti and Bahraini dinars have 3: 1,000 fils to a dinar. That is why a card message sends the currency code next to the amount: the number 25000 means ₹250.00 in rupees but ¥25,000 in yen.</p>
<p><b>What happens to fractions of a paisa?</b> Interest and percentages make them: 7% of ₹10.05 is 70.35 paise. A bank cannot pay 0.35 of a paisa, so it rounds, by a rule it writes down: when to round (each day, or once a month) and which way (for example "half up", or "half to even", which rounds exact halves to the nearest even digit so that over millions of sums the roundings do not all lean one way). You will write rounding yourself in week 2.</p>
<p>You asked about a particular system you use at work. This site is public, so the answer about that system, with what its code actually does, is in your work notebook instead.</p>

<h3>What to remember</h3>
<ul>
<li>A bit is one switch. A byte is 8 bits. An <code>int</code> is 4 bytes.</li>
<li>Memory is a long row of numbered byte cells.</li>
<li>Everything is stored as numbers. The type says how to read them.</li>
<li>A byte has 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 patterns. Each half of a byte is one hex digit, so a byte is two: 65 is 41.</li>
<li>A pixel is three bytes: red, green and blue.</li>
<li><code>double</code> stores decimals approximately. For money use whole paise in a <code>long</code>, <code>BigDecimal</code> in Java, or <code>DECIMAL</code> in a database, and do the sums in that exact form too.</li>
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
