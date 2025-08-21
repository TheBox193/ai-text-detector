const parenthetical_eg_list = {
 name: "parenthetical_eg_list", 
 description: "Parenthetical lists with 'e.g.' - AI formal hedging in casual contexts",
 regex: /\(\s*e\.g\.,?\s*(?:[\w\-\.]+(?:\s+[\w\-\.]+)?,\s*){1,}(?:and\s+)?[\w\-\.]+(?:\s+[\w\-\.]+)?\s*\)/g,
 severity: "high" as const,
 tags: ["formal_hedging", "structure", "AI_pattern"],
 examples: [
   "Popular AI models (e.g., ChatGPT, Claude, Gemini) have transformed the landscape.",
   "Key benefits (e.g., speed, accuracy, efficiency) make this worthwhile.",
   "Various methods (e.g., clustering, classification, regression) can be applied.",
   "Essential tools (e.g. React, Angular, Vue) streamline development.",
   "Top universities (e.g., Harvard, MIT, and Stanford) are investing heavily.",
//    "Technologies (e.g., Node.js, C++, F#) each have strengths.",
   "Search engines (e.g., Google, Bing) index billions of pages.",
   "Focus areas (e.g., user experience, customer satisfaction, brand loyalty) drive success."
 ]
};

export default parenthetical_eg_list;