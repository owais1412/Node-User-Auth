const jwt = require("jsonwebtoken");
const apiResponse = require("../util/apiResponse");

module.exports = function(req,res,next){
	const token = req.header('auth-token');
	if(!token) return apiResponse.unauthorizedResponse(res,"Access Denied");

	try{
		const verified = jwt.verify(token, process.env.SECRET);
		req.user = verified;
		return next();
	} catch(err){
		return apiResponse.ErrorResponse(res, "Error Occurred", err);
	}
}