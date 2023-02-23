const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const factory = require('./handlersFactory');
const bcrypt = require('bcryptjs');
const createToken = require('../utils/createToken');
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const resizeImageMiddleware = require("../middlewares/resizeImageMiddelware");

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
	req.params.id = req.user._id;
	next();
});

exports.getUser = factory.getOne(User);

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.user._id, {
		password: await bcrypt.hash(req.body.password, 12),
		passwordChangedAt: Date.now(),
	}, {
		new: true
	});
	const token = createToken(user._id);
	res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
	const updatedUser = await User.findByIdAndUpdate(req.user._id, {
		name: req.body.name,
      	email: req.body.email,
      	phone: req.body.phone,
	}, {
		new: true
	});
	res.status(200).json({ data: updatedUser });
});

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });
	res.status(204).json({ status: 'Success' });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
	const document = await User.findByIdAndUpdate(req.params.id, {
		password: await bcrypt.hash(req.body.password, 12),
		passwordChangedAt: Date.now(),
	}, {
		new: true
	});
	if (!document) {
    	return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  	}
  	res.status(200).json({ data: document });
});

exports.getUsers = factory.getAll(User);

exports.uploadUserImage = uploadSingleImage('profileImg');

exports.resizeImage = resizeImageMiddleware('users', 'user', 'profileImg');

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User, "profileImg");

exports.deleteUser = factory.deleteOne(User, true, "profileImg");