// Game Data - Letter Left Behind Treasure Hunt in London

const gameData = {
    startingLocation: {
        name: "Waterloo Station",
        address: "Waterloo Station, London SE1 8SW",
        coordinates: {
            lat: 51.4952,
            lng: -0.1441
        }
    },
    
    locations: [
        {
            id: 1,
            clue: "I hang up high where journeys begin, I have two hands but never wave. Trains rush past, but I stay still, helping travellers know when to leave.\nWhat am I?",
            name: "Location 1: Waterloo Clock",
            locationName: "Waterloo Clock",
            locationNameVariations: ["waterloo clock", "clock", "the waterloo clock"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sWaterloo%20Station!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "Time shows a picture of a journey long ago. On the mural made to celebrate 200 years of rail travel, find the child who is travelling through time.\nFrom which place did the child begin their journey?",
            correctAnswer: "Horsley",
            textHint: "Stand where travellers first step inside. The picture greets you right at the beginning of the journey.",
            titbits: "Waterloo Station is one of London's busiest railway stations, opened in 1848. The station's clock has been a landmark for travellers for over 170 years. The station was named after the Battle of Waterloo and has been featured in numerous films and literature. The mural celebrating 200 years of rail travel depicts scenes from railway history, including a child travelling through time."
        },
        {
            id: 2,
            clue: "Travel to the level where time meets your eyes. Stand face-to-face with the clock, not above or below.\nFrom here, look for a couple made of pericrete frozen in time,\nHow many people are peeking through a wall?",
            name: "Location 2: Six People",
            locationName: "Six",
            locationNameVariations: ["six", "6"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sWaterloo%20Station!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "Turn left and walk beside the stone story. Time has been stamped below a shining medal.\nIn which year was this memory placed to honour those lost in battle of Waterloo?",
            correctAnswer: "2015",
            textHint: "Look carefully at the artwork. Count each figure you can see.",
            titbits: "Waterloo Station features several memorials and artworks. The Waterloo Memorial commemorates those who lost their lives in the Battle of Waterloo. The station area contains various sculptures and installations that tell stories of history and travel. The memorial was placed in 2015 to mark the 200th anniversary of the Battle of Waterloo."
        },
        {
            id: 3,
            clue: "Go back down to where you stood before, three travellers pause, carrying more. Their journey crossed the sea and time, this monument remembers their climb.\nWhat is this place called?",
            name: "Location 3: National Windrush Monument",
            locationName: "National Windrush Monument",
            locationNameVariations: ["national windrush monument", "windrush monument", "the national windrush monument"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sWaterloo%20Station!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "These travellers stand on symbols of travel and hope.\nHow many bundles lift them from the ground?",
            correctAnswer: "Seven",
            textHint: "Count the colours that paint the sky after rain 🌈",
            titbits: "The National Windrush Monument commemorates the arrival of the HMT Empire Windrush in 1948, which brought hundreds of Caribbean migrants to Britain. The monument, unveiled in 2022, features three figures representing the Windrush generation. It stands as a symbol of the contributions made by Caribbean communities to British society. The monument is located near Waterloo Station, a significant arrival point for many immigrants."
        },
        {
            id: 4,
            clue: "Time has scrambled the letters into numbers.\n\n19 – 20 – 1 – 20 – 9 – 15 – 14\n13 – 1 – 9 – 14\n5 – 14 – 20 – 18 – 1 – 14 – 3 – 5\n\nIs where should you go next..",
            name: "Location 4: Station Main Entrance",
            locationName: "Station Main Entrance",
            locationNameVariations: ["station main entrance", "main entrance", "the station main entrance"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sWaterloo%20Station!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "At the great entrance of journeys and time, a word hides between two ancient lands.\nWhat place sits between France and Egypt?",
            correctAnswer: "Mesopotamia",
            textHint: "My name means \"land between two rivers\", spoken long ago in Greek.",
            titbits: "Waterloo Station's main entrance is a grand Victorian structure that has welcomed millions of travellers. The station was designed by architects and opened in 1848. The entrance area contains various historical references and architectural details. Mesopotamia, meaning 'land between two rivers' in Greek, refers to the ancient region between the Tigris and Euphrates rivers, located between modern-day France (via historical connections) and Egypt."
        },
        {
            id: 5,
            clue: "Walk where feet cross the river, not by boat, not by train.\nI was named to celebrate a golden year, not for one person, but for a reign.\nI stand beside a wheel that sees the future, and near a clock that watches time begin.\nWhat am I?",
            name: "Location 5: Golden Jubilee Bridge",
            locationName: "Golden Jubilee Bridge",
            locationNameVariations: ["golden jubilee bridge", "jubilee bridge", "the golden jubilee bridge"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sGolden%20Jubilee%20Bridge!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "Before crossing time's river, a man stands tall who once was locked away.\nWho is the traveller who returned from prison to lead a nation?",
            correctAnswer: "Nelson Mandela",
            textHint: "I am a pedestrian bridge named after a royal anniversary.",
            titbits: "The Golden Jubilee Bridges are two pedestrian bridges crossing the River Thames, opened in 2002 to celebrate Queen Elizabeth II's Golden Jubilee. The bridges connect the South Bank to the Embankment area. Nearby stands a statue of Nelson Mandela, the anti-apartheid leader who became South Africa's first black president. The bridges offer stunning views of the London Eye and the Houses of Parliament."
        },
        {
            id: 6,
            clue: "Time has left many names beside the river. On the bridge, find the plaque that maps them all.\nRead from left to right, as time always moves.\nThe third name from the left tells you where to go.",
            name: "Location 6: Victoria Embankment Gardens",
            locationName: "Victoria Embankment Gardens",
            locationNameVariations: ["victoria embankment gardens", "embankment gardens", "the victoria embankment gardens"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sVictoria%20Embankment%20Gardens!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "A Poetic Genius once sent something forward through time, not with his hands, but with his words.\nWhat did Poetic Genius throw?",
            correctAnswer: "Inspiring Mantle",
            textHint: "\"I am Robert Burns.\" Think of warmth, honour, and responsibility.",
            titbits: "Victoria Embankment Gardens is a beautiful public park along the Thames, created in the 1870s. The gardens contain several memorials and statues, including one of Scottish poet Robert Burns. The area is named after Queen Victoria and was part of the embankment project that reclaimed land from the river. The gardens offer a peaceful retreat in the heart of London with views of the Thames."
        },
        {
            id: 7,
            clue: "Time remembers those who never returned. Before travelling onward, honour the names of those who fell in action or died of wounds and disease.\nFrom the memorial, collect letters exactly as follows:\n• First and second letter of the 6th name in the second column\n• First and second letter of the 6th name in the first column\n• Second and third letter of the 2nd name in the fourth column\n• 7th and 8th letter of the 5th name in the second column\n\nAdd a space, then add an x\nWhere does this spell take you?",
            name: "Location 7: Charing Cross",
            locationName: "Charing Cross",
            locationNameVariations: ["charing cross", "charing cross station"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sCharing%20Cross!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "I rise through time in stages three, built from Portland stone, Mansfield stone, and Aberdeen granite.\nI stand tall crowned with a spire and a cross.\nJourneys are measured from where I stand.\nWhat landmark am I?",
            correctAnswer: "Queen Eleanor Memorial Cross",
            textHint: "I am an octagonal Gothic tower, standing where journeys are measured.",
            titbits: "Charing Cross is a major road junction and railway station in central London. The name originates from the Eleanor Cross, one of twelve crosses erected by King Edward I to mark the resting places of his wife Queen Eleanor's funeral procession. The current cross is a Victorian replica. Charing Cross is considered the centre of London, with distances to other places measured from this point. The area contains memorials to those who served in various conflicts."
        },
        {
            id: 8,
            clue: "Lions guard me night and day, while time gathers in open space.\nBattles named me long ago, and travellers meet beneath tall stone.\nHistory watches from every side.\nWhere should you be standing?",
            name: "Location 8: Trafalgar Square",
            locationName: "Trafalgar Square",
            locationNameVariations: ["trafalgar square", "the trafalgar square"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sTrafalgar%20Square!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "Beneath old rules of measure and scale, a number marks when length feels just right.\nAt what temperature was the standard set?",
            correctAnswer: "62",
            textHint: "Look below the imperial standards of length.",
            titbits: "Trafalgar Square is one of London's most famous public spaces, named after the Battle of Trafalgar. The square is dominated by Nelson's Column, surrounded by four bronze lions. The square was designed by architect John Nash and completed in the 1840s. It has been a site for political demonstrations, celebrations, and public gatherings. The square contains various monuments and fountains, and is a major tourist attraction."
        },
        {
            id: 9,
            clue: "High on a horse, frozen in time, I watch the square from every side. Kings may fall, but statues stay —\nWho am I?",
            name: "Location 9: King Charles I",
            locationName: "King Charles I",
            locationNameVariations: ["king charles i", "king charles", "charles i", "statue of king charles i"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sKing%20Charles%20I%20Statue!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "Before this rider claimed the spot, another memory stood here first.\nWhat did the king replace?",
            correctAnswer: "Queen Eleanor's Cross",
            textHint: "Look down — history rests beneath your feet.",
            titbits: "The equestrian statue of King Charles I stands at the southern end of Trafalgar Square, facing down Whitehall. It was created by French sculptor Hubert Le Sueur in 1633 and is one of London's oldest outdoor statues. The statue marks the site where the original Charing Cross (Queen Eleanor's Cross) once stood. King Charles I was executed in 1649 during the English Civil War, making this statue historically significant."
        },
        {
            id: 10,
            clue: "🕰️ Final Time-Traveller's Instruction\nYou've reached the moment where time slows down. Find a quiet place — this message was never meant to be rushed.\nTo uncover what was left behind, follow the traveller's method exactly. Every answer you discovered exists across different moments in time.\nFrom each named location or answer, take the first letter. Then move forward through time by the number shown next to it to arrive at the correct letter for the final message.\n\nActual Clue (do not change order):\n\nLocation 4 (+1), Answer 1 (+1), Answer 4 (0), Location 7 (+2)\nLocation 4 (+1), Location 8 (+1), Answer 7 (+1), Answer 4 (+1), Location 4 (0),\nAnswer 4 (+1), Location 3 (+1), Location 6 (+1)",
            name: "Location 10: The Final Destination",
            locationName: "The Final Destination",
            locationNameVariations: ["final destination", "the final destination"],
            mapHint: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890!2d-0.1441!3d51.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502c4b5b3%3A0x6b5a5b5b5b5b5b5b!2sLondon!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk",
            question: "What is the final word that reveals the letter left behind?",
            correctAnswer: "(You form a word)", // This will be validated based on the puzzle logic
            textHint: "Use the first letters of locations and answers, then shift forward by the numbers shown.",
            titbits: "You have completed an incredible journey through time and space, following clues across London's historic landmarks. Each location told a story, each answer revealed a piece of the puzzle. The final destination represents the culmination of your adventure, where past and present meet, and the letter left behind from 1800 is finally revealed. This journey has connected you to history, to the stories of those who came before, and to the timeless messages that transcend centuries."
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameData;
}
