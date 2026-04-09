// Rotating fun messages for AI loading states
export const LOADING_MESSAGES = [
  "Translating IRS jargon into human language...",
  "Reading tax code so you don't have to...",
  "Doing the boring part for you...",
  "Crunching numbers at the speed of light...",
  "Converting bureaucratic nonsense into English...",
  "Finding the silver lining in your tax situation...",
  "Making the IRS slightly less terrifying...",
  "Turning tax law into something you'd actually read...",
  "Consulting the ancient tax scrolls...",
  "Your accountant friend is typing...",
];

// Messages shown between financial detail questions
export const ENCOURAGEMENT = [
  "You're doing great. Most people don't even get this far.",
  "Almost there! You know more about your taxes than most adults.",
  "Look at you, being a responsible human. Impressive.",
  "This is the hard part. The rest is downhill.",
  "Every number you enter is money you might save.",
  "Your future self is going to thank you for this.",
  "See? This isn't so bad. (We're lying, but you're handling it.)",
  "Fun fact: you're now ahead of ~40% of Americans who file last minute.",
];

// Witty screen subtitles
export const SCREEN_FLAVOR = {
  welcome: {
    tagline: "No judgment. No jargon. No surprise bills from your accountant.",
    footer: "Built by people who also Google \"do I need to file taxes\" every year",
  },
  filing_status: {
    subtitle: "The IRS cares a lot about your relationship status. More than your ex does, honestly.",
  },
  situations: {
    subtitle: "Check everything that applies. The more we know, the more money we can try to save you.",
    footer: "Don't worry if you miss something \u2014 the IRS will definitely remind you.",
  },
  financial: {
    intro: "Time for the numbers. We know this part isn't fun, but every dollar you track is a dollar you might save.",
  },
  analysis: {
    refund_big: [
      "Look at that! The government owes YOU for once.",
      "Time to treat yourself. Or, you know, be responsible. Your call.",
      "The IRS has been holding your money hostage. Let's get it back.",
    ],
    refund_small: [
      "Not a fortune, but hey \u2014 free money is free money.",
      "Enough for a nice dinner. The IRS is buying.",
      "It's not nothing! That's a few months of Netflix.",
    ],
    owe_small: [
      "Don't panic \u2014 this is manageable.",
      "Could be worse. Like, way worse.",
      "A small price for living in a society, right? ...Right?",
    ],
    owe_big: [
      "Deep breaths. We'll figure this out together.",
      "Okay, that stings. But knowing is better than the IRS surprise letter.",
      "The good news: you now know. The bad news: you now know.",
    ],
    zero: [
      "Perfectly balanced, as all things should be.",
      "You broke even! Your employer's payroll department nailed it.",
    ],
  },
  action_plan: {
    intro: "Here's the part where we actually tell you what to do (instead of just scaring you with numbers).",
    complete: "That's it. Seriously. You're going to be fine.",
  },
  topics: {
    subtitle: "Tap any topic to get a plain-English explanation. Think of it as a crash course in not getting screwed by the tax system.",
  },
};

// Fun facts shown randomly throughout
export const TAX_FACTS = [
  "The US tax code is over 75,000 pages long. Don't worry, we read it so you don't have to.",
  "Americans spend 8.1 billion hours a year on tax paperwork. You're spending about 10 minutes.",
  "The IRS was originally called the Bureau of Internal Revenue. Somehow they made the name worse.",
  "About 70% of Americans get a tax refund. The average is around $3,000.",
  "If you filed your taxes on a stone tablet, the IRS would still accept it. (Please don't.)",
  "The first income tax was 3% during the Civil War. Those were the days.",
  "Tax Day used to be March 1st. Then March 15th. Then April 15th. It keeps getting worse.",
];

// Completion celebration messages
export const COMPLETION_MESSAGES = [
  "That's everything! You now understand your taxes better than most people.",
  "Done! You're basically a tax expert now. (Don't tell the CPA industry.)",
  "You made it through! Reward yourself. You've earned it.",
  "Finished! See? That wasn't so bad. (Okay, some of it was bad. But you did it.)",
];

// Get a random item from an array
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get analysis flavor text based on refund/owed amount
export function getAnalysisFlavor(amount: number, hasWithholding: boolean): string {
  if (!hasWithholding) return pickRandom(SCREEN_FLAVOR.analysis.zero);
  if (amount > 1000) return pickRandom(SCREEN_FLAVOR.analysis.refund_big);
  if (amount > 0) return pickRandom(SCREEN_FLAVOR.analysis.refund_small);
  if (amount > -500) return pickRandom(SCREEN_FLAVOR.analysis.owe_small);
  if (amount <= -500) return pickRandom(SCREEN_FLAVOR.analysis.owe_big);
  return pickRandom(SCREEN_FLAVOR.analysis.zero);
}
