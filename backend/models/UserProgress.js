const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── User Schema ───────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastSolvedDate: { type: Date, default: null },
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    dailyGoal: { type: Number, default: 3 },
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Progress Schema ───────────────────────────────────────────────────────────
const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  topicId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['solved', 'attempted', 'bookmarked'],
    default: 'solved',
  },
  solvedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  timeTaken: {
    type: Number, // minutes
    default: null,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  revisionMarked: {
    type: Boolean,
    default: false,
  },
  revisionMarkedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

ProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, topicId: 1 });
ProgressSchema.index({ userId: 1, status: 1 });

const User = mongoose.model('User', UserSchema);
const Progress = mongoose.model('Progress', ProgressSchema);

module.exports = { User, Progress };
