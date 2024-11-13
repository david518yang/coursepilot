import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { INoteDocument } from '@/lib/models/Note';

const GEN_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const SCHEMA = {
  description: 'FlashcardSet',
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: 'Title of the flashcard set',
    },
    flashcards: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          front: {
            type: SchemaType.STRING,
            description: 'Front of the flashcard',
          },
          back: {
            type: SchemaType.STRING,
            description: 'Back of the flashcard',
          },
        },
        required: ['front', 'back'],
      },
    },
  },
};
const MODEL = GEN_AI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: SCHEMA,
  },
});
const PROMPT = `Generate flashcards for a set of notes. 
  If you cannot provide flashcards, still attempt to return flashcards.
  Keep the title under 15 characters. 
  The current note content is: `;

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  const noteContent = notes.map((note: INoteDocument) => note.content).join('\n');
  const flashcardSet = await MODEL.generateContent(`${PROMPT}${noteContent}`);
  return NextResponse.json(flashcardSet.response.text());
}
