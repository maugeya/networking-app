const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")
const keys = require("../../config/keys")

const validateRegisterInput = require("../../validation/register")

// Load user model
const User = require("../models/User")

//@route  GET api/users/test
//@desc   Tests users route
//@access Public route
router.get("/test", (req, res) => res.json({ msg: "Users works" }))

//@route  POST api/users/register
//@desc   Register a user
//@access Public route
router.post("/register", (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body)

	if (!isValid) {
		return res.status(400).json(errors)
	}

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

//@route  GET api/users/login
//@desc   Login a user/ return a JWT token
//@access Public route
router.post("/login", (req, res) => {
	const email = req.body.email
	const password = req.body.password

	User.findOne({ email }).then(user => {
		if (!user) {
			return res.status(404).json({ email: "Credentials are incorrect" })
		}

		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				const payload = {
					id: user.id,
					name: user.name,
					avatar: user.avatar
				}
				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 3600 },
					(error, token) => {
						res.json({ success: true, token: `Bearer ${token}` })
					}
				)
			} else {
				return res.status(400).json({ password: "Credentials are incorrect" })
			}
		})
	})
})

//@route  GET api/users/current
//@desc   Get the current user
//@access Private route
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json({
			id: req.user.id,
			name: req.user.name,
			email: req.user.email
		})
	}
)

module.exports = router
