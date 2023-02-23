const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Category = require("../models/categoryModel");
const fs = require("fs");
const ApiError = require('../utils/apiError');
const resizeImageMiddleware = require("../middlewares/resizeImageMiddelware");

exports.getCategories = factory.getAll(Category);

exports.createCategory = factory.createOne(Category);

exports.uploadCategoryImage = uploadSingleImage('image');

exports.resizeImage = resizeImageMiddleware('categories', 'category', "image");

exports.getCategory = factory.getOne(Category);

exports.updateCategory = factory.updateOne(Category, "image");

exports.deleteCategory = factory.deleteOne(Category, true);