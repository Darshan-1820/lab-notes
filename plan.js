// The plan: what to finish this week, how the tracks fit into a day, and the long roadmap.
// The tutor rewrites "week" and "targets" every Sunday from what the activity log shows.
// A target with "missions" is ticked automatically in the lab when those missions are passed.

window.PLAN = {
  updated: '2026-10-12',
  // Lessons 1 to 7 were all passed on the first night, so the week was pulled forward to the second stretch.
  week: {
    title: 'Week 1: 12 to 18 October',
    goal: 'Turn the Arena fight into a game you play: the monster hits back, dice decide, you choose the moves. Prove the first stretch with a rematch, and understand how one card payment travels. The days below are the latest, not a waiting line: when something is done early, go straight to the next thing.',
  },
  targets: [
    {
      by: 'Today, Monday 12',
      items: [
        { text: 'Lesson 8: The monster hits back (two conditions)', missions: ['w1m8'] },
        { text: 'Lesson 9: Roll the dice (random numbers)', missions: ['w1m9'] },
        { text: 'On a break: payments note 2, "Who is who, with real names". Mark it as read and answer its check-yourself questions.' },
        { text: 'On a break: Maths 1, place value, binary and hex. Read it, then one round of each drill at level 1.' },
      ],
    },
    {
      by: 'By Wednesday 14',
      items: [
        { text: 'Lesson 10: Your move (reading what the player types)', missions: ['w1m10'] },
        { text: 'Lesson 11: Give the moves names (methods)', missions: ['w1m11'] },
        { text: 'On breaks: one maths drill a day. Finish Maths 1 at level 2 and start Maths 2, percentages.' },
        { text: 'On breaks: the new note "How to read a problem", then concept notes 8 to 11 with their "check yourself" questions' },
      ],
    },
    {
      by: 'By Sunday 18',
      items: [
        { text: 'Lesson 12: the second timed challenge, the shop', missions: ['w1m12'] },
        { text: 'Rematch: one new problem on variables, if and while, with no help. Passing it is what counts as mastered.' },
        { text: 'Payments: note 3, on what data travels in the request and in what format (written when note 2 is marked read)' },
        { text: 'Maths: every drill in Maths 1 scored 9 or more on two different days (that locks it in), and Maths 2 under way' },
        { text: 'Use the five steps from "How to read a problem" before lesson 12 and before the rematch' },
        { text: 'Sunday: 15 minutes with the tutor to look at the week and set the next one. Week 2 adds 5 to 10 minutes of terminal and Git to each laptop session.' },
      ],
    },
  ],
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
