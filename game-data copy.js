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
            name: "Location 3: The Old Library",
            locationName: "The Old Library",
            locationNameVariations: ["old library", "the old library"],
            description: "A historic library building from the 1800s",
            clue: "Knowledge preserved in stone and paper. Find where the words of the past are kept safe.",
            textHint: "This building has columns at its entrance. Look for a plaque mentioning '1800'.",
            mapHint: "Head east from Location 2, about 180 meters. The building has classical architecture with tall columns.",
            question: "How many columns are at the entrance of this building?",
            correctAnswer: "6 columns",
            answerVariations: ["6 columns", "6", "six columns", "six"],
            titbits: "The Old Library was established in 1802 and was one of the first public libraries in London. It houses rare manuscripts from the 1800s, including letters from notable figures of that era."
        },
        {
            id: 4,
            name: "Location 4: The Bridge of Whispers",
            locationName: "The Bridge of Whispers",
            locationNameVariations: ["bridge of whispers", "the bridge of whispers"],
            description: "A historic bridge crossing the river",
            clue: "Cross the waters where secrets were once shared. Find the bridge that connects two worlds.",
            textHint: "This bridge has decorative ironwork. Count the arches as you approach.",
            mapHint: "Walk south from Location 3, approximately 250 meters. Cross the bridge over the river.",
            question: "How many arches does this bridge have?",
            correctAnswer: "5 arches",
            answerVariations: ["5 arches", "5", "five arches", "five"],
            titbits: "The Bridge of Whispers was completed in 1804. It got its name from the merchants who would stop here to share information about trade routes and market conditions. The ironwork features intricate patterns from the Georgian era."
        },
        {
            id: 5,
            name: "Location 5: The Garden of Memories",
            locationName: "The Garden of Memories",
            locationNameVariations: ["garden of memories", "the garden of memories"],
            description: "A peaceful garden with historical significance",
            clue: "Where nature meets history. Find the garden that remembers those who came before.",
            textHint: "This garden has a memorial stone. Look for an inscription mentioning '1800'.",
            mapHint: "Continue south from Location 4, about 120 meters. The garden is behind a stone wall.",
            question: "What is written on the memorial stone?",
            correctAnswer: "Established 1800",
            answerVariations: ["established 1800", "established eighteen hundred"],
            titbits: "The Garden of Memories was created in 1800 as a place of reflection. It was designed to honor the founders of the area and has been maintained continuously for over 200 years. Many of the trees planted here are still standing today."
        },
        {
            id: 6,
            name: "Location 6: The Artisan's Lane",
            locationName: "The Artisan's Lane",
            locationNameVariations: ["artisan's lane", "artisans lane", "the artisan's lane", "artisan lane"],
            description: "A narrow lane where craftsmen once worked",
            clue: "Walk the path where skilled hands created wonders. Find the lane that echoes with the sound of hammers and chisels.",
            textHint: "This lane is very narrow. Look for old workshop signs still visible on the walls.",
            mapHint: "Head west from Location 5, approximately 200 meters. The lane is between two larger streets.",
            question: "What craft is mentioned on the oldest visible sign?",
            correctAnswer: "Watchmaker",
            answerVariations: ["watchmaker", "watch maker"],
            titbits: "The Artisan's Lane was home to many craftsmen in the 1800s. Watchmakers, blacksmiths, and carpenters all had workshops here. The narrow lane was designed to maximize space in the growing city. Some of the original workshop signs are still visible today."
        },
        {
            id: 7,
            name: "Location 7: The Market Cross",
            locationName: "The Market Cross",
            locationNameVariations: ["market cross", "the market cross"],
            description: "A historic market area with a central cross",
            clue: "Where commerce and community met. Find the cross that marked the heart of the old market.",
            textHint: "The cross is made of stone. Look for inscriptions around its base.",
            mapHint: "Continue west from Location 6, about 150 meters. The cross stands in a small square.",
            question: "What material is the cross made from?",
            correctAnswer: "Limestone",
            answerVariations: ["limestone", "lime stone"],
            titbits: "The Market Cross was erected in 1801 to mark the official market area. It served as a meeting point for traders and a landmark for travelers. The limestone cross has weathered over two centuries but still stands as a testament to the area's commercial history."
        },
        {
            id: 8,
            name: "Location 8: The Scholar's Gate",
            locationName: "The Scholar's Gate",
            locationNameVariations: ["scholar's gate", "scholars gate", "the scholar's gate", "scholar gate"],
            description: "An ornate gate leading to an educational institution",
            clue: "Pass through the gate where knowledge was sought. Find the entrance that welcomed students of the past.",
            textHint: "The gate has decorative elements. Count the decorative elements on top.",
            mapHint: "Head north from Location 7, approximately 180 meters. The gate is part of a larger building complex.",
            question: "How many decorative elements are on top of the gate?",
            correctAnswer: "4 elements",
            answerVariations: ["4 elements", "4", "four elements", "four"],
            titbits: "The Scholar's Gate was built in 1803 as the entrance to a prestigious academy. Many notable figures from the 1800s passed through this gate to receive their education. The decorative elements represent the four pillars of learning: wisdom, knowledge, understanding, and virtue."
        },
        {
            id: 9,
            name: "Location 9: The Timekeeper's House",
            locationName: "The Timekeeper's House",
            locationNameVariations: ["timekeeper's house", "timekeepers house", "the timekeeper's house", "timekeeper house"],
            description: "A historic house where a famous clockmaker once lived",
            clue: "Visit the home of one who mastered time. Find the house where precision was born.",
            textHint: "The house has a blue plaque. Read what it says about the former resident.",
            mapHint: "Continue north from Location 8, about 220 meters. Look for a house with a distinctive blue plaque.",
            question: "What was the profession of the person who lived here?",
            correctAnswer: "Clockmaker",
            answerVariations: ["clockmaker", "clock maker"],
            titbits: "The Timekeeper's House was home to Master Horologist James Pendleton from 1800 to 1825. He was renowned for creating some of the most accurate timepieces of his era. His clocks can still be found in several historic buildings throughout London. The blue plaque was installed in 1950 to commemorate his contributions."
        },
        {
            id: 10,
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