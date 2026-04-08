import { Router } from 'express';
import { Habit } from '../models/Habit.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { habitCreateSchema, habitUpdateSchema } from 'shared';
import { ZodError } from 'zod';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: (req as AuthRequest).user?.userId, archived: false })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

router.get('/archived', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: (req as AuthRequest).user?.userId, archived: true })
      .sort({ updatedAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch archived habits' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: (req as AuthRequest).user?.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = habitCreateSchema.parse(req.body);
    const habit = new Habit({
      ...validated,
      userId: (req as AuthRequest).user?.userId,
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(400).json({ error: 'Failed to create habit' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validated = habitUpdateSchema.parse(req.body);
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: (req as AuthRequest).user?.userId },
      validated,
      { new: true, runValidators: true }
    );
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(400).json({ error: 'Failed to update habit' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: (req as AuthRequest).user?.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

router.patch('/:id/archive', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: (req as AuthRequest).user?.userId },
      { archived: true },
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive habit' });
  }
});

router.patch('/:id/unarchive', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: (req as AuthRequest).user?.userId },
      { archived: false },
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unarchive habit' });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: (req as AuthRequest).user?.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastCompleted = habit.streak.lastCompletedDate 
      ? new Date(habit.streak.lastCompletedDate).toISOString().split('T')[0]
      : null;

    let newStreak = habit.streak.current;

    if (lastCompleted !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCompleted === yesterdayStr) {
        newStreak = habit.streak.current + 1;
      } else {
        newStreak = 1;
      }

      const bestStreak = Math.max(habit.streak.best, newStreak);

      habit.streak = {
        current: newStreak,
        best: bestStreak,
        lastCompletedDate: today,
      };
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

router.post('/:id/uncomplete', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: (req as AuthRequest).user?.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const lastCompleted = habit.streak.lastCompletedDate 
      ? new Date(habit.streak.lastCompletedDate).toISOString().split('T')[0]
      : null;

    if (lastCompleted === yesterdayStr || lastCompleted === new Date().toISOString().split('T')[0]) {
      habit.streak.current = Math.max(0, habit.streak.current - 1);
      await habit.save();
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to uncomplete habit' });
  }
});

export default router;