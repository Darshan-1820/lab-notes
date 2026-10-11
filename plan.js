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
        { text: 'On a break: read the payments note "What happens when you tap a card"' },
      ],
    },
    {
      by: 'By Wednesday 14',
      items: [
        { text: 'Lesson 10: Your move (reading what the player types)', missions: ['w1m10'] },
        { text: 'Lesson 11: Give the moves names (methods)', missions: ['w1m11'] },
        { text: 'On breaks: concept notes 7 to 10 and their "check yourself" questions' },
      ],
    },
    {
      by: 'By Sunday 18',
      items: [
        { text: 'Lesson 12: the second timed challenge, the shop', missions: ['w1m12'] },
        { text: 'Rematch: one new problem on variables, if and while, with no help. Passing it is what counts as mastered.' },
        { text: 'Payments: the second note, on what is inside the messages' },
        { text: 'Sunday: 15 minutes with the tutor to look at the week and set the next one' },
      ],
    },
  ],
  tracks: [
    { name: 'Programming', where: 'Laptop, evenings', time: 'About 90 minutes a day', what: 'The missions. This is the main track and the only one that needs the laptop every day.' },
    { name: 'Payments', where: 'Phone, office breaks', time: 'About 10 minutes a day', what: 'One visual note at a time: how a payment travels, what the messages contain, how the chip proves itself. Reading only, no code yet.' },
    { name: 'Revision', where: 'Phone or laptop', time: '5 to 10 minutes a day', what: 'Concept notes and their "check yourself" questions, and a rematch problem each weekend.' },
    { name: 'Problem solving (DSA)', where: 'Laptop', time: 'Starts in week 3', what: 'Short daily problems once loops, arrays and methods are in place. Starting earlier would be guessing.' },
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
