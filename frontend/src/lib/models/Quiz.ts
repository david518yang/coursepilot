import mongoose, { Document, Model } from 'mongoose';

export type QuestionFormat =
  | 'multiple choice'
  | 'select all'
  | 'true false'
  | 'short answer'
  | 'fill in the blank'
  | 'matching';

export interface IQuizQuestion {
  question: string;
  answers?: string[] | string | { [term: string]: string };
  correctAnswer?: string[] | string | { [term: string]: string };
  correctAnswers?: string[] | string | { [term: string]: string };
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

export interface IQuizLean extends IQuiz {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizDocument extends IQuiz, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new mongoose.Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      required: true,
      enum: ['multiple choice', 'select all', 'true false', 'short answer', 'fill in the blank', 'matching'],
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    correctAnswers: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema<IQuizDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Quiz: Model<IQuizDocument> = mongoose.models?.Quizzes || mongoose.model('Quizzes', quizSchema);

export default Quiz;
