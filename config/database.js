const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const dbConnection = () => {
	mongoose.set("strictQuery", false);
	mongoose.connect(process.env.DB_URI, {
		useNewUrlParser: true,
	}).then((conn) => {
		console.log(`Database Connected: ${conn.connection.host}`);
	});
};

module.exports = dbConnection;