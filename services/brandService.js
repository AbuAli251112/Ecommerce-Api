const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const Brand = require('../models/brandModel');
const resizeImageMiddleware = require("../middlewares/resizeImageMiddelware");

exports.uploadBrandImage = uploadSingleImage('image');

exports.resizeImage = resizeImageMiddleware('brands', 'brand', "image");

exports.getBrands = factory.getAll(Brand);

exports.getBrand = factory.getOne(Brand);

exports.createBrand = factory.createOne(Brand);

exports.updateBrand = factory.updateOne(Brand, "image");

exports.deleteBrand = factory.deleteOne(Brand, true);