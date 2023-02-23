const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");
const Product = require("../models/productModel");
const sharp = require("sharp");

exports.getProducts = factory.getAll(Product, 'Products');

exports.uploadProductImages = uploadMixOfImages([
	{
		name: 'imageCover',
		maxCount: 1,
	},
	{
		name: 'images',
		maxCount: 5,
	},
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
	if (req.files.imageCover) {
		const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
		await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 95 }).toFile(`uploads/products/covers/${imageCoverFileName}`);
		req.body.imageCover = `${process.env.UPLOAD_FOLDER}/products/covers/${imageCoverFileName}`;
	}
	if (req.files.images) {
		req.body.images = [];
		await Promise.all(
			req.files.images.map(async (img, index) => {
				const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
				await sharp(img.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 95 }).toFile(`uploads/products/images/${imageName}`);
				req.body.images.push(`${process.env.UPLOAD_FOLDER}/products/images/${imageName}`);
			})
		);
	}
	next();
});

exports.createProduct = factory.createOne(Product);

exports.getProduct = factory.getOne(Product);

exports.updateProduct = factory.updateOne(Product, 'imageCover', true);

exports.deleteProduct = factory.deleteOne(Product, true, true);