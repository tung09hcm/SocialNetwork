import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { uploadCloud } from "../config/uploadCloud.js";

import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
	getSearchPosts,
	getSavedPosts,
	saveUnsavePost,
	createPostWithFile,
	reduceQuantity,
	increaseQuantity
} from "../controllers/post.controller.js";

const router = express.Router();
router.post("/createFile", protectRoute, uploadCloud.single("file"), createPostWithFile);
router.get("/all", protectRoute, getAllPosts);
router.post("/save/:id", protectRoute, saveUnsavePost);
router.post("/reduce/:id", protectRoute, reduceQuantity);
router.post("/increase/:id", protectRoute, increaseQuantity);
router.get("/saved/:username", protectRoute, getSavedPosts);
router.get("/search/:search", protectRoute, getSearchPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
