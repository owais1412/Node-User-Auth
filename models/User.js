const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {type: String, required: true , min:2, max:255},
	lastName: {type: String, required: true, min:2, max:255},
	userName: {type: String, required: true, min:2, max:255},
	email: {type: String, required: true, min:6, max:255},
	password: {type: String, required: true, min:6, max:1024},
	date: {type: Date, default: Date.now()},
	isConfirmed: {type: Boolean, required: true, default: 0},
	confirmOTP: {type: String, required:false},
	status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

// userSchema.virtual("fullName")
// 	.get(function () {
// 		return this.firstName + " " + this.lastName;
// 	});

module.exports = mongoose.model("User", userSchema);