const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

// GET /api/questions/topics?track=dsa|ai
router.get('/topics', async (req, res) => {
  try {
    const { track = 'dsa' } = req.query;
    const matchFilter = { isActive: true, track };

    const topics = await Question.aggregate([
      { $match: matchFilter },
      { $sort: { phaseIndex: 1, orderIndex: 1 } },
      { $group: {
        _id: '$topicId',
        name: { $first: '$topicName' },
        emoji: { $first: '$topicEmoji' },
        phase: { $first: '$phase' },
        phaseIndex: { $first: '$phaseIndex' },
        tag: { $first: '$tag' },
        questions: { $push: '$$ROOT' },
        count: { $sum: 1 },
        easyCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
        mediumCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
        hardCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } },
        projectCount: { $sum: { $cond: ['$isProject', 1, 0] } },
      }},
      { $sort: { phaseIndex: 1, _id: 1 } },
    ]);
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions/phases?track=ai  — phase summary
router.get('/phases', async (req, res) => {
  try {
    const { track = 'ai' } = req.query;
    const phases = await Question.aggregate([
      { $match: { isActive: true, track } },
      { $group: {
        _id: '$phaseIndex',
        phase: { $first: '$phase' },
        count: { $sum: 1 },
        topics: { $addToSet: '$topicId' },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, phases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/questions — list with filters
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, platform, search, track, tag, isProject, page = 1, limit = 500 } = req.query;
    const filter = { isActive: true };
    if (topic)      filter.topicId    = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (platform)   filter.platform   = platform;
    if (track)      filter.track      = track;
    if (tag)        filter.tag        = tag;
    if (isProject)  filter.isProject  = isProject === 'true';
    if (search)     filter.$text = { $search: search };

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ phaseIndex: 1, topicId: 1, orderIndex: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, count: questions.length, questions });
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

// POST /api/questions
router.post('/', async (req, res) => {
  try {
    const q = await Question.create(req.body);
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/questions/:id
router.patch('/:id', async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;