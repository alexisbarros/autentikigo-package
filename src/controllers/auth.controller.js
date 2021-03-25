// Modules
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const httpResponse = require('../utils/http-response');
const fetch = require("node-fetch");

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
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @property    {string}    cpfApiEndpoint      -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.register = async (queryParams, connectionParams) => {

    try {

        // Check if email alredy exists
        const users = await userController.readOneByEmail({ email: queryParams.email }, connectionParams);
        // const users = await userController.readAll(connectionParams);
        if (users.data.email) throw new Error('The email has already been registered');


        // Check if person alredy exists
        const person = await personController.readOneByIdNumber(queryParams, connectionParams);
        if (!person.data.idNumber) {
            let personFromApi = await fetch(`${queryParams.cpfApiEndpoint}${queryParams.idNumber}`).then(res => res.json());

            if (personFromApi.status) {

                // Create username
                const username = await personController.createUsername({ fullname: personFromApi.nome }, connectionParams);
                if (username.code === 400) throw new Error(username.message);

                let birthdate = personFromApi.nascimento.split('/');
                birthdate = `${birthdate[1]}/${birthdate[0]}/${birthdate[2]}`;
                const personToAdd = {
                    fullname: personFromApi.nome,
                    idNumber: queryParams.idNumber,
                    birthDate: new Date(birthdate),
                    gender: personFromApi.genero,
                    mothersName: personFromApi.mae,
                    country: queryParams.country,
                    username: username.data.username
                };

                const newPerson = await personController.create(personToAdd, connectionParams);

                if (newPerson.code !== 200) {
                    throw new Error(newPerson.message);
                } else {
                    person.data = newPerson.data;
                }

            } else throw Error('CPF API erro.');

        }

        // Check if birthDate is correct
        let paramsBirthdate = queryParams.birthDate.split('/');
        paramsBirthdate = new Date(`${paramsBirthdate[1]}/${paramsBirthdate[0]}/${paramsBirthdate[2]}`);
        if (
            paramsBirthdate.getDate() !== new Date(person.data.birthDate).getDate() ||
            paramsBirthdate.getMonth() !== new Date(person.data.birthDate).getMonth() ||
            paramsBirthdate.getFullYear() !== new Date(person.data.birthDate).getFullYear()
        ) {
            throw new Error('Birth date doesnt correspond to the CPF');
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
        if (user.code === 400) throw new Error(user.message);

        // Generate token
        const authentication_token = jwt.sign({ id: user.data._id }, queryParams.jwtSecret, { expiresIn: '10m' });
        const authentication_refresh_token = jwt.sign({ id: user.data._id }, queryParams.jwtRefreshSecret, { expiresIn: '7d' });

        // Create user to send to front
        const dataToFront = {
            authentication_token: authentication_token,
            authentication_refresh_token: authentication_refresh_token
        };

        return httpResponse.ok('User successfully registered', dataToFront);

    } catch (e) {

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Login user.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
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
        if (!user) throw new Error('User not found');

        // Check pass
        const isChecked = await bcrypt.compare(queryParams.password, user.password);

        if (!isChecked) throw new Error('Incorrect password');

        // Generate token
        const authentication_token = jwt.sign({ id: user._id }, queryParams.jwtSecret, { expiresIn: '10m' });
        const authentication_refresh_token = jwt.sign({ id: user._id }, queryParams.jwtRefreshSecret, { expiresIn: '7d' });

        // Create user data to return
        const userToFront = {
            _id: user._id,
            email: user.email,
            authentication_token: authentication_token,
            authentication_refresh_token: authentication_refresh_token,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Check token.
 * @param       {object}    queryParams         -required
 * @property    {string}    token               -required
 * @property    {string}    jwtSecret           -required
 * @returns     {boolean}
 */
exports.tokenIsValid = async (queryParams) => {

    // Check if token is valid
    return jwt.verify(queryParams.token, queryParams.jwtSecret, async (err, decoded) => {
        if (!err) return true;

        return false;
    });
}

/**
 * Generate new token.
 * @param       {object}    queryParams         -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    userId              -required
 * @property    {string}    expiresIn           -required
 */
exports.generateNewToken = async (queryParams) => {

    // Generate token
    const authentication_token = jwt.sign({ id: queryParams.userId }, queryParams.jwtSecret, { expiresIn: queryParams.expiresIn });

    return authentication_token;
}