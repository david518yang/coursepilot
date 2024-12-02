import mongoose, { Document, Model } from 'mongoose';

export type QuestionFormat = 'multiple choice' | 'select all' | 'true false' | 'short answer' | 'fill in the blank' | 'matching';

export interface IQuizQuestion {
  question: string;
  answers?: string[] | string | { [term: string]: string };
  correct_answers?: string[] | string | { [term: string]: string };
  format: QuestionFormat;
}

export interface IQuiz {
  title: string;
  courseId: mongoose.Schema.Types.ObjectId;
  userId: string;
  subject: string;
  topic: string;
  questions: IQuizQuestion[];
}

export interface IQuizClean {
  _id: string;
  title: string;
  courseId: string;
  userId: string;
  subject: string;
  topic: string;
  questions: IQuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface IQuizDocument extends IQuiz, Document {
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new mongoose.Schema<IQuizQuestion>({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  correct_answers: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  format: {
    type: String,
    required: true,
    enum: ['multiple choice', 'select all', 'true false', 'short answer', 'fill in the blank', 'matching'],
  },
});

const quizSchema = new mongoose.Schema<IQuizDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    userId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    questions: [quizQuestionSchema],
  },
  {
    timestamps: true,
  }
);

const Quiz: Model<IQuizDocument> = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
