// The clickable diagrams used inside notes, and the note card itself.
// Shared by the lab (index.html) and the phone site (app/notes-site/index.html).
//
//   Lab.noteCard(note)          -> an element showing one note
//   Lab.callstack(block, key)   -> the same, for code that calls methods (steps carry frames[])
//   Lab.marks                   -> read ticks, check-yourself results, section tags and questions:
//                                  configure({ sink, onChange }), isRead(id), counts(), sends(now),
//                                  markSent(keys), remove(key), pageTools(id, title, { read }), data(),
//                                  and for maths drills drill(id), saveDrill(id, p), addRound(r).
//                                  noteCard adds the controls itself unless opts.marks === false.
//   Lab.register(name, make)    -> add a widget from another file (math.js does this)
//   Lab.planView(plan, isDone)  -> the plan page (isDone(missionId) is optional, for ticks)
//   Lab.stepper(block, key)     -> a line-by-line walk-through of code (block has code[] and steps[])
//   Lab.hydrate(root, { run })  -> turns every [data-widget] inside root into a working diagram
//                                  run(file, outputElement) is optional; without it, "run" widgets
//                                  explain that they need the lab on the computer.
//
// Widgets (set with data-widget="..."):
//   bits    a row of switches. data-bits, data-key, and optionally data-signed="true",
//           data-mode="fraction" (+ data-target), data-meanings="true", data-start
//   intmem  type a whole number, see the four memory cells an int uses
//   text    type text, see the number and switches behind each character
//   rgb     three sliders, one pixel
//   run     a Run button for a file in play/ (data-file)
//   calc    two whole numbers and a sign, worked out the way Java does it
//   compound  the short ways to change a box (+=, -=, ++ ...)
//   dice    dice.nextInt(n) + k: the range, a roll button and how the rolls spread (data-n, data-k)
//   logic   two yes/no answers joined with &&, || and ! (data-a, data-b are the two questions)
//   callstack  a walk-through with one frame per method call: data-ref plus widgets: { name: { code, steps } }
//   compare two numbers with all six comparison questions answered live
//   loop    set monsterHp and damage, see how many times a while loop runs
//   flow    a message travelling between parties: data-ref="name" plus widgets: { name: { parties, steps } }
//   cardnum the digits of a card number: likely network, the BIN, and the Luhn check worked out live
//   stepper a walk-through inside a note: data-ref="name" plus widgets: { name: { code, steps } } on the note
//   patterns  how many patterns n switches make, doubling list + counts by "how many on" (data-n)
//   hexbyte   one byte as two halves of 4 switches = two hex digits, plus the grey it would be (data-start)
//   pixels    an 8 x 8 picture; tap a dot to see and change its three bytes
//   money     an amount stored as double / paise / DECIMAL / card-message field, and a running total (data-start)
//   iso8583   a card authorisation request and answer: message type, bitmap, fields, chip data (TLV)
//   apdu      the commands a terminal sends to a chip card, byte by byte
//   threeruns  the lesson 9 fight run three times with Java's exact Random: seed 7 vs new Random()
//   seedmachine  java.util.Random with Java's exact formula, one roll at a time (data-seed, data-n, data-k)
//   convert   pick from-type, to-type and a value: widening or narrowing, Java's message, the result (data-from, data-to, data-value)
//   gitplay   a pretend repo: buttons for edit/status/add/commit/diff/restore/log, three areas drawn, real Git messages
//   overflow  a byte/short/int/long box plus a number: the real answer, what Java stores, where it wraps (data-type, data-total, data-add)

