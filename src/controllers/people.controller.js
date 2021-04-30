// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const Person = require('../models/people.model');

// DTO
const personDTO = require('../dto/person-dto');

/**
 * Register person in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    uniqueId            -required
 * @property    {string}    country             -required
 * @property    {string}    name                -required
 * @property    {string}    username            -required
 * @property    {string}    mother              -required
 * @property    {date}      birthday            -required
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

        // Create person in database
        const person = await Person.create(personDTO.getPersonDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create person data to return
        const personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
            _createdBy: person._createdBy,
            _ownedBy: person._ownedBy,
        };

        return httpResponse.ok('Person created successfuly', personToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get one person by uniqueId.
 * @param       {object}    queryParams         -required
 * @property    {string}    uniqueId            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneByUniqueId = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get person by uniqueId
        const person = await Person.findOne({
            $and: [
                { uniqueId: queryParams.uniqueId },
                { _deletedAt: null }
            ]
        });

        // Create person data to return
        const personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
            _createdBy: person._createdBy,
            _ownedBy: person._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Person returned successfully', personToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Get one person by username.
 * @param       {object}    queryParams         -required
 * @property    {string}    username            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneByUsername = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get person by username
        const person = await Person.findOne({
            $and: [
                { username: queryParams.username },
                { _deletedAt: null }
            ]
        });

        // Create person data to return
        const personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
            _createdBy: person._createdBy,
            _ownedBy: person._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Person returned successfully', personToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Get all people.
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

        // Get all people
        const people = await Person.find({
            _deletedAt: null
        });

        // Create person data to return
        const peopleToFront = people.map(person => {
            return {
                ...personDTO.getPersonDTO(person),
                _id: person._id,
                _createdBy: person._createdBy,
                _ownedBy: person._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('People returned successfully', peopleToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a person.
 * @param       {object}    queryParams         -required
 * @property    {string}    _id                  -required
 * @property    {string}    uniqueId            -required
 * @property    {string}    country             -required
 * @property    {string}    name            -required
 * @property    {string}    username            -required
 * @property    {string}    mother         -required
 * @property    {date}      birthday           -required
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

        // Update person data
        const person = await Person.findByIdAndUpdate(
            queryParams._id,
            {
                ...personDTO.getPersonDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create person data to return
        const personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
            _createdBy: person._createdBy,
            _ownedBy: person._ownedBy,
        };

        return httpResponse.ok('Person updated successfuly', personToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Delete a person.
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

        // Delete person by id
        await Person.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Person deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Create username.
 * @param       {object}    queryParams         -required
 * @property    {string}    name             -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.createUsername = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create username from full name
        const arrayOfName = queryParams.name.split(' ');
        const usernamePrefix = `${arrayOfName[0].toLowerCase()}${arrayOfName[arrayOfName.length - 1].toLowerCase()}_`;

        // Check if username already exists
        const peopleWithSameUsername = await Person.find({
            username: { $regex: "^" + usernamePrefix }
        });

        // Create username
        const username = `${usernamePrefix}${peopleWithSameUsername.length}`

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Username created', { username: username });

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};