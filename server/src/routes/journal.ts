import { Response, Router } from 'express';
import { Journal } from '../models/Journal.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const journal = new Journal({
      ...req.body,
      userId: req.user!.userId,
    });
    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create journal entry', error });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, tag } = req.query;
    const query: Record<string, unknown> = { userId: req.user!.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, string>).$gte = startDate as string;
      if (endDate) (query.date as Record<string, string>).$lte = endDate as string;
    }
    if (tag) query.tags = tag;

    const journals = await Journal.find(query).sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch journal entries', error });
  }
});

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const match: Record<string, unknown> = { userId: req.user!.userId };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) (match.date as Record<string, string>).$gte = startDate as string;
      if (endDate) (match.date as Record<string, string>).$lte = endDate as string;
    }

    const totalEntries = await Journal.countDocuments(match);
    const moodAvg = await Journal.aggregate([
      { $match: { ...match, mood: { $exists: true } } },
      { $group: { _id: null, avgMood: { $avg: '$mood' } } },
    ]);
    const tags = await Journal.distinct('tags', match);

    res.json({
      totalEntries,
      avgMood: moodAvg[0]?.avgMood ? Math.round(moodAvg[0].avgMood * 10) / 10 : null,
      uniqueTags: tags.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch journal stats', error });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch journal entry', error });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json(journal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update journal entry', error });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete journal entry', error });
  }
});

export default router;