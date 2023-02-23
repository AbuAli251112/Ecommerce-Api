const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const { deleteImage , deleteArrayOfImages }  = require("../utils/deleteImages");

exports.getAll = (Model, modelName = "") => asyncHandler(async(req, res) => {
	let filter = {};
	if (req.filterObj) {
		filter = req.filterObj;
	}
	const documentsCounts = await Model.countDocuments();
	const categories = Model.find(filter);
	const apiFeatures = new ApiFeatures(categories, req.query).paginate(documentsCounts).filter().search(modelName).limitFields().sort();
	const { mongooseQuery, paginationResult } = apiFeatures;
	const documents = await mongooseQuery;
	res.status(200).json({ results: documents.length, paginationResult, data: documents})
});

exports.createOne = (Model) => asyncHandler(async (req, res) => {
	const newDoc = await Model.create(req.body);
	res.status(201).json({ data: newDoc });
});

exports.getOne = (Model, populationOpt) => asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	let query = Model.findById(id);
	if (populationOpt) {
		query = query.populate(populationOpt);
	}
	const document = await query;
	if (!document) {
		return next(new ApiError(`No document for this id ${id}`, 404));
	}
	res.status(200).json({ data: document });
});

exports.updateOne = (Model, dltImage = "", isProduct = false) => asyncHandler(async (req, res, next) => {
	const document = await Model.findById(req.params.id);
	if (!document) {
		return next(new ApiError(`No document for this id ${req.params.id}`, 404));
	}
	if (isProduct) {
		if (req.body[dltImage]) {
			await deleteImage(document[dltImage]);
		}
		if (req.body.images) {
			await deleteArrayOfImages(document.images);
		}
	} else if (req.body[dltImage]) {
		await deleteImage(document[dltImage]);
	}
	for (const prop in req.body) {
		document[prop] = req.body[prop];
	}
	document.save();
	res.status(200).json({ data: document });
});

exports.deleteOne = (Model, dltImage = false, fieldName = "image", isProduct = false) => asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const document = await Model.findByIdAndDelete(id);
	if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    if (isProduct) {
    	await deleteImage(document.imageCover);
    	console.log(document.images);
    	await deleteArrayOfImages(document.images);
    } else if (dltImage) {
    	await deleteImage(document[fieldName]);
    }
    document.remove();
    res.status(204).send();
});