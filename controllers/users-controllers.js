const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');
const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Max',
        email: 'max@example.com',
        password: 'test'
    }
]

const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS});
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const {name, email, password, places} = req.body;

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
        places
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    res.status(201).json({user: createdUser.toObject({getters: true})});
}

const login = (req, res, next) => {
    const {email, password} = req.body;

    const identifiedUser = DUMMY_USERS.find(user => user.email === email);

    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user', 401);
    }

    res.json({message: 'Logged in'});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
