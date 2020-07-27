const router = require("express").Router();
const verifyToken = require("./verifyToken");
const User = require("../models/User");


router.get('/', verifyToken, (req, res)=>{
	const user = User.findOne({_id:req.user._id}, (err, result)=>{
		if(err) res.send(err);
		else res.send(result.firstName);
	});
});

module.exports = router;