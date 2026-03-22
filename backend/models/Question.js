const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		topicId: { type: String, required: true, index: true },
		topicName: { type: String, required: true },
		topicEmoji: { type: String, default: "📝" },
		track: { type: String, enum: ["dsa", "ai"], default: "dsa", index: true },
		phase: { type: String, default: "" },
		phaseIndex: { type: Number, default: 0 },
		tag: {
			type: String,
			enum: ["core", "ml", "dl", "genai", "deploy", "project", ""],
			default: "",
		},
		youtubeResources: {
			type: [
				{ title: String, url: String, channel: String, duration: String },
			],
			default: [],
		},
		difficulty: {
			type: String,
			enum: [
				"Easy",
				"Medium",
				"Hard",
				"Beginner",
				"Intermediate",
				"Advanced",
			],
			required: true,
			index: true,
		},
		pattern: { type: String, required: true },
		companies: { type: [String], default: [], index: true },
		lcLink: { type: String, default: "" },
		lcNumber: { type: String, default: "" },
		platform: {
			type: String,
			enum: [
				"LeetCode",
				"GFG",
				"SPOJ",
				"CodeForces",
				"Other",
				"Course",
				"Resource",
			],
			default: "LeetCode",
		},
		hint: { type: String, default: "" },
		approach: { type: String, default: "" },
		proTip: { type: String, default: "" },
		timeComplexity: { type: String, default: "" },
		spaceComplexity: { type: String, default: "" },
		orderIndex: { type: Number, default: 0 },
		tags: { type: [String], default: [] },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

QuestionSchema.index({ topicId: 1, orderIndex: 1 });
QuestionSchema.index({ track: 1, topicId: 1 });
QuestionSchema.index({ title: "text", pattern: "text", tags: "text" });

module.exports = mongoose.model("Question", QuestionSchema);