(function () {
  const state = {};   // widget positions, kept while the page stays open

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, onClick) {
    const b = el('button', cls, esc(label));
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  const fmt = v => v.toLocaleString('en-US');
  const byteBits = v => v.toString(2).padStart(8, '0');

  const css = `
  .note h2 { margin: 0 0 2px; font-size: 24px; line-height: 1.25; text-wrap: balance; }
  .note h3 { margin: 26px 0 6px; font-size: 18px; }
  .note p { margin: 10px 0; }
  .note .asked { border-left: 4px solid var(--blue); padding: 6px 12px; margin: 12px 0 4px; background: var(--panel2); border-radius: 0 8px 8px 0; }
  .note { margin-bottom: 22px; }
  .bitsbox { background: var(--code); border: 1px solid var(--line); border-radius: 10px; padding: 14px; margin: 12px 0; min-width: 0; }
  .bits { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 46px)); gap: 6px; }
  .bitgroups { display: flex; flex-wrap: wrap; gap: 8px 14px; }
  .bitgroups .bits { grid-template-columns: repeat(8, 20px); gap: 3px; }
  .bitcell { text-align: center; min-width: 0; }
  .bit { width: 100%; height: 48px; padding: 0; font: 600 19px var(--mono, Consolas, monospace); }
  .bit.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .bit.neg { border-color: var(--bad); }
  .bit.neg.on { background: var(--bad); color: var(--on-bad, #fff); }
  .bitgroups .bit { height: 30px; font-size: 12px; border-radius: 4px; }
  .worth { font: 11px var(--mono, Consolas, monospace); color: var(--dim); margin-top: 3px; overflow-wrap: anywhere; }
  .bitinfo { margin-top: 12px; font-size: 18px; }
  .bitinfo b { font: 600 22px var(--mono, Consolas, monospace); overflow-wrap: anywhere; }
  .bitmsg { color: var(--warn); min-height: 26px; font-size: 15px; }
  .meanings { margin-top: 6px; display: grid; gap: 4px; font-size: 16px; }
  .meanings b { font-family: var(--mono, Consolas, monospace); }
  .swatch { display: inline-block; width: 46px; height: 22px; border-radius: 5px; border: 1px solid var(--line); vertical-align: middle; }
  .swatch.big { display: block; width: 100%; height: 90px; border-radius: 10px; }
  .wline { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; font-family: var(--mono, Consolas, monospace); }
  .wline input { background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font: 18px var(--mono, Consolas, monospace); width: 200px; max-width: 100%; }
  .cells { display: flex; gap: 8px; flex-wrap: wrap; }
  .cell { border: 2px solid var(--blue); border-radius: 8px; padding: 8px 10px; text-align: center; }
  .cell .addr { font-size: 12px; color: var(--dim); }
  .cell .pat { font: 600 17px var(--mono, Consolas, monospace); letter-spacing: 1px; margin: 4px 0; }
  .cell .val { font-size: 13px; color: var(--dim); }
  .charswrap { overflow-x: auto; }
  table.chars { border-collapse: collapse; width: 100%; }
  table.chars th, table.chars td { text-align: left; padding: 5px 8px; border-bottom: 1px solid var(--line); font-size: 15px; white-space: nowrap; }
  table.chars td { font-family: var(--mono, Consolas, monospace); }
  table.chars th { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--dim); }
  .rgbrow { display: grid; grid-template-columns: 52px minmax(0, 1fr) 34px 84px; gap: 8px; align-items: center; margin-top: 8px; font: 14px var(--mono, Consolas, monospace); }
  .rgbrow input { width: 100%; min-width: 0; }
  @media (max-width: 480px) { table.chars th, table.chars td { font-size: 12.5px; padding: 5px 4px; } table.chars th { font-size: 10px; letter-spacing: 0; } .cell .pat { font-size: 15px; } }
  .stepper .lines { background: var(--code); border: 1px solid var(--line); border-radius: 8px; padding: 8px 0; font: 15px/1.7 var(--mono, Consolas, monospace); overflow-x: auto; }
  .stepper .ln { padding: 0 14px; white-space: pre; border-left: 3px solid transparent; }
  .stepper .ln.on { background: color-mix(in srgb, var(--accent) 16%, transparent); border-left-color: var(--accent); }
  .stepper .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
  .stepper .grid > * { min-width: 0; }
  .stepper h4 { margin: 0 0 6px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--dim); }
  .boxes { display: flex; gap: 10px; flex-wrap: wrap; min-height: 62px; }
  .box { border: 2px solid var(--blue); border-radius: 8px; padding: 4px 12px; text-align: center; min-width: 76px; }
  .box .v { font: 600 20px var(--mono, Consolas, monospace); }
  .box .n { font: 13px var(--mono, Consolas, monospace); color: var(--dim); }
  .screen { background: var(--code); border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; min-height: 62px; font: 15px/1.5 var(--mono, Consolas, monospace); white-space: pre; overflow-x: auto; }
  .stepnote { margin-top: 10px; min-height: 52px; }
  .wline input[type=number] { width: 110px; }
  .ops { display: inline-flex; gap: 4px; flex-wrap: wrap; }
  .opbtn { padding: 6px 0; width: 40px; font: 600 18px var(--mono, Consolas, monospace); }
  button.mono { font-family: var(--mono, Consolas, monospace); padding: 8px 12px; }
  .note details { background: var(--panel2); border-radius: 8px; padding: 8px 12px; margin: 8px 0; }
  .note details summary { cursor: pointer; font-weight: 600; }
  .note table.plain { border-collapse: collapse; width: 100%; margin: 8px 0; }
  .note table.plain th, .note table.plain td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top; font-size: 15.5px; }
  .note table.plain th { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--dim); }
  .note .tablewrap { overflow-x: auto; }
  .note pre { background: var(--code); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; overflow-x: auto; font: 14.5px/1.5 var(--mono, Consolas, monospace); margin: 10px 0; white-space: pre; }
  .note .bad { color: var(--bad); }
  .note .yes { color: var(--accent); }
  .bitsbox pre { margin: 0 0 12px; background: transparent; border: 0; padding: 0; font: 15px/1.5 var(--mono, Consolas, monospace); white-space: pre; overflow-x: auto; }
  .flow .lane { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 6px; }
  .flow .party { border: 2px solid var(--line); border-radius: 8px; padding: 8px 1px; text-align: center; font-size: clamp(10.5px, 2.9vw, 13px); font-weight: 600; line-height: 1.2; overflow-wrap: anywhere; min-height: 52px; display: grid; place-items: center; }
  .flow .party.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .flow .track { position: relative; height: 46px; margin: 8px 0 4px; border-top: 2px dashed var(--line); }
  .flow .pill { position: absolute; top: 8px; transform: translateX(-50%); background: var(--blue); color: var(--bg); border-radius: 99px; padding: 3px 10px; font: 600 12.5px var(--mono, Consolas, monospace); white-space: nowrap; transition: left .7s ease; max-width: 96%; overflow: hidden; text-overflow: ellipsis; }
  @media (prefers-reduced-motion: reduce) { .flow .pill { transition: none; } }
  .flowwho { font: 12px var(--mono, Consolas, monospace); letter-spacing: 1px; text-transform: uppercase; color: var(--dim); }
  .flowtitle { font-weight: 700; font-size: 18px; margin: 2px 0 0; }
  .planwrap { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  .plan-h { margin: 0 0 6px; font-size: 21px; line-height: 1.25; }
  .plan-by { margin: 16px 0 4px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); }
  ul.ticks { list-style: none; padding: 0; margin: 0; }
  ul.ticks li { position: relative; padding: 4px 0 4px 30px; }
  ul.ticks li::before { content: ""; position: absolute; left: 2px; top: 9px; width: 16px; height: 16px; border: 2px solid var(--line); border-radius: 4px; }
  ul.ticks li.free::before { border-radius: 50%; }
  ul.ticks li.done { color: var(--dim); text-decoration: line-through; }
  ul.ticks li.done::before { background: var(--accent); border-color: var(--accent); }
  .track-row { padding: 9px 0; border-top: 1px solid var(--line); display: grid; gap: 2px; }
  .frames { display: flex; flex-direction: column; gap: 6px; }
  .frame { border: 2px solid var(--line); border-radius: 8px; padding: 6px 10px; opacity: .7; }
  .frame.top { border-color: var(--accent); opacity: 1; }
  .frame .fname { font: 600 13px var(--mono, Consolas, monospace); margin-bottom: 4px; }
  .frame .boxes { min-height: 0; }
  .dicebars { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 2px; height: 90px; align-items: end; margin-top: 12px; border-bottom: 2px solid var(--line); }
  .dicecol { height: 100%; display: flex; align-items: flex-end; background: color-mix(in srgb, var(--line) 35%, transparent); border-radius: 3px 3px 0 0; }
  .dicecol .bar { width: 100%; background: var(--blue); border-radius: 3px 3px 0 0; min-height: 0; }
  .dicecol.on { outline: 2px solid var(--accent); }
  .dicecol.on .bar { background: var(--accent); }
  .diceaxis { display: flex; justify-content: space-between; font: 13px var(--mono, Consolas, monospace); color: var(--dim); }
  .marksec { margin: 0 0 8px; font-size: 13.5px; }
  .markhead { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  button.marklink { background: none; border: 0; padding: 2px 0; color: var(--dim); font-size: 13.5px; text-decoration: underline dotted; text-underline-offset: 3px; font-weight: 400; border-radius: 3px; }
  .markchips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .markchip { display: inline-block; font-size: 13.5px; line-height: 1.3; padding: 4px 11px; border-radius: 99px; border: 1px solid var(--line); background: transparent; color: var(--text); }
  .markchip.on { background: color-mix(in srgb, var(--blue) 18%, transparent); border-color: var(--blue); }
  .marktext { color: var(--dim); font-style: italic; overflow-wrap: anywhere; min-width: 0; }
  textarea.markta { display: block; width: 100%; min-height: 66px; background: var(--code); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font: 15px/1.45 var(--sans, system-ui, sans-serif); resize: vertical; }
  .selfcheck { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line); font-size: 14px; color: var(--dim); }
  .selfcheck button { padding: 4px 12px; font-size: 14px; }
  .selfcheck button.got.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .selfcheck button.missed.on { background: var(--warn); color: var(--bg); border-color: var(--warn); }
  .pagetools { border-top: 1px solid var(--line); margin-top: 24px; padding-top: 14px; display: grid; gap: 8px; min-width: 0; }
  .pagelabel { font-weight: 600; font-size: 15px; }
  .pagetools .wrow { margin-top: 2px; }
  button.readbtn.on { background: transparent; color: var(--accent); border-color: var(--accent); font-weight: 600; }
  .readtick { color: var(--accent); font-weight: 700; }
  .cardnum .wline input { width: 260px; }
  .cardnum .samples { margin: 0 0 12px; gap: 6px; }
  .cardnum .samples button { font-size: 13.5px; padding: 5px 10px; }
  .cnlabel { font-size: 13px; color: var(--dim); margin: 12px 0 4px; }
  .cnrow { display: flex; flex-wrap: wrap; gap: 6px 12px; }
  .cng { display: inline-flex; gap: 3px; }
  .cn { display: inline-grid; place-items: center; width: 22px; height: 30px; border-radius: 4px; font: 600 15px var(--mono, Consolas, monospace); border: 1px solid var(--line); }
  .cn.bin { background: color-mix(in srgb, var(--blue) 26%, transparent); border-color: var(--blue); }
  .cn.bin8 { background: color-mix(in srgb, var(--blue) 10%, transparent); border-color: var(--blue); border-style: dashed; }
  .cn.chk { background: color-mix(in srgb, var(--accent) 24%, transparent); border-color: var(--accent); }
  .cn.dbl { outline: 2px solid var(--warn); outline-offset: -2px; }
  .cnkey { font-size: 13px; color: var(--dim); margin-top: 8px; line-height: 2.1; }
  .cnkey .cn { width: 14px; height: 14px; font-size: 0; vertical-align: middle; margin: 0 4px 0 8px; }
  .cnkey .cn:first-child { margin-left: 0; }
  .wrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
  .patgrid { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
  .patchip { font: 14px var(--mono, Consolas, monospace); padding: 3px 7px; border-radius: 5px; border: 1px solid var(--line); }
  .patchip.hi { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
  .patterns .dicecol { border: 0; padding: 0; }
  .hexhalves { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .hexhalf { border: 2px solid var(--blue); border-radius: 8px; padding: 6px 8px 8px; min-width: 0; }
  .hexhalf .bits { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
  .hexhalf .bit { height: 40px; font-size: 16px; }
  .hexdigit { margin-top: 6px; font-size: 14px; }
  .hexdigit b.big { font: 700 24px var(--mono, Consolas, monospace); color: var(--accent); }
  .hexdigits { display: flex; flex-wrap: wrap; gap: 3px; }
  .greyrow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 15px; }
  .greystrip { position: relative; height: 16px; border-radius: 4px; margin-top: 8px; background: linear-gradient(90deg, #000, #fff); border: 1px solid var(--line); }
  .greymark { position: absolute; top: -5px; width: 4px; height: 24px; margin-left: -2px; background: var(--bad); border-radius: 2px; }
  .pxgrid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; width: min(100%, 280px); }
  .pxgrid .px { aspect-ratio: 1; padding: 0; border-radius: 2px; border: 1px solid color-mix(in srgb, var(--line) 60%, transparent); min-width: 0; }
  .pxgrid .px.on { outline: 3px solid var(--blue); outline-offset: 1px; z-index: 1; }
  .pxgrid.small { width: 8px; gap: 0; grid-template-columns: repeat(8, 1px); }
  .pxgrid.small .px { border: 0; border-radius: 0; width: 1px; height: 1px; aspect-ratio: auto; }
  .money .wline input { width: 160px; }
  .overflow .wline input { width: 190px; }
  .convert .wrow button, .gitplay .wrow button { font-size: 14px; padding: 6px 10px; }
  .convert .wline input { width: 190px; }
  .cvboxes { display: grid; gap: 4px; margin: 6px 0 4px; }
  .cvbox { min-width: 110px; max-width: 100%; border: 1px solid var(--line); border-radius: 6px; padding: 3px 8px; font: 13px var(--mono, Consolas, monospace); background: var(--panel2); }
  .cvbox.from { border-color: var(--blue); box-shadow: inset 4px 0 0 var(--blue); }
  .cvbox.to { border-color: var(--accent); box-shadow: inset -4px 0 0 var(--accent); }
  .gpcols { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; }
  .gpcol { flex: 1 1 150px; min-width: 0; border: 1px solid var(--line); border-radius: 8px; padding: 8px; background: var(--panel2); }
  .gphead { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
  .gparrow { align-self: center; font-size: 12.5px; color: var(--dim); }
  .gpfile { border: 1px solid var(--accent); border-radius: 6px; padding: 5px 7px; margin-bottom: 5px; font-size: 13px; overflow-wrap: anywhere; }
  .gpfile.old { border-color: var(--line); opacity: .75; }
  .gpfile code { display: block; margin-top: 3px; font-size: 12px; white-space: normal; overflow-wrap: anywhere; }
  .gpempty { color: var(--dim); font-size: 13px; }
  .gpterm { min-height: 60px; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .overflow .wrow button { font-size: 14px; padding: 6px 10px; }
  .ovline { position: relative; height: 14px; margin: 14px 4px 2px; border-radius: 99px; background: linear-gradient(90deg, var(--bad) 0 50%, var(--accent) 50% 100%); opacity: .85; }
  .ovmark { position: absolute; top: -6px; width: 4px; height: 26px; margin-left: -2px; background: var(--text); border-radius: 2px; }
  .ovzero { position: absolute; top: 0; width: 2px; height: 14px; margin-left: -1px; background: var(--panel); }
  .ovends { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--dim); gap: 6px; overflow-wrap: anywhere; }
  .ovbits { overflow-wrap: anywhere; white-space: normal; }
  .mti { display: flex; gap: 3px; align-items: center; flex-wrap: wrap; }
  .mtinote { margin-left: 8px; font-size: 14px; }
  .bmgrid { display: grid; gap: 3px; }
  .bmrow { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)) 30px; gap: 3px; align-items: center; }
  .bmcell { padding: 0; height: 30px; font: 12px var(--mono, Consolas, monospace); color: var(--dim); border-radius: 4px; min-width: 0; }
  .bmcell:disabled { cursor: default; opacity: .55; }
  .bmcell.on { background: color-mix(in srgb, var(--accent) 22%, transparent); border-color: var(--accent); color: var(--text); font-weight: 600; opacity: 1; }
  .bmcell.sel { background: var(--accent); color: var(--accent-ink); }
  .bmhex { font: 600 14px var(--mono, Consolas, monospace); text-align: right; }
  .isolist { display: grid; gap: 4px; }
  .isorow { display: grid; grid-template-columns: 26px minmax(0, 1fr) minmax(0, 40%); gap: 8px; text-align: left; padding: 6px 10px; align-items: center; }
  .isorow.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
  .isonum { font: 600 14px var(--mono, Consolas, monospace); color: var(--dim); }
  .isoval { font: 13px var(--mono, Consolas, monospace); color: var(--dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
  .isoinfo { border-left: 4px solid var(--blue); padding: 6px 12px; margin-top: 12px; background: var(--panel2); border-radius: 0 8px 8px 0; min-width: 0; }
  .isoinfo pre { margin: 6px 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  .apbytes { display: flex; flex-wrap: wrap; gap: 4px; }
  .apb { display: grid; gap: 1px; padding: 4px 5px; min-width: 36px; text-align: center; font: 600 15px var(--mono, Consolas, monospace); }
  .apb small { font: 10px var(--mono, Consolas, monospace); color: var(--dim); }
  .apb.ap-cla, .apb.ap-ins, .apb.ap-p1, .apb.ap-p2 { border-color: var(--blue); }
  .apb.ap-lc, .apb.ap-le { border-color: var(--warn); }
  .apb.ap-data { border-color: var(--accent); }
  .apb.sel { background: var(--panel); outline: 2px solid var(--text); }
  .apdu .wrow button { font-size: 13.5px; padding: 6px 10px; }
  .later { display: inline-block; margin-top: 4px; font-size: 12.5px; font-weight: 600; padding: 1px 9px; border-radius: 99px; border: 1px dashed var(--blue); color: var(--blue); }
  .runcols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
  .runcol { border: 1px solid var(--line); border-radius: 8px; padding: 6px; min-width: 0; }
  .runhead { font-weight: 700; font-size: 14px; }
  .runline { font: 12px/1.45 var(--mono, Consolas, monospace); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .runline.diff { background: color-mix(in srgb, var(--warn) 22%, transparent); border-radius: 3px; }
  .bitsbox .summary { margin-top: 12px; padding: 8px 12px; border-radius: 8px; font-weight: 600; border: 1px solid var(--line); }
  .bitsbox .summary.ok { color: var(--accent); }
  .bitsbox .summary.no { color: var(--bad); border-color: var(--bad); }
  .ladder .lrow { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 6px 0; border-top: 1px solid var(--line); }
  .ladder .lstate { font: 600 10.5px var(--mono, Consolas, monospace); letter-spacing: .5px; text-transform: uppercase; text-align: center; border-radius: 99px; padding: 2px 0; border: 1px solid var(--line); color: var(--dim); }
  .ladder .lstate.done { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
  .ladder .lstate.now { border-color: var(--blue); color: var(--blue); }
  .ladder .lrow.done .ltext { color: var(--dim); }
  .ladder .lgroup { margin: 14px 0 2px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); }
  .distance { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0 4px; }
  .distance > div { border: 2px solid var(--line); border-radius: 10px; padding: 10px 12px; min-width: 0; }
  .distance b.big { display: block; font-size: 21px; margin: 2px 0; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---- a row of switches ----
  function bitsWidget(node) {
    const n = Number(node.dataset.bits), signed = node.dataset.signed === 'true', key = node.dataset.key;
    const fraction = node.dataset.mode === 'fraction', meanings = node.dataset.meanings === 'true';
    const target = node.dataset.target ? Number(node.dataset.target) : null;
    if (!state[key]) {
      const start = Number(node.dataset.start || 0);
      state[key] = { bits: Array.from({ length: n }, (_, i) => (start >> (n - 1 - i)) & 1), msg: '' };
    }
    const st = state[key];
    const grouped = n > 10;
    const worth = i => { if (fraction) return 1 / Math.pow(2, i + 1); const w = Math.pow(2, n - 1 - i); return signed && i === 0 ? -w : w; };
    const value = () => st.bits.reduce((sum, bit, i) => sum + (bit ? worth(i) : 0), 0);
    const label = i => fraction ? '1/' + Math.pow(2, i + 1) : fmt(worth(i));
    function draw() {
      node.innerHTML = '';
      node.className = 'bitsbox';
      const holder = grouped ? el('div', 'bitgroups') : null;
      let row = null;
      st.bits.forEach((bit, i) => {
        if (!row || (grouped && i % 8 === 0)) {
          row = el('div', 'bits');
          row.style.setProperty('--n', grouped ? 8 : n);
          (holder || node).append(row);
        }
        const cell = el('div', 'bitcell');
        const sw = el('button', 'bit' + (bit ? ' on' : '') + (signed && i === 0 ? ' neg' : ''), bit ? '1' : '0');
        sw.type = 'button';
        sw.setAttribute('aria-label', 'Switch worth ' + label(i) + ', ' + (bit ? 'on' : 'off'));
        sw.title = 'Worth ' + label(i);
        sw.addEventListener('click', () => { st.bits[i] = bit ? 0 : 1; st.msg = ''; draw(); });
        cell.append(sw);
        if (!grouped) cell.append(el('div', 'worth', label(i)));
        row.append(cell);
      });
      if (holder) {
        node.append(holder);
        node.append(el('div', 'worth', 'The first switch (red) is worth ' + fmt(worth(0)) + '. Each one after it is worth half the size of the one before, and positive.'));
      }
      const v = value();
      node.append(el('div', 'bitinfo', 'Value: <b>' + (fraction ? String(v) : fmt(v)) + '</b>'));
      if (target !== null) st.msg = v === target ? 'Exactly ' + target + '.' : 'You are ' + Math.abs(v - target).toFixed(10).replace(/0+$/, '') + ' away from ' + target + '.';
      node.append(el('div', 'bitmsg', esc(st.msg)));
      if (meanings) {
        const letter = v >= 33 && v <= 126 ? String.fromCharCode(v) : v === 32 ? '(a space)' : '(no printable letter)';
        const m = el('div', 'meanings');
        m.append(el('div', '', 'Read as a number: <b>' + v + '</b>'),
          el('div', '', 'Written in hex, the short way to write a byte: <b>' + v.toString(16).toUpperCase().padStart(2, '0') + '</b>'),
          el('div', '', 'Read as a letter: <b>' + esc(letter) + '</b>'),
          el('div', '', 'Read as a shade of grey: <span class="swatch" style="background: rgb(' + v + ',' + v + ',' + v + ')"></span>'));
        node.append(m);
      }
      const controls = el('div', 'wrow');
      if (!fraction) {
        controls.append(btn('+1', 'primary', () => {
          const before = value();
          for (let i = n - 1; i >= 0; i--) { if (st.bits[i] === 0) { st.bits[i] = 1; break; } st.bits[i] = 0; }
          st.msg = value() < before ? 'Rolled over: ' + fmt(before) + ' + 1 gave ' + fmt(value()) + '. There was no pattern left for a bigger number.' : '';
          draw();
        }));
        controls.append(btn('Fill to max', '', () => { st.bits = st.bits.map((_, i) => (signed && i === 0 ? 0 : 1)); st.msg = 'This is the biggest number these switches can show.'; draw(); }));
      }
      controls.append(btn('All off', '', () => { st.bits = st.bits.map(() => 0); st.msg = ''; draw(); }));
      node.append(controls);
    }
    draw();
  }

  // ---- a number in four memory cells ----
  function intMemWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { v: Number(node.dataset.start || 100) };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline', '<span>int heroHp =</span>');
    const input = el('input'); input.type = 'number'; input.id = key + '-in'; input.value = st.v; input.setAttribute('aria-label', 'A whole number');
    line.append(input, el('span', '', ';'));
    const cells = el('div', 'cells'), note = el('div', 'bitmsg');
    function draw() {
      const raw = Math.trunc(Number(input.value) || 0);
      st.v = Math.max(-2147483648, Math.min(2147483647, raw));
      note.textContent = raw !== st.v ? 'That does not fit in an int. Showing the nearest value that does: ' + fmt(st.v) : '';
      const u = st.v >>> 0;
      cells.innerHTML = '';
      [24, 16, 8, 0].forEach((shift, i) => {
        const bv = (u >>> shift) & 255, c = el('div', 'cell');
        c.append(el('div', 'addr', 'cell ' + (1000 + i)), el('div', 'pat', byteBits(bv)), el('div', 'val', 'this byte alone: ' + bv));
        cells.append(c);
      });
    }
    input.addEventListener('input', draw);
    node.append(line, cells, note);
    draw();
  }

  // ---- characters as numbers ----
  function textWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { v: node.dataset.start || 'Hi' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline', '<span>String text =</span>');
    const input = el('input'); input.type = 'text'; input.id = key + '-in'; input.maxLength = 12; input.value = st.v; input.setAttribute('aria-label', 'Some text');
    line.append(input);
    const out = el('div', 'charswrap');
    function draw() {
      st.v = input.value;
      let rows = '';
      for (let i = 0; i < st.v.length; i++) {
        const code = st.v.charCodeAt(i), ch = st.v[i] === ' ' ? '(space)' : st.v[i];
        rows += '<tr><td>' + esc(ch) + '</td><td>' + code + '</td><td>' + byteBits(code >> 8) + ' ' + byteBits(code & 255) + '</td></tr>';
      }
      out.innerHTML = st.v.length ? '<table class="chars"><tr><th>Character</th><th>Its number</th><th>Its 16 switches</th></tr>' + rows + '</table>' : '<span class="muted">Type something.</span>';
    }
    input.addEventListener('input', draw);
    node.append(line, out);
    draw();
  }

  // ---- one pixel ----
  function rgbWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { c: [255, 140, 0] };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const sw = el('div', 'swatch big');
    node.append(sw);
    const outs = [];
    ['Red', 'Green', 'Blue'].forEach((name, i) => {
      const row = el('div', 'rgbrow');
      const input = el('input'); input.type = 'range'; input.id = key + '-' + name; input.min = 0; input.max = 255; input.value = st.c[i]; input.setAttribute('aria-label', name);
      const num = el('span'), pat = el('span');
      outs.push([num, pat]);
      input.addEventListener('input', () => { st.c[i] = Number(input.value); paint(); });
      row.append(el('span', '', name), input, num, pat);
      node.append(row);
    });
    function paint() {
      sw.style.background = 'rgb(' + st.c.join(',') + ')';
      st.c.forEach((v, i) => { outs[i][0].textContent = v; outs[i][1].textContent = byteBits(v); });
    }
    paint();
  }

  // ---- run a file from play/ (only inside the lab) ----
  function runWidget(node, opts) {
    const file = node.dataset.file;
    node.innerHTML = ''; node.className = 'bitsbox';
    if (!opts.run) {
      node.append(el('div', 'muted', 'This experiment runs your own code, so it needs the lab on your computer. Do it there: <span style="font-family: var(--mono, monospace)">play/' + esc(file) + '</span>'));
      return;
    }
    const row = el('div', 'wrow'), out = el('div');
    const go = btn('Run', 'primary', async () => {
      go.disabled = true; go.textContent = 'Running…';
      await opts.run(file, out);
      go.disabled = false; go.textContent = 'Run';
    });
    row.append(go, el('span', 'muted', esc('play/' + file)));
    node.append(row, out);
  }

  // ---- walk through code one line at a time ----
  function stepper(b, key) {
    if (state[key] == null) state[key] = 0;
    const card = el('div', 'card stepper');
    function draw() {
      const at = state[key], s = b.steps[at], last = at === b.steps.length - 1;
      card.innerHTML = '';
      const lines = el('div', 'lines');
      b.code.forEach((line, n) => lines.append(el('div', 'ln' + (n === s.line ? ' on' : ''), esc(line) || ' ')));
      card.append(lines);
      const grid = el('div', 'grid');
      const mem = el('div'); mem.append(el('h4', '', 'Memory'));
      const boxes = el('div', 'boxes');
      Object.entries(s.vars).forEach(([name, value]) => {
        const bx = el('div', 'box'); bx.append(el('div', 'v', esc(value)), el('div', 'n', esc(name))); boxes.append(bx);
      });
      mem.append(boxes);
      const scr = el('div'); scr.append(el('h4', '', 'Screen'), el('div', 'screen', esc(s.out.join('\n'))));
      grid.append(mem, scr);
      card.append(grid, el('div', 'stepnote', esc(s.note)));
      const row = el('div', 'wrow');
      const back = btn('Back', '', () => { state[key] = at - 1; draw(); });
      back.disabled = at === 0;
      row.append(back, btn(last ? 'Start again' : 'Next line', 'primary', () => { state[key] = last ? 0 : at + 1; draw(); }),
        el('span', 'muted', 'Step ' + (at + 1) + ' of ' + b.steps.length));
      card.append(row);
    }
    draw();
    return card;
  }

  // ---- try an arithmetic sign on two whole numbers, the way Java does it ----
  function calcWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { a: Number(node.dataset.a || 7), b: Number(node.dataset.b || 2), op: node.dataset.op || '/' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const a = el('input'); a.type = 'number'; a.id = key + '-a'; a.value = st.a; a.setAttribute('aria-label', 'First number');
    const b = el('input'); b.type = 'number'; b.id = key + '-b'; b.value = st.b; b.setAttribute('aria-label', 'Second number');
    const ops = el('span', 'ops');
    const out = el('div');
    const int = v => Math.max(-2147483648, Math.min(2147483647, Math.trunc(Number(v) || 0)));
    function draw() {
      st.a = int(a.value); st.b = int(b.value);
      ops.innerHTML = '';
      ['+', '-', '*', '/', '%'].forEach(op => {
        const bt = btn(op, 'opbtn' + (op === st.op ? ' primary' : ''), () => { st.op = op; draw(); });
        bt.setAttribute('aria-label', 'Use ' + op);
        ops.append(bt);
      });
      const x = st.a, y = st.b;
      let result, why = '';
      if ((st.op === '/' || st.op === '%') && y === 0) {
        out.innerHTML = '<div class="bitinfo"><b>' + x + ' ' + st.op + ' 0</b></div><div class="bitmsg">Java stops the program here with: ArithmeticException: / by zero. A whole number cannot be divided by zero.</div>';
        return;
      }
      if (st.op === '+') result = (x + y) | 0;
      if (st.op === '-') result = (x - y) | 0;
      if (st.op === '*') result = Math.imul(x, y);
      if (st.op === '/') { result = Math.trunc(x / y); if (x % y !== 0) why = 'On paper ' + x + ' ÷ ' + y + ' is ' + (x / y).toFixed(3).replace(/0+$/, '') + '. With whole numbers Java throws the part after the point away. It does not round.'; }
      if (st.op === '%') { result = x % y; why = y + ' goes into ' + x + ' ' + Math.trunc(x / y) + ' times, and ' + result + ' is left over.'; }
      if ((st.op === '+' && result !== x + y) || (st.op === '-' && result !== x - y) || (st.op === '*' && result !== x * y)) why = 'The true answer does not fit in an int, so it rolled over. See the note on the 32 switches.';
      out.innerHTML = '<div class="bitinfo">' + x + ' ' + st.op + ' ' + y + ' gives <b>' + fmt(result) + '</b></div><div class="bitmsg">' + esc(why) + '</div>';
    }
    a.addEventListener('input', draw); b.addEventListener('input', draw);
    line.append(a, ops, b);
    node.append(line, out);
    draw();
  }

  // ---- the short ways to change a box ----
  function compoundWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { x: 10, msg: 'Press a button. Each one changes the box and shows the long way of writing it.' };
    const st = state[key];
    const moves = [
      ['x += 5', 'x = x + 5', x => x + 5], ['x -= 3', 'x = x - 3', x => x - 3], ['x *= 2', 'x = x * 2', x => x * 2],
      ['x /= 2', 'x = x / 2', x => Math.trunc(x / 2)], ['x++', 'x = x + 1', x => x + 1], ['x--', 'x = x - 1', x => x - 1],
    ];
    function draw() {
      node.innerHTML = ''; node.className = 'bitsbox';
      const boxes = el('div', 'boxes');
      const bx = el('div', 'box'); bx.append(el('div', 'v', fmt(st.x)), el('div', 'n', 'x')); boxes.append(bx);
      node.append(boxes, el('div', 'bitmsg', esc(st.msg)));
      const row = el('div', 'wrow');
      moves.forEach(([short, long, fn]) => row.append(btn(short, 'mono', () => {
        const before = st.x; st.x = fn(st.x) | 0;
        st.msg = short + ';  is short for  ' + long + ';   The box held ' + fmt(before) + ' and now holds ' + fmt(st.x) + '.';
        draw();
      })));
      row.append(btn('Reset', '', () => { st.x = 10; st.msg = ''; draw(); }));
      node.append(row);
    }
    draw();
  }

  // ---- walk through code that calls methods: each call gets its own frame on the stack ----
  //   { code: [...], steps: [{ line, frames: [{ name, vars }], out: [...], note }] }   frames[0] is main, last is on top
  function callstack(b, key) {
    if (state[key] == null) state[key] = 0;
    const card = el('div', 'card stepper');
    function draw() {
      const at = state[key], s = b.steps[at], last = at === b.steps.length - 1;
      card.innerHTML = '';
      const lines = el('div', 'lines');
      b.code.forEach((line, n) => lines.append(el('div', 'ln' + (n === s.line ? ' on' : ''), esc(line) || ' ')));
      card.append(lines);
      const grid = el('div', 'grid');
      const mem = el('div'); mem.append(el('h4', '', 'The call stack (newest call on top)'));
      const stack = el('div', 'frames');
      s.frames.slice().reverse().forEach((f, n) => {
        const fr = el('div', 'frame' + (n === 0 ? ' top' : ''));
        fr.append(el('div', 'fname', esc(f.name)));
        const boxes = el('div', 'boxes');
        Object.entries(f.vars).forEach(([name, value]) => { const bx = el('div', 'box'); bx.append(el('div', 'v', esc(value)), el('div', 'n', esc(name))); boxes.append(bx); });
        if (!Object.keys(f.vars).length) boxes.append(el('div', 'muted', 'no boxes yet'));
        fr.append(boxes);
        stack.append(fr);
      });
      mem.append(stack);
      const scr = el('div'); scr.append(el('h4', '', 'Screen'), el('div', 'screen', esc(s.out.join('\n'))));
      grid.append(mem, scr);
      card.append(grid, el('div', 'stepnote', esc(s.note)));
      const row = el('div', 'wrow');
      const back = btn('Back', '', () => { state[key] = at - 1; draw(); });
      back.disabled = at === 0;
      row.append(back, btn(last ? 'Start again' : 'Next step', 'primary', () => { state[key] = last ? 0 : at + 1; draw(); }),
        el('span', 'muted', 'Step ' + (at + 1) + ' of ' + b.steps.length));
      card.append(row);
    }
    draw();
    return card;
  }
  function callstackWidget(node, opts) {
    const cfg = (opts.configs || {})[node.dataset.ref];
    if (!cfg) return;
    node.innerHTML = '';
    node.append(callstack(cfg, 'cs:' + node.dataset.ref));
  }

  // ---- dice.nextInt(howMany) + smallest: see the range, roll it, see how the rolls spread ----
  function diceWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { n: Number(node.dataset.n || 6), k: Number(node.dataset.k || 1), counts: {}, last: null, total: 0 };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const n = el('input'); n.type = 'number'; n.id = key + '-n'; n.value = st.n; n.setAttribute('aria-label', 'How many different values');
    const k = el('input'); k.type = 'number'; k.id = key + '-k'; k.value = st.k; k.setAttribute('aria-label', 'Smallest value');
    line.append(el('span', '', 'dice.nextInt('), n, el('span', '', ') +'), k);
    const out = el('div');
    function draw() {
      if (st.bad) { out.innerHTML = '<div class="bitmsg">' + st.bad + '</div>'; return; }
      const lo = st.k, hi = st.k + st.n - 1;
      let html = '<div class="bitinfo">Smallest <b>' + lo + '</b>, largest <b>' + hi + '</b></div><div class="muted">' + st.n + ' different values, each equally likely. nextInt(' + st.n + ') alone gives 0 to ' + (st.n - 1) + '.</div>';
      const most = Math.max(1, ...Object.values(st.counts));
      html += '<div class="dicebars" style="--n:' + st.n + '">';
      for (let v = lo; v <= hi; v++) {
        const c = st.counts[v] || 0;
        html += '<div class="dicecol' + (v === st.last ? ' on' : '') + '" title="' + v + ': rolled ' + c + ' times"><div class="bar" style="height:' + Math.round(c / most * 100) + '%"></div></div>';
      }
      html += '</div><div class="diceaxis"><span>' + lo + '</span><span>' + hi + '</span></div>';
      html += '<div class="bitmsg">' + (st.last === null ? 'Roll it.' : 'Last roll: ' + st.last + '. Rolled ' + st.total + ' time' + (st.total === 1 ? '' : 's') + ' so far.') + '</div>';
      out.innerHTML = html;
    }
    function reset() { st.counts = {}; st.last = null; st.total = 0; }
    function setup() {
      // Never change his number silently: a bound the diagram cannot draw gets a message instead.
      const want = Math.trunc(Number(n.value));
      st.bad = !(want >= 1) ? 'Java would stop here with an error: <code>IllegalArgumentException: bound must be positive</code>. nextInt needs at least 1 value to choose from.'
        : want > 100 ? 'Java accepts nextInt(' + want + ') and gives 0 to ' + (want - 1) + ', plus whatever you add. This diagram only draws up to 100 bars, so try 100 or fewer here.' : '';
      st.n = st.bad ? st.n : want;
      st.k = Math.max(-999, Math.min(999, Math.trunc(Number(k.value) || 0)));
      reset(); draw();
    }
    function roll(times) {
      if (st.bad) return;
      for (let t = 0; t < times; t++) { st.last = Math.floor(Math.random() * st.n) + st.k; st.counts[st.last] = (st.counts[st.last] || 0) + 1; st.total++; }
      draw();
    }
    n.addEventListener('input', setup); k.addEventListener('input', setup);
    const row = el('div', 'wrow');
    row.append(btn('Roll once', 'primary', () => roll(1)), btn('Roll 100 times', '', () => roll(100)), btn('Clear', '', () => { reset(); draw(); }));
    node.append(line, out, row);
    draw();
  }

  // ---- two yes/no answers joined with and, or, not ----
  function logicWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { a: true, b: false };
    const st = state[key];
    const an = node.dataset.a || 'heroHp > 0', bn = node.dataset.b || 'monsterHp > 0';
    function draw() {
      node.innerHTML = ''; node.className = 'bitsbox';
      const row = el('div', 'wrow');
      const mk = (name, which) => { const bt = btn(name + ' is ' + st[which], st[which] ? 'primary mono' : 'mono', () => { st[which] = !st[which]; draw(); }); bt.setAttribute('aria-pressed', String(st[which])); return bt; };
      row.append(mk(an, 'a'), mk(bn, 'b'));
      node.append(el('div', 'muted', 'Tap an answer to flip it.'), row);
      const rows = [[an + ' && ' + bn, 'and: both must be true', st.a && st.b], [an + ' || ' + bn, 'or: at least one must be true', st.a || st.b], ['!(' + an + ')', 'not: flips the answer', !st.a]];
      const wrap = el('div', 'tablewrap');
      wrap.innerHTML = '<table class="plain"><tr><th>Joined question</th><th>Meaning</th><th>Answer</th></tr>' + rows.map(r => '<tr><td><code>' + esc(r[0]) + '</code></td><td>' + r[1] + '</td><td class="' + (r[2] ? 'yes' : 'bad') + '"><b>' + r[2] + '</b></td></tr>').join('') + '</table>';
      node.append(wrap);
    }
    draw();
  }

  // ---- two numbers, all six comparison questions answered live ----
  function compareWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { a: Number(node.dataset.a || 35), b: Number(node.dataset.b || 0) };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const a = el('input'); a.type = 'number'; a.id = key + '-a'; a.value = st.a; a.setAttribute('aria-label', 'Left number');
    const b = el('input'); b.type = 'number'; b.id = key + '-b'; b.value = st.b; b.setAttribute('aria-label', 'Right number');
    line.append(el('span', '', 'left'), a, el('span', '', 'right'), b);
    const out = el('div', 'tablewrap');
    function draw() {
      st.a = Math.trunc(Number(a.value) || 0); st.b = Math.trunc(Number(b.value) || 0);
      const rows = [['>', 'greater than', st.a > st.b], ['<', 'less than', st.a < st.b], ['>=', 'at least', st.a >= st.b], ['<=', 'at most', st.a <= st.b], ['==', 'exactly equal', st.a === st.b], ['!=', 'not equal', st.a !== st.b]];
      out.innerHTML = '<table class="plain"><tr><th>Question</th><th>In words</th><th>Answer</th></tr>' + rows.map(r =>
        '<tr><td><code>' + st.a + ' ' + esc(r[0]) + ' ' + st.b + '</code></td><td>' + r[1] + '</td><td class="' + (r[2] ? 'yes' : 'bad') + '"><b>' + r[2] + '</b></td></tr>').join('') + '</table>';
    }
    a.addEventListener('input', draw); b.addEventListener('input', draw);
    node.append(line, out);
    draw();
  }

  // ---- a while loop you can set up and run: how many rounds does the fight last? ----
  function loopWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { hp: 60, dmg: 25 };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const hp = el('input'); hp.type = 'number'; hp.id = key + '-hp'; hp.value = st.hp; hp.setAttribute('aria-label', 'Monster HP');
    const dmg = el('input'); dmg.type = 'number'; dmg.id = key + '-dmg'; dmg.value = st.dmg; dmg.setAttribute('aria-label', 'Damage');
    line.append(el('span', '', 'monsterHp'), hp, el('span', '', 'damage'), dmg);
    const out = el('div');
    function draw() {
      st.hp = Math.trunc(Number(hp.value) || 0); st.dmg = Math.trunc(Number(dmg.value) || 0);
      let h = st.hp, round = 0, rows = '';
      const LIMIT = 1000;
      while (h > 0 && round < LIMIT) {
        round++;
        const before = h; h -= st.dmg;
        if (round <= 6) rows += '<tr><td>' + round + '</td><td><code>' + before + ' &gt; 0</code> is true</td><td>' + before + ' - ' + st.dmg + ' = <b>' + h + '</b></td></tr>';
      }
      let verdict;
      if (round >= LIMIT) verdict = '<div class="bitmsg">This loop never ends. The damage does not bring monsterHp down, so the question <code>monsterHp &gt; 0</code> is true for ever. Only the first rounds are shown.</div>';
      else if (round === 0) verdict = '<div class="bitmsg">The loop runs zero times. The question is false at the very first check, so the block is skipped completely.</div>';
      else verdict = '<div class="bitinfo">The block runs <b>' + round + '</b> time' + (round === 1 ? '' : 's') + '.</div><div class="muted">It stops when the question is asked with monsterHp at ' + h + ', which is not greater than 0.' + (round > 6 ? ' Only the first 6 rounds are shown.' : '') + '</div>';
      out.innerHTML = (rows ? '<div class="tablewrap"><table class="plain"><tr><th>Round</th><th>The question</th><th>Inside the block</th></tr>' + rows + '</table></div>' : '') + verdict;
    }
    hp.addEventListener('input', draw); dmg.addEventListener('input', draw);
    node.append(el('pre', '', 'while (monsterHp &gt; 0) {\n    monsterHp = monsterHp - damage;\n}'), line, out);
    draw();
  }

  // ---- a message travelling between parties: <div data-widget="flow" data-ref="name"> + note.widgets.name ----
  //   { parties: [{ short, name }], steps: [{ from, to, msg, title, note }] }   from/to are positions in parties
  function flowWidget(node, opts) {
    const cfg = (opts.configs || {})[node.dataset.ref];
    if (!cfg) return;
    const key = 'flow:' + node.dataset.ref, n = cfg.parties.length;
    if (state[key] == null) state[key] = 0;
    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pos = i => ((i + 0.5) / n * 100) + '%';
    function draw(animate) {
      const at = state[key], s = cfg.steps[at], last = at === cfg.steps.length - 1;
      node.innerHTML = ''; node.className = 'bitsbox flow';
      const lane = el('div', 'lane'); lane.style.setProperty('--n', n);
      cfg.parties.forEach((p, i) => lane.append(el('div', 'party' + (i === s.from || i === s.to ? ' on' : ''), esc(p.short))));
      const track = el('div', 'track');
      const pill = el('div', 'pill', esc(s.msg));
      pill.style.left = pos(animate && !calm ? s.from : s.to);
      track.append(pill);
      node.append(lane, track);
      if (animate && !calm) requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.left = pos(s.to); }));
      const who = s.from === s.to ? cfg.parties[s.from].name : cfg.parties[s.from].name + ' to ' + cfg.parties[s.to].name;
      node.append(el('div', 'flowwho', esc(who)), el('div', 'flowtitle', esc(s.title)), el('div', 'stepnote', esc(s.note)));
      const row = el('div', 'wrow');
      const back = btn('Back', '', () => { state[key] = at - 1; draw(false); });
      back.disabled = at === 0;
      row.append(back, btn(last ? 'Start again' : 'Next step', 'primary', () => { state[key] = last ? 0 : at + 1; draw(true); }),
        el('span', 'muted', 'Step ' + (at + 1) + ' of ' + cfg.steps.length));
      node.append(row);
    }
    draw(false);
  }

  // ---- the plan: this week, how a day is split, the roadmap ----
  function planView(plan, isDone) {
    const wrap = el('div', 'planwrap');
    if (plan.review) {   // the tutor's review of the last session
      const r = plan.review, card = el('div', 'card');
      card.append(el('h2', 'plan-h', esc(r.title)), el('p', 'muted', esc(r.when)));
      r.points.forEach(pt => card.append(el('h3', 'plan-by', esc(pt.label)), el('p', '', esc(pt.text))));
      wrap.append(card);
    }
    const week = el('div', 'card');
    week.append(el('h2', 'plan-h', esc(plan.week.title)), el('p', '', esc(plan.week.goal)));
    plan.targets.forEach(t => {
      week.append(el('h3', 'plan-by', esc(t.by)));
      const ul = el('ul', 'ticks');
      t.items.forEach(it => {
        const done = isDone && it.missions && it.missions.every(isDone);
        ul.append(el('li', done ? 'done' : (it.missions ? 'todo' : 'free'), esc(it.text)));
      });
      week.append(ul);
    });
    wrap.append(week);
    if (plan.position) {
      const p = plan.position, card = el('div', 'card');
      card.append(el('h2', 'plan-h', esc(p.title)), el('p', '', esc(p.summary)));
      const dist = el('div', 'distance');
      p.distance.forEach(d => dist.append(el('div', '', '<span class="muted">' + esc(d.to) + '</span><b class="big">' + esc(d.how) + '</b><div>' + esc(d.what) + '</div>')));
      card.append(dist);
      const lad = el('div', 'ladder');
      p.ladder.forEach(g => {
        lad.append(el('div', 'lgroup', esc(g.group)));
        g.items.forEach(it => {
          const s = it.state === 'done' || (isDone && it.missions && it.missions.every(isDone)) ? 'done' : (it.state || 'later');
          lad.append(el('div', 'lrow ' + s, '<span class="lstate ' + s + '">' + s + '</span><span class="ltext">' + esc(it.text) + '</span>'));
        });
      });
      card.append(lad);
      if (p.rule) card.append(el('p', 'muted', esc(p.rule)));
      wrap.append(card);
    }
    const day = el('div', 'card');
    day.append(el('h2', 'plan-h', 'How one day is split'), el('p', 'muted', 'Different subjects go in different parts of the day, so you never juggle two in one sitting.'));
    plan.tracks.forEach(t => day.append(el('div', 'track-row', '<b>' + esc(t.name) + '</b><span class="muted">' + esc(t.where + ' · ' + t.time) + '</span><div>' + esc(t.what) + '</div>')));
    wrap.append(day);
    const road = el('div', 'card');
    road.append(el('h2', 'plan-h', 'The roadmap'));
    plan.roadmap.forEach(r => road.append(el('div', 'track-row', '<b>' + esc(r.when) + '</b><div>' + esc(r.what) + '</div>')));
    road.append(el('h3', 'plan-by', 'Milestones, each meaning "without help"'));
    plan.milestones.forEach(r => road.append(el('div', 'track-row', '<b>' + esc(r.when) + '</b><div>' + esc(r.what) + '</div>')));
    road.append(el('p', 'muted', 'Plan last updated ' + esc(plan.updated) + '. It is reset every Sunday from what actually happened.'));
    wrap.append(road);
    return wrap;
  }

  // ---- a walk-through placed inside a note: <div data-widget="stepper" data-ref="name"> + note.widgets.name ----
  function stepperWidget(node, opts) {
    const cfg = (opts.configs || {})[node.dataset.ref];
    if (!cfg) return;
    node.innerHTML = '';
    node.append(stepper(cfg, 'ref:' + node.dataset.ref));
  }

  // ---- the digits of a card number: network, BIN, and the Luhn check on the last digit ----
  const CARD_RANGES = [
    ['Visa', 4, 4, 1], ['Mastercard', 51, 55, 2], ['Mastercard', 2221, 2720, 4],
    ['American Express', 34, 34, 2], ['American Express', 37, 37, 2],
    ['Discover', 6011, 6011, 4], ['Discover', 644, 649, 3], ['Discover', 65, 65, 2],
    ['RuPay', 508, 508, 3], ['RuPay', 81, 81, 2], ['RuPay', 82, 82, 2], ['RuPay', 60, 60, 2],
    ['JCB', 3528, 3589, 4], ['Diners Club', 36, 36, 2], ['Diners Club', 38, 38, 2], ['Diners Club', 300, 305, 3],
  ];
  function cardNetwork(d) {
    if (!d) return { state: 'empty' };
    let best = null; const maybe = [];
    CARD_RANGES.forEach(([name, lo, hi, len]) => {
      if (d.length >= len) {
        const v = Number(d.slice(0, len));
        if (v >= lo && v <= hi && (!best || len > best.len)) best = { name, len };
      } else {
        const low = Number(d.padEnd(len, '0')), high = Number(d.padEnd(len, '9'));
        if (low <= hi && high >= lo) maybe.push({ name, len });
      }
    });
    const rivals = maybe.filter(m => (!best || m.len > best.len) && (!best || m.name !== best.name)).map(m => m.name).filter((x, i, a) => a.indexOf(x) === i);
    if (best && !rivals.length) return { state: 'known', name: best.name };
    if (best) return { state: 'more', names: [best.name].concat(rivals) };
    if (rivals.length) return { state: 'more', names: rivals };
    return { state: 'unknown' };
  }
  // Luhn: from the right, double every second digit; a doubled value over 9 loses 9; the total must end in 0.
  function luhn(d) {
    const vals = []; let sum = 0;
    for (let i = d.length - 1, pos = 0; i >= 0; i--, pos++) {
      let v = Number(d[i]); const doubled = pos % 2 === 1;
      if (doubled) { v *= 2; if (v > 9) v -= 9; }
      vals[i] = { v, doubled }; sum += v;
    }
    return { vals, sum, valid: d.length > 1 && sum % 10 === 0 };
  }
  function cardNumWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { v: node.dataset.start || '4111 1111 1111 1111' };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox cardnum';
    const line = el('div', 'wline');
    const input = el('input'); input.type = 'text'; input.inputMode = 'numeric'; input.id = key + '-in'; input.maxLength = 23; input.value = st.v; input.setAttribute('aria-label', 'Card number digits');
    line.append(input);
    const samples = el('div', 'wrow samples');
    samples.append(el('span', 'muted', 'Test numbers:'));
    [['Visa', '4111 1111 1111 1111'], ['Mastercard', '5555 5555 5555 4444'], ['American Express', '3782 822463 10005']].forEach(([label, v]) =>
      samples.append(btn(label, '', () => { input.value = v; draw(); })));
    const out = el('div');
    function draw() {
      st.v = input.value;
      const d = st.v.replace(/\D/g, '').slice(0, 19);
      if (!d) { out.innerHTML = '<div class="muted">Type some digits.</div>'; return; }
      const net = cardNetwork(d), l = luhn(d);
      const role = i => i === d.length - 1 && d.length > 8 ? 'chk' : i < 6 ? 'bin' : i < 8 ? 'bin8' : 'acct';
      const cells = (text, cls) => '<div class="cnrow"><span class="cng">' + d.split('').map((c, i) => (i > 0 && i % 4 === 0 ? '</span><span class="cng">' : '') + '<span class="cn ' + role(i) + (cls ? ' ' + cls(i) : '') + '">' + text(c, i) + '</span>').join('') + '</span></div>';
      let who;
      if (net.state === 'known') who = 'Likely network: <b>' + esc(net.name) + '</b>' + (net.name === 'Discover' && /^65/.test(d) ? '. Some RuPay cards also sit in this range, through a partnership between the two networks.' : '');
      else if (net.state === 'more') who = 'Could be ' + net.names.map(esc).join(' or ') + '. Type more digits.';
      else who = 'Not one of the common ranges listed here.';
      let h = '<div class="cnlabel">The number</div>' + cells(c => c);
      h += '<div class="cnkey"><span class="cn bin">0</span> first 6: the BIN, which names the bank <span class="cn bin8">0</span> digits 7 and 8: part of the BIN on newer ranges <span class="cn acct">0</span> the account <span class="cn chk">0</span> the check digit</div>';
      h += '<div class="bitinfo" style="font-size:16px">' + who + '</div>';
      h += '<div class="cnlabel">The Luhn check: from the right, double every second digit (shown boxed); if that gives more than 9, take 9 off</div>' + cells((c, i) => l.vals[i].v, i => (l.vals[i].doubled ? 'dbl' : ''));
      h += '<div class="bitinfo" style="font-size:16px">Add them up: <b>' + l.sum + '</b>. ' + (d.length < 2 ? '' : l.valid
        ? '<span class="yes">It ends in 0, so the number passes the check.</span>'
        : '<span class="bad">It does not end in 0, so the number fails the check. One digit is wrong or two were swapped.</span>') + '</div>';
      out.innerHTML = h;
    }
    input.addEventListener('input', draw);
    node.append(line, samples, out, el('div', 'muted', 'Test numbers only. Never type a real card number into a web page you do not trust. The ranges here are the common public ones and are approximate; real routing uses full BIN tables that the networks give their members.'));
    draw();
  }

  // ---- marks: read ticks, check-yourself results, section tags and questions ----
  // Kept in this browser. In the lab every change is also logged at once (configure({ sink })).
  // On the phone site changes wait in an "unsent" queue until he sends them (see sends()).
  const MKEY = 'lab-marks-v1';
  const INBOX = 'https://github.com/Darshan-1820/lab-inbox/issues/new';
  const URL_LIMIT = 5800;
  const TAGS = [
    ['important', 'Important', 'Worth remembering'],
    ['doubt', 'Doubt', 'I have a question here'],
    ['go-deeper', 'Go deeper', 'I want more depth on this'],
    ['show-me', 'Show me', 'This needs a picture or a diagram'],
    ['lost', 'Lost', 'I cannot understand this'],
  ];
  const tagLabel = slug => (TAGS.find(t => t[0] === slug) || [slug, slug])[1];
  let M = null, sink = null, onChange = null;
  const drafts = {};
  function mload() {
    if (M) return M;
    M = { read: {}, checks: {}, marks: {}, drill: {}, rounds: [] };
    try {
      const raw = JSON.parse(localStorage.getItem(MKEY) || 'null');
      if (raw && typeof raw === 'object') ['read', 'checks', 'marks', 'drill'].forEach(k => { if (raw[k] && typeof raw[k] === 'object') M[k] = raw[k]; });
      if (raw && Array.isArray(raw.rounds)) M.rounds = raw.rounds;
    } catch (e) { /* storage blocked: marks last for this visit only */ }
    return M;
  }
  function msave() {
    try { localStorage.setItem(MKEY, JSON.stringify(M)); } catch (e) { /* see above */ }
    if (onChange) { try { onChange(); } catch (e) { /* a listener must not break saving */ } }
  }
  const stamp = () => new Date().toISOString();
  const emit = ev => { if (sink) { try { sink(ev); } catch (e) { /* logging is best effort */ } } };
  const oneLine = s => String(s || '').replace(/\s+/g, ' ').trim();

  function setRead(id, on, title) {
    mload();
    if (on) M.read[id] = { at: stamp(), sent: !!sink }; else delete M.read[id];
    msave(); emit({ type: 'read', id, on: !!on, title: oneLine(title) });
  }
  function setCheck(note, q, result, question) {
    mload();
    (M.checks[note] = M.checks[note] || {})[q] = { r: result, at: stamp(), sent: !!sink };
    msave(); emit({ type: 'selfcheck', note, q: q + 1, result, question: oneLine(question).slice(0, 200) });
  }
  function setMark(key, rec) {
    mload();
    if (!rec || (!rec.tags.length && !rec.text)) {
      const old = M.marks[key]; delete M.marks[key]; msave();
      if (old) emit({ type: 'mark', note: old.note, section: old.sec, title: old.title, removed: true });
      return;
    }
    M.marks[key] = { note: rec.note, sec: rec.sec, title: oneLine(rec.title), tags: rec.tags.slice(), text: rec.text, at: stamp(), sent: !!sink };
    msave(); emit({ type: 'mark', note: rec.note, section: rec.sec, title: oneLine(rec.title), tags: rec.tags, text: rec.text });
  }

  // Maths drills: progress per drill (levels, lock-in days, bests) and one record per finished round.
  function drillState(id) { return mload().drill[id] || null; }
  function saveDrill(id, p) { mload(); M.drill[id] = p; msave(); }
  function addRound(r) {
    mload();
    const rec = { id: Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), drill: r.drill, level: r.level, score: r.score, of: r.of, time: r.time, at: stamp(), sent: !!sink };
    M.rounds.push(rec);
    const sentOnes = M.rounds.filter(x => x.sent);
    if (sentOnes.length > 60) { const drop = new Set(sentOnes.slice(0, sentOnes.length - 60).map(x => x.id)); M.rounds = M.rounds.filter(x => !drop.has(x.id)); }
    msave();
    emit({ type: 'drill', drill: r.drill, level: r.level, score: r.score, of: r.of, seconds: r.time, unlocked: !!r.unlocked, lockedIn: !!r.lockedIn, drillLocked: !!r.drillLocked });
  }

  function linkBtn(label, onClick) { const b = btn(label, 'marklink', onClick); return b; }

  // The small control under a section heading.
  function sectionControl(note, sec, title) {
    const key = note + '#' + sec, box = el('div', 'marksec');
    let open = false;
    function draw(focusSlug) {
      mload();
      const rec = M.marks[key];
      box.innerHTML = '';
      const head = el('div', 'markhead');
      if (rec && !open) {
        rec.tags.forEach(t => head.append(el('span', 'markchip on', esc(tagLabel(t)))));
        if (rec.text) head.append(el('span', 'marktext', esc(rec.text)));
      }
      const toggle = linkBtn(open ? 'Close' : (rec ? 'Edit' : 'Mark this section'), () => { open = !open; draw(); });
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      head.append(toggle);
      box.append(head);
      if (!open) return;
      const ta = el('textarea', 'markta');
      ta.id = 'mk-' + note + '-' + sec; ta.maxLength = 1000; ta.setAttribute('aria-label', 'Your question or note about this section');
      ta.placeholder = 'Your question or note (optional)';
      ta.value = drafts[key] != null ? drafts[key] : (rec ? rec.text : '');
      ta.addEventListener('input', () => { drafts[key] = ta.value; });
      const current = () => (M.marks[key] ? M.marks[key].tags : []);
      const chips = el('div', 'markchips');
      TAGS.forEach(([slug, label, help]) => {
        const on = current().includes(slug);
        const b = btn(label, 'markchip' + (on ? ' on' : ''), () => {
          const tags = on ? current().filter(x => x !== slug) : current().concat(slug);
          setMark(key, { note, sec, title, tags, text: ta.value.trim() });
          draw(slug);
        });
        b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.title = help; b.dataset.slug = slug;
        chips.append(b);
      });
      const row = el('div', 'wrow');
      row.append(btn('Save', 'primary', () => { setMark(key, { note, sec, title, tags: current(), text: ta.value.trim() }); delete drafts[key]; open = false; draw(); }));
      if (rec) row.append(btn('Remove', '', () => { setMark(key, null); delete drafts[key]; open = false; draw(); }));
      box.append(chips, ta, row);
      if (focusSlug) { const f = chips.querySelector('[data-slug="' + focusSlug + '"]'); if (f) f.focus(); }
    }
    draw();
    return box;
  }

  // "Got it" / "Missed it" under a check-yourself answer.
  function checkRow(note, q, question) {
    const row = el('div', 'selfcheck');
    function draw(focus) {
      mload();
      const cur = (M.checks[note] || {})[q];
      row.innerHTML = '';
      row.append(el('span', '', 'Did you get it before opening?'));
      [['got', 'Got it'], ['missed', 'Missed it']].forEach(([r, label]) => {
        const b = btn(label, r + (cur && cur.r === r ? ' on' : ''), () => { setCheck(note, q, r, question); draw(r); });
        b.setAttribute('aria-pressed', cur && cur.r === r ? 'true' : 'false'); b.dataset.r = r;
        row.append(b);
      });
      if (focus) { const f = row.querySelector('[data-r="' + focus + '"]'); if (f) f.focus(); }
    }
    draw();
    return row;
  }

  // The end of a page: a question about the whole page, and the read toggle.
  function pageTools(id, title, options) {
    const o = options || {}, key = id + '#page', box = el('div', 'pagetools');
    function draw(focusRead) {
      mload();
      const rec = M.marks[key];
      box.innerHTML = '';
      const label = el('label', 'pagelabel', 'A question about this whole page');
      const ta = el('textarea', 'markta');
      ta.id = 'mk-' + id + '-page'; label.htmlFor = ta.id; ta.maxLength = 1000;
      ta.placeholder = 'Anything unclear, or anything you want explained further';
      ta.value = drafts[key] != null ? drafts[key] : (rec ? rec.text : '');
      ta.addEventListener('input', () => { drafts[key] = ta.value; });
      const row = el('div', 'wrow');
      row.append(btn(rec ? 'Update question' : 'Save question', '', () => { setMark(key, { note: id, sec: 'page', title: '(whole page)', tags: [], text: ta.value.trim() }); delete drafts[key]; draw(); }));
      if (rec) row.append(btn('Remove', '', () => { setMark(key, null); delete drafts[key]; draw(); }), el('span', 'muted', 'Saved.'));
      box.append(label, ta, row);
      if (o.read !== false) {
        const on = !!M.read[id];
        const rb = btn(on ? 'Read. Tap to undo' : 'Mark as read', 'readbtn' + (on ? ' on' : ' primary'), () => { setRead(id, !on, title); draw(true); });
        rb.setAttribute('aria-pressed', on ? 'true' : 'false');
        const rrow = el('div', 'wrow'); rrow.append(rb);
        box.append(rrow);
        if (focusRead) rb.focus();
      }
    }
    draw();
    return box;
  }

  function attachMarks(card, n) {
    Array.from(card.querySelectorAll('h3')).forEach((h, i) => h.after(sectionControl(n.id, i, h.textContent)));
    Array.from(card.querySelectorAll('details')).forEach((d, q) => { const s = d.querySelector('summary'); d.append(checkRow(n.id, q, s ? s.textContent : '')); });
    card.append(pageTools(n.id, n.title));
  }

  // Everything not yet sent, as { k, line-building data }.
  function unsentItems() {
    mload();
    const items = [];
    Object.keys(M.read).forEach(id => { if (!M.read[id].sent) items.push({ k: 'r:' + id, kind: 'read', id }); });
    Object.keys(M.checks).forEach(note => Object.keys(M.checks[note]).forEach(q => { const c = M.checks[note][q]; if (!c.sent) items.push({ k: 'c:' + note + ':' + q, kind: 'check', note, q: Number(q), r: c.r }); }));
    Object.keys(M.marks).forEach(key => { const m = M.marks[key]; if (!m.sent) items.push({ k: 'm:' + key, kind: 'mark', m }); });
    M.rounds.forEach(r => { if (!r.sent) items.push({ k: 'd:' + r.id, kind: 'drill', r }); });
    return items;
  }
  const markLine = m => 'MARK ' + m.note + ' / "' + oneLine(m.title).replace(/"/g, "'") + '" [' + m.tags.join(', ') + ']: ' + oneLine(m.text);
  const issueUrl = (title, body) => INBOX + '?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);

  // The queue as one or more ready-to-open GitHub issue links: [{ title, body, url, keys, count }].
  function sends(now) {
    const items = unsentItems(), units = [];
    const reads = items.filter(i => i.kind === 'read');
    for (let i = 0; i < reads.length; i += 10) { const part = reads.slice(i, i + 10); units.push({ line: 'READ: ' + part.map(r => r.id).join(', '), keys: part.map(r => r.k) }); }
    const byNote = {};
    items.filter(i => i.kind === 'check').forEach(c => (byNote[c.note] = byNote[c.note] || []).push(c));
    Object.keys(byNote).forEach(note => {
      const list = byNote[note].sort((a, b) => a.q - b.q);
      for (let i = 0; i < list.length; i += 10) { const part = list.slice(i, i + 10); units.push({ line: 'CHECK ' + note + ': ' + part.map(c => 'Q' + (c.q + 1) + ' ' + c.r).join(', '), keys: part.map(c => c.k) }); }
    });
    items.filter(i => i.kind === 'mark').forEach(i => {
      let line = markLine(i.m);
      while (issueUrl('x'.repeat(48), line).length > URL_LIMIT) line = line.slice(0, Math.floor(line.length * 0.8)) + ' (cut)';
      units.push({ line, keys: [i.k] });
    });
    items.filter(i => i.kind === 'drill').forEach(i => units.push({ line: 'DRILL ' + i.r.drill + ' L' + i.r.level + ': ' + i.r.score + '/' + i.r.of + ' time ' + i.r.time + 's', keys: [i.k] }));
    const d = now || new Date(), two = v => String(v).padStart(2, '0');
    const when = d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes());
    const parts = [];
    units.forEach(u => {
      const last = parts[parts.length - 1];
      if (last && issueUrl('x'.repeat(48), last.lines.concat(u.line).join('\n')).length <= URL_LIMIT) { last.lines.push(u.line); last.keys = last.keys.concat(u.keys); }
      else parts.push({ lines: [u.line], keys: u.keys.slice() });
    });
    return parts.map((p, i) => {
      const title = 'Marks ' + when + ' (' + p.keys.length + ' item' + (p.keys.length === 1 ? '' : 's') + ')' + (parts.length > 1 ? ' part ' + (i + 1) + ' of ' + parts.length : '');
      const body = p.lines.join('\n');
      return { title, body, url: issueUrl(title, body), keys: p.keys, count: p.keys.length };
    });
  }
  function markSent(keys) {
    mload();
    keys.forEach(k => {
      if (k.startsWith('r:')) { const r = M.read[k.slice(2)]; if (r) r.sent = true; }
      else if (k.startsWith('c:')) { const rest = k.slice(2), cut = rest.lastIndexOf(':'), c = (M.checks[rest.slice(0, cut)] || {})[rest.slice(cut + 1)]; if (c) c.sent = true; }
      else if (k.startsWith('m:')) { const m = M.marks[k.slice(2)]; if (m) m.sent = true; }
      else if (k.startsWith('d:')) { const r = M.rounds.find(x => x.id === k.slice(2)); if (r) r.sent = true; }
    });
    msave();
  }
  function removeItem(k) {
    mload();
    if (k.startsWith('r:')) setRead(k.slice(2), false, '');
    else if (k.startsWith('c:')) { const rest = k.slice(2), cut = rest.lastIndexOf(':'), note = rest.slice(0, cut); if (M.checks[note]) { delete M.checks[note][rest.slice(cut + 1)]; if (!Object.keys(M.checks[note]).length) delete M.checks[note]; } msave(); emit({ type: 'selfcheck', note, q: Number(rest.slice(cut + 1)) + 1, removed: true }); }
    else if (k.startsWith('m:')) setMark(k.slice(2), null);
    else if (k.startsWith('d:')) { M.rounds = M.rounds.filter(x => x.id !== k.slice(2)); msave(); }
  }
  function counts() {
    mload();
    const marks = Object.keys(M.marks).map(k => M.marks[k]);
    let got = 0, missed = 0;
    Object.keys(M.checks).forEach(n => Object.keys(M.checks[n]).forEach(q => { if (M.checks[n][q].r === 'got') got++; else missed++; }));
    return { read: Object.keys(M.read).length, questions: marks.filter(m => m.text).length, tags: marks.reduce((s, m) => s + m.tags.length, 0), got, missed, rounds: M.rounds.length, unsent: unsentItems().length };
  }
  const marksApi = {
    TAGS, tagLabel,
    configure(o) { sink = o.sink || null; onChange = o.onChange || null; },
    isRead(id) { return !!mload().read[id]; },
    data() { return mload(); },
    counts, sends, markSent, remove: removeItem, pageTools, unsent: unsentItems,
    drill: drillState, saveDrill, addRound,
  };


  // ---- how many patterns n switches can make: <div data-widget="patterns" data-key data-n> ----
  function patternsWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { n: Number(node.dataset.n || 3), k: null };
    const st = state[key];
    const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
    const all = n => Array.from({ length: Math.pow(2, n) }, (_, v) => v.toString(2).padStart(n, '0'));
    function draw() {
      const n = st.n, total = Math.pow(2, n);
      node.innerHTML = ''; node.className = 'bitsbox patterns';
      const top = el('div', 'wrow');
      const less = btn('One switch less', '', () => { st.n = Math.max(1, n - 1); st.k = null; draw(); });
      const more = btn('One switch more', 'primary', () => { st.n = Math.min(8, n + 1); st.k = null; draw(); });
      less.disabled = n === 1; more.disabled = n === 8;
      top.append(less, more);
      node.append(top);
      node.append(el('div', 'bitinfo', n + ' switch' + (n === 1 ? '' : 'es') + ': <b>' + Array(n).fill('2').join(' × ') + ' = ' + total + '</b> patterns'));
      if (n <= 5) {
        const half = total / 2, grid = el('div', 'patgrid');
        all(n).forEach((p, i) => grid.append(el('span', 'patchip' + (n > 1 && i >= half ? ' hi' : ''), '<b>' + p[0] + '</b>' + p.slice(1))));
        node.append(grid);
        if (n > 1) node.append(el('div', 'stepnote', 'Look at the first switch (in bold). The top half of the list is every ' + (n - 1) + '-switch pattern with the new switch <b>off</b>. The bottom half (green) is the very same list again with it <b>on</b>. That is why one more switch always doubles the count.'));
        else node.append(el('div', 'stepnote', 'One switch, two choices: off or on.'));
      } else {
        node.append(el('div', 'stepnote', 'Too many to list here. Each extra switch doubles the list: 2, 4, 8, 16, 32, 64, 128, 256.'));
      }
      node.append(el('div', 'cnlabel', 'The same ' + total + ' patterns, sorted by how many switches are on. Tap a bar.'));
      const bars = el('div', 'dicebars'); bars.style.setProperty('--n', n + 1);
      const peak = choose(n, Math.floor(n / 2));
      for (let k = 0; k <= n; k++) {
        const c = choose(n, k), col = el('button', 'dicecol' + (st.k === k ? ' on' : ''));
        col.type = 'button'; col.title = c + ' patterns with ' + k + ' on';
        col.setAttribute('aria-label', c + ' patterns with ' + k + ' switches on');
        const bar = el('div', 'bar'); bar.style.height = (c / peak * 100) + '%';
        col.append(bar); col.addEventListener('click', () => { st.k = st.k === k ? null : k; draw(); });
        bars.append(col);
      }
      node.append(bars);
      const axis = el('div', 'diceaxis'); for (let k = 0; k <= n; k++) axis.append(el('span', '', String(k)));
      node.append(axis, el('div', 'worth', 'how many switches are on'));
      const counts = []; for (let k = 0; k <= n; k++) counts.push(choose(n, k));
      node.append(el('div', 'stepnote', counts.join(' + ') + ' = <b>' + total + '</b>'));
      if (st.k !== null) {
        const list = all(n).filter(p => p.split('1').length - 1 === st.k);
        node.append(el('div', 'cnlabel', list.length + ' pattern' + (list.length === 1 ? '' : 's') + ' with exactly ' + st.k + ' on. Counting these is a "choose" question: in how many ways can you pick ' + st.k + ' of the ' + n + ' switches to turn on?'));
        const g = el('div', 'patgrid'); list.forEach(p => g.append(el('span', 'patchip', p))); node.append(g);
      }
    }
    draw();
  }

  // ---- one byte as two hex digits: <div data-widget="hexbyte" data-key data-start> ----
  function hexByteWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) { const s = Number(node.dataset.start || 65); state[key] = { bits: Array.from({ length: 8 }, (_, i) => (s >> (7 - i)) & 1) }; }
    const st = state[key], HEX = '0123456789ABCDEF';
    function draw() {
      node.innerHTML = ''; node.className = 'bitsbox hexbyte';
      const halves = el('div', 'hexhalves');
      let hi = 0, lo = 0;
      [0, 1].forEach(h => {
        const box = el('div', 'hexhalf'), row = el('div', 'bits'); row.style.setProperty('--n', 4);
        let v = 0;
        for (let j = 0; j < 4; j++) {
          const i = h * 4 + j, w = 8 >> j, bit = st.bits[i];
          if (bit) v += w;
          const cell = el('div', 'bitcell'), sw = el('button', 'bit' + (bit ? ' on' : ''), bit ? '1' : '0');
          sw.type = 'button'; sw.setAttribute('aria-label', (h ? 'Right' : 'Left') + ' half, switch worth ' + w + ', ' + (bit ? 'on' : 'off'));
          sw.addEventListener('click', () => { st.bits[i] = bit ? 0 : 1; draw(); });
          cell.append(sw, el('div', 'worth', String(w)));
          row.append(cell);
        }
        if (h) lo = v; else hi = v;
        box.append(el('div', 'cnlabel', h ? 'Right half' : 'Left half'), row, el('div', 'hexdigit', 'worth <b>' + v + '</b> → hex digit <b class="big">' + HEX[v] + '</b>'));
        halves.append(box);
      });
      node.append(halves);
      const v = hi * 16 + lo;
      node.append(el('div', 'bitinfo', 'Hex <b>' + HEX[hi] + HEX[lo] + '</b> &nbsp;=&nbsp; ' + hi + ' × 16 + ' + lo + ' &nbsp;=&nbsp; <b>' + v + '</b>'));
      const strip = el('div', 'hexdigits');
      for (let d = 0; d < 16; d++) strip.append(el('span', 'cn' + (d === hi || d === lo ? ' chk' : ''), HEX[d]));
      node.append(el('div', 'cnlabel', 'The 16 hex digits. After 9 the letters A to F stand for 10 to 15.'), strip);
      const grey = el('div', 'greyrow');
      const sw = el('span', 'swatch', ''); sw.style.background = 'rgb(' + v + ',' + v + ',' + v + ')';
      grey.append(sw, el('span', '', 'Red, green and blue all set to ' + v + '.'));
      const bar = el('div', 'greystrip'), mark = el('span', 'greymark'); mark.style.left = (v / 255 * 100) + '%'; bar.append(mark);
      node.append(el('div', 'cnlabel', 'The same byte read as a shade of grey (0 is black, 255 is white)'), grey, bar);
    }
    draw();
  }

  // ---- a tiny picture you can zoom into: <div data-widget="pixels" data-key> ----
  function pixelsWidget(node) {
    const key = node.dataset.key;
    const pal = { K: [20, 24, 32], Y: [255, 196, 0], W: [250, 250, 250], R: [220, 40, 50] };
    const art = ['KKKKKKKK', 'KYYYYYYK', 'KYWWWWYK', 'KYWRRWYK', 'KYWRRWYK', 'KYWWWWYK', 'KYYYYYYK', 'KKKKKKKK'];
    if (!state[key]) state[key] = { px: art.map(r => r.split('').map(c => pal[c].slice())), sel: [3, 3], small: false };
    const st = state[key];
    const hex = v => v.toString(16).toUpperCase().padStart(2, '0');
    function draw(focusName) {
      node.innerHTML = ''; node.className = 'bitsbox pixels';
      const grid = el('div', 'pxgrid' + (st.small ? ' small' : ''));
      st.px.forEach((row, y) => row.forEach((c, x) => {
        const b = el('button', 'px' + (!st.small && st.sel[0] === y && st.sel[1] === x ? ' on' : ''));
        b.type = 'button'; b.style.background = 'rgb(' + c.join(',') + ')';
        b.setAttribute('aria-label', 'Pixel row ' + (y + 1) + ' column ' + (x + 1));
        b.addEventListener('click', () => { st.sel = [y, x]; st.small = false; draw(); });
        grid.append(b);
      }));
      const row = el('div', 'wrow');
      row.append(btn(st.small ? 'Zoom in again' : 'See it at real size', '', () => { st.small = !st.small; draw(); }));
      node.append(grid, row);
      if (st.small) { node.append(el('div', 'stepnote', 'That speck is the whole picture: 8 dots across and 8 down. Your screen is millions of dots like these.')); return; }
      const c = st.px[st.sel[0]][st.sel[1]];
      node.append(el('div', 'cnlabel', 'The dot you tapped: row ' + (st.sel[0] + 1) + ', column ' + (st.sel[1] + 1) + '. It is three bytes. Slide them to repaint it.'));
      ['Red', 'Green', 'Blue'].forEach((name, i) => {
        const r = el('div', 'rgbrow');
        const input = el('input'); input.type = 'range'; input.min = 0; input.max = 255; input.value = c[i]; input.setAttribute('aria-label', name);
        input.addEventListener('input', () => { c[i] = Number(input.value); draw(name); });
        r.append(el('span', '', name), input, el('span', '', String(c[i])), el('span', '', byteBits(c[i])));
        node.append(r);
        if (focusName === name) setTimeout(() => input.focus(), 0);
      });
      node.append(el('div', 'meanings', '<div>Those three bytes in hex: <b>' + hex(c[0]) + ' ' + hex(c[1]) + ' ' + hex(c[2]) + '</b>. Web pages write this colour as <b>#' + hex(c[0]) + hex(c[1]) + hex(c[2]) + '</b>.</div><div>The whole picture: 8 × 8 = 64 dots, × 3 bytes = <b>192 bytes</b>.</div>'));
    }
    draw();
  }

  // ---- an amount of money stored three ways: <div data-widget="money" data-key data-start> ----
  function moneyWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { v: node.dataset.start || '0.10', times: 10 };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox money';
    const line = el('div', 'wline', '<span>Amount in rupees</span>');
    const input = el('input'); input.type = 'text'; input.inputMode = 'decimal'; input.value = st.v; input.setAttribute('aria-label', 'Amount in rupees');
    line.append(input);
    const out = el('div', 'meanings');
    const line2 = el('div', 'wline', '<span>Add it up this many times</span>');
    const times = el('input'); times.type = 'number'; times.min = 1; times.max = 1000; times.value = st.times; times.setAttribute('aria-label', 'How many times');
    line2.append(times);
    const out2 = el('div', 'meanings');
    const rupees = p => { const s = p.toString().padStart(3, '0'); return s.slice(0, -2) + '.' + s.slice(-2); };
    function draw() {
      st.v = input.value.trim(); st.times = Math.max(1, Math.min(1000, Math.trunc(Number(times.value) || 1)));
      const m = st.v.match(/^(\d{1,10})(?:\.(\d{1,2}))?$/);
      if (!m) { out.innerHTML = '<div class="bitmsg">Type an amount like 250 or 1500.75 (at most two digits after the point).</div>'; out2.innerHTML = ''; return; }
      const paise = BigInt(m[1]) * 100n + BigInt((m[2] || '0').padEnd(2, '0'));
      const asDouble = Number(st.v);
      const exact = asDouble.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
      const plain = rupees(paise).replace(/\.?0+$/, '') || '0';
      out.innerHTML = '<div>As a <code>double</code>, what is really stored: <b>' + esc(exact) + '</b> ' + (exact === plain ? '<span class="yes">(exact this time)</span>' : '<span class="bad">(close, not exact)</span>') + '</div>'
        + '<div>As whole paise in a <code>long</code>: <b>' + paise + '</b> <span class="yes">(exact)</span></div>'
        + '<div>In a database column <code>DECIMAL(15,2)</code>: <b>' + rupees(paise) + '</b> <span class="yes">(exact: it keeps decimal digits, not halves and quarters)</span></div>'
        + '<div>In a card payment message, the amount field, 12 digits of paise: <b>' + paise.toString().padStart(12, '0') + '</b></div>';
      let d = 0; for (let i = 0; i < st.times; i++) d += asDouble;
      const p = paise * BigInt(st.times), right = rupees(p);
      const same = Number(right) === d;
      out2.innerHTML = '<div>Adding <code>double</code>s: <b>' + esc(String(d)) + '</b> ' + (same ? '<span class="yes">(right this time)</span>' : '<span class="bad">(wrong: the tiny errors piled up)</span>') + '</div>'
        + '<div>Adding paise, then showing rupees: <b>' + right + '</b> <span class="yes">(always right)</span></div>';
    }
    input.addEventListener('input', draw); times.addEventListener('input', draw);
    node.append(line, out, el('div', 'cnlabel', 'Now add the amount to itself, the way a running total does.'), line2, out2);
    draw();
  }

  // ---- a card authorisation message, field by field: <div data-widget="iso8583" data-key> ----
  const ISO = {
    request: {
      mti: '0100', mtiNote: 'Authorisation request, sent by the shop\'s bank',
      fields: [
        [2, 'Card number (PAN)', 'n..19, LLVAR', '4111111111111111', 'The card number. LLVAR means its length goes first, as two digits, because card numbers are not all the same length. On the wire: 16, then the 16 digits.'],
        [3, 'Processing code', 'n6', '000000', 'What kind of transaction. The first two digits are the type: 00 a purchase, 01 cash from an ATM, 20 a refund, 31 a balance enquiry. The other four name the accounts; 0000 means "the default ones".'],
        [4, 'Amount', 'n12', '000000025000', 'The amount in the smallest unit of the currency, padded with zeros to 12 digits. 25000 paise is ₹250.00. There is no decimal point anywhere: whole numbers only.'],
        [7, 'Date and time sent', 'n10, MMDDhhmmss', '1015143005', 'When this message was sent: 15 October, 14:30:05, in UTC.'],
        [11, 'Trace number (STAN)', 'n6', '004187', 'A counter the sender adds one to for every message. The answer carries the same number back, so the sender can match each answer to its question.'],
        [14, 'Expiry date', 'n4, YYMM', '2908', 'The card expires at the end of August 2029. Year first, then month.'],
        [22, 'How the card was read', 'n3', '071', 'The first two digits say how the card number was captured: 07 a contactless chip, 05 the chip inserted, 01 typed by hand. The last digit says whether this terminal can take a PIN: 1 means yes.'],
        [25, 'Condition', 'n2', '00', 'The situation at the counter. 00 means normal: the customer is there with the card.'],
        [37, 'Reference number (RRN)', 'an12', '528814004187', 'A reference for this payment that stays the same through refunds and disputes later. It is what a bank asks for when you complain about a charge.'],
        [41, 'Terminal ID', 'ans8', 'TRM00042', 'Which terminal.'],
        [42, 'Merchant ID', 'ans15', 'ARENA0000001234', 'Which shop, as the shop\'s bank knows it.'],
        [43, 'Shop name and place', 'ans40', 'ARENA SNACKS           BENGALURU    IN', 'Shop name, city and country, each padded with spaces to a fixed width. Roughly what you later see on your bank statement.'],
        [49, 'Currency', 'n3', '356', 'The currency as a number from the list called ISO 4217: 356 is the Indian rupee, 840 the US dollar, 978 the euro. Field 4 means nothing without this.'],
        [55, 'Chip data', 'b..255, LLLVAR', '9F0206000000025000 5F2A020356 9F37041A2B3C4D 9F36020012 9F2608C3A1F47E2290B5D1', 'What the chip said during the tap, as a list of tag, length, value (TLV). The table below splits it.'],
      ],
    },
    response: {
      mti: '0110', mtiNote: 'Authorisation response, sent back by the card\'s bank',
      fields: [
        [2, 'Card number (PAN)', 'n..19, LLVAR', '4111111111111111', 'Copied from the question.'],
        [3, 'Processing code', 'n6', '000000', 'Copied from the question.'],
        [4, 'Amount', 'n12', '000000025000', 'Copied from the question.'],
        [7, 'Date and time sent', 'n10, MMDDhhmmss', '1015143005', 'Copied from the question.'],
        [11, 'Trace number (STAN)', 'n6', '004187', 'The same number as in the question. This is how the shop\'s bank knows which question this answers.'],
        [37, 'Reference number (RRN)', 'an12', '528814004187', 'Copied from the question.'],
        [38, 'Approval code', 'an6', 'A1B2C3', 'Given by the card\'s bank only when it says yes. It is printed on the receipt.'],
        [39, 'Response code', 'an2', '00', 'The answer itself. 00 means approved. The table under this diagram lists the common "no" codes.'],
        [41, 'Terminal ID', 'ans8', 'TRM00042', 'Copied from the question.'],
        [42, 'Merchant ID', 'ans15', 'ARENA0000001234', 'Copied from the question.'],
        [49, 'Currency', 'n3', '356', 'Copied from the question.'],
      ],
    },
  };
  const TLV = { '9F02': 'The amount, as the chip saw it', '5F2A': 'The currency, as the chip saw it (0356 is the rupee)', '9F37': 'A random number from the terminal, so no two taps are the same', '9F36': 'The chip\'s own counter of taps (ATC). Hex 0012 is 18: its 18th tap', '9F26': 'The cryptogram: a one-time code only the real chip could make. Payments note 5.' };
  function splitTlv(s) {
    const h = s.replace(/\s+/g, ''), out = []; let i = 0;
    while (i < h.length) {
      let tag = h.substr(i, 2); i += 2;
      if ((parseInt(tag, 16) & 0x1F) === 0x1F) { tag += h.substr(i, 2); i += 2; }
      const len = parseInt(h.substr(i, 2), 16); i += 2;
      out.push({ tag, len, value: h.substr(i, len * 2) }); i += len * 2;
    }
    return out;
  }
  function bitmapOf(nums) {
    const bytes = new Array(8).fill(0);
    nums.forEach(f => { const b = f - 1; bytes[b >> 3] |= 0x80 >> (b & 7); });
    return bytes;
  }
  function iso8583Widget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { which: 'request', sel: 4 };
    const st = state[key];
    const h2 = b => b.toString(16).toUpperCase().padStart(2, '0');
    function draw() {
      const msg = ISO[st.which], nums = msg.fields.map(f => f[0]), bm = bitmapOf(nums);
      node.innerHTML = ''; node.className = 'bitsbox iso';
      const tabs = el('div', 'wrow');
      [['request', 'The question (0100)'], ['response', 'The answer (0110)']].forEach(([id, label]) => {
        const b = btn(label, st.which === id ? 'primary' : '', () => { st.which = id; if (!ISO[id].fields.some(f => f[0] === st.sel)) st.sel = 4; draw(); });
        b.setAttribute('aria-pressed', st.which === id ? 'true' : 'false'); tabs.append(b);
      });
      node.append(tabs);
      node.append(el('div', 'cnlabel', '1. The message type: 4 digits'));
      node.append(el('div', 'mti', msg.mti.split('').map(c => '<span class="cn chk">' + c + '</span>').join('') + '<span class="mtinote">' + esc(msg.mtiNote) + '</span>'));
      node.append(el('div', 'worth', 'Digit 1: version of the standard (0 = 1987). Digit 2: class (1 = authorisation, 2 = a payment that moves money, 4 = reversal, 8 = network check). Digit 3: function (0 = question, 1 = answer). Digit 4: who started it (0 = the shop\'s side).'));
      node.append(el('div', 'cnlabel', '2. The bitmap: 64 switches, one per field. A switch is on when that field is in the message. Tap a lit one.'));
      const grid = el('div', 'bmgrid');
      for (let r = 0; r < 8; r++) {
        const row = el('div', 'bmrow');
        for (let c = 0; c < 8; c++) {
          const f = r * 8 + c + 1, on = nums.includes(f);
          const cell = el('button', 'bmcell' + (on ? ' on' : '') + (f === st.sel ? ' sel' : ''), String(f));
          cell.type = 'button'; cell.disabled = !on;
          cell.setAttribute('aria-label', 'Field ' + f + (on ? ', present' : ', not in this message'));
          if (on) cell.addEventListener('click', () => { st.sel = f; draw(); });
          row.append(cell);
        }
        row.append(el('span', 'bmhex', h2(bm[r])));
        grid.append(row);
      }
      node.append(grid);
      node.append(el('div', 'stepnote', 'Each row of 8 switches is one byte, shown in hex on the right. The whole bitmap travels as 8 bytes: <b>' + bm.map(h2).join('') + '</b>. Switch 1 is off, which means "there is no second bitmap": every field here is numbered 64 or lower.'));
      node.append(el('div', 'cnlabel', '3. The fields, in number order. Tap one.'));
      const list = el('div', 'isolist');
      msg.fields.forEach(f => {
        const b = el('button', 'isorow' + (f[0] === st.sel ? ' on' : ''), '<span class="isonum">' + f[0] + '</span><span>' + esc(f[1]) + '</span><span class="isoval">' + esc(f[3]) + '</span>');
        b.type = 'button'; b.addEventListener('click', () => { st.sel = f[0]; draw(); });
        list.append(b);
      });
      node.append(list);
      const f = msg.fields.find(x => x[0] === st.sel) || msg.fields[0];
      const info = el('div', 'isoinfo');
      info.append(el('div', 'flowtitle', 'Field ' + f[0] + ': ' + esc(f[1])), el('div', 'worth', 'Format: ' + esc(f[2])), el('pre', '', esc(f[3])), el('div', '', esc(f[4])));
      if (f[0] === 55) {
        const t = el('table', 'chars');
        t.innerHTML = '<tr><th>Tag</th><th>Length</th><th>Value</th></tr>' + splitTlv(f[3]).map(x => '<tr><td>' + x.tag + '</td><td>' + x.len + ' bytes</td><td>' + x.value + '</td></tr><tr><td colspan="3" style="white-space: normal; font-family: inherit;">' + esc(TLV[x.tag] || '') + '</td></tr>').join('');
        const w = el('div', 'charswrap'); w.append(t); info.append(w);
      }
      node.append(info);
    }
    draw();
  }

  // ---- one chip-card command, byte by byte: <div data-widget="apdu" data-key> ----
  const APDUS = [
    { name: 'SELECT the payment list', bytes: '00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 00', data: 'The name 2PAY.SYS.DDF01 as text bytes: 32 is "2", 50 is "P", 41 is "A", 59 is "Y". Every contactless payment card answers to this name.', reply: 'the list of payment apps on the card' },
    { name: 'SELECT one app', bytes: '00 A4 04 00 07 A0 00 00 00 03 10 10 00', data: 'The app\'s ID (AID). A0 00 00 00 03 is Visa and 10 10 its credit and debit app. Mastercard\'s is A0 00 00 00 04 10 10 and RuPay\'s A0 00 00 05 24 10 10.', reply: 'details of the app, including the list of things it wants to know before it starts (the PDOL)' },
    { name: 'GET PROCESSING OPTIONS', bytes: '80 A8 00 00 0E 83 0C 00 00 00 02 50 00 03 56 1A 2B 3C 4D 00', data: '83 0C means "12 bytes of answers follow". Then the answers to the card\'s list, values only, in the order it asked: amount 00 00 00 02 50 00, currency 03 56, a random number 1A 2B 3C 4D. (Simplified: real cards ask for a few more things.)', reply: 'which records to read, and on many contactless cards the cryptogram straight away' },
    { name: 'READ RECORD', bytes: '00 B2 01 0C 00', data: 'This command carries no data.', reply: 'card data such as the card number, the expiry date and the certificates' },
    { name: 'GENERATE AC', bytes: '80 AE 80 00 1D … 00', data: 'The transaction details the card asked for, shortened here. P1 = 80 asks for an ARQC: "make a cryptogram for your bank to check online".', reply: 'the cryptogram and the tap counter, which end up in field 55 of the message to the bank' },
  ];
  const AMEAN = {
    CLA: 'Class. 00 is a standard command; 80 is one defined for payment cards.',
    INS: 'Instruction: which command. A4 select, A8 get processing options, B2 read record, AE generate a cryptogram.',
    P1: 'Parameter 1. Its meaning depends on the command: for SELECT, 04 means "select by name"; for READ RECORD, the record number; for GENERATE AC, which kind of cryptogram.',
    P2: 'Parameter 2. For READ RECORD it names the file the record is in.',
    Lc: 'How many data bytes follow. In hex: 0E is 14.',
    Data: '',
    Le: 'How many bytes the terminal expects back. 00 means "as many as you have".',
  };
  function apduWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { i: 0, part: 'INS' };
    const st = state[key];
    function draw() {
      const a = APDUS[st.i], b = a.bytes.split(' ');
      node.innerHTML = ''; node.className = 'bitsbox apdu';
      const pick = el('div', 'wrow');
      APDUS.forEach((x, i) => pick.append(btn((i + 1) + '. ' + x.name, i === st.i ? 'primary' : '', () => { st.i = i; if (st.part === 'Data' || st.part === 'Lc') st.part = 'INS'; draw(); })));
      node.append(pick);
      const row = el('div', 'apbytes'), hasData = b.length > 5;
      b.forEach((v, i) => {
        const p = i < 4 ? ['CLA', 'INS', 'P1', 'P2'][i] : i === b.length - 1 ? 'Le' : i === 4 && hasData ? 'Lc' : 'Data';
        const c = el('button', 'apb ap-' + p.toLowerCase() + (st.part === p ? ' sel' : ''), '<span>' + esc(v) + '</span><small>' + p + '</small>');
        c.type = 'button'; c.addEventListener('click', () => { st.part = p; draw(); });
        row.append(c);
      });
      node.append(el('div', 'cnlabel', 'The terminal sends these bytes to the card. Tap any of them.'), row);
      let text = st.part === 'Data' ? a.data : AMEAN[st.part];
      if (st.i === 3 && st.part === 'P1') text = 'Parameter 1: the record number, 01.';
      if (st.i === 3 && st.part === 'P2') text = 'Parameter 2: 0C names the file. 0C is 00001 100 in binary: the first five switches say file 1, the last three (100) say "P1 is a record number".';
      if (st.i === 4 && st.part === 'Lc') text = 'How many data bytes follow: 1D is 29.';
      node.append(el('div', 'isoinfo', '<div class="flowtitle">' + esc(st.part) + '</div><div>' + esc(text) + '</div>'));
      node.append(el('div', 'stepnote', '<b>The card answers with</b> ' + esc(a.reply) + ', and then two status bytes. <b>90 00</b> means "done". <b>6A 82</b> means "I have no such app or file".'));
    }
    draw();
  }


  // ---- java.util.Random, step by step, with Java's real formula: <div data-widget="seedmachine" data-key data-seed data-n data-k> ----
  // Matches Java exactly (checked: new Random(7), nextInt(21) + 10 gives 20, 15, 28; seed 42 with bounds 16 and 50 too).
  function seedMachineWidget(node) {
    const key = node.dataset.key;
    const MASK = (1n << 48n) - 1n, MULT = 0x5DEECE66Dn, ADD = 0xBn;
    if (!state[key]) state[key] = { seed: Number(node.dataset.seed || 7), n: Number(node.dataset.n || 21), k: Number(node.dataset.k || 10) };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox seedm';
    const line = el('div', 'wline');
    const mk = (v, label, w) => { const i = el('input'); i.type = 'number'; i.value = v; i.setAttribute('aria-label', label); i.style.width = w; return i; };
    const si = mk(st.seed, 'Seed', '110px'), ni = mk(st.n, 'How many values', '80px'), ki = mk(st.k, 'Add', '80px');
    line.append(el('span', '', 'new Random('), si, el('span', '', ')  then  nextInt('), ni, el('span', '', ') +'), ki);
    const out = el('div'), rolls = el('div', 'patgrid'), msg = el('div', 'bitmsg');
    let s = 0n, seen = [];
    function start() {
      st.seed = Math.trunc(Number(si.value) || 0); st.n = Math.trunc(Number(ni.value)); st.k = Math.trunc(Number(ki.value) || 0);
      s = (BigInt(st.seed) ^ MULT) & MASK; seen = [];
      out.innerHTML = '<div class="stepnote">The machine is built. Its secret number is now <b>' + s + '</b>: your seed, mixed once with a fixed number. Press Roll.</div>';
      rolls.innerHTML = ''; msg.textContent = st.n >= 1 && st.n <= 1000000 ? '' : 'Pick between 1 and 1,000,000 values. (Java itself would stop with an error for 0 or less.)';
    }
    function next31() { const before = s; s = (s * MULT + ADD) & MASK; return { before, after: s, r: Number(s >> 17n) }; }
    function roll() {
      if (!(st.n >= 1 && st.n <= 1000000)) return;
      const b = st.n, m = b - 1, tries = [];
      let t = next31(), r, way;
      tries.push(t);
      if ((b & m) === 0) { r = Number((BigInt(b) * BigInt(t.r)) >> 31n); way = b + ' is a power of 2, so Java takes the top part of the number instead of the remainder: ' + r + '.'; }
      else {
        let u = t.r;
        while (u - (r = u % b) + m > 2147483647) { t = next31(); tries.push(t); u = t.r; }
        way = fmt(t.r) + ' % ' + b + ' = <b>' + r + '</b>, the remainder after dividing by ' + b + ', which is always 0 to ' + m + '.' + (tries.length > 1 ? ' (The first number was thrown away: it came from the small uneven bit at the very top of the range, so Java took the next one. This keeps every value equally likely.)' : '');
      }
      const result = r + st.k; seen.push(result);
      const last = tries[tries.length - 1];
      out.innerHTML = '<div class="meanings">'
        + '<div>1. Secret number before: <b>' + last.before + '</b></div>'
        + '<div>2. Multiply by 25,214,903,917, add 11, keep only the last 48 switches: <b>' + last.after + '</b>. This becomes the new secret number, used next time.</div>'
        + '<div>3. Take its top 31 switches as a whole number: <b>' + fmt(last.r) + '</b></div>'
        + '<div>4. Cut it down to the size you asked for: ' + way + '</div>'
        + '<div>5. Your code adds ' + st.k + ': <b>' + result + '</b>. That is what <code>dice.nextInt(' + b + ') + ' + st.k + '</code> hands back.</div></div>';
      rolls.innerHTML = '';
      seen.forEach((v, i) => rolls.append(el('span', 'patchip' + (i === seen.length - 1 ? ' hi' : ''), String(v))));
    }
    [si, ni, ki].forEach(i => i.addEventListener('input', start));
    const row = el('div', 'wrow');
    row.append(btn('Roll', 'primary', roll), btn('Start again with this seed', '', start));
    node.append(line, row, out, el('div', 'cnlabel', 'Rolls so far'), rolls, msg);
    start();
  }


  // ---- the lesson 9 fight run three times, with Java's exact Random: <div data-widget="threeruns" data-key> ----
  // Seed 7 reproduces his own Game.java run with new Random(7) line for line (checked 2026-10-15).
  function threeRunsWidget(node) {
    const key = node.dataset.key;
    if (!state[key]) state[key] = { mode: 'seed', runs: null };
    const st = state[key];
    const MASK = (1n << 48n) - 1n, MULT = 0x5DEECE66Dn, ADD = 0xBn;
    function fight(seed) {
      let s = (seed ^ MULT) & MASK;
      const next = () => { s = (s * MULT + ADD) & MASK; return Number(s >> 17n); };
      const nextInt = (b) => { let r = next(); const m = b - 1; for (let u = r; u - (r = u % b) + m > 2147483647; u = next()); return r; };
      let h = 100, m = 100; const lines = [];
      for (let round = 1; h > 0 && m > 0 && round < 60; round++) {
        lines.push('Round ' + round);
        const d = nextInt(21) + 10; m -= d; lines.push('Hero hits for ' + d, 'Monster HP: ' + Math.max(0, m));
        if (m > 0) { const e = nextInt(21) + 5; h -= e; lines.push('Monster hits for ' + e, 'Hero HP: ' + Math.max(0, h)); }
      }
      lines.push(m <= 0 ? 'You win!' : 'You lose.');
      return { seed, lines };
    }
    let counter = 8682522807148012n;
    function clockSeed() {   // what new Random() does: a changing counter mixed with a clock in billionths of a second
      counter = (counter * 1181783497276652981n) & ((1n << 64n) - 1n);
      const nano = BigInt(Math.floor(performance.now() * 1e6)) + BigInt(Date.now()) * 1000000n;
      return (counter ^ nano) & ((1n << 63n) - 1n);
    }
    function run() { st.runs = [0, 1, 2].map(() => fight(st.mode === 'seed' ? 7n : clockSeed())); draw(); }
    function draw() {
      node.innerHTML = ''; node.className = 'bitsbox threeruns';
      const row = el('div', 'wrow');
      [['seed', 'new Random(7)'], ['clock', 'new Random()']].forEach(([id, label]) => {
        const b = btn(label, st.mode === id ? 'primary' : '', () => { st.mode = id; run(); });
        b.setAttribute('aria-pressed', st.mode === id ? 'true' : 'false'); b.classList.add('mono'); row.append(b);
      });
      node.append(el('div', 'cnlabel', 'Which line is in your program?'), row);
      if (!st.runs) { run(); return; }
      const cols = el('div', 'runcols');
      const base = st.runs[0].lines;
      st.runs.forEach((r, i) => {
        const c = el('div', 'runcol');
        c.append(el('div', 'runhead', 'Run ' + (i + 1)), el('div', 'worth', 'seed ' + (r.seed === 7n ? '7' : String(r.seed).slice(0, 6) + '…')));
        r.lines.slice(0, 16).forEach((l, n) => c.append(el('div', 'runline' + (i > 0 && l !== base[n] ? ' diff' : ''), esc(l))));
        if (r.lines.length > 16) c.append(el('div', 'worth', '… ' + (r.lines.length - 16) + ' more lines'));
        cols.append(c);
      });
      node.append(cols);
      const same = st.runs.every(r => r.lines.join('|') === base.join('|'));
      node.append(el('div', 'summary ' + (same ? 'no' : 'ok'), same
        ? 'All three runs are identical, line for line. Same seed, same rolls, same fight. "The three fights are not identical" fails.'
        : 'The runs differ (lines that differ from run 1 are marked). Each run got its own seed from the clock.'));
      const again = el('div', 'wrow'); again.append(btn('Run three times again', '', run)); node.append(again);
    }
    draw();
  }


  // ---- a whole-number box that runs out of room: <div data-widget="overflow" data-key data-type="int" data-total data-add> ----
  // Worked out with BigInt exactly the way Java stores it: only the last N switches are kept,
  // and the first switch counts as negative. Checked against Java 17 for byte, short, int and long.
  function overflowWidget(node) {
    const key = node.dataset.key;
    const TYPES = { byte: 8, short: 16, int: 32, long: 64 };
    if (!state[key]) state[key] = { type: TYPES[node.dataset.type] ? node.dataset.type : 'int', total: node.dataset.total || '2000000000', add: node.dataset.add || '2000000000' };
    const st = state[key];
    const commas = b => { const neg = b < 0n, t = (neg ? -b : b).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '-' : '') + t; };
    const parse = v => /^-?\d{1,25}$/.test(String(v).trim()) ? BigInt(String(v).trim()) : null;
    node.innerHTML = ''; node.className = 'bitsbox overflow';
    const typeRow = el('div', 'wrow');
    const inTotal = el('input'); inTotal.type = 'text'; inTotal.inputMode = 'numeric'; inTotal.value = st.total; inTotal.setAttribute('aria-label', 'What the box holds now');
    const inAdd = el('input'); inAdd.type = 'text'; inAdd.inputMode = 'numeric'; inAdd.value = st.add; inAdd.setAttribute('aria-label', 'The number added');
    const l1 = el('div', 'wline', '<span>The box holds</span>'); l1.append(inTotal);
    const l2 = el('div', 'wline', '<span>Add</span>'); l2.append(inAdd);
    const out = el('div', 'meanings');
    const again = el('div', 'wrow');
    function draw() {
      typeRow.innerHTML = '<span>The box:</span>';
      Object.keys(TYPES).forEach(t => { const b = btn(t + ' (' + TYPES[t] + ' switches)', t === st.type ? 'primary' : '', () => { st.type = t; draw(); }); b.setAttribute('aria-pressed', String(t === st.type)); typeRow.append(b); });
      st.total = inTotal.value; st.add = inAdd.value;
      const n = TYPES[st.type], M = 1n << BigInt(n), min = -(M >> 1n), max = (M >> 1n) - 1n;
      const a = parse(st.total), b = parse(st.add);
      again.innerHTML = '';
      if (a === null || b === null) { out.innerHTML = '<div class="bitmsg">Type whole numbers only, like 2000000000 or -5 (no commas).</div>'; return; }
      if (a < min || a > max) { out.innerHTML = '<div class="bitmsg">A ' + st.type + ' cannot even hold ' + commas(a) + ' to start with. Its range is ' + commas(min) + ' to ' + commas(max) + '.</div>'; return; }
      const real = a + b;
      const stored = (((real - min) % M) + M) % M + min;
      const fits = real === stored;
      const pos = v => Number(((v - min) * 10000n) / (M - 1n)) / 100;
      let html = '<div>A <code>' + st.type + '</code> holds from <b>' + commas(min) + '</b> to <b>' + commas(max) + '</b>.</div>'
        + '<div>The real answer: ' + commas(a) + ' + ' + commas(b) + ' = <b>' + commas(real) + '</b></div>';
      if (fits) html += '<div>What Java stores: <b>' + commas(stored) + '</b> <span class="yes">(it fits)</span></div>';
      else {
        const laps = (real - stored) / M;
        html += '<div>What Java stores: <b class="bad">' + commas(stored) + '</b> <span class="bad">(wrong: it did not fit)</span></div>'
          + '<div class="cnlabel">The answer is ' + (real > max ? commas(real - max) + ' past the top' : commas(min - real) + ' below the bottom') + '. The box has only ' + n + ' switches, so Java keeps the last ' + n + ' and drops the rest. That is the same as ' + (laps > 0n ? 'taking away ' : 'adding ') + commas((laps < 0n ? -laps : laps) * M) + ' (2 to the power ' + n + (laps === 1n || laps === -1n ? '' : ', ' + commas(laps < 0n ? -laps : laps) + ' times') + '): counting goes past ' + commas(max) + ' and carries on from ' + commas(min) + ', like a car meter that rolls over.</div>';
      }
      html += '<div class="ovline" role="img" aria-label="Where the stored value sits in the range"><span class="ovmark" style="left:' + pos(stored) + '%"></span><span class="ovzero" style="left:' + pos(0n) + '%"></span></div>'
        + '<div class="ovends"><span>' + commas(min) + '</span><span>0</span><span>' + commas(max) + '</span></div>';
      if (n <= 32) {
        const bits = ((stored % M) + M) % M;
        const str = bits.toString(2).padStart(n, '0').replace(/(.{8})(?=.)/g, '$1 ');
        html += '<div>The ' + n + ' switches Java keeps: <code class="ovbits">' + str + '</code></div>'
          + '<div class="cnlabel">The first switch is worth ' + commas(min) + ' (negative), every other one is positive. ' + (stored < 0n ? 'It is on, so the number reads as negative.' : 'It is off, so the number reads as positive.') + '</div>';
      }
      out.innerHTML = html;
      again.append(btn('Add it again (total = the stored answer)', '', () => { inTotal.value = stored.toString(); draw(); }));
    }
    inTotal.addEventListener('input', draw); inAdd.addEventListener('input', draw);
    node.append(typeRow, l1, l2, out, again);
    draw();
  }


  // ---- type conversion explorer: <div data-widget="convert" data-key data-from="long" data-to="int" data-value> ----
  // Every verdict, message and result matches Java 17 (checked with javac/java on 2026-10-18):
  // whole-number narrowing keeps the last N switches; double to a whole number drops the part after the
  // point (towards zero), saturates at the ends, NaN gives 0, and to byte/short goes through int first.
  function convertWidget(node) {
    const key = node.dataset.key;
    const T = { byte: { bits: 8, rank: 1 }, short: { bits: 16, rank: 2 }, int: { bits: 32, rank: 3 }, long: { bits: 64, rank: 4 }, double: { bits: 64, rank: 5 } };
    const names = Object.keys(T);
    if (!state[key]) state[key] = { from: T[node.dataset.from] ? node.dataset.from : 'long', to: T[node.dataset.to] ? node.dataset.to : 'int', value: node.dataset.value || '3000000000' };
    const st = state[key];
    const commas = b => { const neg = b < 0n, t = (neg ? -b : b).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '-' : '') + t; };
    const range = t => { const M = 1n << BigInt(T[t].bits); return [-(M >> 1n), (M >> 1n) - 1n]; };
    const wrap = (v, t) => { const M = 1n << BigInt(T[t].bits), [min] = range(t); return (((v - min) % M) + M) % M + min; };
    const javaDouble = x => {
      if (Number.isNaN(x)) return 'NaN';
      const a = Math.abs(x);
      if (a !== 0 && (a >= 1e7 || a < 1e-3)) { let [m, e] = x.toExponential().split('e'); if (!m.includes('.')) m += '.0'; return m + 'E' + e.replace('+', ''); }
      const t = String(x); return t.includes('.') ? t : t + '.0';
    };
    node.innerHTML = ''; node.className = 'bitsbox convert';
    const boxes = el('div', 'cvboxes');
    const fromRow = el('div', 'wrow'), toRow = el('div', 'wrow');
    const vline = el('div', 'wline', '<span>The value</span>');
    const input = el('input'); input.type = 'text'; input.inputMode = 'decimal'; input.value = st.value; input.setAttribute('aria-label', 'The value to convert');
    vline.append(input);
    const out = el('div', 'meanings');
    function picker(row, label, which) {
      row.innerHTML = '<span>' + label + '</span>';
      names.forEach(t => { const b = btn(t, t === st[which] ? 'primary' : '', () => { st[which] = t; draw(); }); b.setAttribute('aria-pressed', String(t === st[which])); row.append(b); });
    }
    function draw() {
      picker(fromRow, 'From:', 'from'); picker(toRow, 'To:', 'to');
      boxes.innerHTML = names.map(t => '<div class="cvbox' + (t === st.from ? ' from' : '') + (t === st.to ? ' to' : '') + '" style="width:' + (T[t].bits / 64 * 100) + '%"><span>' + t + ' · ' + T[t].bits + (t === 'double' ? ' (with a point)' : '') + '</span></div>').join('');
      st.value = input.value.trim();
      const from = st.from, to = st.to, fromD = from === 'double';
      let v;
      if (fromD) { v = Number(st.value); if (st.value === '' || !/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(st.value)) { out.innerHTML = '<div class="bitmsg">Type a number like 3.99 or -2.5 or 1e20.</div>'; return; } }
      else {
        if (!/^-?\d{1,25}$/.test(st.value)) { out.innerHTML = '<div class="bitmsg">A ' + from + ' holds whole numbers only. Type one like 300 or -5 (no commas, no point).</div>'; return; }
        v = BigInt(st.value); const [lo, hi] = range(from);
        if (v < lo || v > hi) { out.innerHTML = '<div class="bitmsg">A ' + from + ' can\'t hold ' + commas(v) + '. Its range is ' + commas(lo) + ' to ' + commas(hi) + '.</div>'; return; }
      }
      const same = from === to, widening = T[from].rank < T[to].rank;
      let html = '<div><code>' + from + ' a = ' + (fromD ? st.value : st.value) + (from === 'long' ? 'L' : '') + ';</code> then <code>' + to + ' b = a;</code></div>';
      if (same) html += '<div>Same type: nothing to convert.</div>';
      else if (widening) html += '<div class="yes"><b>Widening</b> (' + from + ' into a bigger ' + to + '). Java does it on its own, no cast needed.</div>';
      else html += '<div class="bad"><b>Narrowing</b> (' + from + ' into a smaller ' + to + '). Java refuses to compile: <code>incompatible types: possible lossy conversion from ' + from + ' to ' + to + '</code></div><div>Java checks the types, not the value, so it refuses even when the value would fit. To force it you write a cast: <code>' + to + ' b = (' + to + ') a;</code></div>';
      let result, note = '';
      if (to === 'double') {
        const d = fromD ? v : Number(v);
        result = javaDouble(d);
        if (!fromD && BigInt(Math.round(d)) !== v) note = 'Close, not exact: a double keeps about 15 to 16 significant digits, so a long this big loses its last digits.';
        else if (!fromD) note = 'Same number, now printed with a point.';
      } else if (fromD) {
        const [lo, hi] = range(to === 'byte' || to === 'short' ? 'int' : to);
        let w;
        if (Number.isNaN(v)) w = 0n; else if (v >= Number(hi)) w = hi; else if (v <= Number(lo)) w = lo; else w = BigInt(Math.trunc(v));
        let r = w;
        if (to === 'byte' || to === 'short') r = wrap(w, to);
        result = commas(r);
        const steps = [];
        if (v !== Math.trunc(v)) steps.push('the part after the point is dropped (towards zero, not rounded)');
        if (!Number.isNaN(v) && (v > Number(hi) || v < Number(lo))) steps.push('too big for ' + (to === 'byte' || to === 'short' || to === 'int' ? 'an int' : 'a ' + to) + ', so Java stops at the ' + (v > 0 ? 'top' : 'bottom') + ' value');
        if ((to === 'byte' || to === 'short') && r !== w) steps.push('Java first makes it the int ' + commas(w) + ', then keeps the last ' + T[to].bits + ' switches');
        note = steps.length ? 'What happened: ' + steps.join('; ') + '.' : 'It fits exactly.';
      } else {
        const r = wrap(v, to); result = commas(r);
        note = r === v ? 'It fits, so the value is unchanged.' : 'It doesn\'t fit in ' + T[to].bits + ' switches. Java keeps the last ' + T[to].bits + ' and drops the rest, which here means ' + (v > r ? 'taking away ' : 'adding ') + commas((v > r ? v - r : r - v)) + '. The number is now wrong.';
      }
      html += '<div>' + (widening || same ? 'b holds: ' : 'With the cast, b holds: ') + '<b' + (/wrong|not exact/.test(note) ? ' class="bad"' : '') + '>' + result + '</b></div><div class="cnlabel">' + note + '</div>';
      out.innerHTML = html;
    }
    input.addEventListener('input', draw);
    node.append(el('div', 'cnlabel', 'The boxes, drawn to size (number of switches):'), boxes, fromRow, toRow, vline, out);
    draw();
  }

  // ---- Git playground: <div data-widget="gitplay" data-key> ----
  // A pretend repository with one file. Every message is Git 2.49's real text for that state
  // (captured 2026-10-18); only the snapshot ids are made up.
  function gitPlayWidget(node) {
    const key = node.dataset.key, FILE = 'play/week2-money/Bill.java';
    const LINES = ['System.out.println("GST: " + gst);', 'System.out.println("Tax: " + gst);', 'System.out.println("Tax due: " + gst);', 'System.out.println("Tax (18%): " + gst);'];
    const fresh = () => ({ work: 0, index: null, head: null, commits: [], edits: 0, term: [] });
    if (!state[key]) state[key] = fresh();
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox gitplay';
    const cols = el('div', 'gpcols'), buttons = el('div', 'wrow'), term = el('pre', 'gpterm');
    const ids = ['3f2a9c1', 'b71e04d', '9c0d5aa', '41fe7b2', 'e8a31c6', '07b9d3f'];
    function statusText() {
      const out = ['On branch main'];
      if (!st.commits.length) out.push('', 'No commits yet');
      const staged = st.index !== null && st.index !== st.head, unstaged = st.index !== null && st.work !== st.index, untracked = st.index === null;
      if (staged) out.push('', 'Changes to be committed:', st.head === null ? '  (use "git rm --cached <file>..." to unstage)' : '  (use "git restore --staged <file>..." to unstage)', '\t' + (st.head === null ? 'new file:   ' : 'modified:   ') + FILE);
      if (unstaged) out.push('', 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)', '\tmodified:   ' + FILE);
      if (untracked) out.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)', '\t' + FILE, '', 'nothing added to commit but untracked files present (use "git add" to track)');
      else if (!staged && unstaged) out.push('', 'no changes added to commit (use "git add" and/or "git commit -a")');
      else if (!staged && !unstaged) out.push('nothing to commit, working tree clean');
      return out;
    }
    function run(cmd) {
      let out = [];
      if (cmd === 'edit') { st.work = (st.work + 1) % LINES.length; if (st.work === st.index && st.index !== null) st.work = (st.work + 1) % LINES.length; st.term = ['(you changed a line in Bill.java and saved)']; draw(); return; }
      if (cmd === 'status') out = statusText();
      if (cmd === 'add') { st.index = st.work; }
      if (cmd === 'commit') {
        if (st.index !== null && st.index !== st.head) {
          const id = ids[st.commits.length % ids.length], first = !st.commits.length;
          const msg = first ? 'Bill: GST to the nearest paisa' : 'Bill: change the tax line (' + (st.commits.length + 1) + ')';
          st.commits.unshift({ id, msg, line: st.index });
          out = ['[main ' + (first ? '(root-commit) ' : '') + id + '] ' + msg, first ? ' 1 file changed, 1 insertion(+)' : ' 1 file changed, 1 insertion(+), 1 deletion(-)'];
          if (first) out.push(' create mode 100644 ' + FILE);
          st.head = st.index;
        } else out = statusText();
      }
      if (cmd === 'diff') {
        if (st.index !== null && st.work !== st.index) out = ['diff --git a/' + FILE + ' b/' + FILE, '--- a/' + FILE, '+++ b/' + FILE, '@@ -9,7 +9,7 @@', '-        ' + LINES[st.index], '+        ' + LINES[st.work]];
        else out = ['(no output: nothing changed since it was last added or saved' + (st.index === null ? ', and git diff ignores files Git has never saved)' : ')')];
      }
      if (cmd === 'restore') { if (st.index === null) out = ["error: pathspec '" + FILE + "' did not match any file(s) known to git"]; else st.work = st.index; }
      if (cmd === 'log') out = st.commits.length ? st.commits.map(c => c.id + ' ' + c.msg) : ["fatal: your current branch 'main' does not have any commits yet"];
      const typed = { status: 'git status', add: 'git add ' + FILE, commit: 'git commit -m "..."', diff: 'git diff ' + FILE, restore: 'git restore ' + FILE, log: 'git log --oneline' }[cmd];
      st.term = ['$ ' + typed].concat(out.length ? out : ['(no output: it worked)']);
      draw();
    }
    function card(title, line, hint) { return '<div class="gpcol"><div class="gphead">' + title + '</div>' + (line === null ? '<div class="gpempty">' + hint + '</div>' : '<div class="gpfile"><b>Bill.java</b><code>' + esc(LINES[line]) + '</code></div>') + '</div>'; }
    function draw() {
      cols.innerHTML = card('1. Your folder', st.work, '') + '<div class="gparrow">git add →</div>' + card('2. Staging area', st.index !== null && st.index !== st.head ? st.index : null, 'empty: nothing chosen') + '<div class="gparrow">git commit →</div>'
        + '<div class="gpcol"><div class="gphead">3. History</div>' + (st.commits.length ? st.commits.map((c, i) => '<div class="gpfile' + (i ? ' old' : '') + '"><b>' + c.id + '</b> ' + esc(c.msg) + '<code>' + esc(LINES[c.line]) + '</code></div>').join('') : '<div class="gpempty">no snapshots yet</div>') + '</div>';
      term.textContent = st.term.length ? st.term.join('\n') : 'Press a button. The terminal shows what Git would answer.';
    }
    [['Change the file', 'edit'], ['git status', 'status'], ['git add', 'add'], ['git commit', 'commit'], ['git diff', 'diff'], ['git restore', 'restore'], ['git log --oneline', 'log']].forEach(([l, c]) => buttons.append(btn(l, c === 'edit' ? 'primary' : 'mono', () => run(c))));
    buttons.append(btn('Start over', '', () => { Object.assign(st, fresh()); draw(); }));
    node.append(cols, buttons, term);
    draw();
  }

  const makers = { bits: bitsWidget, intmem: intMemWidget, text: textWidget, rgb: rgbWidget, run: runWidget, calc: calcWidget, compound: compoundWidget, stepper: stepperWidget, flow: flowWidget, compare: compareWidget, loop: loopWidget, dice: diceWidget, logic: logicWidget, callstack: callstackWidget, cardnum: cardNumWidget, patterns: patternsWidget, hexbyte: hexByteWidget, pixels: pixelsWidget, money: moneyWidget, iso8583: iso8583Widget, apdu: apduWidget, seedmachine: seedMachineWidget, threeruns: threeRunsWidget, overflow: overflowWidget, convert: convertWidget, gitplay: gitPlayWidget };

  window.Lab = {
    marks: marksApi,
    register(name, make) { makers[name] = make; },   // lets math.js add its own diagrams
    stepper,
    callstack,
    planView,
    hydrate(root, opts) {
      root.querySelectorAll('[data-widget]').forEach(node => {
        if (node.dataset.done) return;
        const make = makers[node.dataset.widget];
        if (make) { make(node, opts || {}); node.dataset.done = '1'; }
      });
    },
    noteCard(n, opts) {
      const card = el('article', 'card note');
      card.id = n.id;
      card.append(el('h2', '', esc(n.title)), el('div', 'muted', esc(n.date + (n.from ? ' · ' + n.from : ''))));
      if (n.asked) card.append(el('div', 'asked', '<span class="muted">You asked:</span> ' + esc(n.asked)));
      card.append(el('div', '', n.html));
      window.Lab.hydrate(card, Object.assign({ configs: n.widgets || {} }, opts || {}));
      if (!(opts && opts.marks === false)) attachMarks(card, n);
      return card;
    },
  };
})();
