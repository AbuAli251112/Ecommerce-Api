const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require('uuid');

const resizeImage = (folderName, imageName, fieldName) => asyncHandler(async (req, res, next) => {
	const filename = `${imageName}-${uuidv4()}-${Date.now()}.jpeg`;
	if (req.file) {
		await sharp(req.file.buffer).resize(600, 600).toFormat('jpeg').jpeg({ quality: 95 }).toFile(`uploads/${folderName}/${filename}`);
		req.body[fieldName] = `${process.env.UPLOAD_FOLDER}/${folderName}/${filename}`;
	}
	next();
});

const resizeImageMiddleware = (folderName, imageName, fieldName) => resizeImage(folderName, imageName, fieldName);

module.exports = resizeImageMiddleware;