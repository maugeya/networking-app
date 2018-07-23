const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")

// Load user model
const User = require("../models/User")

//@route  GET api/users/test
//@desc   Tests users route
//@access Public route
router.get("/test", (req, res) => res.json({ msg: "Users works" }))

//@route  GET api/users/register
//@desc   Register a user
//@access Public route

router.post("/register", (req, res) => {
	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			return res.status(400).json({ email: "Email has already been register" })
		} else {
			const avatar = gravatar.url(req.body.email, {
				s: 200,
				r: "pg",
				d: "mm"
			})
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				avatar
			})

			bcrypt.genSalt(10, (error, salt) => {
				bcrypt.hash(newUser.password, salt, (error, hash) => {
					if (error) {
						throw error
					}
					newUser.password = hash
					newUser
						.save()
						.then(user => res.json(user))
						.catch(console.log(error))
				})
			})
		}
	})
})

module.exports = router
