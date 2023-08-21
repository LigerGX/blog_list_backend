const jwt = require('jsonwebtoken');
const commentRouter = require('express').Router();
const Comment = require('../models/comment');

commentRouter.get('/', async (req, res, next) => {
	try {
		const comments = await Comment.find({}).populate('blog');
		res.json(comments);
	} catch (error) {
		next(error);
	}
});

commentRouter.post('/', async (req, res, next) => {
	// consider making a middleware for validating tokens since this is used
	// in multiple places
	const { token } = req;

	if (!token) {
		return res.status(401).json({ error: 'missing token' });
	}

	const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

	if (!decodedToken.id) {
		return res.status(401).json({ error: 'token invalid' });
	}

	try {
		console.log(req.body);
		const comment = new Comment({
			content: req.body.content,
			blog: req.params.id,
		});
		const newComment = await comment.save();
		res.status(201).json(newComment);
	} catch (error) {
		next(error);
	}
});

module.exports = commentRouter;
