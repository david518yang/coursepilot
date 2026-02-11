import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';
import { shuffle } from 'lodash';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });
const SCHEMA = {
  description: 'Quiz',
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: 'Title of the quiz',
    },
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: {
            type: SchemaType.STRING,
            description: 'The question text',
          },
          type: {
            type: SchemaType.STRING,
            description: 'Type of question (multiple choice, true false, etc.)',
          },
          options: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.STRING,
            },
            description: 'Possible answers for multiple choice questions',
          },
          correctAnswer: {
            type: SchemaType.STRING,
            description: 'The correct answer',
          },
        },
        required: ['question', 'type', 'correctAnswer'],
      },
    },
  },
  required: ['title', 'questions'],
};

export async function POST(req: NextRequest) {
  try {
    console.log('[Debug] Starting quiz generation');
    console.log('[Debug] Auth headers:', {
      auth: req.headers.get('authorization'),
      cookie: req.headers.get('cookie'),
    });

    const user = await currentUser();
    if (!user) {
      console.error('[Error] Unauthorized: No user found');
      return NextResponse.json({ error: 'Unauthorized: No user found' }, { status: 401 });
    }

    console.log('[Debug] Authenticated user:', user.id);

    const { subject, topic, numQuestions, formats } = await req.json();
    console.log('[Debug] Received request:', { subject, topic, numQuestions, formats });

    if (!subject || !topic || !numQuestions || !formats || !Array.isArray(formats)) {
      console.error('[Error] Invalid request parameters:', { subject, topic, numQuestions, formats });
      return NextResponse.json({ error: 'Missing or invalid required parameters' }, { status: 400 });
    }

    const distributeQuestions = async (
      numQuestions: number,
      formats: string[],
      subject: string,
      topic: string
    ): Promise<Record<string, { numQuestions: number; topics: string[] }>> => {
      const distribution: Record<string, { numQuestions: number; topics: string[] }> = {
        'multiple choice': { numQuestions: 0, topics: [] },
        'true false': { numQuestions: 0, topics: [] },
        'short answer': { numQuestions: 0, topics: [] },
        'fill in the blank': { numQuestions: 0, topics: [] },
        matching: { numQuestions: 0, topics: [] },
        'select all': { numQuestions: 0, topics: [] },
      };

      const baseNum = Math.floor(numQuestions / formats.length);
      let remaining = numQuestions - baseNum * formats.length;

      formats.forEach(format => {
        distribution[format].numQuestions = baseNum;
      });

      while (remaining > 0) {
        const minCount = Math.min(...formats.map(f => distribution[f].numQuestions));
        const formatsWithMinCount = formats.filter(f => distribution[f].numQuestions === minCount);
        const randomFormat = formatsWithMinCount[Math.floor(Math.random() * formatsWithMinCount.length)];
        distribution[randomFormat].numQuestions++;
        remaining--;
      }

      const prompt = `For a quiz about ${topic} in ${subject}, suggest subtopic(s) that would work well with different question formats.
      If a format is not mentioned, do not generate topics for it.
      ${distribution['multiple choice'].numQuestions != 0 ? `generate ${distribution['multiple choice'].numQuestions} topics for multiple choice: Topics good for testing knowledge with multiple options` : ''} 
      ${distribution['true false'].numQuestions != 0 ? `generate ${distribution['true false'].numQuestions} topics for true false: Topics with clear true/false statements` : ''} 
      ${distribution['short answer'].numQuestions != 0 ? `generate ${distribution['short answer'].numQuestions} topics for short answer: Topics requiring brief, specific answers` : ''} 
      ${distribution['fill in the blank'].numQuestions != 0 ? `generate ${distribution['fill in the blank'].numQuestions} topics for fill in the blank: Topics with key terms or concepts to complete` : ''} 
      ${distribution['matching'].numQuestions != 0 ? `generate ${distribution['matching'].numQuestions} topics for matching: Groups of related terms/concepts that can be matched` : ''} 
      ${distribution['select all'].numQuestions != 0 ? `generate ${distribution['select all'].numQuestions} topics for select all: Topics with multiple correct related items` : ''} 
      return ONLY the JSON object, with no other formatting, with the following format: 
      {"multiple choice": [topics], 
      "true false": [topics], 
      "short answer": [topics], 
      "fill in the blank": [topics],
      "matching": [topics], 
      "select all": [topics]}`;

      const completion = await MODEL.generateContent(prompt);
      const responseText = completion.response.text();
      let cleanedResponse = responseText
        .replace(/```json\n?|```/g, '') // Remove code block markers
        .replace(/^\s*\n/gm, '') // Remove empty lines
        .trim(); // Remove leading/trailing whitespace

      if (!cleanedResponse.startsWith('{')) {
        const jsonStart = cleanedResponse.indexOf('{');
        if (jsonStart !== -1) {
          cleanedResponse = cleanedResponse.slice(jsonStart);
        }
      }

      let topicSuggestions;
      try {
        topicSuggestions = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Failed to parse response:', cleanedResponse);
        throw new Error('Failed to parse topic suggestions from AI response');
      }

      if (!topicSuggestions || typeof topicSuggestions !== 'object') {
        throw new Error('Invalid topic suggestions format from AI response');
      }

      Object.keys(distribution).forEach(format => {
        if (topicSuggestions[format]) {
          distribution[format].topics = topicSuggestions[format];
        }
      });
      return distribution;
    };

    const questionDistribution = await distributeQuestions(numQuestions, formats, subject, topic);
    console.log('[Debug] Question distribution:', questionDistribution);

    const formatSpecificPrompts = {
      'multiple choice': `Generate exactly ${questionDistribution['multiple choice'].numQuestions} multiple choice question(s) about ${questionDistribution['multiple choice'].topics.join(', ')} in ${subject}. For each question:
- Make the question clear and specific
- Provide exactly 4 answer choices labeled A-D
- Include only one correct answer
- Make incorrect choices plausible but clearly wrong
- Avoid "all/none of the above"
Format as JSON: {"question": "What is X?", "answers": ["answer1", "answer2", "answer3", "answer4"], "correctAnswer": "answer1", "format": "multiple choice"}. Return ONLY the JSON array.`,

      'true false': `Generate exactly ${questionDistribution['true false'].numQuestions} true/false question(s) about ${questionDistribution['true false'].topics.join(', ')} in ${subject}. For each question:
- Make statements clear and unambiguous 
- Avoid double negatives
- Focus on important concepts
- Mix true and false statements evenly
Format as JSON: {"question": "Statement", "correctAnswer": "True", "format": "true false"}. Return ONLY the JSON array.`,

      'short answer': `Generate exactly ${questionDistribution['short answer'].numQuestions} short answer question(s) about ${questionDistribution['short answer'].topics.join(', ')} in ${subject}. For each question:
- question(s) should have a single specific answer
- Answer should be 1-3 words maximum
- Focus on key terms, names, or concepts
- Avoid question(s) with multiple possible answers
Format as JSON: {"question": "What is X?", "correctAnswer": "answer", "format": "short answer"}. Return ONLY the JSON array.`,

      'fill in the blank': `Generate exactly ${questionDistribution['fill in the blank'].numQuestions} fill-in-the-blank question(s) about ${questionDistribution['fill in the blank'].topics.join(', ')} in ${subject}. For each question:
- Use ONLY ONE underscore _ to indicate the blank
- Keep sentences under 15 words
- There should only be one blank and it should test a key concept
- Answer should be 1-2 words maximum
Format as JSON: {"question": "The _ is important.", "correctAnswer": "answer", "format": "fill in the blank"}. Return ONLY the JSON array.`,

      matching: `Generate exactly ${questionDistribution['matching'].numQuestions} matching question about ${questionDistribution['matching'].topics.join(', ')} in ${subject}. Format your response as a JSON array with this exact structure:
[{
  "question": "Match the Renaissance artists to their most famous works",
  "format": "matching",
  "answers": {
    "terms": ["Artist1", "Artist2", "Artist3"],
    "descriptions": ["Work1", "Work2", "Work3"]
  },
  "correctAnswers": {
    "Artist1": "Work1",
    "Artist2": "Work2",
    "Artist3": "Work3"
  }
}]

Rules:
- Create 3-5 pairs of related terms and descriptions
- Terms should be concise (1-3 words)
- Descriptions should be clear and specific
- All items should be related to the same concept
- Return ONLY the JSON array with no additional text`,

      'select all': `Generate exactly ${questionDistribution['select all'].numQuestions} select-all question(s) about ${questionDistribution['select all'].topics.join(', ')} in ${subject}. For each question:
- Provide 4-6 total options
- Include 2-4 correct answers
- Make all options related and plausible
- Avoid obvious incorrect answers
Format as JSON: {"question": "Select all that apply", "answers": ["answer1", "answer2", "answer3", "answer4"], "correctAnswers": ["answer1", "answer3"], "format": "select all"}. Return ONLY the JSON array.`,
    };

    for (const format in formatSpecificPrompts) {
      formatSpecificPrompts[format as keyof typeof formatSpecificPrompts] =
        'You are an expert test creator. ' + formatSpecificPrompts[format as keyof typeof formatSpecificPrompts];
    }

    try {
      const responses = await Promise.all(
        formats.map(async (format: string) => {
          if (questionDistribution[format].numQuestions === 0) return [];

          try {
            const prompt = formatSpecificPrompts[format as keyof typeof formatSpecificPrompts];
            console.log(`\n[Generation] Generating ${questionDistribution[format].numQuestions} ${format} questions`);
            console.log(`[Generation] Topics:`, questionDistribution[format].topics);

            const completion = await MODEL.generateContent(prompt);
            if (!completion.response) {
              throw new Error('No response from AI model');
            }

            const responseText = completion.response.text();
            console.log(`[Debug] Raw AI response length for ${format}:`, responseText.length);

            let cleanedResponse = responseText
              .replace(/```json\n?|```/g, '') // Remove code blocks
              .replace(/^\s*\n/gm, '') // Remove empty lines
              .replace(/\/\/.*/g, '') // Remove any comments
              .trim();

            console.log(`[Debug] Cleaned response length for ${format}:`, cleanedResponse.length);

            // For matching format, add extra JSON validation
            if (format === 'matching') {
              try {
                // Try to parse as is first
                JSON.parse(cleanedResponse);
              } catch (e) {
                // If parsing fails, try to extract just the JSON array
                const jsonStart = cleanedResponse.indexOf('[');
                const jsonEnd = cleanedResponse.lastIndexOf(']') + 1;
                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                  cleanedResponse = cleanedResponse.slice(jsonStart, jsonEnd);
                  // Verify it's now valid JSON
                  JSON.parse(cleanedResponse);
                }
              }
            }

            if (!cleanedResponse.startsWith('[')) {
              const jsonStart = cleanedResponse.indexOf('[');
              if (jsonStart !== -1) {
                cleanedResponse = cleanedResponse.slice(jsonStart);
              } else {
                cleanedResponse = '[' + cleanedResponse;
              }
            }
            if (!cleanedResponse.endsWith(']')) {
              cleanedResponse = cleanedResponse + ']';
            }

            let parsedResponse;
            try {
              parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
              console.error(`[Error] JSON parsing failed for ${format}:`, {
                error: parseError,
                cleanedResponse: cleanedResponse.substring(0, 200) + '...',
              });
              throw new Error(`Failed to parse AI response for ${format}`);
            }

            const questions = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
            console.log(`[Debug] Generated ${questions.length} ${format} questions`);

            // Basic format validation
            questions.forEach((q, idx) => {
              q.format = format; // Ensure format is set correctly

              // Check required fields based on format
              if (!q.question) {
                throw new Error(`Question ${idx + 1} missing question text`);
              }

              if (format === 'multiple choice') {
                if (!Array.isArray(q.answers) || q.answers.length !== 4) {
                  throw new Error(`Question ${idx + 1} must have exactly 4 answers`);
                }
                if (!q.correctAnswer) {
                  throw new Error(`Question ${idx + 1} missing correctAnswer`);
                }
              } else if (format === 'select all') {
                if (!Array.isArray(q.answers)) {
                  throw new Error(`Question ${idx + 1} missing answers array`);
                }
                if (!Array.isArray(q.correctAnswers)) {
                  throw new Error(`Question ${idx + 1} missing correctAnswers array`);
                }
              } else if (format === 'matching') {
                if (!q.answers?.terms || !q.answers?.descriptions) {
                  throw new Error(`Question ${idx + 1} missing terms or descriptions`);
                }
                if (!q.correctAnswers) {
                  throw new Error(`Question ${idx + 1} missing correctAnswers mapping`);
                }
              } else if (format === 'fill in the blank') {
                if (!q.question.includes('_')) {
                  throw new Error(`Question ${idx + 1} missing blank (_)`);
                }
                if (!q.correctAnswer) {
                  throw new Error(`Question ${idx + 1} missing correctAnswer`);
                }
              }
            });

            return questions;
          } catch (promptError) {
            console.error(`[Error] Failed to generate ${format} questions:`, promptError);
            return []; // Skip failed format but continue with others
          }
        })
      );

      const quizData = shuffle(responses.flat());
      console.log('\n[Final] Questions generated by format:');
      const distribution = quizData.reduce(
        (acc, q) => {
          acc[q.format] = (acc[q.format] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      console.log(distribution);

      if (quizData.length === 0) {
        throw new Error('Failed to generate any valid questions');
      }

      return NextResponse.json({ questions: quizData });
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in quiz generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate quiz',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
