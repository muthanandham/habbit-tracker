import express, { Response, NextFunction } from 'express';
import { Wellness } from '../models/Wellness.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { wellnessCreateSchema, wellnessUpdateSchema } from 'shared';
import { ZodError } from 'zod';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fromDate, toDate } = req.query;
    const query: Record<string, unknown> = { userId: req.user?.userId };

    if (fromDate && toDate) {
      query.date = { $gte: fromDate as string, $lte: toDate as string };
    } else if (fromDate) {
      query.date = { $gte: fromDate as string };
    } else if (toDate) {
      query.date = { $lte: toDate as string };
    }

    const wellness = await Wellness.find(query).sort({ date: -1 });
    res.json(wellness);
  } catch (error) {
    next(error);
  }
});

router.get('/date/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wellness = await Wellness.findOne({
      userId: req.user?.userId,
      date: req.params.date,
    });
    res.json(wellness || null);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = wellnessCreateSchema.parse(req.body);
    const { date } = validated;
    const existing = await Wellness.findOne({
      userId: req.user?.userId,
      date,
    });

    if (existing) {
      const updated = await Wellness.findOneAndUpdate(
        { _id: existing._id },
        validated,
        { new: true, runValidators: true }
      );
      res.json(updated);
      return;
    }

    const wellness = new Wellness({ ...validated, userId: req.user?.userId });
    await wellness.save();
    res.status(201).json(wellness);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = wellnessUpdateSchema.parse(req.body);
    const wellness = await Wellness.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      validated,
      { new: true, runValidators: true }
    );
    if (!wellness) {
      res.status(404).json({ message: 'Wellness record not found' });
      return;
    }
    res.json(wellness);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

router.patch('/date/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = wellnessUpdateSchema.parse(req.body);
    const wellness = await Wellness.findOneAndUpdate(
      { userId: req.user?.userId, date: req.params.date },
      validated,
      { new: true, runValidators: true, upsert: true }
    );
    res.json(wellness);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wellness = await Wellness.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });
    if (!wellness) {
      res.status(404).json({ message: 'Wellness record not found' });
      return;
    }
    res.json({ message: 'Wellness record deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/stats/range', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fromDate, toDate } = req.query;
    const wellness = await Wellness.find({
      userId: req.user?.userId,
      date: { $gte: fromDate as string, $lte: toDate as string },
    });

    const stats = {
      avgMood: 0,
      avgEnergy: { morning: 0, afternoon: 0, evening: 0 },
      avgSleepDuration: 0,
      avgSleepQuality: 0,
      totalExerciseMinutes: 0,
      avgWaterIntake: 0,
      totalDays: wellness.length,
    };

    if (wellness.length > 0) {
      let moodSum = 0, sleepDurSum = 0, sleepQualSum = 0;
      let exMins = 0, waterSum = 0;
      let morningSum = 0, afternoonSum = 0, eveningSum = 0;
      let energyCount = 0;

      wellness.forEach((w) => {
        moodSum += w.mood.score;
        if (w.sleep.duration) sleepDurSum += w.sleep.duration;
        if (w.sleep.quality) sleepQualSum += w.sleep.quality;
        if (w.exercise.duration) exMins += w.exercise.duration;
        if (w.nutrition.waterIntake) waterSum += w.nutrition.waterIntake;

        if (w.energy.morning) {
          morningSum += w.energy.morning;
          energyCount++;
        }
        if (w.energy.afternoon) afternoonSum += w.energy.afternoon;
        if (w.energy.evening) eveningSum += w.energy.evening;
      });

      stats.avgMood = moodSum / wellness.length;
      stats.avgSleepDuration = sleepDurSum / wellness.length;
      stats.avgSleepQuality = sleepQualSum / wellness.length;
      stats.totalExerciseMinutes = exMins;
      stats.avgWaterIntake = waterSum / wellness.length;
      stats.avgEnergy = {
        morning: energyCount > 0 ? morningSum / energyCount : 0,
        afternoon: energyCount > 0 ? afternoonSum / energyCount : 0,
        evening: energyCount > 0 ? eveningSum / energyCount : 0,
      };
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;