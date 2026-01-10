// Game Data - Placeholder content for 10 locations
// This will be replaced with actual clues and locations later

const gameData = {
    startingLocation: {
        name: "Victoria Station",
        address: "Victoria Station, London SW1V 1JT",
        coordinates: {
            lat: 51.4952,
            lng: -0.1441
        }
    },
    
    locations: [
        {
            id: 1,
            name: "Location 1: The Old Clock Tower",
            locationName: "The Old Clock Tower", // For validation
            locationNameVariations: ["old clock tower", "clock tower", "the old clock tower"], // Acceptable variations
            description: "A historic clock tower that has stood for centuries",
            clue: "Find the place where time stands still, yet moves forward. Look for the tower that has watched over the city since the 1800s.",
            textHint: "This location is near a major railway station. The clock face is visible from the main square.",
            mapHint: "Head northwest from the starting point, about 200 meters. Look for a tall stone tower with a clock.",
            question: "What year was this clock tower first built?",
            correctAnswer: "1805", // Text-based answer
            answerVariations: ["1805", "eighteen oh five"], // Acceptable variations
            titbits: "This clock tower was built in 1805 and has been keeping time for over 200 years. It was one of the first public clocks in the area and helped coordinate the growing railway network."
        },
        {
            id: 2,
            name: "Location 2: The Merchant's Square",
            locationName: "The Merchant's Square",
            locationNameVariations: ["merchant's square", "merchants square", "the merchant's square", "merchant square"],
            description: "A historic square where merchants once gathered",
            clue: "Where traders met to exchange goods and stories. Find the square that echoes with voices from the past.",
            textHint: "This square is named after a famous merchant family. Look for a statue in the center.",
            mapHint: "Continue north from Location 1, approximately 150 meters. The square has a central fountain.",
            question: "What is the name of the merchant family commemorated here?",
            correctAnswer: "The Harringtons",
            answerVariations: ["the harringtons", "harringtons", "harrington"],
            titbits: "The Merchant's Square was established in 1803 as a trading hub. The Harrington family, whose statue stands in the center, were instrumental in establishing trade routes that connected London to the world."
        },
        {
            id: 3,
            name: "Location 10: The Final Destination",
            locationName: "The Final Destination",
            locationNameVariations: ["final destination", "the final destination"],
            description: "The place where the lost letter awaits",
            clue: "Your journey ends where it began, yet in a new place. Find the spot where past and present meet, and the letter from 1800 awaits discovery.",
            textHint: "This is a peaceful spot with a view. Look for a bench or seating area.",
            mapHint: "Return to the area near the starting point, but take a different path. Look for a secluded spot with historical significance.",
            question: "What year is inscribed on the nearby monument?",
            correctAnswer: "1800",
            answerVariations: ["1800", "eighteen hundred"],
            titbits: "This final location marks the spot where history comes full circle. It was here, in 1800, that a letter was written but never delivered. Now, over two centuries later, you have followed the trail and discovered what was meant to be found. This place represents the connection between past and present, between those who came before and those who follow."
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameData;
}