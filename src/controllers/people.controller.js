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
 * @property    {string}    idNumber            -required
 * @property    {string}    country             -required
 * @property    {string}    fullname            -required
 * @property    {string}    username            -required
 * @property    {string}    mothersName         -required
 * @property    {date}      birthDate           -required
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
        };

        return httpResponse.ok('Person created successfuly', personToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get one person by idNumber.
 * @param       {object}    queryParams         -required
 * @property    {string}    idNumber            -required
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

        // Get person by idNumber
        const person = await Person.findOne({
            idNumber: queryParams.idNumber
        });

        // Check if person was removed
        if (person && person._deletedAt) throw new Error('Person removed');

        // Create person data to return
        const personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
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
        const people = await Person.find({});

        // Filter person tha wasnt removed
        let peopleToFront = people.filter(person => !person._deletedAt);

        // Create person data to return
        peopleToFront = peopleToFront.map(person => {
            return {
                ...personDTO.getPersonDTO(person),
                _id: person._id,
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
 * @property    {string}    idNumber            -required
 * @property    {string}    country             -required
 * @property    {string}    fullname            -required
 * @property    {string}    username            -required
 * @property    {string}    mothersName         -required
 * @property    {date}      birthDate           -required
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