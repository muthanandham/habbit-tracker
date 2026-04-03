import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { Task } from '../models/Task.js';
import { Wellness } from '../models/Wellness.js';
import { Journal } from '../models/Journal.js';
import { Logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const seedData = async () => {
  try {
    Logger.info('🚀 Starting seed process...');
    
    // Clear old data
    Logger.info('🧹 Clearing old data...');
    await User.deleteMany({});
    await Habit.deleteMany({});
    await Task.deleteMany({});
    await Wellness.deleteMany({});
    await Journal.deleteMany({});

    // Create test user
    Logger.info('👤 Creating test user: Aiden Thorne...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      username: 'athorne',
      email: 'aiden@lifeos.com',
      password: hashedPassword,
      firstName: 'Aiden',
      lastName: 'Thorne',
    });

    const userId = user._id;

    // Create habits
    Logger.info('✨ Creating habits...');
    const habits = [
      {
        userId,
        name: 'Morning Meditation',
        description: '10 minutes of mindfulness',
        category: 'mindfulness',
        frequency: 'daily',
        reminder: '07:00',
        streak: 5,
        target: 1,
        isCompletedToday: true,
      },
      {
        userId,
        name: 'Read 20 Pages',
        description: 'Non-fiction reading',
        category: 'learning',
        frequency: 'daily',
        streak: 12,
        target: 1,
        isCompletedToday: false,
      }
    ];
    await Habit.insertMany(habits);

    // Create tasks
    Logger.info('📝 Creating tasks... ');
    const tasks = [
      {
        userId,
        title: 'Complete Integrated Life-OS Backend',
        description: 'Wire all modules to real DB',
        priority: 'high',
        status: 'in_progress',
        isMustDo: true,
        dueDate: new Date(),
      },
      {
        userId,
        title: 'Draft Persistence Strategy',
        priority: 'medium',
        status: 'done',
        dueDate: new Date(),
      }
    ];
    await Task.insertMany(tasks);

    // Create wellness entry
    Logger.info('🧘 Creating wellness entry...');
    await Wellness.create({
      userId,
      date: new Date().toISOString().split('T')[0],
      mood: {
        score: 8,
        emotions: ['Focused', 'Productive'],
      },
      sleep: {
        duration: 7.5,
        quality: 8,
      },
      energy: {
        morning: 9,
      },
      nutrition: {
        waterIntake: 2000,
        meals: [],
      },
      notes: 'Feeling productive after the backend refactor.',
    });

    // Create journal entry
    Logger.info('📓 Creating journal entry...');
    await Journal.create({
      userId,
      date: new Date().toISOString().split('T')[0],
      title: 'The Great Integration',
      content: 'Today I finally connected the frontend to a real MongoDB. The persistence feels solid.',
      mood: 9,
      tags: ['milestone', 'coding'],
    });

    Logger.info('✅ Seeding completed successfully!');
  } catch (error) {
    Logger.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  });
}
