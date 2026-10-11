// The clickable diagrams used inside notes, and the note card itself.
// Shared by the lab (index.html) and the phone-friendly notes page (app/notes-site/page.html).
//
//   Lab.noteCard(note)          -> an element showing one note
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
  .wrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
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

  const makers = { bits: bitsWidget, intmem: intMemWidget, text: textWidget, rgb: rgbWidget, run: runWidget };

  window.Lab = {
    stepper,
    hydrate(root, opts) {
      root.querySelectorAll('[data-widget]').forEach(node => {
        const make = makers[node.dataset.widget];
        if (make) make(node, opts || {});
      });
    },
    noteCard(n) {
      const card = el('article', 'card note');
      card.id = n.id;
      card.append(el('h2', '', esc(n.title)), el('div', 'muted', esc(n.date + (n.from ? ' · ' + n.from : ''))));
      if (n.asked) card.append(el('div', 'asked', '<span class="muted">You asked:</span> ' + esc(n.asked)));
      card.append(el('div', '', n.html));
      return card;
    },
  };
})();
