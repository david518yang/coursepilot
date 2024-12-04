import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { quizId } = params;

    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizId: quizId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[QUIZ_QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { quizId } = params;
    const body = await req.json();

    const question = await prisma.quizQuestion.create({
      data: {
        ...body,
        quizId: quizId,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUIZ_QUESTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
