const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require("../models/http-error");
const getCordForAddress = require('../util/location');
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not find a place', 500));
    }

    if (!place) {
        return next(new HttpError('Could not find place for the provided id.', 404));
    }

    res.json({place: place.toObject({getters: true})}); // toObject() is used to remove the __v property
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;

    try {
        places = await Place.find({creator: userId});
    } catch (err) {
        return next(new HttpError('Fetching places failed, Please try again.', 500));
    }

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    }

    res.json({places: places.map(place => place.toObject({getters: true}))}); // toObject() is used to remove the __v property
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
       return  next (new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const {title, description, address, creator} = req.body;
    let coordinates;
    try {
        coordinates = await getCordForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://picsum.photos/id/200/300',
        creator
    });

    let user;

    try {
        user = await User.findById(creator);
    } catch (err) {
        return next(new HttpError('Creating place failed, Please try again.', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for provided id.', 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (error) {
        return next(new HttpError('Creating place failed, please try again.', 500));
    }

    res.status(201).json({place: createdPlace})
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next(new HttpError('Something went wrong, could not update place.', 500));
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update place.', 500));
    }

    res.status(200).json({place: place.toObject({getters: true})});
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next(new HttpError('Something went wrong, could not delete place.', 500));
    }

    try {
        await place.remove();
    } catch (error) {
        return next(new HttpError('Something went wrong, could not delete place.', 500));
    }

    res.status(200).json({message: 'Deleted place.'})
}


exports.getPlacesById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;