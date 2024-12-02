import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';
import Quiz from '@/lib/models/Quiz';
import { connectToMongoDB } from '@/lib/db';
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
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { subject, topic, numQuestions, formats, courseId } = await req.json();

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

    const formatSpecificPrompts = {
      'multiple choice': `Generate exactly ${questionDistribution['multiple choice'].numQuestions} multiple choice question(s) about ${questionDistribution['multiple choice'].topics.join(', ')} in ${subject}. For each question:
- Make the question clear and specific
- Provide exactly 4 answer choices labeled A-D
- Include only one correct answer
- Make incorrect choices plausible but clearly wrong
- Avoid "all/none of the above"
Format as JSON: {"question": "What is X?", "answers": ["answer1", "answer2", "answer3", "answer4"], "correct_answer": "answer1", "format": "multiple choice"}. Return ONLY the JSON array.`,

      'true false': `Generate exactly ${questionDistribution['true false'].numQuestions} true/false question(s) about ${questionDistribution['true false'].topics.join(', ')} in ${subject}. For each question:
- Make statements clear and unambiguous 
- Avoid double negatives
- Focus on important concepts
- Mix true and false statements evenly
Format as JSON: {"question": "Statement", "correct_answer": "True", "format": "true false"}. Return ONLY the JSON array.`,

      'short answer': `Generate exactly ${questionDistribution['short answer'].numQuestions} short answer question(s) about ${questionDistribution['short answer'].topics.join(', ')} in ${subject}. For each question:
- question(s) should have a single specific answer
- Answer should be 1-3 words maximum
- Focus on key terms, names, or concepts
- Avoid question(s) with multiple possible answers
Format as JSON: {"question": "What is X?", "format": "short answer"}. Return ONLY the JSON array.`,

      'fill in the blank': `Generate exactly ${questionDistribution['fill in the blank'].numQuestions} fill-in-the-blank question(s) about ${questionDistribution['fill in the blank'].topics.join(', ')} in ${subject}. For each question:
- Use ONE underscore _ to indicate the blank
- Keep sentences under 15 words
- Blank should test a key concept
- Answer should be 1-2 words maximum
Format as JSON: {"question": "The _ is important.", "format": "fill in the blank"}. Return ONLY the JSON array.`,

      matching: `Generate exactly ${questionDistribution['matching'].numQuestions} matching sets about ${questionDistribution['matching'].topics.join(', ')} in ${subject}. For each set:
- Create 3-5 pairs of related terms and descriptions
- Terms should be concise (1-3 words), and be specific to the topic
- Descriptions should be clear and specific to which term they should be matched to
- All items should be related to the same concept
Format as JSON: {"question": "Match terms to descriptions", "answers": {"terms": ["Term1", "Term2"], "descriptions": ["Desc1", "Desc2"]}, "correct_answers": {"Term1": "Desc1", "Term2": "Desc2"}, "format": "matching"}. Return ONLY the JSON array.`,

      'select all': `Generate exactly ${questionDistribution['select all'].numQuestions} select-all question(s) about ${questionDistribution['select all'].topics.join(', ')} in ${subject}. For each question:
- Provide 4-6 total options
- Include 2-4 correct answers
- Make all options related and plausible
- Avoid obvious incorrect answers
Format as JSON: {"question": "Select all that apply", "answers": ["answer1", "answer2", "answer3", "answer4"], "correct_answers": ["answer1", "answer3"], "format": "select all"}. Return ONLY the JSON array.`,
    };

    for (const format in formatSpecificPrompts) {
      formatSpecificPrompts[format as keyof typeof formatSpecificPrompts] =
        'You are an expert test creator. ' + formatSpecificPrompts[format as keyof typeof formatSpecificPrompts];
    }

    const selectedFormatPrompts = formats
      .filter((format: string) => questionDistribution[format].numQuestions > 0)
      .map((format: string) => formatSpecificPrompts[format as keyof typeof formatSpecificPrompts]);

    try {
      const responses = await Promise.all(
        selectedFormatPrompts.map(async (prompt: string) => {
          try {
            const completion = await MODEL.generateContent(prompt);
            const responseText = completion.response.text();

            let cleanedResponse = responseText.replace(/```json\n?|```/g, '').trim();

            if (!cleanedResponse.startsWith('[')) {
              cleanedResponse = '[' + cleanedResponse;
            }
            if (!cleanedResponse.endsWith(']')) {
              cleanedResponse = cleanedResponse + ']';
            }

            let parsedResponse;
            try {
              parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
              console.error('JSON parsing error:', parseError);
              console.error('Cleaned response that failed to parse:', cleanedResponse);
              throw new Error(`Failed to parse AI response for format`);
            }

            const questions = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

            // format validation
            questions.forEach((question, idx) => {
              if (!question.format || !question.question) {
                throw new Error(`Invalid question format at index ${idx}`);
              }
            });

            const format = Object.keys(questionDistribution).find(f =>
              prompt.includes(f)
            ) as keyof typeof questionDistribution;

            if (questions.length !== questionDistribution[format].numQuestions) {
              console.warn(
                `Expected ${questionDistribution[format].numQuestions} question(s) for ${format}, but got ${questions.length}`
              );
            }

            return questions;
          } catch (promptError) {
            console.error('Error processing prompt:', promptError);
            throw promptError;
          }
        })
      );

      const quizData = shuffle(responses.flat());

      // final quiz data validation
      if (quizData.length !== numQuestions) {
        throw new Error(`Expected ${numQuestions} questions, but received ${quizData.length}`);
      }

      // Save to MongoDB if courseId is provided
      try {
        await connectToMongoDB();

        const dummyCourseId = '65f4f8d71f0944b332f12345'; // Dummy MongoDB ObjectId
        const dummyUserId = 'user_2Zs93kL9mN0pQ1rT'; // Dummy Clerk userId

        const quiz = await Quiz.create({
          title: `${topic} Quiz`,
          courseId: courseId || dummyCourseId,
          userId: user?.id || dummyUserId,
          subject,
          topic,
          questions: quizData,
        });

        console.log('Quiz saved successfully:', quiz);
        return NextResponse.json(quizData);
      } catch (dbError) {
        console.error('MongoDB Error:', dbError);
        throw new Error('Failed to save quiz to database');
      }

      return NextResponse.json(
        quizData.map(q => ({
          ...q,
          answers: Array.isArray(q.answers) ? q.answers : q.answers || undefined,
          correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : q.correct_answers || undefined,
        }))
      );
    } catch (error) {
      console.error('Error generating quiz:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate quiz',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[QUIZ_GENERATION]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
