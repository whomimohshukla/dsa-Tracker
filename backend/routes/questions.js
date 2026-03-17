const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

// GET /api/questions — all questions (with filters)
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, platform, search, page = 1, limit = 500 } = req.query;
    const filter = { isActive: true };

    if (topic) filter.topicId = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;
    if (search) filter.$text = { $search: search };

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ topicId: 1, orderIndex: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions/topics — grouped by topic
router.get('/topics', async (req, res) => {
  try {
    const topics = await Question.aggregate([
      { $match: { isActive: true } },
      { $sort: { orderIndex: 1 } },
      { $group: {
        _id: '$topicId',
        name: { $first: '$topicName' },
        emoji: { $first: '$topicEmoji' },
        questions: { $push: '$$ROOT' },
        count: { $sum: 1 },
        easyCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
        mediumCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
        hardCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
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

// POST /api/questions — add question (admin)
router.post('/', async (req, res) => {
  try {
    const q = await Question.create(req.body);
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/questions/:id — update
router.patch('/:id', async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/questions/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
