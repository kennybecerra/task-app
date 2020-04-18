const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

//  ********** TASKS *************

router.post("/tasks", auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id
	})

	try {
		await task.save();
		res.status(201).send(task);

	} catch (err) {
		res.status(400).send(err)
	}
})

router.get("/tasks", auth, async (req, res) => {
	const match = {};
	if (req.query.completed) {
		match.completed = req.query.completed === "true";
	}

	const sort = {};
	if (req.query.sortBy) {
		const [field, order] = req.query.sortBy.split(":")
		sort[field] = order.toLowerCase() === "desc" ? -1 : 1;
	}
	


	try {
		await req.user.populate({
			path: "tasks",
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate()
		if (!req.user.tasks) {
			return res.status(404).send()
		}
		res.send(req.user.tasks);

	} catch (err) {
		res.status(500).send(err);
	}
});


router.get("/tasks/:id", auth,  async (req, res) => {

	try {
		const task = await Task.findOne({_id: req.params.id , owner: req.user._id })

		if (!task) {
			return res.status(404).send();
		}

		res.send(task)

	} catch (err) {	
		res.status(500).send(err);
	}

});

router.patch("/tasks/:id", auth, async (req, res) => {

	const updates = Object.keys(req.body)
	const allowedUpdates = ["description", "completed"];

	const isValid = updates.every((update) => allowedUpdates.includes(update))

	if (!isValid) {
		return res.status(400).send({error: "Invalid updates!"});
	}


	try {
		const task = await Task.findOne({_id: req.params.id , owner: req.user._id })

		if (!task) {
			return res.status(400).send();
		}

		updates.forEach( (update) => {
			task[update] = req.body[update];
		})
		await task.save();

		res.send(task);

	} catch (err) {
		res.status(400).send(err);
	}

});

router.delete("/tasks/:id", auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({_id: req.params.id , owner: req.user._id});

		if (!task) {
			return res.status(400).send()
		}
		res.send(task)

	} catch (err) {
		res.status(500).send(err);
	}

});

module.exports = router;