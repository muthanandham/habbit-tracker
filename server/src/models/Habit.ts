import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: 'health' | 'fitness' | 'mindfulness' | 'productivity' | 'learning' | 'social' | 'creative' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: number[];
  targetCount: number;
  unit?: string;
  reminder: {
    enabled: boolean;
    time?: string;
  };
  streak: {
    current: number;
    best: number;
    lastCompletedDate?: Date;
  };
  color?: string;
  icon?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['health', 'fitness', 'mindfulness', 'productivity', 'learning', 'social', 'creative', 'other'],
      default: 'other',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    targetDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    targetCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    unit: {
      type: String,
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      time: {
        type: String,
        match: /^\d{2}:\d{2}$/,
      },
    },
    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },
      best: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastCompletedDate: {
        type: Date,
      },
    },
    color: {
      type: String,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    icon: {
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ userId: 1, archived: 1 });

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
