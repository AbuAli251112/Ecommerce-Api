const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
dotenv.config({ path: 'config.env '});

dbConnection();

const app = express();

app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(compression());

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(mongoSanitize());										// Sanitize Againt NoSQL Query Injection (MongoDB) ($ And .) 
app.use(xss());							                // Sanitize Againt Cross Site Scripting Attack 

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	console.log(`mode: ${process.env.NODE_ENV}`);
}

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: `Too many accounts created from this IP, please try again after an hour`
});

app.use('/api', limiter);

app.use(hpp({ whitelist: ['price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'] }));

mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
	console.log(`App running running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
	console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
	server.close(() => {
		console.error(`Shutting down....`);
    	process.exit(1);
	});
});