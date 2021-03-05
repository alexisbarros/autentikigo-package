// Modules
const mongoose = require('mongoose');

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
        let person = await Person.create(personDTO.getPersonDTO(queryParams));
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create person data to return
        let personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
        };
        
        console.info('Person created successfuly');
        return({
            data: personToFront,
            message: 'Person created successfuly',
            code: 200
        });

    } catch(err) {

        // Disconnect to database
        await mongoose.disconnect();

        console.error(err.message);
        return({
            data: {},
            message: err.message,
            code: 400
        });

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
        let person = await Person.find({
            idNumber: queryParams.idNumber
        });
        
        // Check if person was removed
        if(person._deletedAt) throw { message: 'Person removed' };

        // Create person data to return
        let personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
        };
        
        // Disconnect to database
        await mongoose.disconnect();
        
        console.info('Person returned successfully');
        return({
            data: personToFront,
            message: 'Person returned successfully',
            code: 200
        });

    } catch(err) {

        // Disconnect to database
        await mongoose.disconnect();

        console.error(err.message);
        return({
            data: {},
            message: err.message,
            code: 400
        });

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
        let people = await Person.find({});

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
        
        console.info('People returned successfully');
        return({
            data: peopleToFront,
            message: 'People returned successfully',
            code: 200
        });

    } catch(err) {

        // Disconnect to database
        await mongoose.disconnect();

        console.error(err.message);
        return({
            data: [],
            message: err.message,
            code: 400
        });

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
        let person = await Person.findByIdAndUpdate(
            queryParams._id, 
            {
                ...personDTO.getPersonDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create person data to return
        let personToFront = {
            ...personDTO.getPersonDTO(person),
            _id: person._id,
        };
        
        console.info('Person updated successfuly');
        return({
            data: personToFront,
            message: 'Person updated successfuly',
            code: 200
        });

    } catch(err) {

        // Disconnect to database
        await mongoose.disconnect();

        console.error(err.message);
        return({
            data: [],
            message: err.message,
            code: 400
        });

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
    
        console.info('Person deleted successfuly');
        return({
            data: {},
            message: 'Person deleted successfuly',
            code: 200
        });
        
    } catch(err) {

        // Disconnect to database
        await mongoose.disconnect();
        
        console.error(err.message);
        return({
            data: [],
            message: err.message,
            code: 400
        });

    }

};