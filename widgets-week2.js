// Diagrams for week 2 (the money tool). Registered into the shared widget set with Lab.register,
// so a lesson or note can use them like any other: <div data-widget="growth" data-key="...">.
//
//   growth    simple against compound interest: amount, yearly rate and years, drawn as two lines
//   arraymem  a long array as cells in memory: pick an index, see the address Java works out
//
// Loaded after widgets.js in the lab (app/web/index.html) and on the phone site.
(function () {
  if (!window.Lab) return;
  const state = {};
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls, onClick) { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', onClick); return b; }
  const inr = v => '₹' + Math.round(v).toLocaleString('en-IN');

  const css = `
  .w2-in { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-bottom: 12px; }
  .w2-in label { display: grid; grid-template-columns: 112px minmax(0, 1fr) 64px; gap: 8px; align-items: center; font-size: 14px; }
  .w2-in input[type=range] { width: 100%; min-width: 0; }
  .w2-in b { font: 600 14px var(--mono, Consolas, monospace); text-align: right; }
  .w2-chart { width: 100%; height: 170px; display: block; border-left: 2px solid var(--line); border-bottom: 2px solid var(--line); }
  .w2-chart .s { stroke: var(--blue); }
  .w2-chart .c { stroke: var(--accent); }
  .w2-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 14px; margin-top: 8px; }
  .w2-legend i { display: inline-block; width: 18px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 6px; }
  .w2-sum { margin-top: 8px; font-size: 15px; line-height: 1.5; }
  .w2-sum .num { font-family: var(--mono, Consolas, monospace); font-weight: 600; }
  .w2-cells { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin: 10px 0; }
  .w2-cell { border: 2px solid var(--line); border-radius: 8px; padding: 6px 2px; text-align: center; min-width: 0; }
  .w2-cell .i { font: 600 13px var(--mono, Consolas, monospace); color: var(--dim); }
  .w2-cell .v { font: 600 14px var(--mono, Consolas, monospace); overflow-wrap: anywhere; }
  .w2-cell .a { font: 12px var(--mono, Consolas, monospace); color: var(--dim); }
  .w2-cell.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .w2-err { color: var(--bad); font-family: var(--mono, Consolas, monospace); overflow-wrap: anywhere; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---- simple against compound interest ----
  function growthWidget(node) {
    const key = node.dataset.key || 'growth';
    if (!state[key]) state[key] = { amount: 100000, rate: 12, years: 10 };
    const st = state[key];
    node.innerHTML = ''; node.className = 'bitsbox';
    const box = el('div', 'w2-in');
    function slider(label, field, min, max, step, show) {
      const lab = el('label');
      const input = el('input'); input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = st[field];
      input.id = key + '-' + field; input.setAttribute('aria-label', label);
      const out = el('b', '', show(st[field]));
      input.addEventListener('input', () => { st[field] = Number(input.value); out.textContent = show(st[field]); draw(); });
      lab.append(el('span', '', label), input, out);
      box.append(lab);
    }
    slider('Put in', 'amount', 10000, 1000000, 10000, inr);
    slider('Rate a year', 'rate', 1, 30, 0.5, v => v + '%');
    slider('Years', 'years', 1, 40, 1, v => String(v));
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'w2-chart'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    const lines = ['s', 'c'].map(c => { const p = document.createElementNS(svgNS, 'polyline'); p.setAttribute('class', c); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '2.5'); p.setAttribute('vector-effect', 'non-scaling-stroke'); svg.append(p); return p; });
    const legend = el('div', 'w2-legend', '<span><i style="background:var(--blue)"></i>Simple: interest on what you put in</span><span><i style="background:var(--accent)"></i>Compound: added every month</span>');
    const sum = el('div', 'w2-sum');
    function draw() {
      const months = st.years * 12, r = st.rate / 100 / 12, simple = [], comp = [];
      let bal = st.amount;
      for (let m = 0; m <= months; m++) {
        if (m > 0) bal = bal * (1 + r);
        simple.push(st.amount * (1 + r * m)); comp.push(bal);
      }
      const top = comp[months];
      const pts = vals => vals.map((v, m) => (m / months * 100).toFixed(2) + ',' + (100 - v / top * 96).toFixed(2)).join(' ');
      lines[0].setAttribute('points', pts(simple)); lines[1].setAttribute('points', pts(comp));
      svg.setAttribute('aria-label', 'After ' + st.years + ' years: simple ' + inr(simple[months]) + ', compound ' + inr(top));
      const extra = top - simple[months];
      sum.innerHTML = 'After <b>' + st.years + '</b> year' + (st.years === 1 ? '' : 's') + ':<br>Simple <span class="num">' + inr(simple[months]) + '</span> · Compound <span class="num">' + inr(top) + '</span><br>Interest earned on interest: <span class="num">' + inr(extra) + '</span>' + (top >= 2 * st.amount ? '<br>Compound has more than doubled the money.' : '');
    }
    node.append(box, svg, legend, sum);
    draw();
  }

  // ---- a long array as cells in memory ----
  function arrayMemWidget(node) {
    const key = node.dataset.key || 'arraymem';
    const values = [4500, 3800, 5200, 4100, 3900, 6100, 3000, 4500, 4700, 8000, 3500, 4000];
    if (!state[key]) state[key] = { i: 3 };
    const st = state[key], START = 1000;
    st.bad = '';   // the box is drawn with st.i, so start without an old message
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const input = el('input'); input.type = 'number'; input.id = key + '-i'; input.value = st.i; input.setAttribute('aria-label', 'Index');
    line.append(el('span', '', 'spent['), input, el('span', '', ']'));
    const cells = el('div', 'w2-cells');
    const msg = el('div', 'w2-sum');
    function draw() {
      cells.innerHTML = '';
      values.forEach((v, i) => {
        const c = el('div', 'w2-cell' + (i === st.i ? ' on' : ''));
        c.append(el('div', 'i', '[' + i + ']'), el('div', 'v', String(v)), el('div', 'a', String(START + i * 8)));
        cells.append(c);
      });
      if (st.bad) {
        msg.innerHTML = st.bad;
      } else if (st.i >= 0 && st.i < values.length) {
        msg.innerHTML = 'Address = start + index × 8 = <span class="num">' + START + ' + ' + st.i + ' × 8 = ' + (START + st.i * 8) + '</span>. That cell holds <span class="num">' + values[st.i] + '</span>.<br><span class="muted">One multiplication and one addition, whichever box you ask for. Index 0 is zero steps from the start.</span>';
      } else {
        msg.innerHTML = '<span class="w2-err">ArrayIndexOutOfBoundsException: Index ' + st.i + ' out of bounds for length ' + values.length + '</span><br><span class="muted">Address ' + (START + st.i * 8) + ' is outside this row. It may belong to something else, so Java refuses.</span>';
      }
    }
    // Never change what he typed: a value the diagram cannot use gets a message instead.
    input.addEventListener('input', () => {
      const raw = input.value.trim(), v = Number(raw);
      st.bad = raw === '' ? 'Type an index: a whole number such as 0, 5 or 11.'
        : !Number.isInteger(v) ? 'An index is a whole number of steps from the start, so it has no point in it. Try ' + Math.trunc(v) + '.'
        : Math.abs(v) > 2147483647 ? 'That is bigger than an int can hold, and an index is an int. Try a smaller number.' : '';
      if (!st.bad) st.i = v;
      draw();
    });
    const row = el('div', 'wrow');
    row.append(btn('First', '', () => { st.bad = ''; st.i = 0; input.value = 0; draw(); }), btn('Last', '', () => { st.bad = ''; st.i = 11; input.value = 11; draw(); }), btn('One too far', '', () => { st.bad = ''; st.i = 12; input.value = 12; draw(); }));
    node.append(line, cells, msg, row, el('div', 'muted', 'The addresses are made up for the picture. Each box is 8 bytes because a long is 64 switches.'));
    draw();
  }

  Lab.register('growth', growthWidget);
  Lab.register('arraymem', arrayMemWidget);
})();
