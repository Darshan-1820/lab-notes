// The plan: what to finish this week, how the tracks fit into a day, and the long roadmap.
// The tutor rewrites "week" and "targets" every Sunday from what the activity log shows.
// A target with "missions" is ticked automatically in the lab when those missions are passed.

window.PLAN = {
  updated: '2026-10-16',
  // 16 Oct, 08:23 IST: lessons 11 and 12 passed, week 1 finished. Review rewritten; targets moved to
  // week 2; Rematch 1 (missions/rematches.js) opens Sat 17.
  // The tutor's review of the last session, shown first on the plan page.
  review: {
    title: 'Review: week 1 finished, Friday 16 October',
    when: 'Friday early morning. Lesson 11 passed first try, lesson 12 (the shop) passed with the bonus. All 12 lessons of week 1, zero hints, 1030 XP.',
    points: [
      { label: 'What went well', text: 'Lesson 11 on the first attempt: roll and heal written, both used, one nextInt left. And you worked out the roll formula yourself from your own numbers (30 - 10 + 1 = 21). The shop logic was right from attempt 1: canAfford, the count and the bonus maximum all worked.' },
      { label: 'What the shop taught', text: 'Attempts 1 to 4 failed on two things, neither of them the logic. A new Scanner made inside the loop works when you type, but breaks when all the input arrives at once (note: "Works when I type, fails in the checks"). And "Most Expensive" with a capital E. That is the exact-output habit again, for the third lesson in a row: put the expected line next to yours and compare letter by letter before changing anything.' },
      { label: 'Honest scoring', text: 'The challenge took about 34 minutes against a 25 minute target, and the Scanner fix came after the tutor explained the failure, so it counts as passed, not as unaided. That is fine: it is exactly what the rematch is for.' },
      { label: 'One thing in Game.java', text: 'You wrote roll(Random dice, int high, int low) and call it roll(dice, 30, 10). It works, because you were consistent. But the task and almost every Java library put the low end first (low, high), so anyone else calling your method would get it backwards. Order your parameters the way readers expect.' },
      { label: 'Next', text: 'Rematch 1 opens on Saturday 17: a new problem, alone, no AI, no notes. Week 2 (the money tool) is open now and does not wait for it. Before you sleep: one line in journal.md.' },
    ],
  },
  week: {
    title: 'Week 1: 12 to 18 October',
    goal: 'Week 1, the Arena, is finished: 12 lessons, zero hints. What is left this week is proof and a head start: Rematch 1 on a later day, then week 2, the money tool, at your pace. On breaks, payments notes 2, 3 and 4. The days below are the latest, not a waiting line.',
  },
  targets: [
    {
      by: 'Done: week 1 (11 to 16 October)',
      items: [
        { text: 'Lessons 1 to 10: printing to reading what the player types', missions: ['w1m1', 'w1m2', 'w1m3', 'w1m4', 'w1m5', 'w1m6', 'w1m7', 'w1m8', 'w1m9', 'w1m10'] },
        { text: 'Lesson 11: Give the moves names (methods)', missions: ['w1m11'] },
        { text: 'Lesson 12: the shop challenge, with the bonus', missions: ['w1m12'] },
      ],
    },
    {
      by: 'SQL night: Sunday 18 October (about 45 minutes)',
      items: [
        { text: 'SQL lesson 1: The map, what a database is. It is in the list under "SQL: Databases from zero" and does not wait for Java. Finish the Java lesson you are in first.', missions: ['sql1m1'] },
      ],
    },
    {
      by: 'Saturday 17 (opens that day, not before)',
      items: [
        { text: 'Rematch 1: level up. No hints, no AI, no notes. Do the five steps from "How to read a problem" first, and work List 2 out by hand.', missions: ['w1r1'] },
      ],
    },
    {
      by: 'Next evenings, any time from now',
      items: [
        { text: 'Week 2, lesson 1: Count it in paise (long, and money as whole paise)', missions: ['w2m1'] },
        { text: 'Week 2, lessons 2 and 3: Tax to the nearest paisa, Money that grows', missions: ['w2m2', 'w2m3'] },
      ],
    },
    {
      by: 'On breaks, by Sunday 18',
      items: [
        { text: 'Payments note 2, then note 3 (the message the shop\'s bank sends) and note 4 (what the card and terminal say). Mark each as read and answer its check-yourself questions.' },
        { text: 'One maths drill a day: Maths 1 to level 2, then Maths 2, percentages. Week 2 uses percentages.' },
        { text: 'Sunday: 15 minutes with the tutor to look at the week and set the next one.' },
      ],
    },
  ],
  // "Where you are": the answer to "how far am I from OOP and DSA?". state: done | now | next | later.
  // Items with missions tick themselves in the lab when those missions are passed.
  position: {
    title: 'Where you are in Java',
    summary: 'Week 1 is finished: 12 lessons with no hints, in four evenings. That is real speed. It is not mastery yet: mastery is solving a fresh problem alone on a later day, which is what the rematch is for. Loops and if are the floor of programming. Interviews for backend jobs are decided by two things built on top of them: object-oriented design and problem solving (DSA). Both need methods and arrays first, and those are the next lessons.',
    distance: [
      { to: 'Functions', how: 'Reached', what: 'Lesson 11: roll and heal. Week 2 uses them properly: values in, a result out.' },
      { to: 'Problem solving (DSA)', how: 'About 7 lessons away', what: 'Starts in week 3, once arrays are in (week 2). Then a short problem every day, for months.' },
      { to: 'Object-oriented programming', how: 'About 14 lessons away', what: 'Weeks 4 to 5: the Arena comes back with Hero and Monster as objects. At your pace that is 2 to 3 weeks of evenings, not 5.' },
    ],
    ladder: [
      {
        group: 'Stage 1: programming basics',
        items: [
          { text: 'Printing, variables, arithmetic, reading errors (lessons 1 to 4)', missions: ['w1m1', 'w1m2', 'w1m3', 'w1m4'], state: 'done' },
          { text: 'if and else, while loops, the first timed challenge (lessons 5 to 7)', missions: ['w1m5', 'w1m6', 'w1m7'], state: 'done' },
          { text: 'Two conditions: && and || (lesson 8)', missions: ['w1m8'], state: 'done' },
          { text: 'Random numbers (lesson 9)', missions: ['w1m9'], state: 'done' },
          { text: 'Reading what the player types (lesson 10)', missions: ['w1m10'], state: 'done' },
          { text: 'Methods, Java\'s functions (lesson 11)', missions: ['w1m11'], state: 'done' },
          { text: 'Second timed challenge (lesson 12)', missions: ['w1m12'], state: 'done' },
          { text: 'Rematch 1 on a later day: the first proof of mastery (opens Sat 17)', missions: ['w1r1'], state: 'now' },
          { text: 'Week 2, the money tool: long and paise, percentages and interest, methods with parameters and return values, arrays, text formatting, Git', missions: ['w2m1', 'w2m2', 'w2m3', 'w2m4', 'w2m5', 'w2m6', 'w2m7'], state: 'now' },
          { text: 'Week 3, the card-data decoder: bytes and hex in code, char and String in depth, for loops, arrays of bytes', state: 'later' },
        ],
      },
      {
        group: 'Problem solving (DSA), daily from week 3',
        items: [
          { text: 'Arrays and strings: counting, searching, two pointers', state: 'later' },
          { text: 'How fast is it (Big O), sorting, binary search', state: 'later' },
          { text: 'Hash maps, stacks and queues, recursion', state: 'later' },
          { text: 'Trees and graphs (months 3 to 5)', state: 'later' },
        ],
      },
      {
        group: 'Stage 2: object-oriented programming',
        items: [
          { text: 'Classes and objects: Hero and Monster become objects with their own data and methods', state: 'later' },
          { text: 'Constructors, private fields, this: protecting an object\'s data', state: 'later' },
          { text: 'Inheritance, interfaces, polymorphism: many kinds of monster, one fight loop', state: 'later' },
          { text: 'Collections (ArrayList, HashMap), exceptions, files', state: 'later' },
        ],
      },
    ],
    rule: 'Fast-track rule: if you pass lessons 8 to 12 without hints and the rematch on a later day, week 2 runs at two lessons a night and objects start in week 4. Hints taken or a failed rematch mean the normal pace. The activity log decides, not a feeling.',
  },
  tracks: [
    { name: 'Programming', where: 'Laptop, evenings', time: 'About 90 minutes a day', what: 'The missions. This is the main track and the only one that needs the laptop every day.' },
    { name: 'Maths', where: 'Phone, office breaks', time: 'About 10 minutes a day', what: 'One drill a day: rounds of 10 questions with the working shown on a miss. 9 or more on two different days locks a level in.' },
    { name: 'Reading: payments or how computers work', where: 'Phone, office breaks', time: 'About 10 minutes a day', what: 'One note at a time, not both on the same day. Mark sections, ask questions, then tap "Send to tutor". The phone rule: one maths drill and one reading a day, no more.' },
    { name: 'Tools: terminal and Git', where: 'Laptop, inside the evening session', time: '5 to 10 minutes, from week 2', what: 'Saving your own work with Git and moving around in the terminal, learned by doing it on your own lab files.' },
    { name: 'Revision', where: 'Phone or laptop', time: '5 to 10 minutes a day', what: 'Concept notes and their "check yourself" questions, and a rematch problem each weekend.' },
    { name: 'Problem solving (DSA)', where: 'Laptop', time: 'Starts in week 3', what: 'Short daily problems once loops, arrays and methods are in place. It opens with "How to read a problem", which you practise from now in every challenge.' },
  ],
  roadmap: [
    { when: 'Weeks 1 to 4', what: 'Programming from zero through three small builds: a fighting game, a money tool, a decoder for card data. Then a bigger version of whichever one you kept coming back to.' },
    { when: 'Weeks 5 to 9', what: 'Objects and classes (through the game), collections, errors, files. Daily problem solving.' },
    { when: 'Weeks 10 to 13', what: 'SQL and databases. A tested command-line project.' },
    { when: 'Months 4 to 6', what: 'How the web works, then Spring Boot: a real service with a database and tests. First small open-source contribution.' },
    { when: 'Months 6 to 12', what: 'Operating systems, networking, concurrency, Docker, system design. A second project. Applying for jobs.' },
  ],
  milestones: [
    { when: '30 days', what: 'Write and debug small Java programs alone. Solve easy array and string problems.' },
    { when: '90 days', what: 'A tested command-line project. About 60 easy and 15 medium problems. SQL joins.' },
    { when: '6 months', what: 'A Spring Boot and PostgreSQL service with tests. A first open-source contribution.' },
    { when: '12 months', what: 'Two solid projects. Repeated contributions to one project. Applying.' },
  ],
};
