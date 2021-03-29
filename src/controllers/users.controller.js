// Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const httpResponse = require('../utils/http-response');
const ObjectId = require('mongoose').Types.ObjectId;

// Model
const User = require('../models/users.model');

// DTO
const userDTO = require('../dto/user-dto');

// Controllers
const personController = require('./people.controller');

/**
 * Register user in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    type                -required
 * @property    {string}    personInfo
 * @property    {string}    authorizedCompanies
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.create = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Encrypt pass
        const hashedPassword = await bcrypt.hash(queryParams.password, 10);

        // Create user in database
        const data = userDTO.getUserDTO(queryParams);
        data['password'] = hashedPassword;
        const user = await User.create(data);

        // Disconnect to database
        await mongoose.disconnect();

        // Create user data to return
        const userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };

        return httpResponse.ok('User created successfuly', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get one user by id.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneByIdNumber = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get user by idNumber
        const user = await User.findById(queryParams.id)
            .populate('personInfo')
            .populate('authorizedCompanies')
            .exec();

        // Check if user was removed
        if (user._deletedAt) new Error('User removed');

        // Create user data to return
        const userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User returned successfully', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Get one user by emal.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneByEmail = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get user by idNumber
        const user = await User.findOne().and([
            { _deletedAt: null },
            { email: queryParams.email },
        ])
            .populate('personInfo')
            .populate('authorizedCompanies')
            .exec();

        // Create user data to return
        const userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User returned successfully', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Get all users.
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readAll = async (connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get all users
        const users = await User.find({
            _deletedAt: null
        })
            .populate('personInfo')
            .populate('authorizedCompanies')
            .exec();

        // Create user data to return
        const usersToFront = users.map(user => {
            return {
                ...userDTO.getUserDTO(user),
                _id: user._id,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Users returned successfully', usersToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get all users with specific cpf.
 * @param       {object}    queryParams         -required
 * @property    {string}    cpf                 -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readAllByCpf = async (queryParams, connectionParams) => {

    try {

        const person = await personController.readOneByIdNumber({ idNumber: queryParams.cpf.replace(/[.-\s]/g, '') }, connectionParams);
        if (!person.data) throw new Error('User not found');

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get all users
        const users = await User
            .find({
                $and: [
                    { personInfo: new ObjectId(person.data._id) },
                    { _deletedAt: null }
                ]
            })
            .populate('personInfo')
            .populate('authorizedCompanies')
            .exec();

        // Create user data to return
        const usersToFront = users.map(user => {
            return {
                ...userDTO.getUserDTO(user),
                _id: user._id,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Users returned successfully', usersToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get all users with specific username.
 * @param       {object}    queryParams         -required
 * @property    {string}    username            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readAllByUsername = async (queryParams, connectionParams) => {

    try {

        const person = await personController.readOneByUsername({ username: queryParams.username }, connectionParams);
        if (!person.data) throw new Error('User not found');

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get all users
        const users = await User
            .find({
                $and: [
                    { personInfo: new ObjectId(person.data._id) },
                    { _deletedAt: null }
                ]
            })
            .populate('personInfo')
            .populate('authorizedCompanies')
            .exec();

        // Create user data to return
        const usersToFront = users.map(user => {
            return {
                ...userDTO.getUserDTO(user),
                _id: user._id,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Users returned successfully', usersToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a user.
 * @param       {object}    queryParams         -required
 * @property    {string}    _id                  -required
 * @property    {string}    email               -required
 * @property    {string}    type                -required
 * @property    {string}    personInfo
 * @property    {string}    authorizedCompanies
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.update = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Update user data
        const user = await User.findByIdAndUpdate(
            queryParams._id,
            {
                ...userDTO.getUserDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create user data to return
        const userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };

        return httpResponse.ok('User updated successfuly', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Delete a user.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.delete = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Delete user by id
        await User.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};