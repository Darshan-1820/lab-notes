// Notes: answers to questions Darshan asked his tutor, saved so they are not lost in the terminal.
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
