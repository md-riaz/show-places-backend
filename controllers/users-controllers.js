const {validationResult} = require('express-validator');
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({getters: true}))});
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const {name, email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        return next(new HttpError('User exists already, please login instead.', 422));
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://i.pravatar.cc/300?u=' + email,
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    res.status(201).json({user: createdUser.toObject({getters: true})});
}

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    res.json({message: 'Logged in!', user: existingUser.toObject({getters: true})});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
