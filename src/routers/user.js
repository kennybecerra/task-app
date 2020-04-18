const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");
const {sendWelcomeEmail, sendCancellationEmail } = require("../emails/account");

// const storage = multer.diskStorage({
// 	destination(req , file, cb) {
// 		const base = "./assets";

// 		if (file.originalname.match(/\.(pdf|doc|docx)/)) {
// 			cb(null, `${base}/documents`);
// 		} 
// 		else if (file.originalname.match(/\.(jpg|jpeg|gif|png)/)) {
// 			cb(null, `${base}/images`);
// 		} 
// 		else if (file.originalname.match(/\.(webm|mp4|wmv|mov)/)) {
// 			cb(null, `${base}/video`);
// 		}
// 		else {
// 			cb(null, `${base}/miscellaneous`);
// 		}

// 	},
// 	filename(req, file, cb) {
// 		cb(null, `${file.originalname}`);
// 	}

// })

const uploadAvatarImage = multer({
	// storage,
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
			return cb(new Error("Please upload an image"))
		}

		cb(undefined, true);
	}
});

//  ********** USERS *************

router.post("/users", async (req, res) => {
	
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({user, token});

	}
	catch (err) {
		res.status(400).send(err);
	}
})

router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken()

		res.send({user: user, token});
	} catch (err) {
		res.status(400).send(err)
	}
});

router.post("/users/logout", auth, async (req,res) => {
	try {

			req.user.tokens = req.user.tokens.filter((token) => {
				return token.token !== req.token;
			})
		await req.user.save();

		res.send()

	} catch (err) {
		res.status(500).send();
	}
});

router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send()

	} catch (err) {
		res.status(500).send()
	}
})

router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});


router.patch("/users/me", auth, async (req, res) => {

	const updates = Object.keys(req.body)
	const allowedUpdates = ["name", "email", "password", "age"];

	const isValid = updates.every((update) => allowedUpdates.includes(update))

	if (!isValid) {
		return res.status(400).send({error: "Invalid updates!"});
	}


	try {
		// const user  = await User.findById(req.params.id);

		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});

		await req.user.save();
		res.send(req.user);

	} catch (err) {
		res.status(400).send(err);
	}

});

router.delete("/users/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		sendCancellationEmail(req.user.email, req.user.name);
		res.send(req.user)

	} catch (err) {
		res.status(500).send(err);
	}

});

router.post("/users/me/avatar", auth, uploadAvatarImage.single("avatar"), async (req, res) => {
	const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
	
	req.user.avatar = buffer;
	await req.user.save();
	res.send();
}, (error, req, res, next) => {
	res.status(400).send({error: error.message});
});

router.delete("/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send();
}, (error, req, res, next) => {
	res.status(400).send({error: error.message});
});


router.get("/users/:id/avatar" , async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) {
			throw new Error();
		}
		res.set("Content-Type", "image/png");
		res.send(user.avatar);

	} catch (err) {
		res.status(404).send()
	}
})

module.exports = router;