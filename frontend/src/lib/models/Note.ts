import mongoose, { Document, Model } from 'mongoose';

export interface INote {
  title: string;
  courseId: mongoose.Schema.Types.ObjectId;
  content: string;
}

export interface INoteLean extends INote {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteDocument extends INote, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Note: Model<INoteDocument> = mongoose.models?.Notes || mongoose.model('Notes', noteSchema);

export default Note;
