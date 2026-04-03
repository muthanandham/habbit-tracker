import mongoose, { Document, Schema } from 'mongoose';

export interface IWellness extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  sleep: {
    bedtime?: string;
    wakeTime?: string;
    duration?: number;
    quality?: number;
  };
  mood: {
    score: number;
    emotions: string[];
    notes?: string;
  };
  energy: {
    morning?: number;
    afternoon?: number;
    evening?: number;
  };
  exercise: {
    type?: string;
    duration?: number;
    intensity?: 'low' | 'moderate' | 'high';
    caloriesBurned?: number;
  };
  nutrition: {
    waterIntake?: number;
    meals: {
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      time?: string;
      notes?: string;
    }[];
  };
  notes?: string;
}

const mealSchema = new Schema<IWellness['nutrition']['meals'][0]>(
  {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    time: {
      type: String,
      match: /^\d{2}:\d{2}$/,
    },
    notes: {
      type: String,
      maxlength: 200,
    },
  },
  { _id: false }
);

const wellnessSchema = new Schema<IWellness>(
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
    sleep: {
      type: {
        bedtime: {
          type: String,
          match: /^\d{2}:\d{2}$/,
        },
        wakeTime: {
          type: String,
          match: /^\d{2}:\d{2}$/,
        },
        duration: {
          type: Number,
          min: 0,
        },
        quality: {
          type: Number,
          min: 1,
          max: 10,
        },
      },
      default: {},
    },
    mood: {
      score: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      emotions: {
        type: [String],
        default: [],
      },
      notes: {
        type: String,
        maxlength: 500,
      },
    },
    energy: {
      type: {
        morning: {
          type: Number,
          min: 1,
          max: 10,
        },
        afternoon: {
          type: Number,
          min: 1,
          max: 10,
        },
        evening: {
          type: Number,
          min: 1,
          max: 10,
        },
      },
      default: {},
    },
    exercise: {
      type: {
        type: String,
      },
      duration: {
        type: Number,
        min: 0,
      },
      intensity: {
        type: String,
        enum: ['low', 'moderate', 'high'],
      },
      caloriesBurned: {
        type: Number,
        min: 0,
      },
      default: {},
    },
    nutrition: {
      waterIntake: {
        type: Number,
        min: 0,
      },
      meals: {
        type: [mealSchema],
        default: [],
      },
      default: {},
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

wellnessSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Wellness = mongoose.model<IWellness>('Wellness', wellnessSchema);
