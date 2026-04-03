import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  title?: string;
  content: string;
  mood?: number;
  tags: string[];
  isPrivate: boolean;
  linkedHabits: mongoose.Types.ObjectId[];
  linkedTasks: mongoose.Types.ObjectId[];
  aiSummary?: string;
  aiInsights: string[];
}

const journalSchema = new Schema<IJournal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    mood: {
      type: Number,
      min: 1,
      max: 10,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    linkedHabits: {
      type: [Schema.Types.ObjectId],
      ref: 'Habit',
      default: [],
    },
    linkedTasks: {
      type: [Schema.Types.ObjectId],
      ref: 'Task',
      default: [],
    },
    aiSummary: {
      type: String,
      maxlength: 500,
    },
    aiInsights: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

journalSchema.index({ userId: 1, date: 1 });

export const Journal = mongoose.model<IJournal>('Journal', journalSchema);
