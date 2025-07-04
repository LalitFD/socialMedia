import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

// GET /api/posts - Get all posts (feed)
export const getAllMyPosts = async (request, response, next) => {
    try {
        const userId = request.user._id;

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('author', 'name username profilePicture');

        return response.status(200).json({
            message: "All posts fetched successfully for logged-in user",
            posts
        });

    } catch (err) {
        console.error("Error fetching posts:", err);
        return response.status(500).json({ error: "Internal server error" });
    }
};


// GET /api/posts/:id - Get single post
export const getPost = async (request, response, next) => {
    try {
        const { id } = request.params;

        const post = await Post.findById(id)
            .populate('author', 'name username profilePicture')
            .populate('likes.user', 'name username')
            .populate('comments.user', 'name username');

        if (!post) {
            return response.status(404).json({ error: "Post not found" });
        }

        return response.status(200).json({ message: "Post fetched", post });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/posts - Create new post
export const createPost = async (request, response, next) => {
    try {
        if (!request.user || !request.user._id) {
            return response.status(401).json({ error: "Unauthorized - user not found" });
        }

        const userId = request.user._id;
        console.log("User ID:", userId);

        if (!request.file) {
            return response.status(400).json({ error: "Media file is required" });
        }

        const fileName = request.file.filename;

        const newPost = new Post({
            author: userId,
            media: { imageName: fileName },
            caption: request.body.caption || '',
            tags: request.body.tags || [],
            mentions: request.body.mentions || []
        });

        const savedPost = await newPost.save();

        return response.status(201).json({
            message: "Post created successfully",
            post: savedPost
        });

    } catch (err) {
        console.error("Error creating post:", err);
        return response.status(500).json({ error: "Internal server error" });
    }
};


// PUT /api/posts/:id - Update post
export const updatePost = async (request, response, next) => {
    try {
        const { id } = request.params;
        const { caption, tags, mentions } = request.body;
        const userId = request.user.id;

        const post = await Post.findOne({ _id: id, author: userId });

        if (!post) {
            return response.status(404).json({ error: "Post not found or unauthorized" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { caption, tags, mentions },
            { new: true }
        ).populate('author', 'name username profilePicture');

        return response.status(200).json({ message: "Post updated", post: updatedPost });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};

// DELETE /api/posts/:id - Delete post
export const deletePost = async (request, response, next) => {
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const post = await Post.findOneAndDelete({ _id: id, author: userId });

        if (!post) {
            return response.status(404).json({ error: "Post not found or unauthorized" });
        }

        return response.status(200).json({ message: "Post deleted" });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/posts/user/:id - Get user's posts
export const getUserPosts = async (request, response, next) => {
    try {
        const { id } = request.params;

        const posts = await Post.find({ author: id })
            .populate('author', 'name username profilePicture');

        return response.status(200).json({ message: "User posts fetched", posts });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};


// POST /api/posts/:id/like - Like/Unlike post
export const toggleLike = async (request, response, next) => {
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return response.status(404).json({ error: "Post not found" });
        }

        const isLiked = post.likes.some(like => like.user.toString() === userId);

        if (isLiked) {
            post.likes = post.likes.filter(like => like.user.toString() !== userId);
        } else {
            post.likes.push({ user: userId });
        }

        await post.save();

        return response.status(200).json({
            message: isLiked ? "Post unliked" : "Post liked",
            isLiked: !isLiked
        });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/posts/:id/comments - Add comment
export const addComment = async (request, response, next) => {
    try {
        const { id } = request.params;
        const { text } = request.body;
        const userId = request.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return response.status(404).json({ error: "Post not found" });
        }

        post.comments.push({ user: userId, text });
        await post.save();

        return response.status(201).json({ message: "Comment added" });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
    }
};