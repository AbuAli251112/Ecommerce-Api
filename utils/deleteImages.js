const fs = require("fs");
const util = require("util");

exports.deleteImage = async (image) => {
	return util.promisify(fs.unlink)(`${image}`);
};

exports.deleteArrayOfImages = async (images) => {
	images.forEach((image) => {
		return util.promisify(fs.unlink)(`${image}`);
	});
};