const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mailer = require("../util/mailer");
const apiResponse = require("../util/apiResponse");
const randomOTP = require("../util/randomNumber");
const { validateSignupData, 
		validateLoginData, 
		validateOTPData, 
		validateEmail } = require("../util/validators");


// Register route
router.post('/register', async (req,res) => {
	const newUser = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		userName: req.body.userName,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword
	};

	// Validations
	const { valid, errors } = validateSignupData(newUser);

  	if (!valid) return apiResponse.validationErrorWithData(res,"Invalid data",errors);

  	// Check if user exist in the database
	try {
		const emailExist = await User.findOne({email:req.body.email});
	  	if(emailExist) return apiResponse.validationErrorWithData(res,"Already exist",{email:"Email already exist"});

	  	const userNameExist = await User.findOne({userName:req.body.userName});
	  	if(userNameExist) return apiResponse.validationErrorWithData(res,"Already exist",{userName:"Username already exist"});

		// Hash the password

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		let otp = randomOTP.randomNumber(4);
	  	// Creating a new user object
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			userName: req.body.userName,
			email: req.body.email,
			confirmOTP: otp,
			password: hashedPassword
		});

		// Sending to the database
		let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
		mailer.send( 
			req.body.email,
			"Confirm Account",
			html
		).then(async () => {
			await user.save(err => {
				if(err) apiResponse.ErrorResponse(res, "Error occurred",err);;
				return apiResponse.successResponseWithData(res, "User created successfully, OTP sent to email:"+req.body.email, {userId:user._id});
			});
		}).catch(err => {
			return apiResponse.ErrorResponse(res, "Error occurred",err);
		});
	}catch(err) {
		return apiResponse.ErrorResponse(res, "Error occurred",err);
	}
});

// Login route
router.post('/login', async (req,res) => {
	const userDetails = {
		userName: req.body.userName,
		password: req.body.password
	}
	// Validations
	const { email, valid, errors } = validateLoginData(userDetails);

  	if (!valid) return apiResponse.validationErrorWithData(res,"Invalid data",errors);

  	try {
  		// Check if user exists 
	  	let user = {};
		if(email) {
			await User.findOne({email:req.body.userName}).then( async (result) => {
				if(!result) return apiResponse.notFoundResponse(res, "Username or Password is wrong");
				
				Object.assign(user,result._doc);
			});
		} else {
			await User.findOne({userName:req.body.userName}).then(async (result) => {
				if(!result) return apiResponse.notFoundResponse(res, "Username or Password is wrong");

				Object.assign(user,result._doc);			
			});
		}
		// if(!user) return apiResponse.notFoundResponse(res, "Username or Password is wrong");

		// Decrpyt password
		await bcrypt.compare(req.body.password, user.password, (err,same)=>{
			if(same) {
				if(user.isConfirmed){
					if(user.status) {
						let userData = {
							userId: user._id,
							userName: user.userName,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email
						};
						// Create jwt
						const jsonPayload = userData;
						const token = jwt.sign(jsonPayload, process.env.SECRET);
						userData.token = token;
						res.header('auth-token', token);
						return apiResponse.successResponseWithData(res, "Login Success", userData);
					} else {
						return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
					}
				} else {
					return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
				}
			} else {
				return apiResponse.notFoundResponse(res, "Username or Password is wrong");
			}
		});
  	} catch(err){
  		return apiResponse.ErrorResponse(res, "Error occurred",err);
  	}
});

router.post('/verifyUser', async (req, res) => {
	const userDetails = {
		email: req.body.email,
		otp: req.body.otp
	}
	const { valid, errors } = validateOTPData(userDetails);

  	if (!valid) return apiResponse.validationErrorWithData(res,"Invalid data",errors);

	try {
		let query = { email : req.body.email};
		await User.findOne(query).then(user => {
			if(user){
				if(!user.isConfirmed){
					if(user.confirmOTP == req.body.otp){
						User.findOneAndUpdate(query, {
							isConfirmed:1,
							confirmOTP:null
						}).then(doc => {
							return apiResponse.successResponse(res,"Account confirmed");
						}).catch(err => {
							return apiResponse.ErrorResponse(res, err);
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "Otp does not match");
					}
				}else{
					return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
				}
			} else{
				return apiResponse.unauthorizedResponse(res, "Specified email not found.");
			}
		});
	} catch(err) {
		return apiResponse.ErrorResponse(res, "Error occurred",err);	
	}
});

router.post('/resendOtp', async (req, res) => {
	const userDetails = {
		email: req.body.email,
	}
	const { valid, errors } = validateEmail(userDetails);

  	if (!valid) return apiResponse.validationErrorWithData(res,"Invalid data",errors);

	try {
		let query = { email : req.body.email};
		await User.findOne(query).then(user => {
			if(user){
				if(!user.isConfirmed){
					let otp = randomOTP.randomNumber(4);
					let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
					mailer.send(
						req.body.email,
						"Confirm Account",
						html
					).then(async () => {
						User.findOneAndUpdate(query, {
							isConfirmed:0,
							confirmOTP:otp
						}).then(doc => {
							return apiResponse.successResponse(res,"OTP sent to mail: "+req.body.email);
						}).catch(err => {
							return apiResponse.ErrorResponse(res, err);
						});
					}).catch(err => {
						return apiResponse.ErrorResponse(res, "Error occurred",err);
					});

				}else{
					return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
				}
			} else{
				return apiResponse.unauthorizedResponse(res, "Specified email not found.");
			}
		});
	} catch(err) {
		return apiResponse.ErrorResponse(res, "Error occurred",err);	
	}
});


module.exports = router;
