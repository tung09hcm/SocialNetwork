import Notification from "../models/notification.model.js";
import multer from "multer";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from '@supabase/supabase-js';
import fs from "fs";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
export const createPostWithFile = async (req, res) => {
	try {
		const { text } = req.body;
		let { tagType} = req.body;
		let { tagQuantity} = req.body;
		if (!req.file) {
			return res.status(400).send('No file uploaded.')
		}
		let file = req.file;	
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!text && !file) {
			return res.status(400).json({ error: "Post must have text or file" });
		}
		const supabaseUrl = process.env.SUPABASE_URL; // URL của Supabase  
		const supabaseKey = process.env.SUPABASE_ANON_KEY;
		; // Khóa API của Supabase
		const supabase = createClient(supabaseUrl, supabaseKey)
		
		const fileExtension = req.file.originalname.split('.').pop();
		const uniqueFileName = Date.now() + '-' + uuidv4() + '.' + fileExtension;

		const localFilePath = req.file.path;
		const supabaseFilePath = 'uploads/' + uniqueFileName;
		const fileBuffer = fs.readFileSync(localFilePath)
		const { data, error } = await supabase
			.storage
			.from('uploads') 
			.upload(supabaseFilePath, fileBuffer, {
				contentType: req.file.mimetype,
				upsert: true 
		})

		if (error) {
		console.error('Upload to Supabase failed:', error.message)
		return res.status(500).send('Failed to upload to Supabase.')
		}
		console.log('Upload to Supabase successful:', data);
		// Optional: Sau upload có thể xóa file local
		fs.unlinkSync(localFilePath)

		// https://hsymtqtmibipgkdaawfs.supabase.co/storage/v1/object/public/${data.fullPath}
		if (tagType === "limited"){
			const newPost = new Post({
				user: userId,
				text,
				file: `https://hsymtqtmibipgkdaawfs.supabase.co/storage/v1/object/public/${data.fullPath}`,
				quantity: tagQuantity,
			});

			await newPost.save();
			res.status(201).json(newPost);
		}
		else{
			const newPost = new Post({
				user: userId,
				text,
				file: `https://hsymtqtmibipgkdaawfs.supabase.co/storage/v1/object/public/${data.fullPath}`,
			});

			await newPost.save();
			res.status(201).json(newPost);
		}
		

		
	} catch (error) {
		console.error("Error in createPost controller:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		let { tagType} = req.body;
		let { tagQuantity} = req.body;
		console.log("tagType", tagType);
		console.log("tagQuantity", tagQuantity);
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}
		if (tagType === "limited"){
			const newPost = new Post({
				user: userId,
				text,
				img,
				quantity: tagQuantity,
			});
			console.log("newPost", newPost);
			await newPost.save();
			res.status(201).json(newPost);
		}
		else{
			const newPost = new Post({
				user: userId,
				text,
				img,
			});
			console.log("newPost", newPost);
			await newPost.save();
			res.status(201).json(newPost);
		}
		
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}
		console.log("posts", posts.length);
		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getSearchPosts = async (req,res) =>{
	
	try{
		const {search} = req.params;
		console.log("searchContent", search);
		const posts = await Post.find({
			text: { $regex: search, $options: "i" }
		}).populate({
			path: "user",
			select: "-password",
		})
		.populate({
			path: "comments.user",
			select: "-password",
		});
		res.status(200).json(posts);
	}catch(e)
	{
		console.log("Error in getSearchPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const getSavedPosts = async (req, res) => {
	console.log("getSavedPost")
	const { username } = req.params;
	
	try {
		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(savedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const saveUnsavePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userSavedPost = post.saved.includes(userId);

		if (userSavedPost) {
			// Unsave post
			await Post.updateOne({ _id: postId }, { $pull: { saved: userId } });
			await User.updateOne({ _id: userId }, { $pull: { savedPosts: postId } });

			const updatedSave = post.saved.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedSave);
		} else {
			// Save post
			post.saved.push(userId);
			await User.updateOne({ _id: userId }, { $push: { savedPosts: postId } });
			await post.save();

			const updatedSave = post.saved;
			res.status(200).json(updatedSave);
		}
	} catch (error) {
		console.log("Error in saveUnsavePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const reduceQuantity = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		post.quantity = post.quantity - 1;
		if (post.quantity <= 0) {
			post.quantity = 0;
		}
		await post.save();
		res.status(200).json(post);
	} catch (error) {
		console.log("Error in reduceQuantity controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const increaseQuantity = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		post.quantity = post.quantity + 1;
		if (post.quantity <= 0) {
			post.quantity = 0;
		}
		await post.save();
		res.status(200).json(post);
	} catch (error) {
		console.log("Error in increaseQuantity controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};