// The maths track: question generators, answer checking, the drill card and the diagrams
// used on maths pages. Shared by the lab (index.html) and the phone site.
//
//   LabMath.DRILLS                 -> { id: { id, title, blurb, levels: [gen, gen, gen] } }
//   LabMath.make(id, level, rng)   -> one question: { html, type, answer, steps[], spec }
//   LabMath.check(question, text)  -> 'right' | 'wrong' | 'invalid' (not a usable answer)
//   LabMath.drillCard(id)          -> an element: rounds of 10, levels, lock-in
//   LabMath.modulePage(mod, opts)  -> explanation (a note card, so marks work) + its drills
//   LabMath.summary(mod)           -> { drills, locked } for lists
//
// Rules built in (see CLAUDE.md, "Maths track"):
//   a round is 10 questions; 8 or more unlocks the next level;
//   a level is locked in after 9 or more on two DIFFERENT days; a drill is locked in when
//   level 3 is. Nothing is called mastered after one sitting.
// Every answer is a whole number, a binary string or a hex string, so there is no rounding.
// Generators take rng() (0 <= x < 1) so tests can replay them; each question carries a
// machine-readable spec that tests recompute independently.

(function (root) {
  const ROUND = 10, UNLOCK = 8, LOCK = 9;

  // ---------- small helpers ----------
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const fmt = v => Number(v).toLocaleString('en-US');
  const code = s => '<code>' + s + '</code>';
  // Groups of four, counted from the right: 110000 -> "11 0000".
  const groupBits = s => { const out = []; for (let end = s.length; end > 0; end -= 4) out.unshift(s.slice(Math.max(0, end - 4), end)); return out.join(' '); };
  const padBits = (v, n) => v.toString(2).padStart(n, '0');
  const HEX = '0123456789ABCDEF';
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const money = hundredths => { const s = String(Math.abs(hundredths)).padStart(3, '0'); return (hundredths < 0 ? '-' : '') + fmt(Number(s.slice(0, -2))) + '.' + s.slice(-2); };

  function seeded(seed) {   // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const Q = (html, type, answer, steps, spec) => ({ html, type, answer: String(answer), steps, spec });

  // ---------- generators ----------
  const placeNames = n => Array.from({ length: n }, (_, i) => Math.pow(2, n - 1 - i));

  function binToDec(r, len, lo, hi) {
    const v = ri(r, lo, hi), bits = padBits(v, len), places = placeNames(len);
    const on = places.filter((p, i) => bits[i] === '1');
    return Q('What number is ' + code(groupBits(bits)) + ' in binary?', 'int', v, [
      'The columns are worth ' + places.join(', ') + ', from left to right.',
      'The columns holding a 1 are worth: ' + on.join(', ') + '.',
      on.length > 1 ? on.join(' + ') + ' = ' + v : 'So the number is ' + v + '.',
    ], { op: 'bin2dec', bits });
  }

  function decToBin(r, lo, hi) {
    const v = ri(r, lo, hi), len = v.toString(2).length, steps = [];
    let left = v;
    placeNames(len).forEach(p => {
      if (left >= p) { steps.push(p + ' fits into ' + left + ': write 1, and ' + (left - p) + ' is left.'); left -= p; }
      else steps.push(p + ' does not fit into ' + left + ': write 0.');
    });
    steps.unshift('Start from the biggest column that fits (' + placeNames(len)[0] + ') and work to the right.');
    steps.push('Reading the 1s and 0s in order: ' + v.toString(2));
    return Q('Write ' + code(String(v)) + ' in binary.', 'bin', v.toString(2), steps, { op: 'dec2bin', n: v });
  }

  function hexDigit(r) {
    if (r() < 0.5) {
      const v = ri(r, 8, 15);
      return Q('What number is the hex digit ' + code(HEX[v]) + '?', 'int', v,
        ['Hex digits go 0 to 9, then A, B, C, D, E, F.', 'A is 10, B is 11, C is 12, D is 13, E is 14, F is 15.', HEX[v] + ' is ' + v + '.'], { op: 'hex2dec', hex: HEX[v] });
    }
    const v = ri(r, 10, 15);
    return Q('Write ' + code(String(v)) + ' as one hex digit.', 'hex', HEX[v],
      ['After 9, hex carries on with letters: 10 is A, 11 is B, 12 is C, 13 is D, 14 is E, 15 is F.', v + ' is ' + HEX[v] + '.'], { op: 'dec2hex', n: v });
  }

  function hexTwo(r) {
    const v = ri(r, 16, 255), h = v.toString(16).toUpperCase(), hi = Math.floor(v / 16), lo = v % 16;
    return Q('What number is hex ' + code(h) + '?', 'int', v, [
      'The left digit counts 16s. The right digit counts 1s.',
      'Left digit ' + h[0] + ' is ' + hi + ', and ' + hi + ' × 16 = ' + (hi * 16) + '.',
      'Right digit ' + h[1] + ' is ' + lo + '.',
      (hi * 16) + ' + ' + lo + ' = ' + v,
    ], { op: 'hex2dec', hex: h });
  }

  function hexFrom(r) {
    const v = ri(r, 16, 255), h = v.toString(16).toUpperCase().padStart(2, '0'), hi = Math.floor(v / 16), lo = v % 16;
    if (r() < 0.5) {
      return Q('Write ' + code(String(v)) + ' in hex (two digits).', 'hex', h, [
        'How many whole 16s fit into ' + v + '? ' + hi + ' (' + hi + ' × 16 = ' + (hi * 16) + '). That is the left digit: ' + HEX[hi] + '.',
        'What is left over? ' + v + ' - ' + (hi * 16) + ' = ' + lo + '. That is the right digit: ' + HEX[lo] + '.',
        'Together: ' + h,
      ], { op: 'dec2hex', n: v });
    }
    const bits = padBits(v, 8);
    return Q('Write the byte ' + code(groupBits(bits)) + ' in hex.', 'hex', h, [
      'Split the byte into two groups of four switches: ' + bits.slice(0, 4) + ' and ' + bits.slice(4) + '.',
      bits.slice(0, 4) + ' is ' + hi + ', which is hex ' + HEX[hi] + '.',
      bits.slice(4) + ' is ' + lo + ', which is hex ' + HEX[lo] + '.',
      'Together: ' + h,
    ], { op: 'bin2hex', bits });
  }

  // p% of n, built from 10% and 5% so every step is a whole number (n is a multiple of 20).
  function tensSteps(p, n) {
    const ten = n / 10, five = n / 20, tens = Math.floor(p / 10), hasFive = p % 10 === 5, steps = ['10% of ' + fmt(n) + ' is ' + fmt(n) + ' ÷ 10 = ' + fmt(ten) + '.'];
    if (hasFive) steps.push('5% is half of that: ' + fmt(five) + '.');
    const parts = [];
    if (tens) parts.push(tens + ' × ' + fmt(ten) + ' = ' + fmt(tens * ten));
    if (hasFive) parts.push(fmt(five));
    steps.push(p + '% is ' + (tens ? tens + ' lots of 10%' : '') + (tens && hasFive ? ' plus ' : '') + (hasFive ? 'one 5%' : '') + ': ' + parts.join(' + ') + (parts.length > 1 ? ' = ' + fmt(p * n / 100) : '') + '.');
    return steps;
  }

  function pctOf1(r) {
    const p = pick(r, [10, 50, 25, 1]);
    const n = p === 10 ? 10 * ri(r, 1, 50) : p === 50 ? 2 * ri(r, 1, 200) : p === 25 ? 4 * ri(r, 1, 100) : 100 * ri(r, 1, 20);
    const how = { 10: '10% is one tenth. ' + fmt(n) + ' ÷ 10 = ' + fmt(n / 10), 50: '50% is one half. ' + fmt(n) + ' ÷ 2 = ' + fmt(n / 2), 25: '25% is one quarter. ' + fmt(n) + ' ÷ 4 = ' + fmt(n / 4), 1: '1% is one hundredth. ' + fmt(n) + ' ÷ 100 = ' + fmt(n / 100) }[p];
    return Q('What is ' + p + '% of ' + fmt(n) + '?', 'int', p * n / 100, ['Percent means "out of every hundred".', how + '.'], { op: 'pctof', p, n });
  }
  function pctOf2(r) {
    const p = 5 * ri(r, 1, 19), n = 20 * ri(r, 1, 50);
    return Q('What is ' + p + '% of ' + fmt(n) + '?', 'int', p * n / 100, tensSteps(p, n), { op: 'pctof', p, n });
  }
  function pctOf3(r) {
    if (r() < 0.5) {
      const p = ri(r, 1, 9), n = 100 * ri(r, 1, 50);
      return Q('A shop is charged a ' + p + '% fee on a card sale of ' + fmt(n) + ' rupees. How many rupees is the fee?', 'int', p * n / 100,
        ['1% of ' + fmt(n) + ' is ' + fmt(n) + ' ÷ 100 = ' + fmt(n / 100) + '.', p + '% is ' + p + ' × ' + fmt(n / 100) + ' = ' + fmt(p * n / 100) + '.'], { op: 'pctof', p, n });
    }
    const p = 5 * ri(r, 1, 12), n = 20 * ri(r, 5, 100), off = p * n / 100;
    return Q('An item costs ' + fmt(n) + ' rupees and has ' + p + '% off. How many rupees do you pay?', 'int', n - off,
      tensSteps(p, n).concat(['That is the discount. You pay ' + fmt(n) + ' - ' + fmt(off) + ' = ' + fmt(n - off) + '.']), { op: 'after_discount', p, n });
  }

  // a is what percent of b? Only pairs where the percent is a whole number.
  function pctPair(r, bases) {
    const b = pick(r, bases), unit = 100 / gcd(b, 100);
    const choices = [];
    for (let p = unit; p < 100; p += unit) if (p >= 5 || unit < 5) choices.push(p);
    const p = pick(r, choices);
    return { a: b * p / 100, b, p };
  }
  function pctWhat1(r) {
    const { a, b, p } = pctPair(r, [100, 50, 10, 20, 25, 200]);
    const k = 100 / b;
    const how = b === 100 ? fmt(a) + ' out of 100 is already a percent.' : b === 200 ? 'Make it "out of 100" by halving both: ' + fmt(a) + ' out of 200 is ' + fmt(a / 2) + ' out of 100.' : 'Make it "out of 100" by multiplying both by ' + k + ': ' + fmt(a) + ' out of ' + b + ' is ' + fmt(a * k) + ' out of 100.';
    return Q('What percent of ' + fmt(b) + ' is ' + fmt(a) + '?', 'int', p, ['The question is: ' + fmt(a) + ' out of ' + fmt(b) + ' is how many out of 100?', how, 'So it is ' + p + '%.'], { op: 'pctwhat', a, b });
  }
  function pctWhat2(r) {
    const { a, b, p } = pctPair(r, [40, 60, 80, 120, 150, 250, 400, 500]);
    return Q('What percent of ' + fmt(b) + ' is ' + fmt(a) + '?', 'int', p,
      ['Divide the part by the whole, then multiply by 100. It is easier to multiply first.', fmt(a) + ' × 100 = ' + fmt(a * 100) + '.', fmt(a * 100) + ' ÷ ' + fmt(b) + ' = ' + p + '.', 'So it is ' + p + '%.'], { op: 'pctwhat', a, b });
  }
  function pctChange(r) {
    const { a: change, b: old, p } = pctPair(r, [20, 25, 40, 50, 80, 120, 200, 250, 400, 500]);
    const up = r() < 0.5, nw = up ? old + change : old - change;
    return Q('A price goes from ' + fmt(old) + ' to ' + fmt(nw) + ' rupees. By what percent did it go ' + (up ? 'up' : 'down') + '?', 'int', p, [
      'First find the change: ' + (up ? fmt(nw) + ' - ' + fmt(old) : fmt(old) + ' - ' + fmt(nw)) + ' = ' + fmt(change) + '.',
      'Compare the change with the OLD price, not the new one: ' + fmt(change) + ' out of ' + fmt(old) + '.',
      fmt(change) + ' × 100 ÷ ' + fmt(old) + ' = ' + p + '.',
      'So it went ' + (up ? 'up' : 'down') + ' by ' + p + '%.',
    ], { op: 'pctchange', old, nw });
  }

  function undo1(r) {
    const p = pick(r, [10, 50, 25, 20]), unit = 100 / p, whole = unit * ri(r, 1, Math.floor(400 / unit)), v = whole * p / 100;
    return Q(p + '% of a number is ' + fmt(v) + '. What is the number?', 'int', whole,
      [p + '% is one part out of ' + unit + ' equal parts.', 'One part is ' + fmt(v) + ', so the whole is ' + unit + ' × ' + fmt(v) + ' = ' + fmt(whole) + '.'], { op: 'undo_of', p, v });
  }
  function undo2(r) {
    const p = pick(r, [10, 20, 25, 50]), whole = 100 * ri(r, 1, 50), price = whole * (100 - p) / 100;
    return Q('After ' + p + '% off, an item costs ' + fmt(price) + ' rupees. What was the price before the discount?', 'int', whole, [
      'After ' + p + '% off you pay ' + (100 - p) + '% of the old price.',
      'So ' + (100 - p) + '% of the old price is ' + fmt(price) + '.',
      '1% is ' + fmt(price) + ' ÷ ' + (100 - p) + ' = ' + fmt(whole / 100) + '.',
      '100% is 100 × ' + fmt(whole / 100) + ' = ' + fmt(whole) + '.',
      'The trap: adding ' + p + '% back onto ' + fmt(price) + ' gives ' + money(price * (100 + p)) + ', which is wrong, because ' + p + '% of the smaller number is a smaller amount.',
    ], { op: 'undo_discount', p, price });
  }
  function undo3(r) {
    const p = pick(r, [5, 10, 12, 18, 20, 25, 28]), whole = 100 * ri(r, 1, 50), total = whole * (100 + p) / 100;
    return Q('A bill comes to ' + fmt(total) + ' rupees after ' + p + '% tax was added. What was the bill before tax?', 'int', whole, [
      'After adding ' + p + '%, the total is ' + (100 + p) + '% of the bill before tax.',
      '1% is ' + fmt(total) + ' ÷ ' + (100 + p) + ' = ' + fmt(whole / 100) + '.',
      '100% is 100 × ' + fmt(whole / 100) + ' = ' + fmt(whole) + '.',
      'The trap: taking ' + p + '% off ' + fmt(total) + ' gives ' + money(total * (100 - p)) + ', which is wrong. The tax was ' + p + '% of the smaller number.',
    ], { op: 'undo_tax', p, total });
  }

  const doubles = n => { const out = []; let v = 1; for (let i = 0; i < n; i++) { v *= 2; out.push(fmt(v)); } return out; };
  function pow2(r, lo, hi) {
    const n = ri(r, lo, hi);
    return Q('What is 2 to the power ' + n + '? (Start at 1 and double it ' + n + ' time' + (n === 1 ? '' : 's') + '.)', 'int', Math.pow(2, n),
      ['Start at 1 and double ' + n + ' time' + (n === 1 ? '' : 's') + ':', '1 → ' + doubles(n).join(' → '), 'The last one is the answer: ' + fmt(Math.pow(2, n)) + '.'], { op: 'pow2', n });
  }
  function pow2Hard(r) {
    const n = ri(r, 1, 16);
    if (r() < 0.5) {
      return Q('How many different patterns can ' + n + ' on/off switch' + (n === 1 ? '' : 'es') + ' show?', 'int', Math.pow(2, n),
        ['Each extra switch doubles the number of patterns.', 'Double ' + n + ' time' + (n === 1 ? '' : 's') + ' from 1: 1 → ' + doubles(n).join(' → '), 'So ' + n + ' switch' + (n === 1 ? '' : 'es') + ' give ' + fmt(Math.pow(2, n)) + ' patterns.'], { op: 'pow2', n });
    }
    const v = Math.pow(2, n);
    return Q(fmt(v) + ' is 2 to the power of what?', 'int', n,
      ['Count how many doublings it takes to get from 1 to ' + fmt(v) + ':', '1 → ' + doubles(n).join(' → '), 'That is ' + n + ' doubling' + (n === 1 ? '' : 's') + ', so the power is ' + n + '.'], { op: 'log2', v });
  }

  function halvingChain(n) { const chain = [n]; while (n > 1) { n = Math.floor(n / 2); chain.push(n); } return chain; }
  function halvings(r, exact, lo, hi) {
    let n;
    if (exact) n = Math.pow(2, ri(r, lo, hi));
    else do { n = ri(r, lo, hi); } while ((n & (n - 1)) === 0);
    const chain = halvingChain(n);
    return Q('Start at ' + fmt(n) + '. Halve it' + (exact ? '' : ', dropping any leftover half,') + ' again and again until you reach 1. How many halvings is that?', 'int', chain.length - 1,
      [chain.map(fmt).join(' → '), 'Count the arrows: ' + (chain.length - 1) + '.'], { op: 'halvings', n });
  }
  function doubling(r) {
    const start = ri(r, 1, 9), times = ri(r, 2, 8), chain = [start];
    for (let i = 0; i < times; i++) chain.push(chain[chain.length - 1] * 2);
    return Q('Start at ' + start + ' and double it ' + times + ' times. What do you get?', 'int', chain[times], [chain.map(fmt).join(' → '), 'After ' + times + ' doublings: ' + fmt(chain[times]) + '.'], { op: 'double', start, times });
  }

  function switchesFor(n) { let k = 0, v = 1; while (v < n) { v *= 2; k++; } return k; }
  function switches(r, exact, lo, hi) {
    let n;
    if (exact) n = Math.pow(2, ri(r, lo, hi));
    else do { n = ri(r, lo, hi); } while ((n & (n - 1)) === 0);
    const k = switchesFor(n);
    const steps = ['Each switch doubles the number of patterns: ' + doubles(k).join(', ') + '.'];
    if (!exact) steps.push((k - 1) + ' switches give only ' + fmt(Math.pow(2, k - 1)) + ', which is fewer than ' + fmt(n) + '.');
    steps.push(k + ' switches give ' + fmt(Math.pow(2, k)) + ', which is enough. The answer is ' + k + '.');
    return Q('How many on/off switches do you need to show ' + (exact ? '' : 'at least ') + fmt(n) + ' different patterns?', 'int', k, steps, { op: 'switches', n });
  }
  function maxValue(r) {
    const n = ri(r, 2, 16);
    return Q('Counting up from 0, what is the largest number that ' + n + ' switches can show?', 'int', Math.pow(2, n) - 1,
      [n + ' switches give ' + fmt(Math.pow(2, n)) + ' patterns.', 'One pattern is used for 0, so the largest number is ' + fmt(Math.pow(2, n)) + ' - 1 = ' + fmt(Math.pow(2, n) - 1) + '.'], { op: 'maxval', n });
  }

  function rem(r, bLo, bHi, aHi, bList) {
    const b = bList ? pick(r, bList) : ri(r, bLo, bHi);
    const a = r() < 0.1 && bHi > 6 ? ri(r, 1, b - 1) : ri(r, b, aHi);
    const q = Math.floor(a / b), m = a % b;
    return Q('What is ' + code(a + ' % ' + b) + '? (The remainder when ' + a + ' is divided by ' + b + '.)', 'int', m, [
      q === 0 ? b + ' does not fit into ' + a + ' even once.' : b + ' fits into ' + a + ' ' + q + ' time' + (q === 1 ? '' : 's') + ': ' + q + ' × ' + b + ' = ' + (q * b) + '.',
      q === 0 ? 'So all of ' + a + ' is left over. The remainder is ' + a + '.' : 'What is left over: ' + a + ' - ' + (q * b) + ' = ' + m + '.',
    ], { op: 'rem', a, b });
  }

  function clock12(r) {
    const h = ri(r, 1, 12), k = ri(r, 1, 11), ans = ((h + k - 1) % 12) + 1, sum = h + k;
    return Q('It is ' + h + ' o\'clock. What hour will a 12-hour clock show ' + k + ' hour' + (k === 1 ? '' : 's') + ' from now?', 'int', ans,
      [h + ' + ' + k + ' = ' + sum + '.', sum > 12 ? 'A 12-hour clock starts again after 12, so take 12 away: ' + sum + ' - 12 = ' + ans + '.' : 'That is not past 12, so the clock shows ' + ans + '.'], { op: 'clock12', h, k });
  }
  function wrap(r, size, start, add, html) {
    const sum = start + add, laps = Math.floor(sum / size), ans = sum % size;
    return Q(html, 'int', ans, [
      start + ' + ' + add + ' = ' + sum + '.',
      laps === 0 ? 'That is still below ' + size + ', so nothing wraps. The answer is ' + ans + '.' : 'It starts again every ' + size + '. ' + size + ' fits into ' + sum + ' ' + laps + ' time' + (laps === 1 ? '' : 's') + ' (' + (laps * size) + '), leaving ' + sum + ' - ' + (laps * size) + ' = ' + ans + '.',
      'In code this is ' + sum + ' % ' + size + ' = ' + ans + '.',
    ], { op: 'wrap', start, add, size });
  }
  function clockDays(r) {
    if (r() < 0.5) { const d = ri(r, 0, 6), k = ri(r, 7, 40); return wrap(r, 7, d, k, 'The days of a week are numbered 0 to 6. Today is day ' + d + '. What day number is it ' + k + ' days from now?'); }
    const h = ri(r, 1, 12), k = ri(r, 12, 50), sum = h + k, ans = ((sum - 1) % 12) + 1, laps = Math.floor((sum - 1) / 12);
    return Q('It is ' + h + ' o\'clock. What hour will a 12-hour clock show ' + k + ' hours from now?', 'int', ans,
      [h + ' + ' + k + ' = ' + sum + '.', 'Take away 12 as many times as needed to land between 1 and 12: ' + sum + ' - ' + (laps * 12) + ' = ' + ans + '.'], { op: 'clock12', h, k });
  }
  function clockWrap(r) {
    if (r() < 0.5) { const s = ri(r, 200, 255), a = ri(r, 1, 100); return wrap(r, 256, s, a, 'A one-byte counter goes from 0 up to 255 and then starts again at 0. It shows ' + s + '. What does it show after counting ' + a + ' more?'); }
    const m = ri(r, 0, 59), a = ri(r, 15, 200);
    return wrap(r, 60, m, a, 'It is ' + m + ' minute' + (m === 1 ? '' : 's') + ' past the hour. How many minutes past the hour will it be ' + a + ' minutes from now?');
  }

  function digits1(r) {
    const n = ri(r, 10, 99999);
    if (r() < 0.5) return Q('What is the last digit of ' + fmt(n) + '?', 'int', n % 10, ['The last digit is what is left after taking out all the whole tens.', 'In code: ' + n + ' % 10 = ' + (n % 10) + '.'], { op: 'lastdigit', n });
    return Q('What is ' + code(n + ' % 2') + '?', 'int', n % 2, ['Only the last digit matters. It is ' + (n % 10) + ', which is ' + (n % 2 ? 'odd' : 'even') + '.', 'Even numbers leave 0 when divided by 2, odd numbers leave 1. The answer is ' + (n % 2) + '.'], { op: 'mod2', n });
  }
  function digits2(r) {
    const n = ri(r, 100, 99999), rupees = Math.floor(n / 100), paise = n % 100;
    if (r() < 0.5) return Q('How many whole rupees are there in ' + fmt(n) + ' paise? (100 paise make 1 rupee.)', 'int', rupees, ['Every 100 paise is one rupee, so cut off the last two digits.', fmt(n) + ' paise is ' + fmt(rupees) + ' rupees, with ' + paise + ' paise left over.', 'In code: ' + n + ' / 100 = ' + rupees + ' (whole-number division).'], { op: 'rupees', n });
    return Q('You have ' + fmt(n) + ' paise. After taking out the whole rupees, how many paise are left over?', 'int', paise, ['The whole rupees take everything except the last two digits.', 'The last two digits of ' + fmt(n) + ' are ' + String(paise).padStart(2, '0') + ', so ' + paise + ' paise are left.', 'In code: ' + n + ' % 100 = ' + paise + '.'], { op: 'paise', n });
  }
  function digits3(r) {
    if (r() < 0.5) {
      const n = ri(r, 1000, 99999), ds = String(n).split('').map(Number), sum = ds.reduce((a, b) => a + b, 0);
      return Q('Add up the digits of ' + n + '. What is that total % 10?', 'int', sum % 10, [ds.join(' + ') + ' = ' + sum + '.', sum + ' % 10 is its last digit: ' + (sum % 10) + '.'], { op: 'digitsum10', n });
    }
    const s = ri(r, 1, 89), m = s % 10, need = (10 - m) % 10;
    return Q('A total comes to ' + s + '. What must you add to reach the next multiple of 10? (If it is already a multiple of 10, answer 0.)', 'int', need,
      [s + ' % 10 = ' + m + '.', m === 0 ? s + ' is already a multiple of 10, so add 0.' : 'It is ' + m + ' past a multiple of 10, so it needs 10 - ' + m + ' = ' + need + ' more to reach ' + (s + need) + '.', 'This is how the last digit of a card number is chosen.'], { op: 'tonext10', s });
  }

  const DRILLS = {};
  const drill = (id, title, blurb, levels) => { DRILLS[id] = { id, title, blurb, levels }; };
  drill('bin-to-dec', 'Binary to number', 'Read a row of 1s and 0s.', [r => binToDec(r, 4, 1, 15), r => binToDec(r, 6, 8, 63), r => binToDec(r, 8, 32, 255)]);
  drill('dec-to-bin', 'Number to binary', 'Write a number as 1s and 0s.', [r => decToBin(r, 1, 15), r => decToBin(r, 16, 63), r => decToBin(r, 64, 255)]);
  drill('hex', 'Hex', 'The short way to write a byte.', [hexDigit, hexTwo, hexFrom]);
  drill('pct-of', 'A percent of an amount', 'Fees, discounts, interest.', [pctOf1, pctOf2, pctOf3]);
  drill('pct-what', 'What percent is it?', 'One number as a percent of another.', [pctWhat1, pctWhat2, pctChange]);
  drill('pct-undo', 'Undoing a percentage', 'Working back to the original.', [undo1, undo2, undo3]);
  drill('pow2', 'Powers of two', 'Doubling, again and again.', [r => pow2(r, 1, 6), r => pow2(r, 7, 12), pow2Hard]);
  drill('halvings', 'Halving and doubling', 'How fast a pile shrinks.', [r => halvings(r, true, 1, 6), r => (r() < 0.5 ? halvings(r, true, 7, 12) : doubling(r)), r => halvings(r, false, 5, 5000)]);
  drill('switches', 'How many switches?', 'Switches needed for a job.', [r => switches(r, true, 1, 6), r => switches(r, false, 3, 300), r => (r() < 0.5 ? switches(r, false, 300, 100000) : maxValue(r))]);
  drill('rem', 'Remainders', 'What is left over.', [r => rem(r, 0, 0, 50, [2, 5, 10]), r => rem(r, 3, 9, 100), r => rem(r, 7, 19, 999)]);
  drill('clock', 'Going round the clock', 'Counting that wraps around.', [clock12, clockDays, clockWrap]);
  drill('digits', 'Last digits', 'Pulling a number apart.', [digits1, digits2, digits3]);

  function make(id, level, rng) { return DRILLS[id].levels[level - 1](rng || Math.random); }

  // ---------- checking a typed answer ----------
  // int: optional currency sign, commas, spaces, a trailing % and a trailing .0 are ignored.
  // bin: optional 0b, spaces ignored, leading zeros ignored.
  // hex: optional 0x, spaces ignored, any case, leading zeros ignored.
  function normalize(type, text) {
    let s = String(text == null ? '' : text).trim();
    if (!s) return null;
    if (type === 'int') {
      s = s.replace(/[\s,]/g, '').replace(/^(rs\.?|inr|₹)/i, '').replace(/%$/, '').replace(/\.0+$/, '');
      if (!/^-?\d+$/.test(s)) return null;
      return String(Number(s));
    }
    if (type === 'bin') {
      s = s.replace(/\s/g, '').replace(/^0b/i, '');
      if (!/^[01]+$/.test(s)) return null;
      return s.replace(/^0+(?=.)/, '');
    }
    if (type === 'hex') {
      s = s.replace(/\s/g, '').replace(/^0x/i, '');
      if (!/^[0-9a-f]+$/i.test(s)) return null;
      return s.toUpperCase().replace(/^0+(?=.)/, '');
    }
    return null;
  }
  function check(q, text) {
    const got = normalize(q.type, text);
    if (got === null) return 'invalid';
    return got === normalize(q.type, q.answer) ? 'right' : 'wrong';
  }

  const api = { DRILLS, ROUND, UNLOCK, LOCK, make, check, normalize, seeded };
  root.LabMath = api;
  if (typeof document === 'undefined') return;   // tests load only the generators

  // ====================== everything below needs a page ======================
  const Lab = root.Lab, marks = Lab.marks;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls, onClick) { const b = el('button', cls, esc(label)); b.type = 'button'; b.addEventListener('click', onClick); return b; }
  const two = v => String(v).padStart(2, '0');
  // The local date. Tests may set window.__labToday = 'YYYY-MM-DD' to stand on another day.
  const today = () => { if (root.__labToday) return root.__labToday; const d = new Date(); return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); };
  const clock = secs => Math.floor(secs / 60) + ':' + two(Math.floor(secs % 60));

  const style = document.createElement('style');
  style.textContent = `
  .drill { border-left: 4px solid var(--accent); }
  .drill h3 { margin: 0; font-size: 19px; }
  .drill .lvls { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 4px; }
  .drill .lvl { padding: 6px 12px; font-size: 14.5px; }
  .drill .lvl.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); font-weight: 600; }
  .drill .pips { letter-spacing: 2px; margin-left: 4px; color: var(--accent); }
  .drill .qnum { font: 12px var(--mono, Consolas, monospace); letter-spacing: 1px; text-transform: uppercase; color: var(--dim); margin-top: 12px; }
  .drill .qtext { font-size: 19px; line-height: 1.45; margin: 4px 0 12px; }
  .drill .qtext code { font-size: 1em; }
  .drill form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .drill input.ans { background: var(--code); color: var(--text); border: 2px solid var(--line); border-radius: 8px; padding: 10px 12px; font: 600 20px var(--mono, Consolas, monospace); width: 180px; max-width: 100%; }
  .drill .verdict { font-weight: 700; margin-top: 12px; }
  .drill .verdict.ok { color: var(--accent); } .drill .verdict.no { color: var(--bad); }
  .drill ol.steps { margin: 6px 0 0; padding-left: 22px; }
  .drill ol.steps li { margin: 3px 0; }
  .drill .stat { display: flex; gap: 6px 16px; flex-wrap: wrap; color: var(--dim); font-size: 14.5px; margin-top: 8px; }
  .drill .stat b { color: var(--text); }
  .drill .big { font: 700 30px var(--mono, Consolas, monospace); margin: 6px 0; }
  .drill .lockmsg { border-radius: 8px; background: var(--panel2); padding: 8px 12px; margin-top: 10px; }
  .lockbadge { display: inline-block; font: 600 12px var(--mono, Consolas, monospace); letter-spacing: 1px; text-transform: uppercase; color: var(--accent-ink); background: var(--accent); border-radius: 99px; padding: 1px 9px; vertical-align: middle; }
  .mathh { font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); margin: 6px 0 0; }
  .pv { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 64px)); gap: 6px; margin: 10px 0; }
  .pv .col { border: 2px solid var(--blue); border-radius: 8px; text-align: center; padding: 6px 2px; min-width: 0; }
  .pv .col .w { font: 11px var(--mono, Consolas, monospace); color: var(--dim); overflow-wrap: anywhere; }
  .pv .col .d { font: 700 22px var(--mono, Consolas, monospace); }
  .seg { display: inline-flex; gap: 4px; flex-wrap: wrap; }
  .seg button { padding: 6px 12px; font-size: 14.5px; }
  .seg button.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); font-weight: 600; }
  .grid100 { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; width: min(100%, 260px); aspect-ratio: 1; margin: 10px 0; }
  .grid100 i { background: var(--panel2); border-radius: 2px; }
  .grid100 i.on { background: var(--accent); }
  .mrange { width: 100%; }
  .chain { font: 15px/1.9 var(--mono, Consolas, monospace); overflow-wrap: anywhere; }
  .ring { width: min(100%, 250px); display: block; margin: 8px 0; }
  .ring text { font: 600 11px var(--mono, Consolas, monospace); fill: var(--dim); }
  .ring .dot { fill: var(--panel2); stroke: var(--line); }
  .ring .dot.start { fill: var(--blue); stroke: var(--blue); }
  .ring .dot.end { fill: var(--accent); stroke: var(--accent); }
  .ring .lbl.end { fill: var(--accent-ink); } .ring .lbl.start { fill: var(--bg); }
  `;
  document.head.appendChild(style);

  // ---------- one drill ----------
  const fresh = () => ({ level: 1, days: {}, best: {}, bestStreak: 0, streak: 0, played: 0 });
  function progress(id) { const p = marks.drill(id); return p ? Object.assign(fresh(), p) : fresh(); }
  const lockedLevel = (p, level) => ((p.days && p.days[level]) || []).length >= 2;
  const drillLocked = p => lockedLevel(p, 3);

  function drillCard(id) {
    const d = DRILLS[id], card = el('section', 'card drill');
    card.id = 'drill-' + id;
    let p = progress(id), level = Math.min(p.level, 3), round = null, result = null;
    const inputMode = type => (type === 'hex' ? 'text' : 'numeric');

    function head() {
      card.append(el('h3', '', esc(d.title) + (drillLocked(p) ? ' <span class="lockbadge">Locked in</span>' : '')), el('div', 'muted', esc(d.blurb)));
    }
    function levels() {
      const row = el('div', 'lvls');
      [1, 2, 3].forEach(n => {
        const days = ((p.days && p.days[n]) || []).length, open = n <= p.level;
        const b = btn('Level ' + n + (open ? '' : ' (locked)'), 'lvl' + (n === level ? ' on' : ''), () => { level = n; result = null; draw(); });
        if (days) b.append(el('span', 'pips', days >= 2 ? '●●' : '●○'));
        b.disabled = !open;
        b.setAttribute('aria-pressed', n === level ? 'true' : 'false');
        b.title = open ? (days >= 2 ? 'Locked in' : days === 1 ? '9 or more on one day so far' : 'Open') : 'Score ' + UNLOCK + ' or more on level ' + (n - 1) + ' to open this';
        row.append(b);
      });
      card.append(row);
    }
    function stats() {
      const s = el('div', 'stat');
      s.append(el('span', '', 'Rounds played <b>' + p.played + '</b>'), el('span', '', 'Best streak <b>' + p.bestStreak + '</b>'));
      if (p.best && p.best[level]) s.append(el('span', '', 'Fastest clean round, level ' + level + ' <b>' + clock(p.best[level]) + '</b>'));
      card.append(s);
    }
    function nextQuestion() {
      let q, tries = 0;
      do { q = make(id, level); tries++; } while (tries < 8 && round.seen.includes(q.html));
      round.seen.push(q.html);
      round.q = q; round.phase = 'ask'; round.note = '';
      if (root.__labTest) root.__labLastQ = q;   // lets a browser test know the expected answer
    }
    function start() {
      round = { n: 0, score: 0, startedAt: Date.now(), seen: [], q: null, phase: 'ask', note: '' };
      result = null;
      nextQuestion();
      draw(true);
    }
    function finish() {
      const secs = Math.max(1, Math.round((Date.now() - round.startedAt) / 1000)), score = round.score, day = today();
      p.played++;
      const msgs = [];
      if (score === ROUND && (!p.best[level] || secs < p.best[level])) { p.best[level] = secs; msgs.push('New fastest clean round for this level: ' + clock(secs) + '.'); }
      let unlocked = false, lockedNow = false;
      if (score >= UNLOCK && level === p.level && p.level < 3) { p.level++; unlocked = true; msgs.push('Level ' + p.level + ' is now open.'); }
      if (score >= LOCK) {
        p.days = p.days || {};
        const days = p.days[level] = p.days[level] || [];
        if (days.length < 2 && !days.includes(day)) {
          days.push(day);
          if (days.length === 2) { lockedNow = true; msgs.push(level === 3 ? 'Locked in. You did this on two different days, so it has stuck.' : 'Level ' + level + ' is locked in: ' + LOCK + ' or more on two different days.'); }
          else msgs.push('That is ' + LOCK + ' or more once. Come back on another day and do it again to lock level ' + level + ' in.');
        } else if (days.length < 2) msgs.push('You already have today\'s ' + LOCK + '-or-more for this level. Come back on another day to lock it in.');
      } else if (score < UNLOCK) msgs.push('Score ' + UNLOCK + ' or more to open the next level, and ' + LOCK + ' or more on two different days to lock this one in.');
      marks.saveDrill(id, p);
      marks.addRound({ drill: id, level, score, of: ROUND, time: secs, unlocked, lockedIn: lockedNow, drillLocked: drillLocked(p) });
      result = { score, secs, msgs, level };
      round = null;
      draw();
    }
    function answer(text) {
      const q = round.q, verdict = check(q, text);
      if (verdict === 'invalid') { round.note = q.type === 'hex' ? 'Type hex digits: 0 to 9 and A to F.' : q.type === 'bin' ? 'Type only 1s and 0s.' : 'Type a whole number.'; draw(true); return; }
      round.n++; round.said = String(text).trim();
      if (verdict === 'right') { round.score++; p.streak++; if (p.streak > p.bestStreak) p.bestStreak = p.streak; round.phase = 'right'; }
      else { p.streak = 0; round.phase = 'wrong'; }
      marks.saveDrill(id, p);
      draw(true);
    }
    function advance() { if (round.n >= ROUND) finish(); else { nextQuestion(); draw(true); } }

    function draw(focus) {
      card.innerHTML = '';
      head();
      if (!round) {
        levels();
        if (result) {
          card.append(el('div', 'big', result.score + ' / ' + ROUND), el('div', 'muted', 'Level ' + result.level + ' · ' + clock(result.secs)));
          result.msgs.forEach(m => card.append(el('div', 'lockmsg', esc(m))));
        }
        stats();
        const row = el('div', 'wrow');
        const go = btn(result ? 'Play again, level ' + level : 'Start a round of ' + ROUND + ', level ' + level, 'primary', start);
        row.append(go);
        card.append(row);
        if (focus) go.focus();
        return;
      }
      const q = round.q, asking = round.phase === 'ask';
      card.append(el('div', 'qnum', 'Level ' + level + ' · question ' + (asking ? round.n + 1 : round.n) + ' of ' + ROUND + ' · score ' + round.score));
      card.append(el('div', 'qtext', q.html));
      if (asking) {
        const form = el('form');
        const input = el('input', 'ans');
        input.id = 'ans-' + id; input.type = 'text'; input.inputMode = inputMode(q.type); input.autocomplete = 'off'; input.autocapitalize = q.type === 'hex' ? 'characters' : 'off'; input.spellcheck = false;
        input.setAttribute('aria-label', 'Your answer');
        input.placeholder = q.type === 'hex' ? 'hex' : q.type === 'bin' ? '1s and 0s' : 'number';
        const go = el('button', 'primary', 'Check'); go.type = 'submit';
        form.append(input, go);
        form.addEventListener('submit', e => { e.preventDefault(); if (input.value.trim()) answer(input.value); });
        card.append(form);
        if (round.note) card.append(el('div', 'muted', esc(round.note)));
        if (focus) input.focus();
        return;
      }
      const right = round.phase === 'right';
      card.append(el('div', 'verdict ' + (right ? 'ok' : 'no'), right ? 'Correct.' : 'Not this time. You said ' + esc(round.said) + '. The answer is ' + esc(q.answer) + '.'));
      if (!right) { const ol = el('ol', 'steps'); q.steps.forEach(s => ol.append(el('li', '', esc(s)))); card.append(el('div', 'muted', 'How to get there:'), ol); }
      const row = el('div', 'wrow');
      const next = btn(round.n >= ROUND ? 'See my score' : 'Next question', 'primary', advance);
      row.append(next);
      card.append(row);
      if (focus) next.focus();
    }
    draw();
    return card;
  }

  // ---------- diagrams for the explanations ----------
  // Place-value columns in base 10, 2 or 16.
  function placeValueWidget(node) {
    const st = { base: Number(node.dataset.base || 10), v: Number(node.dataset.start || 307) };
    function draw(keepFocus) {
      node.innerHTML = ''; node.className = 'bitsbox';
      const seg = el('div', 'seg');
      [[10, 'Base 10 (everyday)'], [2, 'Base 2 (binary)'], [16, 'Base 16 (hex)']].forEach(([b, label]) => { const x = btn(label, b === st.base ? 'on' : '', () => { st.base = b; draw(); }); x.setAttribute('aria-pressed', b === st.base ? 'true' : 'false'); seg.append(x); });
      const line = el('div', 'wline');
      const input = el('input'); input.type = 'number'; input.id = (node.dataset.key || 'pv') + '-in'; input.min = 0; input.max = 999; input.value = st.v; input.inputMode = 'numeric'; input.setAttribute('aria-label', 'A number from 0 to 999');
      input.addEventListener('input', () => { st.v = Math.max(0, Math.min(999, Math.trunc(Number(input.value) || 0))); body(); });
      line.append(el('span', '', 'Number (0 to 999)'), input);
      const out = el('div');
      function body() {
        const digits = st.v.toString(st.base).toUpperCase().split(''), n = digits.length;
        const worth = i => Math.pow(st.base, n - 1 - i), val = dch => parseInt(dch, 16);
        out.innerHTML = '';
        const pv = el('div', 'pv'); pv.style.setProperty('--n', n);
        digits.forEach((dch, i) => { const c = el('div', 'col'); c.append(el('div', 'w', fmt(worth(i)) + 's'), el('div', 'd', dch)); pv.append(c); });
        out.append(pv);
        out.append(el('div', '', digits.map((dch, i) => val(dch) + ' × ' + fmt(worth(i))).join(' + ') + ' = <b>' + fmt(st.v) + '</b>'));
        out.append(el('div', 'muted', 'Each column is worth ' + st.base + ' times the one to its right' + (st.base === 16 ? ', and a column can hold 0 to 15, written 0 to 9 then A to F.' : st.base === 2 ? ', and a column can hold only 0 or 1.' : ', and a column can hold 0 to 9.')));
      }
      node.append(seg, line, out);
      body();
      if (keepFocus) input.focus();
    }
    draw();
  }

  // A 10 by 10 grid: p% of an amount.
  function pctGridWidget(node) {
    const st = { p: Number(node.dataset.p || 25), n: Number(node.dataset.n || 200) };
    node.innerHTML = ''; node.className = 'bitsbox';
    const grid = el('div', 'grid100'); grid.setAttribute('role', 'img');
    const cells = Array.from({ length: 100 }, () => { const c = el('i'); grid.append(c); return c; });
    const range = el('input', 'mrange'); range.type = 'range'; range.id = (node.dataset.key || 'pct') + '-p'; range.min = 0; range.max = 100; range.value = st.p; range.setAttribute('aria-label', 'Percent');
    const line = el('div', 'wline');
    const amount = el('input'); amount.type = 'number'; amount.id = (node.dataset.key || 'pct') + '-n'; amount.min = 0; amount.value = st.n; amount.inputMode = 'numeric'; amount.setAttribute('aria-label', 'Amount');
    line.append(el('span', '', 'of'), amount);
    const out = el('div');
    function paint() {
      st.p = Number(range.value); st.n = Math.max(0, Math.min(10000000, Math.trunc(Number(amount.value) || 0)));
      cells.forEach((c, i) => c.classList.toggle('on', i < st.p));
      grid.setAttribute('aria-label', st.p + ' of 100 squares filled');
      const each = st.n, part = st.p * st.n;   // both in hundredths of a unit
      out.innerHTML = '<div class="bitinfo"><b>' + st.p + '%</b> of ' + fmt(st.n) + ' is <b>' + money(part).replace(/\.00$/, '') + '</b></div>'
        + '<div class="muted">Share ' + fmt(st.n) + ' equally over the 100 squares: each square holds ' + money(each).replace(/\.00$/, '') + '. ' + st.p + ' squares are filled, so ' + st.p + ' × ' + money(each).replace(/\.00$/, '') + ' = ' + money(part).replace(/\.00$/, '') + '.</div>';
    }
    range.addEventListener('input', paint); amount.addEventListener('input', paint);
    node.append(grid, range, line, out);
    paint();
  }

  // n switches: how many patterns, and the largest number.
  function powersWidget(node) {
    const st = { n: Number(node.dataset.start || 8) };
    node.innerHTML = ''; node.className = 'bitsbox';
    const range = el('input', 'mrange'); range.type = 'range'; range.id = (node.dataset.key || 'pow') + '-n'; range.min = 1; range.max = 32; range.value = st.n; range.setAttribute('aria-label', 'Number of switches');
    const out = el('div');
    function paint() {
      st.n = Number(range.value);
      const v = Math.pow(2, st.n), chain = [];
      for (let i = 1; i <= Math.min(st.n, 12); i++) chain.push(fmt(Math.pow(2, i)));
      out.innerHTML = '<div class="bitinfo"><b>' + st.n + '</b> switch' + (st.n === 1 ? '' : 'es') + ' can show <b>' + fmt(v) + '</b> different patterns</div>'
        + '<div class="muted">Counting from 0, the largest number is ' + fmt(v - 1) + '.' + (st.n === 8 ? ' This is one byte.' : st.n === 32 ? ' This is an int. Half the patterns are used for negative numbers, which is why an int stops at 2,147,483,647.' : st.n === 16 ? ' This is two bytes.' : '') + '</div>'
        + '<div class="chain">1 → ' + chain.join(' → ') + (st.n > 12 ? ' → …' : '') + '</div>';
    }
    range.addEventListener('input', paint);
    node.append(el('div', 'muted', 'Drag to add or remove switches. Each one doubles the count.'), range, out);
    paint();
  }

  // Halve a number until it reaches 1.
  function halveWidget(node) {
    const st = { n: Number(node.dataset.start || 1000) };
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const input = el('input'); input.type = 'number'; input.id = (node.dataset.key || 'halve') + '-n'; input.min = 1; input.value = st.n; input.inputMode = 'numeric'; input.setAttribute('aria-label', 'Starting number');
    line.append(el('span', '', 'Start at'), input);
    const out = el('div');
    function paint() {
      st.n = Math.max(1, Math.min(1000000000, Math.trunc(Number(input.value) || 1)));
      const chain = halvingChain(st.n);
      out.innerHTML = '<div class="chain">' + chain.map(fmt).join(' → ') + '</div><div class="bitinfo"><b>' + (chain.length - 1) + '</b> halving' + (chain.length === 2 ? '' : 's') + ' to get from ' + fmt(st.n) + ' down to 1</div>'
        + '<div class="muted">Try 1000, then 1000000 (a thousand times bigger). The count only goes up by about 10.</div>';
    }
    input.addEventListener('input', paint);
    node.append(line, out);
    paint();
  }

  // Counting round a ring: (start + add) % size.
  function ringWidget(node) {
    const st = { size: Number(node.dataset.size || 12), start: Number(node.dataset.start || 9), add: Number(node.dataset.add || 5) };
    const key = node.dataset.key || 'ring';
    function draw() {
      node.innerHTML = ''; node.className = 'bitsbox';
      const seg = el('div', 'seg');
      [[12, 'Clock (12)'], [7, 'Week (7)'], [10, 'Last digit (10)']].forEach(([s, label]) => { const b = btn(label, s === st.size ? 'on' : '', () => { st.size = s; st.start = Math.min(st.start, s - 1); draw(); }); b.setAttribute('aria-pressed', s === st.size ? 'true' : 'false'); seg.append(b); });
      const line = el('div', 'wline');
      const a = el('input'); a.type = 'number'; a.id = key + '-start'; a.min = 0; a.max = st.size - 1; a.value = st.start; a.inputMode = 'numeric'; a.setAttribute('aria-label', 'Start position');
      const b = el('input'); b.type = 'number'; b.id = key + '-add'; b.min = 0; b.value = st.add; b.inputMode = 'numeric'; b.setAttribute('aria-label', 'How many to count on');
      line.append(el('span', '', 'Start at'), a, el('span', '', 'count on'), b);
      const out = el('div');
      function paint() {
        st.start = Math.max(0, Math.min(st.size - 1, Math.trunc(Number(a.value) || 0)));
        st.add = Math.max(0, Math.min(100000, Math.trunc(Number(b.value) || 0)));
        const sum = st.start + st.add, end = sum % st.size, laps = Math.floor(sum / st.size);
        let svg = '<svg class="ring" viewBox="0 0 220 220" role="img" aria-label="Positions 0 to ' + (st.size - 1) + ' in a ring. Start ' + st.start + ', end ' + end + '.">';
        for (let i = 0; i < st.size; i++) {
          const ang = (i / st.size) * 2 * Math.PI - Math.PI / 2, x = 110 + 88 * Math.cos(ang), y = 110 + 88 * Math.sin(ang);
          const cls = i === end ? 'end' : i === st.start ? 'start' : '';
          svg += '<circle class="dot ' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="14" stroke-width="2"></circle><text class="lbl ' + cls + '" x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle">' + i + '</text>';
        }
        svg += '</svg>';
        out.innerHTML = svg + '<div class="bitinfo">' + st.start + ' + ' + st.add + ' = ' + fmt(sum) + ', and <b>' + fmt(sum) + ' % ' + st.size + ' = ' + end + '</b></div>'
          + '<div class="muted">Blue is where you start, green is where you land. You went all the way round ' + laps + ' time' + (laps === 1 ? '' : 's') + (st.size === 12 ? '. (This ring is numbered 0 to 11. A clock face writes 12 where this ring has 0.)' : '.') + '</div>';
      }
      a.addEventListener('input', paint); b.addEventListener('input', paint);
      node.append(seg, line, out);
      paint();
    }
    draw();
  }

  // The potion problem read two ways: does this starting HP tell the two readings apart?
  function readingsWidget(node) {
    const st = { hp: Number(node.dataset.start || 20) };
    node.innerHTML = ''; node.className = 'bitsbox';
    const line = el('div', 'wline');
    const input = el('input'); input.type = 'number'; input.id = (node.dataset.key || 'readings') + '-hp'; input.min = 0; input.max = 100; input.value = st.hp; input.inputMode = 'numeric'; input.setAttribute('aria-label', 'Starting HP');
    line.append(el('span', '', 'Starting HP'), input);
    const out = el('div');
    const heal = hp => Math.min(100, hp + 30);
    function paint() {
      st.hp = Math.max(0, Math.min(100, Math.trunc(Number(input.value) || 0)));
      const a = [], b = [];
      let hp = st.hp, n = 1;
      while (hp < 100 && n <= 20) { hp = heal(hp); a.push('Potion ' + n + ': HP ' + hp); n++; }
      hp = st.hp;
      for (let i = 1; i <= 3; i++) { hp = heal(hp); b.push('Potion ' + i + ': HP ' + hp); }
      const same = a.join('|') === b.join('|');
      out.innerHTML = '<div class="tablewrap"><table class="plain"><tr><th>Reading A: drink until HP is full</th><th>Reading B: drink the 3 potions</th></tr><tr><td><pre>' + (a.length ? esc(a.join('\n')) : '(prints nothing)') + '</pre></td><td><pre>' + esc(b.join('\n')) + '</pre></td></tr></table></div>'
        + '<div class="bitmsg">' + (same ? 'Same output. Starting at ' + st.hp + ' cannot tell the two readings apart.' : 'Different output. Starting at ' + st.hp + ' exposes the misreading: reading A drinks ' + a.length + ' potion' + (a.length === 1 ? '' : 's') + ', and the problem said 3.') + '</div>';
    }
    input.addEventListener('input', paint);
    node.append(line, out);
    paint();
  }

  Lab.register('readings', readingsWidget);
  Lab.register('placevalue', placeValueWidget);
  Lab.register('pctgrid', pctGridWidget);
  Lab.register('powers', powersWidget);
  Lab.register('halve', halveWidget);
  Lab.register('ring', ringWidget);

  // ---------- a module page ----------
  function summary(mod) {
    const locked = mod.drills.filter(id => drillLocked(progress(id))).length;
    const started = mod.drills.filter(id => progress(id).played > 0).length;
    return { drills: mod.drills.length, locked, started };
  }
  function modulePage(mod, opts) {
    const wrap = el('div', 'planwrap');
    wrap.append(Lab.noteCard({ id: mod.id, title: mod.title, date: mod.date, from: mod.from, html: mod.html, widgets: mod.widgets }, opts || {}));
    wrap.append(el('h2', 'mathh', 'Practise: rounds of ' + ROUND));
    wrap.append(el('div', 'muted', 'Score ' + UNLOCK + ' or more to open the next level. Score ' + LOCK + ' or more on two different days and the level is locked in. A miss shows the working.'));
    mod.drills.forEach(id => wrap.append(drillCard(id)));
    return wrap;
  }

  api.drillCard = drillCard; api.modulePage = modulePage; api.summary = summary; api.today = today;
})(typeof window !== 'undefined' ? window : globalThis);
