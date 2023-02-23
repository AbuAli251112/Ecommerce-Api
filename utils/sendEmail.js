const nodemailer = require('nodemailer');

const sendMail = async (options) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
	  		pass: process.env.EMAIL_PASSWORD,
		},
	});
	// const transporter = nodemailer.createTransport({
	// 	host: process.env.EMAIL_HOST,
	// 	port: process.env.EMAIL_PORT,
	// 	secure: true,
	// 	auth: {
	// 		user: process.env.EMAIL_USER,
    //   		pass: process.env.EMAIL_PASSWORD,
	// 	},
	// });
	const maitOpts = {
		from: 'E-shop App <abualininja@gmail.com>',
	    to: options.email,
	    subject: options.subject,
	    text: options.message,
	};
	await transporter.sendMail(maitOpts);
};

module.exports = sendMail;


/////////////////////////////////////////

// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'hello@example.com',
//     pass: 'generated password'
//   }
// });

// const mailOptions = {
//   from: 'hello@example.com',
//   to: 'reciever@gmail.com',
//   subject: 'Subject',
//   text: 'Email content'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//  console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//     // do something useful
//   }
// });