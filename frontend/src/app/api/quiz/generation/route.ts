import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { shuffle } from 'lodash';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const MODEL = GEN_AI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  const { subject, topic, numQuestions, formats } = await req.json();

  const distributeQuestions = (numQuestions: number, formats: string[]): Record<string, number> => {
    const distribution: Record<string, number> = {
      'multiple choice': 0,
      'true false': 0,
      'short answer': 0,
      'fill in the blank': 0,
      matching: 0,
      'select all': 0,
    };

    const baseNum = Math.floor(numQuestions / formats.length);
    let remaining = numQuestions - baseNum * formats.length;

    formats.forEach(format => {
      distribution[format] = baseNum;
    });
    while (remaining > 0) {
      // Find formats with minimum count
      const minCount = Math.min(...formats.map(f => distribution[f]));
      const formatsWithMinCount = formats.filter(f => distribution[f] === minCount);

      // Randomly select from formats with minimum count
      const randomFormat = formatsWithMinCount[Math.floor(Math.random() * formatsWithMinCount.length)];
      distribution[randomFormat]++;
      remaining--;
    }

    return distribution;
  };

  const questionDistribution = distributeQuestions(numQuestions, formats);
  console.log(questionDistribution);

  const formatSpecificPrompts = {
    'multiple choice': `Generate exactly ${questionDistribution['multiple choice']} multiple choice question(s) about ${topic} in ${subject}. For each question:
- Make the question clear and specific
- Provide exactly 4 answer choices labeled A-D
- Include only one correct answer
- Make incorrect choices plausible but clearly wrong
- Avoid "all/none of the above"
Format as JSON: {"question": "What is X?", "answers": ["answer1", "answer2", "answer3", "answer4"], "correct_answer": "answer1", "format": "multiple choice"}. Return ONLY the JSON array.`,

    'true false': `Generate exactly ${questionDistribution['true false']} true/false question(s) about ${topic} in ${subject}. For each question:
- Make statements clear and unambiguous 
- Avoid double negatives
- Focus on important concepts
- Mix true and false statements evenly
Format as JSON: {"question": "Statement", "correct_answer": "True", "format": "true false"}. Return ONLY the JSON array.`,

    'short answer': `Generate exactly ${questionDistribution['short answer']} short answer question(s) about ${topic} in ${subject}. For each question:
- question(s) should have a single specific answer
- Answer should be 1-3 words maximum
- Focus on key terms, names, or concepts
- Avoid question(s) with multiple possible answers
Format as JSON: {"question": "What is X?", "correct_answer": "Answer", "format": "short answer"}. Return ONLY the JSON array.`,

    'fill in the blank': `Generate exactly ${questionDistribution['fill in the blank']} fill-in-the-blank question(s) about ${topic} in ${subject}. For each question:
- Use ONE underscore _ to indicate the blank
- Keep sentences under 15 words
- Blank should test a key concept
- Answer should be 1-2 words maximum
Format as JSON: {"question": "The _ is important.", "correct_answer": ["Answer"], "format": "fill in the blank"}. Return ONLY the JSON array.`,

    matching: `Generate exactly ${questionDistribution['matching']} matching sets about ${topic} in ${subject}. For each set:
- Create 4-6 pairs of related terms and descriptions
- Terms should be concise (1-3 words)
- Descriptions should be clear and specific
- All items should be related to the same concept
Format as JSON: {"question": "Match terms to descriptions", "answers": {"terms": ["Term1", "Term2"], "descriptions": ["Desc1", "Desc2"]}, "correct_answers": {"Term1": "Desc1", "Term2": "Desc2"}, "format": "matching"}. Return ONLY the JSON array.`,

    'select all': `Generate exactly ${questionDistribution['select all']} select-all question(s) about ${topic} in ${subject}. For each question:
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
    .filter(format => questionDistribution[format] > 0)
    .map((format: string) => formatSpecificPrompts[format as keyof typeof formatSpecificPrompts]);

  try {
    const responses = await Promise.all(
      selectedFormatPrompts.map(async (prompt: string) => {
        console.log(prompt + '\n');
        const completion = await MODEL.generateContent(prompt);
        const cleanedResponse = completion.response.text().replace(/```json|```/g, '');
        const parsedResponse = JSON.parse(cleanedResponse);
        const questions = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

        const format = Object.keys(questionDistribution).find(f =>
          prompt.includes(f)
        ) as keyof typeof questionDistribution;

        if (questions.length !== questionDistribution[format]) {
          console.warn(
            `Expected ${questionDistribution[format]} question(s) for ${format}, but got ${questions.length}`
          );
        }

        return questions;
      })
    );

    const quizData = shuffle(responses.flat());

    quizData.forEach((question: any, index: number) => {
      console.log(`Question ${index + 1}:`);
      console.log('Question:', question.question);
      console.log('Format:', question.format);
      console.log('Answers:', question.answers);
      console.log('Correct Answers:', question.correct_answer || question.correct_answers);
      console.log('---');
    });

    if (quizData.length !== numQuestions) {
      throw new Error(`Expected ${numQuestions} questions, but received ${quizData.length}`);
    }

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
