const quotes = [
    "There is no shortcut to success; hard work is the only key.",
    "Failure is just an indication that you need to try harder.",
    "There is no substitute for hard work. - Dr. A.P.J. Abdul Kalam",
    "Knowledge is the real power; the more you share, the more it grows.",
    "Learn something new every day because learning never stops.",
    "If someone says you can't do it, prove them wrong with your actions.",
    "The bigger the struggle, the greater the victory.",
    "Only those who dare to dream and work for it succeed.",
    "Never fear making mistakes; they bring you closer to success.",
    "Dreams are not what you see while sleeping; dreams are what keep you awake. - Dr. Kalam",
    "Success is not final; failure is not fatal: It is the courage to continue that counts.",
    "Discipline is the bridge between goals and accomplishment.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Do not wait for opportunity. Create it.",
    "A river cuts through a rock not because of its power but because of its persistence.",
    "Education is the most powerful weapon you can use to change the world. - Nelson Mandela",
    "Small daily improvements are the key to staggering long-term results.",
    "A journey of a thousand miles begins with a single step.",
    "Your time is limited, so don’t waste it living someone else’s life. - Steve Jobs",
    "Work hard in silence; let your success make the noise.",
    "The best preparation for tomorrow is doing your best today.",
    "Don’t let what you cannot do interfere with what you can do.",
    "Believe in yourself, and you will be unstoppable.",
    "Success usually comes to those who are too busy to be looking for it.",
    "Do what you can, with what you have, where you are.",
    "Education is not preparation for life; education is life itself.",
    "Push yourself because no one else is going to do it for you.",
    "Hustle until you no longer have to introduce yourself.",
    "Your dream job does not exist. You must create it.",
    "There is no elevator to success; you have to take the stairs.",
    "When you feel like quitting, think about why you started.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "All our dreams can come true if we have the courage to pursue them.",
    "Success is 1% inspiration and 99% perspiration.",
    "The best investment you can make is in yourself.",
    "Consistency is the key to success.",
    "You don't have to be great to start, but you have to start to be great.",
    "Study like your future depends on it because it does.",
    "Work smart, not just hard.",
    "Success doesn’t come from what you do occasionally, it comes from what you do consistently.",
    "The secret to getting ahead is getting started.",
    "Opportunities don’t happen, you create them.",
    "Success is not about being better than someone else. It’s about being better than you were yesterday.",
    "Doubt kills more dreams than failure ever will.",
    "It always seems impossible until it's done.",
    "Failure is not the opposite of success; it is part of success.",
    "Winners focus on winning; losers focus on winners.",
    "Your future is created by what you do today, not tomorrow.",
    "The expert in anything was once a beginner.",
    "One day, all the hard work will pay off.",
    "If you can dream it, you can achieve it.",
    "It’s not about how bad you want it; it’s about how hard you are willing to work for it.",
    "Stay focused, go after your dreams, and keep moving toward your goals.",
    "It’s never too late to be what you might have been.",
    "If you are working on something that you really care about, you don’t have to be pushed. The vision pulls you.",
    "The man who moves a mountain begins by carrying away small stones.",
    "Work until your idols become your rivals.",
    "Don’t compare your beginning to someone else’s middle.",
    "If opportunity doesn’t knock, build a door.",
    "Success is getting what you want. Happiness is wanting what you get.",
    "Winners never quit, and quitters never win.",
    "Chase the dream, not the competition.",
    "Your only limit is your mind.",
    "The way to get started is to quit talking and begin doing.",
    "Think big and don’t listen to people who tell you it can’t be done.",
    "Winners are not people who never fail but people who never quit.",
    "Every accomplishment starts with the decision to try.",
    "Losers quit when they fail. Winners fail until they succeed.",
    "Hard work beats talent when talent doesn’t work hard.",
    "There will be obstacles. There will be doubters. There will be mistakes. But with hard work, there are no limits.",
    "Do something today that your future self will thank you for.",
    "Don’t stop until you’re proud.",
    "Work hard, stay disciplined, and be patient.",
    "The only way to do great work is to love what you do.",
    "If you fail, never give up because F.A.I.L. means 'First Attempt In Learning'.",
    "It’s not whether you get knocked down, it’s whether you get up.",
    "Believe you can and you're halfway there.",
    "Successful people do what unsuccessful people are not willing to do.",
    "The key to success is to focus on goals, not obstacles.",
    "Stop doubting yourself, work hard, and make it happen.",
    "Never let success get to your head and never let failure get to your heart.",
    "Don’t be pushed by your problems. Be led by your dreams.",
    "Keep going. Everything you need will come to you at the perfect time.",
    "Your best teacher is your last mistake.",
    "Success comes from having dreams that are bigger than your fears.",
    "Someday is not a day of the week.",
    "Believe in your infinite potential.",
    "The best view comes after the hardest climb.",
    "If you don’t challenge yourself, you will never realize what you can become.",
    "Be stubborn about your goals and flexible about your methods.",
    "The distance between dreams and reality is called action.",
    "One day or day one. You decide.",
    "Nothing will work unless you do.",
    "If you want something you never had, you must be willing to do something you have never done.",
    "Act as if what you do makes a difference. It does.",
    "Dream big, work hard, stay focused, and surround yourself with good people."
];

let currentQuoteIndex = 0;

// Create a continuous scrolling quotes display
document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Create a string with all quotes separated by a divider
    const allQuotes = quotes.join(' • ');
    
    // Set the content to be double the quotes to ensure continuous scrolling
    quoteDisplay.textContent = allQuotes + ' • ' + allQuotes;
    
    // Set the parent container to be twice as wide for smooth scrolling
    const scrollContainer = quoteDisplay.parentElement;
    scrollContainer.style.display = 'flex';
    scrollContainer.style.width = 'max-content';
    
    // Adjust animation duration based on content length
    const contentLength = allQuotes.length;
    const duration = Math.max(40, contentLength * 0.2);
    scrollContainer.style.setProperty('--animation-duration', `${duration}s`);
});
