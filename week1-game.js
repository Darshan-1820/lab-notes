// Week 1: build a small fighting game. Each mission adds one thing to play/week1-game/Game.java.
//
// Block types the app understands:
//   say      short text
//   code     a code sample to read
//   run      a button that runs a file and shows what it printed
//   try      an experiment, usually breaking something on purpose
//   predict  guess what code prints before seeing the answer
//   stepper  walk through code one line at a time, watching the boxes change
//   task     the thing to build; checked by running the file
//   deeper   optional, folded away: how it really works underneath

(function () {
  const GAME = 'week1-game/Game.java';

  // helpers for checks. r = { ok, timedOut, lines, stdout, stderr, src }
  const has = (r, line) => r.lines.includes(line);
  const inOrder = (r, wanted) => {
    let at = -1;
    for (const line of wanted) {
      at = r.lines.indexOf(line, at + 1);
      if (at < 0) return false;
    }
    return true;
  };
  const count = (text, piece) => text.split(piece).length - 1;
  const ran = { label: 'The program runs without errors', test: r => r.ok };

  window.WEEK = {
    id: 'week1-game',
    title: 'Week 1: The Arena',
    blurb: 'You build a fighting game from an empty file. By the last mission the fight runs by itself until someone falls.',
    missions: [
      // ------------------------------------------------------------------
      {
        id: 'w1m1',
        title: 'Make it speak',
        skill: 'Printing',
        blocks: [
          { t: 'say', html: 'Every game you have played started as a text file. Yours is <b>play/week1-game/Game.java</b>. Open it in VS Code now. It is five lines long.' },
          { t: 'run', file: GAME, html: 'Press Run. The app runs your file the same way a terminal would and shows what it printed.' },
          { t: 'say', html: 'Only line 3 does anything. <code>System.out.println("...")</code> means: show this text, then move to a new line. The text sits inside double quotes. The line ends with a semicolon, the way a sentence ends with a full stop.' },
          { t: 'try', file: GAME, html: '<b>Break it on purpose.</b> Delete the semicolon at the end of line 3, save the file, and press Run. Read the red message: it names the file, the line number and what is missing. Then put the semicolon back and run again.' },
          {
            t: 'task', file: GAME, xp: 50,
            html: 'A game needs a name and a hero. Change <b>Game.java</b> so it prints three lines, in this order:<ol><li>the name of your game (anything you like)</li><li><code>Hero: </code> followed by your hero\'s name</li><li><code>A monster appears.</code></li></ol>',
            checks: [
              ran,
              { label: 'It prints at least three lines', test: r => r.lines.length >= 3 },
              { label: 'Line 1 is your game\'s name', test: r => r.lines.length > 0 && !/^(Hero:|A monster)/.test(r.lines[0]) },
              { label: 'Line 2 starts with "Hero: " and a name', test: r => /^Hero: \S/.test(r.lines[1] || '') },
              { label: 'Line 3 is "A monster appears."', test: r => r.lines[2] === 'A monster appears.' },
            ],
            hints: [
              'Each line of output needs its own System.out.println(...) instruction.',
              'Instructions run from top to bottom. The order you write them is the order they print.',
              'The two new lines go above the monster line, inside the same curly braces.',
            ],
          },
          { t: 'say', html: 'The computer ran your three instructions from top to bottom, one at a time. That is all a program is: instructions, in order. Everything else you will learn is a way of deciding <i>which instruction runs next</i>.' },
          {
            t: 'deeper', title: 'What really happened when you pressed Run?',
            html: '<ol><li><b>Check.</b> Java read the whole file and checked every line against the rules of the language. This is where your missing semicolon was caught. Nothing had run yet, which is why even the correct lines printed nothing.</li><li><b>Translate.</b> The file was turned into a compact form called bytecode, which is not readable by people.</li><li><b>Run.</b> A program called the Java Virtual Machine (JVM) started, found the part named <code>main</code>, and carried out the instructions inside it one by one.</li></ol><p><code>main</code> is the door the JVM walks in through. The <code>public class Game { ... }</code> wrapper around it is required in every Java file. Treat it as the box your instructions live in for now. In week 4 you will write your own classes and it will stop being a mystery.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m2',
        title: 'Give them a life bar',
        skill: 'Variables',
        blocks: [
          { t: 'say', html: 'Your game cannot remember anything yet. A monster with 60 health needs somewhere to keep that 60.' },
          { t: 'code', code: 'int monsterHp = 60;' },
          { t: 'say', html: 'This makes a <b>box</b> in the computer\'s memory, called a variable.<ul><li><code>int</code>: the box holds a whole number.</li><li><code>monsterHp</code>: the label on the box. You choose it.</li><li><code>= 60</code>: put 60 in the box.</li></ul>Step through the next example and watch the boxes.' },
          {
            t: 'stepper',
            code: [
              'int heroHp = 100;',
              'int monsterHp = 60;',
              'System.out.println("Hero HP: " + heroHp);',
              'System.out.println(heroHp);',
              'System.out.println("heroHp");',
            ],
            steps: [
              { line: 0, vars: { heroHp: 100 }, out: [], note: 'A box labelled heroHp is created and 100 goes in.' },
              { line: 1, vars: { heroHp: 100, monsterHp: 60 }, out: [], note: 'A second box. Memory now holds two values.' },
              { line: 2, vars: { heroHp: 100, monsterHp: 60 }, out: ['Hero HP: 100'], note: 'Text + box: Java reads the box and glues its value onto the text.' },
              { line: 3, vars: { heroHp: 100, monsterHp: 60 }, out: ['Hero HP: 100', '100'], note: 'No quotes: print what is inside the box.' },
              { line: 4, vars: { heroHp: 100, monsterHp: 60 }, out: ['Hero HP: 100', '100', 'heroHp'], note: 'With quotes: print the word itself. The box is never looked at.' },
            ],
          },
          {
            t: 'task', file: GAME, xp: 50,
            html: 'Add two boxes to <b>Game.java</b>, after your monster line: <code>heroHp</code> holding 100 and <code>monsterHp</code> holding 60. Then print:<pre>Hero HP: 100\nMonster HP: 60</pre><b>Rule:</b> the numbers 100 and 60 may each appear only once in your file, where you fill the box. The print lines must read the boxes.',
            checks: [
              ran,
              { label: 'There is a box: int heroHp = 100', test: r => /\bint\s+heroHp\s*=\s*100\s*;/.test(r.src) },
              { label: 'There is a box: int monsterHp = 60', test: r => /\bint\s+monsterHp\s*=\s*60\s*;/.test(r.src) },
              { label: 'It prints "Hero HP: 100"', test: r => has(r, 'Hero HP: 100') },
              { label: 'It prints "Monster HP: 60"', test: r => has(r, 'Monster HP: 60') },
              { label: '100 and 60 each appear only once in the file', test: r => count(r.src, '100') === 1 && count(r.src, '60') === 1 },
            ],
            hints: [
              'Glue text and a box together with a plus sign: "Hero HP: " + heroHp',
              'The space after the colon has to be inside the quotes, or the output will read "Hero HP:100".',
              'Create the box on one line, then print it on a later line. A box must exist before you can read it.',
            ],
          },
          { t: 'say', html: 'You wrote 100 once, and the print line found it by name. Change the 100 to 250 and run it: the output follows. That is the point of a variable. One place to change, and every line that reads the box changes with it. Set it back to 100 before you go on.' },
          { t: 'try', file: GAME, html: '<b>How big can the box get?</b> Set <code>heroHp</code> to <code>2147483647</code> and run. Fine so far. Now change the print line to print <code>heroHp + 1</code>, in round brackets like this: <code>"Hero HP: " + (heroHp + 1)</code>. Run it and look at the number. Then put everything back to 100.' },
          {
            t: 'deeper', title: 'Why did the biggest number plus one turn negative?',
            html: '<p>An <code>int</code> box is made of 32 tiny switches, each either off or on. With 32 switches there are only so many patterns, and the largest number they can show is 2,147,483,647.</p><p>Add one more and the pattern rolls over, the way an old car\'s distance counter rolls from 999999 to 000000. In Java the roll-over lands on the most negative number, -2,147,483,648. Java does not warn you. It just carries on with the wrong value.</p><p>This has happened in public. In 2014 a YouTube video passed 2,147,483,647 views, more than the counter was built to hold, and YouTube had to switch to a bigger box. Java has a bigger box too, called <code>long</code>, which uses 64 switches and holds numbers up to about 9 quintillion. Systems that count money use boxes like that for exactly this reason.</p><p>Want to see the switches and flip them yourself? Open <b>Notes</b> at the top of the list on the left.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m3',
        title: 'First blood',
        skill: 'Arithmetic, changing a box',
        blocks: [
          { t: 'say', html: 'A box can be refilled. Before you make the hero attack, predict this one. Do it in your head, no running.' },
          {
            t: 'predict', xp: 10, answer: '30',
            code: 'int coins = 10;\ncoins = coins + 5;\ncoins = coins * 2;\nSystem.out.println(coins);',
          },
          {
            t: 'stepper',
            code: ['int coins = 10;', 'coins = coins + 5;', 'coins = coins * 2;', 'System.out.println(coins);'],
            steps: [
              { line: 0, vars: { coins: 10 }, out: [], note: 'The box is created holding 10.' },
              { line: 1, vars: { coins: 15 }, out: [], note: 'Right side first: read coins (10), add 5, get 15. Then store 15 back into coins. The 10 is gone.' },
              { line: 2, vars: { coins: 30 }, out: [], note: 'Right side first: read coins (15), times 2, get 30. Store it.' },
              { line: 3, vars: { coins: 30 }, out: ['30'], note: 'Print what the box holds now.' },
            ],
          },
          { t: 'say', html: 'The <code>=</code> sign does not mean "equals". It means: <b>work out the right side, then store the answer in the box on the left.</b> That is why <code>coins = coins + 5</code> makes sense in a program even though it would be nonsense in a maths class.<br><br>Signs you can use: <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide.' },
          {
            t: 'task', file: GAME, xp: 50,
            html: 'The hero attacks. Add to the end of <b>Game.java</b>:<ol><li>a box <code>damage</code> holding 25</li><li>a line that prints <code>Hero hits for 25</code> (read the box)</li><li>a line that takes <code>damage</code> out of <code>monsterHp</code></li><li>a line that prints the monster\'s HP again</li></ol>The end of your output should read:<pre>Monster HP: 60\nHero hits for 25\nMonster HP: 35</pre><b>Rule:</b> the number 35 must not appear anywhere in your file. The computer does the subtraction.',
            checks: [
              ran,
              { label: 'There is a box: int damage = 25', test: r => /\bint\s+damage\s*=\s*25\s*;/.test(r.src) },
              { label: 'It prints the three lines in order', test: r => inOrder(r, ['Monster HP: 60', 'Hero hits for 25', 'Monster HP: 35']) },
              { label: 'The number 35 is not in your file', test: r => !r.src.includes('35') },
              { label: '25 appears only once in your file', test: r => count(r.src, '25') === 1 },
            ],
            hints: [
              'To change a box: its name on the left, the new value on the right.',
              'The new value is the old value minus the damage: monsterHp = monsterHp - damage;',
              'You print the monster\'s HP twice: once before the hit (already there) and once after it.',
            ],
          },
          { t: 'say', html: 'You have the same print line twice and it printed two different things, because the box changed in between. What a program does depends on what is in its boxes at that moment. Most debugging comes down to one question: <i>what is in the box right now?</i>' },
          {
            t: 'deeper', title: 'A shortcut, and a trap with division',
            html: '<p><code>monsterHp -= damage;</code> means exactly the same as <code>monsterHp = monsterHp - damage;</code>. There is also <code>+=</code>, <code>*=</code> and <code>/=</code>. Use whichever you read more easily.</p><p>The trap: add <code>System.out.println(7 / 2);</code> to your file and run it. You get 3, not 3.5. Whole-number boxes throw the leftover away. The leftover has its own sign: <code>7 % 2</code> gives 1. You will use <code>%</code> a lot later, for questions like "is this number even?". Remove the line when you are done.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m4',
        title: 'Bug hunt: the broken shop',
        skill: 'Reading errors',
        blocks: [
          { t: 'say', html: 'Someone else wrote a shop for the game and it is broken in <b>five</b> places. Open <b>play/week1-game/BugHunt1.java</b>.<br><br>Three of the bugs stop it from running at all. Java will point at those. The other two let it run and print the wrong thing. Java will say nothing about those. You find them by knowing what the output should be.' },
          { t: 'say', html: 'Fix one bug, run, read, repeat. Do not try to fix everything in one go.' },
          {
            t: 'task', file: 'week1-game/BugHunt1.java', xp: 80,
            html: 'Make <b>BugHunt1.java</b> print exactly this:<pre>Gold: 40\nYou buy a sword.\nGold left: 15</pre><b>Rule:</b> the number 15 must not appear in the file.',
            checks: [
              ran,
              { label: 'It prints exactly the three expected lines', test: r => r.lines.join('|') === 'Gold: 40|You buy a sword.|Gold left: 15' },
              { label: 'The number 15 is not in the file', test: r => !r.src.includes('15') },
            ],
            hints: [
              'Java reports the first problem it meets. Fix that one and run again to see the next.',
              'Java treats capital and small letters as different. swordPrice and swordprice are two different names.',
              'If it runs but the gold goes up after buying, look at the sign in the line that changes gold.',
              'Text in quotes is printed as it is. If the output shows a word where a number should be, something is in quotes that should not be.',
            ],
          },
          { t: 'say', html: 'There are two kinds of bug. The first kind breaks the rules of the language, and Java catches it before anything runs. The second kind follows every rule and still does the wrong thing. Only you can catch that kind, by comparing what happened with what you expected. This is why you predict before you run.' },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m5',
        title: 'Is it dead yet?',
        skill: 'Decisions: if and else',
        blocks: [
          { t: 'say', html: 'So far every line runs every time. A game has to decide things. Did the monster survive that hit?' },
          { t: 'code', code: 'if (monsterHp > 0) {\n    System.out.println("The monster is still standing.");\n} else {\n    System.out.println("The monster falls. You win!");\n}' },
          { t: 'say', html: 'The part in round brackets is a question with a yes or no answer. Yes: the first block runs. No: the <code>else</code> block runs. Never both.<br><br>Questions you can ask: <code>&gt;</code> greater than, <code>&lt;</code> less than, <code>&gt;=</code> at least, <code>&lt;=</code> at most, <code>==</code> exactly equal, <code>!=</code> not equal.' },
          {
            t: 'predict', xp: 10, answer: 'dead',
            code: 'int hp = 20;\nint damage = 20;\nhp = hp - damage;\nif (hp > 0) {\n    System.out.println("alive");\n} else {\n    System.out.println("dead");\n}',
          },
          { t: 'say', html: 'The box held exactly 0, and 0 is not greater than 0, so the answer was no. Values sitting right on the edge of a question are where most mistakes with <code>if</code> happen. Always test the edge.' },
          {
            t: 'task', file: GAME, xp: 50,
            html: 'Add the decision to the end of <b>Game.java</b>, after the hit. If the monster has more than 0 HP print <code>The monster is still standing.</code> Otherwise print <code>The monster falls. You win!</code><br><br>With damage at 25 the monster survives, so your output should end with:<pre>Monster HP: 35\nThe monster is still standing.</pre>',
            checks: [
              ran,
              { label: 'Your file uses if and else', test: r => /\bif\s*\(/.test(r.src) && /\belse\b/.test(r.src) },
              { label: 'Both messages are written in your file', test: r => r.src.includes('The monster is still standing.') && r.src.includes('The monster falls. You win!') },
              { label: 'The output ends with "The monster is still standing."', test: r => r.lines[r.lines.length - 1] === 'The monster is still standing.' },
              { label: 'It does not also print the win message', test: r => !has(r, 'The monster falls. You win!') },
            ],
            hints: [
              'The decision has to come after the line that subtracts the damage. Otherwise it judges the old value.',
              'The question goes in round brackets, and each block of lines goes in its own curly braces.',
              'Look at the sample above this task: your code has the same shape.',
            ],
          },
          { t: 'try', file: GAME, html: '<b>Now take the other path.</b> Change <code>damage</code> to 80 and run. The other message should print, and the monster\'s HP goes negative. Then try 60, the exact edge. Which message do you expect before you run it? Set damage back to 25 when you are done.' },
          {
            t: 'deeper', title: 'One equals sign or two?',
            html: '<p><code>=</code> stores a value. <code>==</code> asks whether two values are the same. Mixing them up is one of the oldest mistakes in programming.</p><p>Try it: change your question to <code>if (monsterHp = 0)</code> and run. Java refuses, because the round brackets need a yes or no and you gave it a number. Some other languages accept that line and quietly do the wrong thing, which has caused real bugs for decades. Change it back afterwards.</p><p>The yes or no answer is a value too. It can live in its own kind of box: <code>boolean alive = monsterHp &gt; 0;</code> The box holds either <code>true</code> or <code>false</code>, and you can write <code>if (alive)</code>.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m6',
        title: 'Fight to the end',
        skill: 'Loops: while',
        blocks: [
          { t: 'say', html: 'One hit is not a fight. You could copy the hit lines three times. Then the monster gets 600 HP and you need 24 copies. What you want to say is: <b>keep doing this until the monster is down.</b>' },
          { t: 'code', code: 'while (monsterHp > 0) {\n    // the lines in here repeat\n}' },
          { t: 'say', html: 'A <code>while</code> is an <code>if</code> that goes back to the top and asks again. As long as the answer is yes, the block runs once more. When the answer is no, the program carries on below the closing brace.' },
          {
            t: 'predict', xp: 10, answer: '3\n2\n1\nGo!',
            code: 'int n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n = n - 1;\n}\nSystem.out.println("Go!");',
          },
          {
            t: 'stepper',
            code: ['int n = 3;', 'while (n > 0) {', '    System.out.println(n);', '    n = n - 1;', '}', 'System.out.println("Go!");'],
            steps: [
              { line: 0, vars: { n: 3 }, out: [], note: 'The box starts at 3.' },
              { line: 1, vars: { n: 3 }, out: [], note: 'Is 3 greater than 0? Yes. Go inside.' },
              { line: 2, vars: { n: 3 }, out: ['3'], note: 'Print the box.' },
              { line: 3, vars: { n: 2 }, out: ['3'], note: 'The box drops to 2. This line is what will eventually end the loop.' },
              { line: 1, vars: { n: 2 }, out: ['3'], note: 'Back to the top. Is 2 greater than 0? Yes.' },
              { line: 2, vars: { n: 2 }, out: ['3', '2'], note: 'Print.' },
              { line: 3, vars: { n: 1 }, out: ['3', '2'], note: 'Drop to 1.' },
              { line: 1, vars: { n: 1 }, out: ['3', '2'], note: 'Is 1 greater than 0? Yes.' },
              { line: 2, vars: { n: 1 }, out: ['3', '2', '1'], note: 'Print.' },
              { line: 3, vars: { n: 0 }, out: ['3', '2', '1'], note: 'Drop to 0.' },
              { line: 1, vars: { n: 0 }, out: ['3', '2', '1'], note: 'Is 0 greater than 0? No. Skip the block.' },
              { line: 5, vars: { n: 0 }, out: ['3', '2', '1', 'Go!'], note: 'The program carries on after the closing brace.' },
            ],
          },
          {
            t: 'task', file: GAME, xp: 70,
            html: 'Turn the single hit into a fight. The hero keeps hitting until the monster\'s HP is 0 or less. Each round, print the round number, the hit and the monster\'s HP. After the loop, print the win message.<br><br>With <code>monsterHp</code> at 60 and <code>damage</code> at 25, the output after your first three lines should be:<pre>Hero HP: 100\nMonster HP: 60\nRound 1\nHero hits for 25\nMonster HP: 35\nRound 2\nHero hits for 25\nMonster HP: 10\nRound 3\nHero hits for 25\nMonster HP: -15\nThe monster falls. You win!</pre><b>Rule:</b> the words <code>Hero hits for</code> may appear only once in your file. The loop does the repeating.',
            checks: [
              { label: 'The program stops by itself (no endless loop)', test: r => !r.timedOut },
              ran,
              { label: 'Your file uses while', test: r => /\bwhile\s*\(/.test(r.src) },
              { label: 'Round 1 is right', test: r => inOrder(r, ['Monster HP: 60', 'Round 1', 'Hero hits for 25', 'Monster HP: 35']) },
              { label: 'Rounds 2 and 3 are right', test: r => inOrder(r, ['Round 2', 'Hero hits for 25', 'Monster HP: 10', 'Round 3', 'Hero hits for 25', 'Monster HP: -15']) },
              { label: 'The fight stops after round 3', test: r => !r.lines.some(l => l.startsWith('Round 4')) },
              { label: 'The last line is "The monster falls. You win!"', test: r => r.lines[r.lines.length - 1] === 'The monster falls. You win!' },
              { label: '"Hero hits for" appears only once in your file', test: r => count(r.src, 'Hero hits for') === 1 },
            ],
            hints: [
              'You need a new box for the round number. It starts at 1 and grows by 1 each time round.',
              'Three things belong inside the curly braces of the while: print the round, do the hit, print the HP.',
              'The win message goes after the closing brace of the loop. The loop only ends when the monster is down, so if the program gets there, the hero has won.',
              'You no longer need the if and else from the last mission. The while question does that job now.',
            ],
          },
          { t: 'say', html: 'You wrote the hit once and the computer ran it three times. Change <code>monsterHp</code> to 600 and run it: 24 rounds, with no new code. Set it back to 60 afterwards.' },
          { t: 'try', file: GAME, html: '<b>Break it: the fight that never ends.</b> Delete the line that subtracts the damage and run. The monster never loses HP, so the question is always yes. The app cuts the program off after 10 seconds. In a terminal you stop a runaway program with <b>Ctrl + C</b>. Put the line back.' },
          {
            t: 'deeper', title: 'A monster with -15 HP?',
            html: '<p>Negative health looks wrong. The program is doing exactly what you told it: 10 minus 25 is -15. Whether that is a bug depends on what you want the game to show.</p><p>If you want it to show 0, you already have the tool. Think about where an <code>if</code> would go and what question it would ask. This is not checked. Try it if you are curious.</p><p>Loops are also where programs spend nearly all of their time. A program that feels slow almost always has a loop that runs more times than it needs to. Counting how many times a loop runs is the start of a whole subject, and you will get to it in week 3.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m7',
        title: 'Challenge: the potion problem',
        skill: 'Everything so far, no help',
        blocks: [
          { t: 'say', html: 'This one is against the clock and has <b>no hints</b>. No AI. Try not to look back at Game.java. It is a new problem, so there is nothing to copy.<br><br>You write it in <b>play/week1-game/Challenge1.java</b>, which is empty apart from the wrapper. Read the problem first. The clock starts when you press Start.' },
          {
            t: 'task', file: 'week1-game/Challenge1.java', xp: 100, timed: true, parSeconds: 1200,
            html: 'A hero has <b>20 HP</b> and finds <b>3 potions</b>. Each potion heals <b>30 HP</b>, but HP can never go above <b>100</b>. Drink the potions one at a time, in a loop, and print the HP after each one:<pre>Potion 1: HP 50\nPotion 2: HP 80\nPotion 3: HP 100</pre><b>Rules:</b> use a loop. The numbers 50 and 80 must not appear in your file.<br><br><b>Bonus (+30 XP):</b> the third potion heals more than the hero can hold. Add one last line that says how many HP were wasted: <code>Wasted: 10</code>. The number 10 must come from your boxes, not be typed in.',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              ran,
              { label: 'Your file uses a loop', test: r => /\b(while|for)\s*\(/.test(r.src) },
              { label: 'It prints the three potion lines in order', test: r => inOrder(r, ['Potion 1: HP 50', 'Potion 2: HP 80', 'Potion 3: HP 100']) },
              { label: 'It drinks exactly three potions', test: r => r.lines.filter(l => l.startsWith('Potion')).length === 3 },
              { label: 'The numbers 50 and 80 are not in your file', test: r => !r.src.includes('50') && !r.src.includes('80') },
            ],
            bonus: { label: 'Bonus: last line is "Wasted: 10", worked out by the program', xp: 30, test: r => r.lines[r.lines.length - 1] === 'Wasted: 10' && !r.src.replace(/100/g, '').includes('10') },
            hints: [],
          },
          { t: 'say', html: 'That was variables, arithmetic, a decision and a loop working together, on a problem you had not seen. Passing it today means you can do it with the lesson fresh in your head.<br><br>It does not count as <b>mastered</b> yet. That takes solving a new problem like this, unaided, on a later day. Your tutor will set a rematch.<br><br>This is the end of the first stretch of week 1. Open Claude Code in the <b>engineering-lab</b> folder and say <b>"next"</b>. Your tutor can already see everything you did here.' },
        ],
      },
    ],
  };
})();
