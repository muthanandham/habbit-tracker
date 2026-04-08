import express, { Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { taskCreateSchema, taskUpdateSchema } from 'shared';
import { ZodError } from 'zod';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, date, fromDate, toDate } = req.query;
    const query: Record<string, unknown> = { userId: req.user?.userId };

    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (fromDate && toDate) {
      query.dueDate = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string),
      };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, priority: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = taskCreateSchema.parse(req.body);
    const task = new Task({ ...validated, userId: req.user?.userId });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = taskUpdateSchema.parse(req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      validated,
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
});

router.patch('/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, actualDuration } = req.body;
    const update: Record<string, unknown> = { status };

    if (status === 'done') {
      update.completedAt = new Date();
    } else {
      update.completedAt = null;
    }

    if (actualDuration !== undefined) {
      update.actualDuration = actualDuration;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/carryover', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fromDate, toDate } = req.body;

    const incompleteTasks = await Task.find({
      userId: req.user?.userId,
      status: { $in: ['todo', 'in_progress'] },
      dueDate: { $gte: new Date(fromDate), $lt: new Date(toDate) },
    });

    const carriedTasks = await Promise.all(
      incompleteTasks.map(async (task) => {
        const newTask = new Task({
          ...task.toObject(),
          _id: undefined,
          dueDate: new Date(toDate),
          status: 'todo',
          completedAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        });
        await newTask.save();
        return newTask;
      })
    );

    res.json({ carried: carriedTasks.length, tasks: carriedTasks });
  } catch (error) {
    next(error);
  }
});

export default router;