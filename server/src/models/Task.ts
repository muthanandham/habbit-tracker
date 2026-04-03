import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  dueDate?: Date;
  dueTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  tags: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  linkedHabits: mongoose.Types.ObjectId[];
  linkedJournal?: mongoose.Types.ObjectId;
  isMustDo: boolean;
  completedAt?: Date;
}

const subtaskSchema = new Schema<ITask['subtasks'][0]>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done', 'cancelled'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
    dueTime: {
      type: String,
      match: /^\d{2}:\d{2}$/,
    },
    estimatedDuration: {
      type: Number,
      min: 0,
    },
    actualDuration: {
      type: Number,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    linkedHabits: {
      type: [Schema.Types.ObjectId],
      ref: 'Habit',
      default: [],
    },
    linkedJournal: {
      type: Schema.Types.ObjectId,
      ref: 'Journal',
    },
    isMustDo: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
