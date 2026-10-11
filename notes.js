// Notes: answers to questions Darshan asked his tutor, saved so they are not lost in the terminal.
// Newest first. The tutor adds a note here whenever he asks about a concept.
//
// A note's html may contain a switch board:
//   <div data-widget="bits" data-key="unique-name" data-bits="8" data-signed="true"></div>
// The widgets are defined in app/web/widgets.js. After changing this file, republish the
// phone page (see CLAUDE.md, "Notes").

// Other widgets: intmem (a number in four memory cells), text (characters as numbers),
// rgb (one pixel), run (data-file="Scratch.java": a Run button for a file in play/).

window.NOTES = [
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
