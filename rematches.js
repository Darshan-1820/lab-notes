// Rematches: the mastery checks. A topic counts as mastered only when he solves a fresh problem
// with no help on a LATER day than the lesson (see CLAUDE.md, "Teaching rules").
//
// This "week" is loaded last, but its missions do not wait for the weeks before it. Two extra
// fields, read by unlocked() in app/web/index.html:
//   after:     the mission id that must be passed first (the lesson stretch it checks)
//   notBefore: 'YYYY-MM-DD', the first day it opens. The one date that is a real gate.
// Missions after a rematch in the list ignore it when they unlock.
//
// Every expected output is worked out from the typed input by levelProblem() below, and was
// checked against a correct and a wrong (if in place of while) Java program.

(function () {
  // Hero starts at level 1 with 0 XP. Going from level L to L + 1 costs L * 50 XP.
  // One battle can give several level-ups, so the level-up must be a loop, not an if.
  function levelProblem(r) {
    let level = 1, xp = 0;
    const want = [];
    for (const word of r.input) {
      const gained = Number(word);
      if (gained === 0) break;
      xp += gained;
      while (xp >= level * 50) { xp -= level * 50; level++; want.push('Level up! Level ' + level); }
      want.push('XP: ' + xp + '/' + level * 50);
    }
    want.push('Final level: ' + level);
    const got = r.lines.map(l => l.trim()).filter(l => l !== '');
    for (let n = 0; n < want.length; n++) {
      if (got[n] === want[n]) continue;
      if (got[n] === undefined) return 'Line ' + (n + 1) + ' should be "' + want[n] + '", but the output ended.';
      const near = got[n].toLowerCase().replace(/[.\s]/g, '') === want[n].toLowerCase().replace(/[.\s]/g, '');
      return 'Line ' + (n + 1) + ' should be "' + want[n] + '", but it is "' + got[n] + '".' + (near ? ' Only capitals, spaces or a full stop differ.' : '');
    }
    if (got.length > want.length) return 'There is an unexpected extra line: "' + got[want.length] + '".';
    return '';
  }

  const R = {
    id: 'rematches',
    title: 'Rematches',
    blurb: 'A new problem on what you already passed, alone, on a later day. Passing one is what "mastered" means.',
    missions: [
      {
        id: 'w1r1',
        after: 'w1m12',
        notBefore: '2026-10-17',
        title: 'Rematch 1: level up',
        skill: 'Week 1, unaided: variables, if, while, input, a method',
        blocks: [
          { t: 'say', html: 'This is the first <b>rematch</b>. It checks week 1: variables, decisions, loops, reading typed numbers and a method of your own. The problem is new, so there is nothing to copy.<br><br><b>No hints, no AI, no notes, no looking at your old files.</b> If you get stuck, stop, take a break and come back to it; that is allowed. Asking for help is not, because then it no longer tells us what you can do alone.<br><br>Before you type any code, use the five steps from "How to read a problem": in particular, write down when your loop stops, and work out List 2 below by hand.' },
          {
            t: 'task', file: 'week1-game/Rematch1.java', xp: 150, timed: true, parSeconds: 1800,
            runs: [
              { name: 'List 1', stdin: '30\n40\n200\n0\n' },
              { name: 'List 2: one big win', stdin: '300\n0\n' },
              { name: 'List 3: no battles', stdin: '0\n' },
              { name: 'List 4: just short, then exact', stdin: '49\n1\n0\n' },
            ],
            html: 'A hero starts at <b>level 1</b> with <b>0 XP</b> (experience points). The player types the XP the hero won in each battle, one number per line. Typing <b>0</b> means the hero is done.<ul><li>To go from level L to the next level, the hero needs <b>L × 50</b> XP: 50 XP to reach level 2, then 100 more to reach level 3, then 150 more to reach level 4, and so on. When the hero has enough, that amount is used up (taken off the XP) and the level goes up by 1. Print <code>Level up! Level L</code> with the new level.</li><li>One battle can give enough XP for <b>more than one</b> level-up.</li><li>After each battle, once all its level-ups are done, print <code>XP: X/N</code>: the XP the hero has now, and the XP needed for the next level.</li><li>After the 0, print <code>Final level: L</code>.</li></ul>You must write and use this method, which gives back the XP needed to leave a level:<pre>static int xpNeeded(int level)</pre>For the typed list 30, 40, 200, 0 the output is:<pre>XP: 30/50\nLevel up! Level 2\nXP: 20/100\nLevel up! Level 3\nXP: 120/150\nFinal level: 3</pre>',
            checks: [
              { label: 'The program stops by itself', test: r => !r.timedOut },
              { label: 'The program runs without errors', test: r => r.ok, why: r => /NoSuchElementException/.test(r.stderr) ? 'Java ran out of typed numbers: a nextInt() found nothing left to read. Either the program asked again after the 0, or the numbers were used up before your nextInt() got them.' : '' },
              { label: 'There is a method: static int xpNeeded(int level)', test: r => /static\s+int\s+xpNeeded\s*\(\s*int\s+\w+\s*\)/.test(r.src) },
              { label: 'xpNeeded is used', test: r => (r.src.match(/\bxpNeeded\s*\(/g) || []).length >= 2 },
              { label: 'The output is right for this list', test: r => levelProblem(r) === '', why: r => levelProblem(r) },
            ],
            hints: [],
          },
          { t: 'say', html: 'Passed, alone, on a later day than the lessons, on four lists. That is the first thing in this lab that counts as <b>mastered</b>: week 1\'s basics.<br><br>Open Claude Code in the <b>engineering-lab</b> folder and say <b>"rematch done"</b>, so your tutor can look at how you got there and record it.' },
        ],
      },
    ],
  };

  if (!window.WEEKS) window.WEEKS = window.WEEK ? [window.WEEK] : [];
  window.WEEKS.push(R);
})();
