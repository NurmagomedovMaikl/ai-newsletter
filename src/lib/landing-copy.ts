export const landingCopy = {
  hero: {
    badge: "Weekly · AI-curated · Free & Premium",
    headline: "Stay Ahead of the AI Curve",
    subheadline:
      "The latest AI news, trends and insights — handpicked and summarized every week. Free to read, premium to unlock.",
    cta: "Subscribe Now",
    secondaryCta: "Read the latest issue",
  },
  features: [
    {
      title: "Handpicked AI News",
      description:
        "Curated updates on the latest AI breakthroughs and innovations — scored for relevance, not noise.",
    },
    {
      title: "In-Depth Analysis",
      description:
        "Expert insights and commentary on the impact of AI on business and society, plus a weekly deep dive.",
    },
    {
      title: "Practical Prompts",
      description:
        "A prompt of the week, image-prompt training and tool recommendations you can use immediately.",
    },
  ],
  pricing: {
    free: {
      title: "Weekly Issue",
      price: "Free",
      description: "A taste of our AI news and analysis with the free weekly issue.",
      features: [
        "Limited access to the latest issue",
        "Curated news snippets",
        "Tool of the week",
      ],
      cta: "Sign up free",
    },
    paid: {
      title: "Premium Subscription",
      price: "€5.00/month",
      description: "Unlock full access to the archive and every exclusive segment.",
      features: [
        "Full access to the complete archive",
        "In-depth analysis and exclusive interviews",
        "Prompt of the week & image prompt training",
        "Weekly deep dive, podcast, video & reading picks",
      ],
      cta: "Upgrade to Premium",
    },
  },
  faq: [
    {
      question: "What do I get with a free subscription?",
      answer:
        "With a free subscription you get access to a limited version of the weekly issue, featuring curated news snippets and the tool of the week.",
    },
    {
      question: "How often are new issues released?",
      answer:
        "New issues are released every week. Paid subscribers get the full issue, free subscribers get the limited version.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Yes — you can cancel your subscription at any time by logging into your account and following the cancellation instructions.",
    },
  ],
} as const;
