// import { NextResponse } from 'next/server';
// import { currentUser } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/db';

// export async function GET(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
//   try {
//     const user = await currentUser();

//     if (!user || !user.id) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const { quizId } = params;

//     const questions = await prisma.quizQuestion.findMany({
//       where: {
//         quizId: quizId,
//       },
//       orderBy: {
//         order: 'asc',
//       },
//     });

//     return NextResponse.json(questions);
//   } catch (error) {
//     console.error('[QUIZ_QUESTIONS_GET]', error);
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }

// export async function POST(req: Request, { params }: { params: { courseId: string; quizId: string } }) {
//   try {
//     const user = await currentUser();

//     if (!user || !user.id) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const { quizId } = params;
//     const body = await req.json();

//     const question = await prisma.quizQuestion.create({
//       data: {
//         ...body,
//         quizId: quizId,
//       },
//     });

//     return NextResponse.json(question);
//   } catch (error) {
//     console.error('[QUIZ_QUESTIONS_POST]', error);
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }
