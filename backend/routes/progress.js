const express = require("express");
const { Progress, User } = require("../models/UserProgress");
const Question = require("../models/Question");
const auth = require("../middleware/auth");
const router = express.Router();

// All progress routes require auth
router.use(auth);

// GET /api/progress — get all progress for current user
router.get("/", async (req, res) => {
	try {
		const progress = await Progress.find({ userId: req.user._id })
			.populate("questionId", "title difficulty topicId topicName")
			.sort({ solvedAt: -1 })
			.lean();

		// Also return as a flat map: questionId -> status for fast frontend lookup
		const progressMap = {};
		progress.forEach((p) => {
			progressMap[p.questionId._id.toString()] = {
				status: p.status,
				solvedAt: p.solvedAt,
				notes: p.notes,
				rating: p.rating,
				revisionMarked: !!p.revisionMarked,
				revisionMarkedAt: p.revisionMarkedAt,
			};
		});

		res.json({
			success: true,
			count: progress.length,
			progress,
			progressMap,
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// GET /api/progress/stats — detailed stats
router.get("/stats", async (req, res) => {
	try {
		const userId = req.user._id;

		const [total, byDifficulty, byTopic, recentActivity] = await Promise.all([
			Progress.countDocuments({ userId, status: "solved" }),
			Progress.aggregate([
				{ $match: { userId, status: "solved" } },
				{
					$lookup: {
						from: "questions",
						localField: "questionId",
						foreignField: "_id",
						as: "q",
					},
				},
				{ $unwind: "$q" },
				{ $group: { _id: "$q.difficulty", count: { $sum: 1 } } },
			]),
			Progress.aggregate([
				{ $match: { userId, status: "solved" } },
				{ $group: { _id: "$topicId", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
			]),
			Progress.find({ userId, status: "solved" })
				.sort({ solvedAt: -1 })
				.limit(10)
				.populate("questionId", "title difficulty topicName")
				.lean(),
		]);

		const totalQuestions = await Question.countDocuments({ isActive: true });

		res.json({
			success: true,
			stats: {
				totalSolved: total,
				totalQuestions,
				completionPct: totalQuestions
					? Math.round((total / totalQuestions) * 100)
					: 0,
				byDifficulty,
				byTopic,
				recentActivity,
				streak: req.user.streak,
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// POST /api/progress/toggle — mark/unmark a question
router.post("/toggle", async (req, res) => {
	try {
		const {
			questionId,
			status = "solved",
			notes = "",
			rating = null,
		} = req.body;
		if (!questionId)
			return res
				.status(400)
				.json({ success: false, message: "questionId required" });

		const question = await Question.findById(questionId);
		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		const existing = await Progress.findOne({
			userId: req.user._id,
			questionId,
		});

		let action, progress;

		if (existing && existing.status === "solved") {
			const hasExtraState =
				existing.revisionMarked ||
				existing.notes ||
				existing.rating !== null;

			if (hasExtraState) {
				existing.status = "attempted";
				existing.solvedAt = null;
				progress = await existing.save();
			} else {
				await Progress.deleteOne({ userId: req.user._id, questionId });
				progress = null;
			}

			action = "removed";
		} else if (existing) {
			existing.status = status;
			existing.solvedAt = new Date();
			if (notes) existing.notes = notes;
			if (rating !== null) existing.rating = rating;
			progress = await existing.save();
			action = "added";

			await updateStreak(req.user);
		} else {
			progress = await Progress.create({
				userId: req.user._id,
				questionId,
				topicId: question.topicId,
				status,
				notes,
				rating,
				solvedAt: new Date(),
			});
			action = "added";

			await updateStreak(req.user);
		}

		res.json({ success: true, action, progress });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// POST /api/progress/revision — toggle revision marker for a question
router.post("/revision", async (req, res) => {
	try {
		const { questionId } = req.body;
		if (!questionId)
			return res
				.status(400)
				.json({ success: false, message: "questionId required" });

		const question = await Question.findById(questionId);
		if (!question)
			return res
				.status(404)
				.json({ success: false, message: "Question not found" });

		const existing = await Progress.findOne({
			userId: req.user._id,
			questionId,
		});

		let action, progress;

		if (existing) {
			existing.revisionMarked = !existing.revisionMarked;
			existing.revisionMarkedAt = existing.revisionMarked
				? new Date()
				: null;

			if (
				existing.status !== "solved" &&
				!existing.revisionMarked &&
				!existing.notes &&
				existing.rating === null
			) {
				await Progress.deleteOne({ _id: existing._id });
				progress = null;
			} else {
				progress = await existing.save();
			}

			action = existing.revisionMarked ? "added" : "removed";
		} else {
			progress = await Progress.create({
				userId: req.user._id,
				questionId,
				topicId: question.topicId,
				status: "attempted",
				revisionMarked: true,
				revisionMarkedAt: new Date(),
			});
			action = "added";
		}

		res.json({ success: true, action, progress });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// PATCH /api/progress/:questionId — update notes/rating
router.patch("/:questionId", async (req, res) => {
	try {
		const progress = await Progress.findOneAndUpdate(
			{ userId: req.user._id, questionId: req.params.questionId },
			{ $set: req.body },
			{ new: true },
		);
		if (!progress)
			return res
				.status(404)
				.json({ success: false, message: "Progress entry not found" });
		res.json({ success: true, progress });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// DELETE /api/progress/reset — reset all progress
router.delete("/reset", async (req, res) => {
	try {
		await Progress.deleteMany({ userId: req.user._id });
		// Reset streak
		await User.findByIdAndUpdate(req.user._id, {
			"streak.current": 0,
			"streak.lastSolvedDate": null,
		});
		res.json({ success: true, message: "All progress reset" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// ── Helper: update streak ─────────────────────────────────────────────────────
async function updateStreak(user) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const lastDate = user.streak.lastSolvedDate
		? new Date(
				user.streak.lastSolvedDate.getFullYear(),
				user.streak.lastSolvedDate.getMonth(),
				user.streak.lastSolvedDate.getDate(),
			)
		: null;

	let newStreak = user.streak.current;

	if (!lastDate) {
		newStreak = 1;
	} else {
		const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
		if (diff === 1)
			newStreak += 1; // consecutive day
		else if (diff === 0)
			return; // same day, no change
		else newStreak = 1; // streak broken
	}

	await User.findByIdAndUpdate(user._id, {
		"streak.current": newStreak,
		"streak.longest": Math.max(newStreak, user.streak.longest),
		"streak.lastSolvedDate": today,
		lastActive: now,
	});
}

module.exports = router;
