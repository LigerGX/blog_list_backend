/* eslint-disable consistent-return */
/* eslint-disable no-unneeded-ternary */
const userRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

userRouter.get('/', async (req, res, next) => {
	try {
		const users = await User.find({}).populate('blogs');

		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
});

userRouter.get('/:id', async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id).populate('blogs');

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
});

userRouter.post('/', async (req, res, next) => {
	try {
		const { username, password, name } = req.body;

		const checkUniqueUsername = async () => {
			const user = await User.findOne({ username });
			return user ? false : true;
		};

		const usernameIsUnique = await checkUniqueUsername();

		if (password.length < 3) {
			return res
				.status(400)
				.json({ error: 'password must be at least 4 characters long' });
		}
		if (!usernameIsUnique) {
			return res.status(400).json({ error: 'this username already exists' });
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const user = new User({
			username,
			password: hashedPassword,
			name,
		});

		const savedUser = await user.save();
		res.status(201).json(savedUser);
	} catch (error) {
		next(error);
	}
});

module.exports = userRouter;
