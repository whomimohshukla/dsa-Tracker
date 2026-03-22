const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

// GET /api/questions — all questions (with filters)
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, platform, search, track, page = 1, limit = 1000 } = req.query;
    const filter = { isActive: true };
    if (topic) filter.topicId = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;
    if (track) filter.track = track;
    if (search) filter.$text = { $search: search };

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ track: 1, phaseIndex: 1, topicId: 1, orderIndex: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions/topics — grouped by topic (supports ?track=dsa|ai)
router.get('/topics', async (req, res) => {
  try {
    const match = { isActive: true };
    if (req.query.track) match.track = req.query.track;
    const topics = await Question.aggregate([
      { $match: match },
      { $sort: { phaseIndex: 1, orderIndex: 1 } },
      { $group: {
        _id: '$topicId',
        name: { $first: '$topicName' },
        emoji: { $first: '$topicEmoji' },
        track: { $first: '$track' },
        phase: { $first: '$phase' },
        phaseIndex: { $first: '$phaseIndex' },
        questions: { $push: '$$ROOT' },
        count: { $sum: 1 },
        easyCount: { $sum: { $cond: [{ $in: ['$difficulty', ['Easy','Beginner']] }, 1, 0] } },
        mediumCount: { $sum: { $cond: [{ $in: ['$difficulty', ['Medium','Intermediate']] }, 1, 0] } },
        hardCount: { $sum: { $cond: [{ $in: ['$difficulty', ['Hard','Advanced']] }, 1, 0] } },
      }},
      { $sort: { phaseIndex: 1, _id: 1 } },
    ]);
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const q = await Question.create(req.body);
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
