import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		img: {
			type: String,
		},
		file: {
			type: String,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		saved: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		quantity:{
			type: Number
		},
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
