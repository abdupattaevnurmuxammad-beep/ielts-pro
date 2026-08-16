// ============================================
// DEMO / PLACEHOLDER CONTENT
// Replace `sections` below with your own licensed
// content later — the engine (listening-engine.js)
// doesn't need to change at all.
//
// Question "type" values supported:
//   "fill_blank"      -> single text input, exact-match answer
//   "multiple_choice" -> pick 1 of N options
//   "matching"        -> match each item in `items` to one
//                         option in `options`
// ============================================

const listeningTest = {
  title: "IELTS PRO — Sample Listening Test",
  totalQuestions: 40,
  transferTimeSeconds: 600, // 10 min transfer time at the end

  sections: [
    {
      id: 1,
      title: "Section 1",
      context: "A phone conversation about booking a community hall for an event.",
      audio: "audio/section1-demo.mp3",
      questions: [
        { id: 1,  type: "fill_blank", prompt: "Caller's surname:", answer: "harrison" },
        { id: 2,  type: "fill_blank", prompt: "Contact phone number:", answer: "0114 226 7789" },
        { id: 3,  type: "fill_blank", prompt: "Event date requested:", answer: "14 march" },
        { id: 4,  type: "multiple_choice", prompt: "What type of event is being planned?",
          options: ["A wedding reception", "A birthday party", "A community meeting"], correct: 1 },
        { id: 5,  type: "multiple_choice", prompt: "How many guests are expected?",
          options: ["Around 30", "Around 60", "Around 100"], correct: 1 },
        { id: 6,  type: "fill_blank", prompt: "Hire fee for the main hall (per hour):", answer: "25" },
        { id: 7,  type: "multiple_choice", prompt: "What is included in the basic hire fee?",
          options: ["Tables and chairs only", "Tables, chairs and sound system", "Full catering service"], correct: 1 },
        { id: 8,  type: "matching", prompt: "Match each room to its capacity.",
          items: ["Main hall", "Meeting room", "Kitchen area"],
          options: ["Up to 120 people", "Up to 20 people", "Staff use only"],
          correct: { "Main hall": "Up to 120 people", "Meeting room": "Up to 20 people", "Kitchen area": "Staff use only" } },
        { id: 9,  type: "fill_blank", prompt: "Deposit required to confirm booking:", answer: "50" },
        { id: 10, type: "multiple_choice", prompt: "What must the caller send by email to confirm?",
          options: ["A signed contract", "Proof of address", "A deposit receipt"], correct: 0 }
      ]
    },
    {
      id: 2,
      title: "Section 2",
      context: "A recorded announcement about a university library's opening hours and services.",
      audio: "audio/section2-demo.mp3",
      questions: [
        { id: 11, type: "multiple_choice", prompt: "What time does the library open on weekdays?",
          options: ["7:00 am", "8:00 am", "9:00 am"], correct: 1 },
        { id: 12, type: "fill_blank", prompt: "The library is closed on:", answer: "sunday" },
        { id: 13, type: "matching", prompt: "Match each floor to what can be found there.",
          items: ["Ground floor", "First floor", "Second floor"],
          options: ["Group study rooms", "Silent study area", "Reception and cafe"],
          correct: { "Ground floor": "Reception and cafe", "First floor": "Group study rooms", "Second floor": "Silent study area" } },
        { id: 14, type: "fill_blank", prompt: "Maximum number of books a student can borrow:", answer: "8" },
        { id: 15, type: "multiple_choice", prompt: "How long can a textbook be borrowed for?",
          options: ["1 week", "2 weeks", "4 weeks"], correct: 2 },
        { id: 16, type: "fill_blank", prompt: "Late return fine (per day):", answer: "0.50" },
        { id: 17, type: "multiple_choice", prompt: "What do students need to enter the building after hours?",
          options: ["A staff member present", "Their student ID card", "A written permission slip"], correct: 1 },
        { id: 18, type: "fill_blank", prompt: "Printing costs, per page (black and white):", answer: "0.10" },
        { id: 19, type: "multiple_choice", prompt: "Where should students report a lost item?",
          options: ["The IT help desk", "The reception desk", "Security office"], correct: 1 },
        { id: 20, type: "fill_blank", prompt: "Website to check real-time seat availability:", answer: "library.online" }
      ]
    },
    {
      id: 3,
      title: "Section 3",
      context: "Two students discussing their upcoming group project on renewable energy.",
      audio: "audio/section3-demo.mp3",
      questions: [
        { id: 21, type: "multiple_choice", prompt: "What is the topic of their group project?",
          options: ["Solar power in rural areas", "Wind farms and local communities", "Recycling policies"], correct: 1 },
        { id: 22, type: "matching", prompt: "Match each task to the student responsible.",
          items: ["Literature review", "Data collection", "Final presentation"],
          options: ["Priya", "Tom", "Both together"],
          correct: { "Literature review": "Priya", "Data collection": "Tom", "Final presentation": "Both together" } },
        { id: 23, type: "fill_blank", prompt: "Submission deadline for the draft:", answer: "22 april" },
        { id: 24, type: "multiple_choice", prompt: "What problem did they have with their first data source?",
          options: ["It was out of date", "It was too technical", "It was not free to access"], correct: 0 },
        { id: 25, type: "fill_blank", prompt: "Name of the journal they will use instead:", answer: "energy futures" },
        { id: 26, type: "multiple_choice", prompt: "What does the tutor suggest they add to the project?",
          options: ["A case study", "More statistics", "An interview"], correct: 2 },
        { id: 27, type: "fill_blank", prompt: "Length requirement for the final report:", answer: "3000 words" },
        { id: 28, type: "multiple_choice", prompt: "How does Tom feel about the deadline?",
          options: ["Confident", "Worried", "Indifferent"], correct: 1 },
        { id: 29, type: "fill_blank", prompt: "Room booked for their next meeting:", answer: "b12" },
        { id: 30, type: "multiple_choice", prompt: "What will they do before their next meeting?",
          options: ["Email the tutor", "Read two more articles", "Book the interview"], correct: 1 }
      ]
    },
    {
      id: 4,
      title: "Section 4",
      context: "A lecture on the history of urban green spaces.",
      audio: "audio/section4-demo.mp3",
      questions: [
        { id: 31, type: "fill_blank", prompt: "The first public park discussed opened in the year:", answer: "1847" },
        { id: 32, type: "multiple_choice", prompt: "What was the original purpose of most early city parks?",
          options: ["Recreation for all classes", "Private use by the wealthy", "Military training"], correct: 1 },
        { id: 33, type: "fill_blank", prompt: "Term used for parks designed to improve public health:", answer: "lungs of the city" },
        { id: 34, type: "matching", prompt: "Match each city to its famous park era.",
          items: ["City A", "City B", "City C"],
          options: ["19th century", "Early 20th century", "Post-war period"],
          correct: { "City A": "19th century", "City B": "Early 20th century", "City C": "Post-war period" } },
        { id: 35, type: "multiple_choice", prompt: "What modern challenge do city parks face today?",
          options: ["Lack of visitors", "Funding cuts", "Overuse by tourists"], correct: 1 },
        { id: 36, type: "fill_blank", prompt: "Percentage of city land recommended for green space:", answer: "15%" },
        { id: 37, type: "multiple_choice", prompt: "What solution does the lecturer mention for small cities?",
          options: ["Rooftop gardens", "Larger central parks", "Removing car parks"], correct: 0 },
        { id: 38, type: "fill_blank", prompt: "Name of the case-study city mentioned:", answer: "Grenshaw" },
        { id: 39, type: "multiple_choice", prompt: "What is the lecturer's overall conclusion?",
          options: ["Parks are less important now", "Green space design must adapt", "Older parks should be replaced"], correct: 1 },
        { id: 40, type: "fill_blank", prompt: "Title of the report recommended for further reading:", answer: "urban green futures" }
      ]
    }
  ]
};