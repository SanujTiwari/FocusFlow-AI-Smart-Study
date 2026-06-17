import axios from 'axios';

export const generateStudyPlan = async (subjects, preference, startDate, numberOfDays) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing');
  }

  // Calculate days between dates
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + numberOfDays - 1);

  let timeRange = "08:00 to 20:00";
  if (preference.studyTimePreference === 'MORNING') {
    timeRange = "06:00 to 14:00";
  } else if (preference.studyTimePreference === 'EVENING') {
    timeRange = "14:00 to 22:00";
  }

  const subjectList = subjects.map(s => {
    const examDate = new Date(s.examDate);
    const diffTime = Math.abs(examDate - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `  - Name: "${s.subjectName}", Difficulty: ${s.difficulty}, Exam Date: ${s.examDate}, Days Until Exam: ${diffDays}`;
  }).join('\n');

  const prompt = `
You are an intelligent study planner AI. Generate an optimized study schedule.

STUDENT PREFERENCES:
- Available study hours per day: ${preference.availableHoursPerDay}
- Study time window: ${timeRange}
- Break duration: ${preference.breakDurationMinutes} minutes
- Pomodoro: ${preference.pomodoroWorkMinutes} min work / ${preference.pomodoroBreakMinutes} min rest

SUBJECTS:
${subjectList}

DATE RANGE: ${startDate} to ${end.toISOString().split('T')[0]} (${numberOfDays} days)

SCHEDULING RULES:
1. Allocate time by difficulty: HARD gets 40%, MEDIUM gets 35%, EASY gets 25%
2. Subjects with exams within 7 days get DOUBLE priority
3. Subjects with exams already passed should be EXCLUDED
4. Reserve 20% of study time for REVISION sessions
5. Add a BREAK of ${preference.breakDurationMinutes} minutes after every 1.5-2 hours of study
6. Maximum ${preference.availableHoursPerDay} hours of active study per day (excluding breaks)
7. Earlier exam dates get higher priority
8. Vary subjects throughout the day to avoid fatigue
9. Do NOT schedule anything past exam dates for that subject

Generate a JSON array with this exact structure:
[
  {
    "date": "YYYY-MM-DD",
    "subjectName": "exact subject name from the list above",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "taskDescription": "specific study task description",
    "taskType": "STUDY or REVISION or BREAK",
    "isRevision": true/false
  }
]

Return ONLY the JSON array. No explanation, no markdown fences.
Ensure times don't overlap and are in chronological order per day.
For BREAK entries, use subjectName as "Break".
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      }
    );

    let text = response.data.candidates[0].content.parts[0].text;
    text = text.trim();
    if (text.startsWith('\`\`\`json')) text = text.substring(7);
    if (text.startsWith('\`\`\`')) text = text.substring(3);
    if (text.endsWith('\`\`\`')) text = text.substring(0, text.length - 3);
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error('Gemini API call failed:', error.message);
    if (error.response) console.error(error.response.data);
    
    // Fallback: Generate a basic schedule if Gemini is unavailable
    console.log('Using fallback schedule generation due to Gemini API error.');
    const fallbackPlan = [];
    let currentStartDate = new Date(startDate);
    
    for (let i = 0; i < numberOfDays; i++) {
      const dateString = currentStartDate.toISOString().split('T')[0];
      
      if (subjects.length > 0) {
        // Just pick the first subject as a placeholder
        fallbackPlan.push({
          date: dateString,
          subjectName: subjects[0].subjectName,
          startTime: "09:00",
          endTime: "11:00",
          taskDescription: "Fallback Study Session",
          taskType: "STUDY",
          isRevision: false
        });
      }
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    }
    
    if (fallbackPlan.length > 0) {
      return fallbackPlan;
    }
    
    throw new Error('Failed to generate study plan. Please try again.');
  }
};

export const parseSyllabusFromText = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing');
  }

  const prompt = `
You are an expert academic curriculum parsing agent.
Analyze the following copy-pasted syllabus content and extract a clean list of individual chapters, topics, or units.

Syllabus Content:
${text}

Generate a JSON array of strings containing the chapter names:
[
  "Chapter Name 1",
  "Chapter Name 2"
]

Return ONLY the JSON array. Do not include markdown fences or any explanation. Ensure chapter names are concise (max 80 chars).
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }
    );

    let resultText = response.data.candidates[0].content.parts[0].text;
    resultText = resultText.trim();
    if (resultText.startsWith('\`\`\`json')) resultText = resultText.substring(7);
    if (resultText.startsWith('\`\`\`')) resultText = resultText.substring(3);
    if (resultText.endsWith('\`\`\`')) resultText = resultText.substring(0, resultText.length - 3);

    return JSON.parse(resultText.trim());
  } catch (error) {
    console.error('Gemini parseSyllabusFromText failed:', error.message);
    throw new Error('Failed to parse syllabus text using AI');
  }
};

export const parseSyllabusFromFile = async (base64Data, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing');
  }

  const textPart = {
    text: `You are an expert academic curriculum parsing agent.
Analyze the attached syllabus document (PDF/Image/Text) and extract a clean list of individual chapters, topics, or units.

Generate a JSON array of strings containing the chapter names:
[
  "Chapter Name 1",
  "Chapter Name 2"
]

Return ONLY the JSON array. Do not include markdown fences or any explanation. Ensure chapter/topic names are concise (max 80 chars).`
  };

  const filePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data
    }
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [textPart, filePart] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }
    );

    let resultText = response.data.candidates[0].content.parts[0].text;
    resultText = resultText.trim();
    if (resultText.startsWith('\`\`\`json')) resultText = resultText.substring(7);
    if (resultText.startsWith('\`\`\`')) resultText = resultText.substring(3);
    if (resultText.endsWith('\`\`\`')) resultText = resultText.substring(0, resultText.length - 3);

    return JSON.parse(resultText.trim());
  } catch (error) {
    console.error('Gemini parseSyllabusFromFile failed:', error.message);
    if (error.response) console.error(error.response.data);
    throw new Error('Failed to parse syllabus file using AI');
  }
};

export const generateFlashcardsForSubject = async (subjectName, chapters) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing');
  }

  const prompt = `
You are an intelligent study tutor AI. Generate a set of high-quality study flashcards for active recall.

Subject: ${subjectName}
Chapters/Topics to focus on:
${chapters.join(', ')}

Generate exactly 10 high-quality flashcards testing key concepts, definitions, or application questions from the topics above. 
For each flashcard, define a clear, concise question/concept on the "front" and a direct, informative answer/explanation on the "back". Keep it engaging and challenging for study.

Generate a JSON array with this exact structure:
[
  {
    "front": "Question/Concept text...",
    "back": "Answer/Explanation text..."
  }
]

Return ONLY the JSON array. No explanations, no markdown formatting.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      }
    );

    let resultText = response.data.candidates[0].content.parts[0].text;
    resultText = resultText.trim();
    if (resultText.startsWith('\`\`\`json')) resultText = resultText.substring(7);
    if (resultText.startsWith('\`\`\`')) resultText = resultText.substring(3);
    if (resultText.endsWith('\`\`\`')) resultText = resultText.substring(0, resultText.length - 3);

    return JSON.parse(resultText.trim());
  } catch (error) {
    console.error('Gemini generateFlashcards failed:', error.message);
    throw new Error('Failed to generate flashcards using AI');
  }
};
