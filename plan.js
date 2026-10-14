// The plan: what to finish this week, how the tracks fit into a day, and the long roadmap.
// The tutor rewrites "week" and "targets" every Sunday from what the activity log shows.
// A target with "missions" is ticked automatically in the lab when those missions are passed.

window.PLAN = {
  updated: '2026-10-15',
  // 15 Oct, 03:10: lessons 8 to 10 passed (0 hints); a review of the night was added (review, below).
  // 15 Oct: he asked "how far am I from OOP and DSA?" and said he will finish lessons 8 to 12 in one go.
  // The plan was pulled forward again, and a "where you are" map was added (position, below).
  // The tutor's review of the last session, shown first on the plan page.
  review: {
    title: 'Review of your night, Thursday 15 October',
    when: 'About 00:50 to 03:10. Lessons 8, 9 and 10 passed. 770 XP.',
    points: [
      { label: 'What went well', text: 'Three lessons, zero hints, every one passed by your own fixes (3, 3 and 5 attempts). Your lesson 8 prediction (-1 3) was right. And your questions were the best part of the night: your "largest 40" mark found a real bug in the lab, and asking "why are the fights identical?" and "please explain the red message" pushed the notes to explain things properly. Keep marking anything that does not add up. You are often right.' },
      { label: 'The one habit to build', text: 'Exact output. Three of your five lesson 10 attempts failed on one full stop, and in lesson 7 four attempts failed on System.err in place of System.out. The logic was right both times. The habit: when a check fails on text, put the expected line from the task next to yours and compare them letter by letter, before you change any logic. Computers that talk to each other, like a terminal and a bank, compare messages exactly too, so this habit is worth a lot later.' },
      { label: 'Reading errors', text: 'Tonight you met your first stack trace on purpose. The rule from the note: read the exception name like a sentence, then go down to the first "at" line that names your file. Use it the next time a program of yours stops with red text.' },
      { label: 'The fast track', text: 'On track: lessons 8 to 10 with no hints. Lessons 11 (methods, your first functions) and 12 (the shop challenge) are next. Then the rematch, on a later day than lesson 12, decides whether week 2 runs at two lessons a night.' },
      { label: 'Before you sleep', text: 'Write one line in journal.md: what you did and one thing that confused you. It takes a minute and it is how the tutor knows what to explain next. And try to stop by 1 am on lesson nights: memory of what you practised is laid down while you sleep, so late nights cost you some of what you learned that night.' },
    ],
  },
  week: {
    title: 'Week 1: 12 to 18 October',
    goal: 'Finish the Arena in one go: the monster hits back, dice decide, you choose the moves, and the moves get names (methods, Java\'s word for functions). Then prove it with a rematch on a later day. On breaks, payments notes 2, 3 and 4. The days below are the latest, not a waiting line.',
  },
  targets: [
    {
      by: 'Done, Thursday 15',
      items: [
        { text: 'Lesson 8: The monster hits back (two conditions)', missions: ['w1m8'] },
        { text: 'Lesson 9: Roll the dice (random numbers)', missions: ['w1m9'] },
        { text: 'Lesson 10: Your move (reading what the player types)', missions: ['w1m10'] },
      ],
    },
    {
      by: 'Next lab night',
      items: [
        { text: 'Lesson 11: Give the moves names (methods, which other languages call functions)', missions: ['w1m11'] },
        { text: 'Lesson 12: the second timed challenge, the shop. Use the five steps from "How to read a problem" first.', missions: ['w1m12'] },
      ],
    },
    {
      by: 'On breaks, by Sunday 18',
      items: [
        { text: 'Your marks are answered: open "Bits, bytes..." again. Sections 1a, 1b, 1c, 5 and 7 are new.' },
        { text: 'Payments note 2, then note 3 (the message the shop\'s bank sends) and note 4 (what the card and terminal say). Mark each as read and answer its check-yourself questions.' },
        { text: 'One maths drill a day: Maths 1 to level 2, then Maths 2, percentages. Week 2 uses percentages.' },
      ],
    },
    {
      by: 'By Sunday 18',
      items: [
        { text: 'Rematch: one new problem on variables, if and while, with no help, on a later day than the lessons. Passing it is what counts as mastered.' },
        { text: 'Week 2, the money tool, opens when lesson 12 is passed. Its first lessons include 5 minutes of terminal and Git: from then on you save your own work.' },
        { text: 'Sunday: 15 minutes with the tutor to look at the week and set the next one.' },
      ],
    },
  ],
  // "Where you are": the answer to "how far am I from OOP and DSA?". state: done | now | next | later.
  // Items with missions tick themselves in the lab when those missions are passed.
  position: {
    title: 'Where you are in Java',
    summary: 'You passed lessons 1 to 7 in one night with no hints. That is real speed. It is not mastery yet: mastery is solving a fresh problem alone on a later day, which is what the rematch is for. Loops and if are the floor of programming. Interviews for backend jobs are decided by two things built on top of them: object-oriented design and problem solving (DSA). Both need methods and arrays first, and those are the next lessons.',
    distance: [
      { to: 'Functions', how: '3 lessons away', what: 'Lesson 11. Java calls them methods. Week 2 then uses them properly: values in, a result out.' },
      { to: 'Problem solving (DSA)', how: 'About 10 lessons away', what: 'Starts in week 3, once arrays are in (week 2). Then a short problem every day, for months.' },
      { to: 'Object-oriented programming', how: 'About 17 lessons away', what: 'Weeks 4 to 5: the Arena comes back with Hero and Monster as objects. At your pace that is 2 to 3 weeks of evenings, not 5.' },
    ],
    ladder: [
      {
        group: 'Stage 1: programming basics',
        items: [
          { text: 'Printing, variables, arithmetic, reading errors (lessons 1 to 4)', missions: ['w1m1', 'w1m2', 'w1m3', 'w1m4'] },
          { text: 'if and else, while loops, the first timed challenge (lessons 5 to 7)', missions: ['w1m5', 'w1m6', 'w1m7'] },
          { text: 'Two conditions: && and || (lesson 8)', missions: ['w1m8'], state: 'now' },
          { text: 'Random numbers (lesson 9)', missions: ['w1m9'], state: 'now' },
          { text: 'Reading what the player types (lesson 10)', missions: ['w1m10'], state: 'now' },
          { text: 'Methods, Java\'s functions (lesson 11)', missions: ['w1m11'], state: 'now' },
          { text: 'Second timed challenge (lesson 12)', missions: ['w1m12'], state: 'now' },
          { text: 'Rematch on a later day: the first proof of mastery', state: 'next' },
          { text: 'Week 2, the money tool: long and paise, percentages and interest, methods with parameters and return values, arrays, text formatting, Git', state: 'next' },
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
