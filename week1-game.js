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
//   callstack  like stepper, for code that calls methods: steps carry frames[] (one per call)
//   deeper   optional, folded away: how it really works underneath
//
// A say/try/deeper block may contain a widget from app/web/widgets.js, e.g. <div data-widget="dice" ...>.
// A try or run block may set stdin (text fed to the program as if typed).
//
// A task normally runs the file once. With runs: [{ name, stdin }] it runs once per entry, feeding
// stdin as typed input, and every check must pass on every run. Checks see r = { ok, timedOut,
// lines, stdout, stderr, src, input } where input is that run's typed words. A check may carry
// why: r => 'one sentence', shown under it when it fails. across: [{ label, test: rs => ... }]
// compares all the runs with each other. One input is weak evidence: prefer several.

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

  // ---- the fight, checked line by line (missions 8 to 11) ----
  // Rules of each stage. inputs (the typed moves) are added per run for the missions that read them.
  const M8 = { hero: 50, monster: 75, heroRange: [25, 25], monsterRange: [20, 20] };
  const M9 = { hero: 100, monster: 100, heroRange: [10, 30], monsterRange: [5, 25] };
  const M10 = { hero: 100, monster: 100, heroRange: [10, 30], monsterRange: [5, 25], potions: 3, heal: 30, maxHp: 100 };

  const FIGHT_LINE = /^(Round \d+|Hero hits for -?\d+|Monster hits for -?\d+|Hero HP: -?\d+|Monster HP: -?\d+|Hero drinks a potion|No potions left\.|Not a move\.|The monster falls\. You win!|The hero falls\. You lose\.)$/;

  // Walks through what the program printed and follows the fight with its own copy of the two HP
  // boxes. Returns '' when every line is right, or one sentence about the first line that is not.
  // Lines that are not part of the fight (a title, the "Your move" question) are ignored.
  // An HP that went below zero may be shown as it is or as 0.
  function fightProblem(r, o) {
    const ev = r.lines.map(l => l.replace(/^Your move[^:]*:\s*/, '').trim()).filter(l => FIGHT_LINE.test(l));
    let at = 0, round = 0;
    const where = () => (round ? 'In round ' + round + ': ' : 'Before round 1: ');
    const take = (re, what) => {
      if (at >= ev.length) return { bad: where() + 'the output ended, but ' + what + ' should come next.' };
      const mt = ev[at].match(re);
      if (!mt) return { bad: where() + 'expected ' + what + ', but the next line is "' + ev[at] + '".' };
      at++;
      return { n: mt[1] === undefined ? 0 : Number(mt[1]) };
    };
    const shows = (shown, real) => shown === real || (real < 0 && shown === 0);
    let h = o.hero, m = o.monster, potions = o.potions || 0, t;

    t = take(/^Hero HP: (-?\d+)$/, 'the line "Hero HP: ' + h + '"'); if (t.bad) return t.bad;
    if (t.n !== h) return 'The hero should start with ' + h + ' HP, but the first HP line says ' + t.n + '.';
    t = take(/^Monster HP: (-?\d+)$/, 'the line "Monster HP: ' + m + '"'); if (t.bad) return t.bad;
    if (t.n !== m) return 'The monster should start with ' + m + ' HP, but its first HP line says ' + t.n + '.';

    while (h > 0 && m > 0) {
      round++;
      if (round > 400) return 'The fight went past 400 rounds.';
      const prev = round - 1;
      t = take(/^Round (\d+)$/, '"Round ' + round + '"');
      if (t.bad) { round = prev; return t.bad; }
      if (t.n !== round) return 'Expected "Round ' + round + '" but saw "Round ' + t.n + '".';
      const move = o.inputs ? o.inputs[round - 1] : '1';
      if (move === undefined) return 'The fight lasted longer than the list of typed moves.';
      if (move === '1') {
        t = take(/^Hero hits for (-?\d+)$/, '"Hero hits for ..." (the move typed was 1)'); if (t.bad) return t.bad;
        if (t.n < o.heroRange[0] || t.n > o.heroRange[1]) return where() + 'the hero hit for ' + t.n + ', which is outside ' + o.heroRange[0] + ' to ' + o.heroRange[1] + '.';
        const hit = t.n, before = m; m -= hit;
        t = take(/^Monster HP: (-?\d+)$/, 'the monster\'s HP after the hit'); if (t.bad) return t.bad;
        if (!shows(t.n, m)) return where() + 'the monster had ' + before + ' HP and was hit for ' + hit + ', so its HP should be ' + m + ', but the line says ' + t.n + '.';
      } else if (move === '2') {
        if (potions > 0) {
          t = take(/^Hero drinks a potion$/, '"Hero drinks a potion" (the move typed was 2)'); if (t.bad) return t.bad;
          potions--;
          const before = h; h = Math.min(o.maxHp, h + o.heal);
          t = take(/^Hero HP: (-?\d+)$/, 'the hero\'s HP after the potion'); if (t.bad) return t.bad;
          if (t.n !== h) return where() + 'the hero had ' + before + ' HP and drank a potion, so HP should be ' + h + ', but the line says ' + t.n + '.';
        } else {
          t = take(/^No potions left\.$/, '"No potions left." (the move typed was 2 and all ' + o.potions + ' potions are used)'); if (t.bad) return t.bad;
        }
      } else {
        t = take(/^Not a move\.$/, '"Not a move." (the move typed was ' + move + ')'); if (t.bad) return t.bad;
      }
      if (m > 0) {
        t = take(/^Monster hits for (-?\d+)$/, '"Monster hits for ..." (the monster is still alive)'); if (t.bad) return t.bad;
        if (t.n < o.monsterRange[0] || t.n > o.monsterRange[1]) return where() + 'the monster hit for ' + t.n + ', which is outside ' + o.monsterRange[0] + ' to ' + o.monsterRange[1] + '.';
        const hit = t.n, before = h; h -= hit;
        t = take(/^Hero HP: (-?\d+)$/, 'the hero\'s HP after the hit'); if (t.bad) return t.bad;
        if (!shows(t.n, h)) return where() + 'the hero had ' + before + ' HP and was hit for ' + hit + ', so HP should be ' + h + ', but the line says ' + t.n + '.';
      }
    }
    const ending = m <= 0 ? 'The monster falls. You win!' : 'The hero falls. You lose.';
    if (at >= ev.length) return 'After round ' + round + ' someone has fallen, so "' + ending + '" should come next, but the output ended.';
    if (ev[at] !== ending) return 'After round ' + round + ' the ' + (m <= 0 ? 'monster' : 'hero') + ' is down, so the next line should be "' + ending + '", but it is "' + ev[at] + '".';
    at++;
    if (at < ev.length) return 'The fight is over, but more lines follow the ending, starting with "' + ev[at] + '".';
    return '';
  }

  // ---- the shop (mission 12): works out the right output from the typed prices and compares ----
  function shopProblem(r, withBonus) {
    let gold = 100, items = 0, top = 0;
    const want = [];
    for (const word of r.input) {
      const price = Number(word);
      if (price === 0) break;
      if (gold >= price) { gold -= price; items++; if (price > top) top = price; want.push('Bought for ' + price + '. Gold left: ' + gold); }
      else want.push('Too expensive: ' + price);
    }
    want.push('Items: ' + items, 'Gold left: ' + gold);
    if (withBonus) want.push('Most expensive: ' + top);
    const got = r.lines.map(l => l.trim());
    for (let n = 0; n < want.length; n++) {
      if (got[n] !== want[n]) return 'Line ' + (n + 1) + ' should be "' + want[n] + '"' + (got[n] === undefined ? ', but the output ended.' : ', but it is "' + got[n] + '".');
    }
    const extra = got.slice(want.length);
    if (extra.length && !(!withBonus && extra.length === 1 && /^Most expensive: \d+$/.test(extra[0]))) return 'There is an unexpected extra line: "' + extra[0] + '".';
    return '';
  }


  window.WEEK = {
    id: 'week1-game',
    title: 'Week 1: The Arena',
    blurb: 'You build a fighting game from an empty file. First the fight runs by itself. Then the monster hits back, the dice decide, and you play it.',
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

      // ==================================================================
      // Second stretch: the fight becomes a game you play.
      // ==================================================================
      {
        id: 'w1m8',
        title: 'The monster hits back',
        skill: 'Two conditions: && (and)',
        blocks: [
          { t: 'say', html: 'Your monster has stood there taking hits. Now it fights back. Two boxes will change every round, and for the first time the fight can end in <b>two different ways</b>.' },
          { t: 'say', html: 'The loop should go on only while <b>both</b> fighters are alive. Java joins two questions with <code>&amp;&amp;</code>, read as "and". The joined question is yes only when both sides are yes.' },
          { t: 'code', code: 'while (heroHp > 0 && monsterHp > 0) {\n    // one round\n}' },
          {
            t: 'predict', xp: 10, answer: '-1 3',
            code: 'int a = 5;\nint b = 0;\nwhile (a > 0 && b < 3) {\n    a = a - 2;\n    b = b + 1;\n}\nSystem.out.println(a + " " + b);',
          },
          {
            t: 'stepper',
            code: ['int a = 5;', 'int b = 0;', 'while (a > 0 && b < 3) {', '    a = a - 2;', '    b = b + 1;', '}', 'System.out.println(a + " " + b);'],
            steps: [
              { line: 1, vars: { a: 5, b: 0 }, out: [], note: 'Two boxes.' },
              { line: 2, vars: { a: 5, b: 0 }, out: [], note: 'Is 5 > 0? Yes. Is 0 < 3? Yes. Both yes, so go inside.' },
              { line: 4, vars: { a: 3, b: 1 }, out: [], note: 'Both boxes change in the same round.' },
              { line: 2, vars: { a: 3, b: 1 }, out: [], note: 'Yes and yes. Go inside.' },
              { line: 4, vars: { a: 1, b: 2 }, out: [], note: 'Round two done.' },
              { line: 2, vars: { a: 1, b: 2 }, out: [], note: 'Yes and yes. Go inside.' },
              { line: 4, vars: { a: -1, b: 3 }, out: [], note: 'Round three done.' },
              { line: 2, vars: { a: -1, b: 3 }, out: [], note: 'Is -1 > 0? No. Is 3 < 3? No. This time both happen to be no, but one no is already enough to stop.' },
              { line: 6, vars: { a: -1, b: 3 }, out: ['-1 3'], note: 'After the loop you only know that at least one of the two questions is false. You do not know which.' },
            ],
          },
          { t: 'say', html: 'Remember the dead code you removed in lesson 6? After that loop there was only one way out, so asking again was pointless. This loop has <b>two</b> ways out. When the program gets past it, you no longer know who fell. Now the question after the loop is worth asking, and both answers can happen.' },
          {
            t: 'task', file: GAME, xp: 70,
            html: 'Change <b>Game.java</b> so the monster fights back.<ul><li>Start with <code>heroHp</code> at <b>50</b> and <code>monsterHp</code> at <b>75</b>. The hero hits for <b>25</b>. Add a new box for the monster\'s damage holding <b>20</b>.</li><li>Print the two starting HP lines before round 1.</li><li>Each round: the hero hits and the monster\'s HP is printed. Then, <b>only if the monster is still alive</b>, the monster hits and the hero\'s HP is printed.</li><li>The loop runs while both are alive.</li><li>After the loop, print <code>The monster falls. You win!</code> or <code>The hero falls. You lose.</code>, whichever is true.</li></ul>With those numbers the output from the HP lines onward must be:<pre>Hero HP: 50\nMonster HP: 75\nRound 1\nHero hits for 25\nMonster HP: 50\nMonster hits for 20\nHero HP: 30\nRound 2\nHero hits for 25\nMonster HP: 25\nMonster hits for 20\nHero HP: 10\nRound 3\nHero hits for 25\nMonster HP: 0\nThe monster falls. You win!</pre><b>Rule:</b> the words <code>Monster hits for</code> may appear only once in your file.',
            checks: [
              { label: 'The program stops by itself (no endless loop)', test: r => !r.timedOut },
              ran,
              { label: 'The loop question joins two conditions with &&', test: r => /while\s*\([^{]*&&[^{]*\)\s*\{/.test(r.src) },
              { label: 'The fight follows the rules, line by line', test: r => fightProblem(r, M8) === '', why: r => fightProblem(r, M8) },
              { label: 'The monster hits exactly twice (a dead monster cannot hit)', test: r => r.lines.filter(l => l === 'Monster hits for 20').length === 2 },
              { label: 'Both endings are written in your file', test: r => r.src.includes('The monster falls. You win!') && r.src.includes('The hero falls. You lose.') },
              { label: '"Monster hits for" appears only once in your file', test: r => count(r.src, 'Monster hits for') === 1 },
            ],
            hints: [
              'The monster needs its own damage box. Its hit works like the hero\'s hit, but it takes HP from the hero.',
              'Inside the loop, after the hero\'s hit, ask whether the monster is still alive. Only then let it hit. That is an if inside the while.',
              'The loop question needs both conditions joined with &&.',
              'After the loop, one if and one else decide which ending to print. Ask about the hero\'s HP or the monster\'s HP, either works.',
            ],
          },
          { t: 'try', file: GAME, html: '<b>Take the other ending.</b> Lower the hero\'s damage to 20 and run. Count the rounds before you look: who falls, and in which round? Put it back to 25 afterwards.' },
          { t: 'try', file: GAME, html: '<b>Break it: and becomes or.</b> Change <code>&amp;&amp;</code> to <code>||</code>, which means "or", and run with the damage at 25. The lab will cut it off after 10 seconds. Work out why the fight never ends, then change it back.' },
          {
            t: 'deeper', title: 'And, or, not, and a shortcut Java takes',
            html: '<p>There are three ways to build bigger questions out of small ones.</p><ul><li><code>a &amp;&amp; b</code> is true only when both are true.</li><li><code>a || b</code> is true when at least one is true.</li><li><code>!a</code> flips the answer: true becomes false.</li></ul><p>With <code>||</code> your loop kept going while <i>either</i> fighter was alive. The monster was down, the hero was not, so the answer stayed yes for ever.</p><p>Java is also lazy in a useful way. In <code>a &amp;&amp; b</code>, if <code>a</code> is false the answer is already known, so Java never looks at <code>b</code>. Programmers rely on this. <code>count != 0 &amp;&amp; total / count &gt; 5</code> is safe, because the division only happens when count is not zero.</p><p>The concept note for this lesson has two answers you can flip to see all three results change.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m9',
        title: 'Roll the dice',
        skill: 'Random numbers',
        blocks: [
          { t: 'say', html: 'Every fight so far ends the same way. Real games roll dice, so you cannot know the result before you play. Java has a tool for that, but it does not come switched on.' },
          { t: 'code', code: 'import java.util.Random;\n\npublic class Game {\n    public static void main(String[] args) {\n        Random dice = new Random();\n        int damage = dice.nextInt(21) + 10;\n    }\n}' },
          { t: 'say', html: 'Three new things.<ul><li><code>import java.util.Random;</code> goes on the <b>very first line</b>, above <code>public class Game</code>. It tells Java to load the Random tool. Without it you get "cannot find symbol".</li><li><code>Random dice = new Random();</code> makes one dice and puts it in a box called <code>dice</code>. Do this once, before the loop.</li><li><code>dice.nextInt(21)</code> rolls it.</li></ul>' },
          { t: 'say', html: '<code>nextInt(21)</code> gives one of <b>21</b> numbers, and it starts counting at <b>zero</b>: 0, 1, 2 and so on up to 20. It never gives 21. Adding 10 slides the whole range up, to 10 through 30.<br><br>The recipe is <code>dice.nextInt(how many values) + smallest value</code>. <b>Try it.</b> Change the two numbers, then roll 100 times and watch how evenly the rolls spread.<div data-widget="dice" data-key="m9-dice" data-n="21" data-k="10"></div>' },
          {
            t: 'task', file: GAME, xp: 70,
            runs: [{ name: 'Fight 1', stdin: '' }, { name: 'Fight 2', stdin: '' }, { name: 'Fight 3', stdin: '' }],
            html: 'Make every hit a dice roll.<ul><li>Both fighters start with <b>100</b> HP.</li><li>Each round the hero rolls a new damage from <b>10 to 30</b>.</li><li>Each time the monster hits, it rolls a new damage from <b>5 to 25</b>.</li><li>Everything else stays as it was: the same lines in the same order, the monster only hits while alive, and the right ending is printed.</li></ul>The lab runs your program three times. Each fight must follow the rules, and the three fights must not be identical.',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              ran,
              { label: 'Your file imports and uses Random', test: r => /import\s+java\.util\.Random\s*;/.test(r.src) && /\.nextInt\s*\(\s*[^)\s]/.test(r.src) },
              { label: 'The fight follows the rules, and every roll is inside its range', test: r => fightProblem(r, M9) === '', why: r => fightProblem(r, M9) },
              { label: 'The hero rolls again every round (not one roll reused)', test: r => { const hits = r.lines.filter(l => /^Hero hits for \d+$/.test(l)); return hits.length < 3 || new Set(hits).size > 1; } },
            ],
            across: [
              { label: 'The three fights are not identical', test: rs => new Set(rs.map(r => r.lines.join('|'))).size > 1 },
            ],
            hints: [
              'Make the dice once, above the loop. Roll it inside the loop, so each round gets a new number.',
              'Hero: 10 to 30 is 21 different values, starting at 10. Monster: 5 to 25 is also 21 values, starting at 5.',
              'The damage box now has to be refilled inside the loop, before the line that prints the hit.',
              'If Java says "cannot find symbol ... class Random", the import line is missing or is not the first line of the file.',
            ],
          },
          { t: 'try', file: GAME, html: '<b>Break the randomness.</b> Change <code>new Random()</code> to <code>new Random(7)</code> and press Run three times. Compare the fights. Then <b>save</b> (Ctrl + S) and press the big button of the task above ("Run and check", or "Run again" once you have passed). A red line at the top of the results names the check that fails; the check itself is listed last, under "Comparing the runs". Change it back to <code>new Random()</code> afterwards.' },
          {
            t: 'deeper', title: 'A computer cannot roll dice',
            html: '<p>A computer only follows instructions, and instructions give the same result every time. So it cannot produce a truly random number. What <code>Random</code> does is start from one number, called the <b>seed</b>, and push it through a fixed formula that scrambles it. Each result is fed back in to make the next one. The numbers look random, but they are completely decided by the seed. This is called <b>pseudo-random</b>.</p><p>That is what you saw with <code>new Random(7)</code>: same seed, same formula, same fight, on every computer in the world.</p><p>With plain <code>new Random()</code> Java picks the seed for you from things that keep changing, such as the clock counted in billionths of a second. So you get a different fight each run.</p><p>Fixed seeds are useful. A game can save one number and rebuild an entire world from it, and a tester can replay the exact fight that showed a bug.</p><p>They are also a danger. If someone can guess the seed, they can predict every "random" number. Anything secret, such as a one-time code or the keys inside a payment card, must not use <code>Random</code>. Java has a separate tool for that, <code>SecureRandom</code>, which collects real unpredictability from the machine.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m10',
        title: 'Your move',
        skill: 'Reading what the player types',
        blocks: [
          { t: 'say', html: 'So far you press Run and watch. A game needs a player. Your program is going to stop, wait for you to type a number, and act on it.' },
          { t: 'code', code: 'import java.util.Random;\nimport java.util.Scanner;\n\npublic class Game {\n    public static void main(String[] args) {\n        Scanner keys = new Scanner(System.in);\n        int choice = keys.nextInt();\n    }\n}' },
          { t: 'say', html: '<ul><li><code>import java.util.Scanner;</code> is a second import line, under the first.</li><li><code>Scanner keys = new Scanner(System.in);</code> makes a reader connected to the keyboard. Make it once, before the loop.</li><li><code>keys.nextInt()</code> waits until a whole number has been typed and Enter pressed, then hands that number back.</li></ul>' },
          {
            t: 'stepper',
            code: ['Scanner keys = new Scanner(System.in);', 'int a = keys.nextInt();', 'int b = keys.nextInt();', 'System.out.println(a + b);'],
            steps: [
              { line: 0, vars: { 'typed, not yet read': '4 9' }, out: [], note: 'Suppose the player has typed 4, Enter, 9, Enter. What was typed waits in a queue until the program asks for it.' },
              { line: 1, vars: { 'typed, not yet read': '9', a: 4 }, out: [], note: 'nextInt takes the first number out of the queue. Each number can be read only once.' },
              { line: 2, vars: { 'typed, not yet read': '(empty)', a: 4, b: 9 }, out: [], note: 'The second call takes the next one. The queue is now empty.' },
              { line: 3, vars: { 'typed, not yet read': '(empty)', a: 4, b: 9 }, out: ['13'], note: 'If the queue is empty and the keyboard is still open, nextInt simply waits for you to type.' },
            ],
          },
          { t: 'say', html: '<b>How to play your own game.</b> The lab cannot type for you, so play in VS Code: open the terminal (menu Terminal, New Terminal) and run<pre>java play/week1-game/Game.java</pre>When you press "Run and check" here, the lab plays <b>four scripted games</b> against your program, typing a prepared list of moves each time.' },
          {
            t: 'task', file: GAME, xp: 90,
            runs: [
              { name: 'Game 1: attack every turn', stdin: Array(80).fill('1').join('\n') + '\n' },
              { name: 'Game 2: four potions, then attack', stdin: ['2', '2', '2', '2'].concat(Array(80).fill('1')).join('\n') + '\n' },
              { name: 'Game 3: a move that does not exist', stdin: ['1', '7', '1', '0'].concat(Array(80).fill('1')).join('\n') + '\n' },
              { name: 'Game 4: potions only, never attack', stdin: Array(300).fill('2').join('\n') + '\n' },
            ],
            html: 'Let the player choose each round.<ul><li>Both fighters start with <b>100</b> HP. The hero has <b>3 potions</b>.</li><li>Each round, print <code>Round N</code>, then print the question <code>Your move (1 = attack, 2 = potion):</code> with <code>println</code>, then read a number.</li><li><b>1:</b> the hero hits for a roll of 10 to 30, as before.</li><li><b>2:</b> if a potion is left, print <code>Hero drinks a potion</code>, add <b>30</b> to the hero\'s HP but never above <b>100</b>, and print the hero\'s HP. If none is left, print <code>No potions left.</code></li><li><b>Anything else:</b> print <code>Not a move.</code></li><li>Then, if the monster is still alive, it hits for a roll of 5 to 25, as before. A wasted turn still gets hit.</li><li>The endings stay the same.</li></ul>A round where the hero drinks looks like this:<pre>Round 2\nYour move (1 = attack, 2 = potion):\nHero drinks a potion\nHero HP: 100\nMonster hits for 12\nHero HP: 88</pre>',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              { label: 'The program runs without errors', test: r => r.ok, why: r => /NoSuchElementException/.test(r.stderr) ? 'Your program asked for more moves than a whole game needs. Does the loop stop when someone falls?' : '' },
              { label: 'Your file uses a Scanner to read the move', test: r => /import\s+java\.util\.Scanner\s*;/.test(r.src) && /\.nextInt\s*\(\s*\)/.test(r.src) },
              { label: 'Every round does the move that was typed, and the numbers add up', test: r => fightProblem(r, Object.assign({ inputs: r.input }, M10)) === '', why: r => fightProblem(r, Object.assign({ inputs: r.input }, M10)) },
            ],
            hints: [
              'The move decides between three paths. That is an if, an else if and an else.',
              'You need a box that counts the potions left. Drinking one takes 1 away from it.',
              'Inside the potion path there is a second decision: is a potion left or not?',
              'You wrote the "never above 100" rule once already, in the potion challenge.',
            ],
          },
          { t: 'try', file: GAME, stdin: '', html: '<b>Break it: nobody at the keyboard.</b> Press Run here. This button gives your program no input at all. Read the red message and find the line of <i>your</i> file it names.' },
          {
            t: 'deeper', title: 'Where typed input really comes from',
            html: '<p>Your program does not read the keyboard directly. The operating system gives every program a channel called the <b>standard input</b>, which Java calls <code>System.in</code>. It is a queue of characters. Normally the keyboard feeds it. When the lab runs your program, a prepared list of moves feeds it. Your program cannot tell the difference, and that is why one program can be used by a person, tested by a script, or fed from a file.</p><p><code>System.in</code> hands over raw characters. If you type 25, what arrives is the character 2 and then the character 5. The <code>Scanner</code> gathers them and turns them into the number 25. The note on bits and bytes showed why a digit character and a number are different things in memory. This is where the conversion happens.</p><p>Two things can go wrong, and you have now seen the first:</p><ul><li>The queue is empty and nothing more will ever come. <code>nextInt</code> cannot wait for ever, so it stops the program with <code>NoSuchElementException</code>.</li><li>The player types a word where a number is expected. The Scanner cannot turn it into a number and stops the program with <code>InputMismatchException</code>.</li></ul><p>Real programs check their input before trusting it. Everything that comes from outside the program can be wrong, and a large share of security problems begin with input that nobody checked.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m11',
        title: 'Give the moves names',
        skill: 'Methods',
        blocks: [
          { t: 'say', html: 'Look at <code>main</code>. It is long, and two lines in it are almost the same: the hero\'s roll and the monster\'s roll. When you catch yourself writing the same idea twice, give it a name and write it once. A named block of code is called a <b>method</b>.' },
          { t: 'code', code: 'static int roll(Random dice, int low, int high) {\n    return dice.nextInt(high - low + 1) + low;\n}' },
          { t: 'say', html: 'Read it left to right.<ul><li><code>static</code>: needed for a method that <code>main</code> calls directly. Week 4 explains what it means. For now, always write it.</li><li><code>int</code>: the type of the answer this method gives back.</li><li><code>roll</code>: the name you call it by.</li><li><code>(Random dice, int low, int high)</code>: the <b>parameters</b>. These are boxes that get filled in by whoever calls the method.</li><li><code>return</code>: hands the answer back and ends the method.</li></ul>You use it like this: <code>int damage = roll(dice, 10, 30);</code>' },
          { t: 'say', html: '<b>Where it goes.</b> A method sits inside the class but <b>outside</b> <code>main</code>: after the closing brace of <code>main</code> and before the last closing brace of the file. A method written inside another method is an error.' },
          {
            t: 'predict', xp: 10, answer: '8 17',
            code: 'public class Demo {\n    static int twice(int n) {\n        return n * 2;\n    }\n\n    public static void main(String[] args) {\n        int a = twice(4);\n        int b = twice(a) + 1;\n        System.out.println(a + " " + b);\n    }\n}',
          },
          {
            t: 'callstack',
            code: ['static int twice(int n) {', '    return n * 2;', '}', '', 'public static void main(String[] args) {', '    int a = twice(4);', '    int b = twice(a) + 1;', '    System.out.println(a + " " + b);', '}'],
            steps: [
              { line: 5, frames: [{ name: 'main', vars: {} }], out: [], note: 'The program starts in main. To work out the right side, it must call twice(4). main pauses on this line.' },
              { line: 0, frames: [{ name: 'main', vars: {} }, { name: 'twice', vars: { n: 4 } }], out: [], note: 'A fresh set of boxes is made for this call and put on top. The 4 is copied into the parameter n.' },
              { line: 1, frames: [{ name: 'main', vars: {} }, { name: 'twice', vars: { n: 4 } }], out: [], note: 'return works out 4 * 2 and hands back 8.' },
              { line: 5, frames: [{ name: 'main', vars: { a: 8 } }], out: [], note: 'The call is over, so its boxes are thrown away. main carries on exactly where it paused, and stores the 8 in a.' },
              { line: 6, frames: [{ name: 'main', vars: { a: 8 } }], out: [], note: 'Another call. main pauses again.' },
              { line: 0, frames: [{ name: 'main', vars: { a: 8 } }, { name: 'twice', vars: { n: 8 } }], out: [], note: 'A brand new n. It has nothing to do with the n from the first call, which no longer exists.' },
              { line: 1, frames: [{ name: 'main', vars: { a: 8 } }, { name: 'twice', vars: { n: 8 } }], out: [], note: 'Hands back 16.' },
              { line: 6, frames: [{ name: 'main', vars: { a: 8, b: 17 } }], out: [], note: 'main adds 1 to the 16 and stores 17 in b.' },
              { line: 7, frames: [{ name: 'main', vars: { a: 8, b: 17 } }], out: ['8 17'], note: 'Printing is itself a method call, to println.' },
            ],
          },
          {
            t: 'task', file: GAME, xp: 90,
            runs: [
              { name: 'Game 1: attack every turn', stdin: Array(80).fill('1').join('\n') + '\n' },
              { name: 'Game 2: four potions, then attack', stdin: ['2', '2', '2', '2'].concat(Array(80).fill('1')).join('\n') + '\n' },
              { name: 'Game 3: a move that does not exist', stdin: ['1', '7', '1', '0'].concat(Array(80).fill('1')).join('\n') + '\n' },
              { name: 'Game 4: potions only, never attack', stdin: Array(300).fill('2').join('\n') + '\n' },
            ],
            html: 'Tidy <b>Game.java</b> with two methods. The game must play exactly as before.<ol><li>Add <code>static int roll(Random dice, int low, int high)</code>, which gives back a random number from <code>low</code> to <code>high</code>, both included. Use it for the hero\'s roll and for the monster\'s roll.</li><li>Add <code>static int heal(int hp)</code>, which gives back <code>hp</code> plus 30, but never more than 100. Use it when the hero drinks a potion.</li></ol><b>Rule:</b> after this, the dice may be rolled in only one place in your file: inside <code>roll</code>.',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              ran,
              { label: 'There is a method: static int roll(Random dice, int low, int high)', test: r => /static\s+int\s+roll\s*\(\s*Random\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'roll is used for both fighters', test: r => (r.src.match(/\broll\s*\(/g) || []).length >= 3 },
              { label: 'There is a method: static int heal(int hp)', test: r => /static\s+int\s+heal\s*\(\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'heal is used when the hero drinks', test: r => (r.src.match(/\bheal\s*\(/g) || []).length >= 2 },
              { label: 'The dice is rolled in only one place in the file', test: r => (r.src.match(/\.nextInt\s*\(\s*[^)\s]/g) || []).length === 1 },
              { label: 'The game still plays by the rules', test: r => fightProblem(r, Object.assign({ inputs: r.input }, M10)) === '', why: r => fightProblem(r, Object.assign({ inputs: r.input }, M10)) },
            ],
            hints: [
              'Put both methods after the closing brace of main, before the final closing brace of the file.',
              'Inside roll, the number of different values from low to high is high - low + 1.',
              'heal needs a decision: work out hp + 30, and if that is above 100, give back 100.',
              'A method cannot see the boxes in main. Anything it needs must be passed in as a parameter, which is why roll takes the dice.',
            ],
          },
          { t: 'try', file: GAME, stdin: Array(80).fill('1').join('\n') + '\n', html: '<b>Break it: forget the answer.</b> Delete the <code>return</code> line inside <code>heal</code>, run, and read what Java says. Put it back. Then call <code>roll(dice, 10)</code> with one number missing and read that message too. Put it back.' },
          {
            t: 'deeper', title: 'What a call costs, and a method that calls itself',
            html: '<p>Each call gets its own set of boxes, called a <b>frame</b>. Frames are piled up like plates: a new call goes on top, and when it returns it is taken off and the one underneath carries on. The pile is called the <b>call stack</b>.</p><p>Two things follow from that.</p><ul><li><b>Values are copied in.</b> When you call <code>heal(heroHp)</code>, the number in <code>heroHp</code> is copied into the parameter. Changing the parameter inside the method does nothing to <code>heroHp</code>. The only thing that comes back is what you <code>return</code>, and it is lost unless you store it: <code>heroHp = heal(heroHp);</code></li><li><b>A method\'s boxes do not outlive the call.</b> That is why a method cannot leave a result lying in one of its own boxes for main to pick up.</li></ul><p>The stack has a limit. Try this in <code>play/Scratch.java</code>: a method that calls itself and never stops.</p><pre>static int forever(int n) {\n    return forever(n + 1);\n}</pre><p>Call <code>forever(1)</code> from main and run it in the terminal. Every call adds a frame and none is ever removed, until Java gives up with <code>StackOverflowError</code>. A well-known programming website is named after this error.</p>',
          },
        ],
      },

      // ------------------------------------------------------------------
      {
        id: 'w1m12',
        title: 'Challenge: the shop',
        skill: 'Loops, decisions, input and a method, no help',
        blocks: [
          { t: 'say', html: 'The second timed challenge. <b>No hints</b>, no AI, and a new problem, so there is nothing to copy. You write it in <b>play/week1-game/Challenge2.java</b>, which is empty apart from the wrapper.<br><br>The lab will run your program several times with different lists of typed numbers, so a program that is right for only one list will not pass. The clock starts when you press Start.' },
          {
            t: 'task', file: 'week1-game/Challenge2.java', xp: 120, timed: true, parSeconds: 1500,
            runs: [
              { name: 'List 1', stdin: '30\n50\n40\n10\n0\n' },
              { name: 'List 2: nothing wanted', stdin: '0\n' },
              { name: 'List 3: exactly enough', stdin: '100\n1\n0\n' },
              { name: 'List 4', stdin: '150\n99\n2\n1\n5\n0\n' },
            ],
            html: 'A hero walks into a shop with <b>100 gold</b>. The player types the price of each item the hero wants, one number per line. Typing <b>0</b> means the hero is done.<ul><li>If the hero has enough gold for an item, buy it: take the price off the gold and print <code>Bought for P. Gold left: G</code></li><li>If not, print <code>Too expensive: P</code> and carry on.</li><li>After the 0, print <code>Items: N</code> and then <code>Gold left: G</code>.</li></ul>You must write and use this method, which answers yes or no:<pre>static boolean canAfford(int gold, int price)</pre>For the typed list 30, 50, 40, 10, 0 the output is:<pre>Bought for 30. Gold left: 70\nBought for 50. Gold left: 20\nToo expensive: 40\nBought for 10. Gold left: 10\nItems: 3\nGold left: 10</pre><b>Bonus (+40 XP):</b> add one last line, <code>Most expensive: P</code>, with the highest price the hero actually paid, or 0 if nothing was bought.',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              { label: 'The program runs without errors', test: r => r.ok, why: r => /NoSuchElementException/.test(r.stderr) ? 'Your program kept asking for numbers after the 0.' : '' },
              { label: 'There is a method: static boolean canAfford(int gold, int price)', test: r => /static\s+boolean\s+canAfford\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'canAfford is used', test: r => (r.src.match(/\bcanAfford\s*\(/g) || []).length >= 2 },
              { label: 'The output is right for this list', test: r => shopProblem(r, false) === '', why: r => shopProblem(r, false) },
            ],
            bonus: { label: 'Bonus: the last line is "Most expensive: P", right for every list', xp: 40, test: r => shopProblem(r, true) === '' },
            hints: [],
          },
          { t: 'say', html: 'That was a loop that ends on what the player types, a decision inside it, a count, and a method that answers yes or no, on a problem you had not seen. It also passed on four different lists, which is much stronger evidence than passing on one.<br><br>It still does not count as <b>mastered</b>. That takes a new problem, unaided, on a later day. Your tutor will set a rematch.<br><br>This is the end of week 1. Open Claude Code in the <b>engineering-lab</b> folder and say <b>"next"</b>.' },
        ],
      },
    ],
  };
})();
