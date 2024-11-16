import mongoose, { Document, Model } from 'mongoose';

export interface IFlashcard {
  front: string;
  back: string;
}

export interface IFlashcardSet {
  title: string;
  courseId: mongoose.Schema.Types.ObjectId;
  userId: string;
  flashcards: IFlashcard[];
}

export interface IFlashcardSetClean {
  _id: string;
  title: string;
  courseId: string;
  userId: string;
  flashcards: IFlashcard[];
  createdAt: string;
  updatedAt: string;
}

export interface IFlashcardSetLean extends IFlashcardSet {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlashcardSetDocument extends IFlashcardSet, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardSchema = new mongoose.Schema<IFlashcard>({
  front: {
    type: String,
    required: true,
    trim: true,
  },
  back: {
    type: String,
    required: true,
    trim: true,
  },
});

const flashcardSetSchema = new mongoose.Schema<IFlashcardSetDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    flashcards: {
      type: [flashcardSchema],
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FlashcardSet: Model<IFlashcardSetDocument> =
  mongoose.models?.FlashcardSets || mongoose.model('FlashcardSets', flashcardSetSchema);

export default FlashcardSet;
