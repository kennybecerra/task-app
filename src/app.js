const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const port = process.env.PORT;

app.use(express.json())
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});