// Modules
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Controllers
const userController = require('./users.controller');
const personController = require('./people.controller');

// DTO
const personDTO = require('../dto/person-dto');

// Models
const User = require('../models/users.model');

/**
 * Register a user in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    idNumber            -required
 * @property    {date}      birthDate           -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    jwtsecret           -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.register = async (queryParams, connectionParams) => {

    try {

        // Check if email alredy exists
        const users = await userController.readAll(connectionParams);
        if (
            users.data &&
            users.data.filter(user => user.email === queryParams.email).length
        ) throw { message: 'The email has already been registered' }


        // Check if person alredy exists
        const person = await personController.readOneByIdNumber(queryParams, connectionParams);
        if (!person.data.idNumber) {
            // @todo: create person with api cpf/cnpj

            // Mock: start
            const personToAdd = {
                idNumber: queryParams.idNumber,
                country: 'br',
                fullname: 'Teste',
                username: 'teste',
                mothersName: 'Mãe teste',
                birthDate: new Date('2021-03-02'),
            };
            const newPerson = await personController.create(personToAdd, connectionParams);
            if (newPerson.code !== 200) {
                throw { message: newPerson.message }
            } else {
                person.data = newPerson.data;
            }
            // Mock: end

        } else {

            // Check if birthDate is correct
            if (queryParams.birthDate !== person.data.birthDate) {
                throw { message: 'Birth date doesnt correspond to the CPF' }
            }
        }

        // Create a user in db
        const userToRegister = {
            email: queryParams.email,
            password: queryParams.password,
            type: 'person',
            personInfo: person.data._id,
            authorizedCompanies: [],
        }
        const user = await userController.create(userToRegister, connectionParams);
        if (user.code === 400) throw { message: user.message }

        // Generate token
        const authentication_token = jwt.sign({ id: user.data._id, email: user.data.email }, queryParams.jwtsecret);

        // Create user to send to front
        const dataToFront = {
            authentication_token: authentication_token
        };

        console.info('User successfully registered');
        return ({
            data: dataToFront,
            message: 'User successfully registered',
            code: 200
        });

    } catch (err) {

        console.error(err.message);
        return ({
            data: {},
            message: err.message,
            code: 400
        });

    }

}

/**
 * Login user.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    jwtsecret           -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.login = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Search user
        const user = await User.findOne({ email: queryParams.email });
        if (!user) throw { message: 'User not found' };

        // Check pass
        const isChecked = await bcrypt.compare(queryParams.password, user.password);
        if (isChecked) {

            // Generate token
            const authentication_token = jwt.sign({ id: user._id, email: user.email }, queryParams.jwtsecret);

            // Create user data to return
            const userToFront = {
                _id: user._id,
                email: user.email,
                authentication_token: authentication_token
            };

            // Disconnect to database
            await mongoose.disconnect();

            console.info('User successfully logged');
            return ({
                data: userToFront,
                message: 'User successfully logged.',
                code: 200
            })

        } else {

            throw { message: 'Incorrect password' }

        }

    } catch (err) {

        // Disconnect to database
        await mongoose.disconnect();

        console.error(err.message);
        return ({
            data: {},
            message: err.message,
            code: 400
        });

    }

}