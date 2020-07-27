const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");
const authRoute = require("./routes/auth");
const testRoute = require("./routes/test");
app.use(cors());

const PORT = process.env.PORT || 5000;

// DB connection
mongoose.set('useFindAndModify', false);
mongoose.connect(
	process.env.MONGO_URL,
	{ useNewUrlParser: true,useUnifiedTopology: true },
	()=> console.log("Connected to DB")
	);

// Middlewares
app.use(express.json());

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/test', testRoute);

app.get('/', (req,res)=>{
  res.send("Hey its me Owais");
});


app.listen(PORT, '0.0.0.0', ()=> console.log("Server running"));