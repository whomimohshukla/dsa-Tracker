const mongoose = require('mongoose');

// Sub-schemas using safe field names (avoid Mongoose's reserved 'type' keyword)
const YoutubeResourceSchema = new mongoose.Schema({
  title:   { type: String },
  url:     { type: String },
  channel: { type: String },
  duration:{ type: String },
}, { _id: false });

const DocResourceSchema = new mongoose.Schema({
  title:        { type: String },
  url:          { type: String },
  resourceType: { type: String, default: 'doc' },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  topicId: {
    type: String,
    required: true,
    index: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  topicEmoji: {
    type: String,
    default: '📝',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true,
  },
  pattern: {
    type: String,
    required: true,
  },
  companies: {
    type: [String],
    default: [],
    index: true,
  },
  lcLink: {
    type: String,
    default: '',
  },
  lcNumber: {
    type: String,
    default: '',
  },
  platform: {
    type: String,
    enum: ['LeetCode', 'GFG', 'SPOJ', 'CodeForces', 'Other'],
    default: 'LeetCode',
  },
  hint: {
    type: String,
    default: '',
  },
  approach: {
    type: String,
    default: '',
  },
  proTip: {
    type: String,
    default: '',
  },
  timeComplexity: {
    type: String,
    default: '',
  },
  spaceComplexity: {
    type: String,
    default: '',
  },
  orderIndex: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // ── AI / ML TRACK FIELDS ─────────────────────────────────────────
  track: {
    type: String,
    enum: ['dsa', 'ai'],
    default: 'dsa',
    index: true,
  },
  phase: { type: String, default: '' },
  phaseIndex: { type: Number, default: 0, index: true },
  tag: { type: String, default: '', index: true },
  description: { type: String, default: '' },
  estimatedTime: { type: String, default: '' },
  prerequisites: { type: [String], default: [] },
  practiceTasks: { type: [String], default: [] },
  youtubeResources: { type: [YoutubeResourceSchema], default: [] },
  docResources: { type: [DocResourceSchema], default: [] },
  isProject: { type: Boolean, default: false },
  problemStatement: { type: String, default: '' },
  techStack: { type: [String], default: [] },
  features: { type: [String], default: [] },
  expectedOutcome: { type: String, default: '' },

  // Legacy global flag. User-specific revision state is stored in Progress.
  revisionMarked: { type: Boolean, default: false },

}, {
  timestamps: true,
});

QuestionSchema.index({ topicId: 1, orderIndex: 1 });
QuestionSchema.index({ title: 'text', pattern: 'text', tags: 'text' });
QuestionSchema.index({ track: 1, phaseIndex: 1, tag: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
