// Modules
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const httpResponse = require('../utils/http-response');
const fetch = require("node-fetch");
const checkUser = require('../utils/check-user-type');
const ObjectId = require('mongoose').Types.ObjectId;

// Controllers
const userController = require('./users.controller');
const peopleController = require('./people.controller');

// Models
const User = require('../models/users.model');

/**
 * Register a user in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    uniqueId            -required
 * @property    {date}      birthday           -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    cpfApiEndpoint      -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.register = async (queryParams, connectionParams) => {

    try {

        // Check if email alredy exists
        const users = await userController.readOneByEmail({ email: queryParams.email }, connectionParams);
        if (users.data.email) throw new Error('The email has already been registered');

        // Check if uniqueId (CPF) alredy use to an user
        const userWithUniqueIdRegistered = await userController.readAllByCpf({ cpf: queryParams.uniqueId }, connectionParams);
        if (userWithUniqueIdRegistered.data.length) throw new Error('The uniqueId has already been registered');


        // Check if person alredy exists
        const person = await peopleController.readOneByUniqueId(queryParams, connectionParams);
        if (!person.data.uniqueId) {
            let personFromApi = await fetch(`${queryParams.cpfApiEndpoint}${queryParams.uniqueId}`).then(res => res.json());

            if (personFromApi.status) {

                // Create username
                const username = await peopleController.createUsername({ name: personFromApi.nome }, connectionParams);
                if (username.code === 400) throw new Error(username.message);

                let birthday = personFromApi.nascimento.split('/');
                birthday = `${birthday[1]}/${birthday[0]}/${birthday[2]}`;
                const personToAdd = {
                    name: personFromApi.nome,
                    uniqueId: queryParams.uniqueId,
                    birthday: new Date(birthday),
                    gender: personFromApi.genero,
                    mother: personFromApi.mae,
                    country: queryParams.country,
                    username: username.data.username
                };

                const newPerson = await peopleController.create(personToAdd, connectionParams);

                if (newPerson.code !== 200) {
                    throw new Error(newPerson.message);
                } else {
                    person.data = newPerson.data;
                }

            } else throw Error('CPF API erro.');

        }

        // Check if birthday is correct
        let paramsBirthday = queryParams.birthday.split('/');
        paramsBirthday = new Date(`${paramsBirthday[1]}/${paramsBirthday[0]}/${paramsBirthday[2]}`);
        if (
            paramsBirthday.getDate() !== new Date(person.data.birthday).getDate() ||
            paramsBirthday.getMonth() !== new Date(person.data.birthday).getMonth() ||
            paramsBirthday.getFullYear() !== new Date(person.data.birthday).getFullYear()
        ) {
            throw new Error('Birth date doesnt correspond to the CPF');
        }

        // Create a user in db
        const userToRegister = {
            email: queryParams.email,
            password: queryParams.password,
            type: 'person',
            personInfo: person.data._id,
            projects: [],
        }
        const user = await userController.create(userToRegister, connectionParams);
        if (user.code === 400) throw new Error(user.message);

        // Create user to send to front
        const dataToFront = {
            userId: user.data._id
        };

        return httpResponse.ok('User successfully registered', dataToFront);

    } catch (e) {

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Login user.
 * @param       {object}    queryParams         -required
 * @property    {string}    user                -required
 * @property    {string}    password            -required
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

        // Check user type
        let user;
        const userType = await checkUser.checkUserType(queryParams.user);

        let users;
        switch (userType) {
            case 'email':
                const userToCheck = await userController.readOneByEmail({ email: queryParams.user }, connectionParams);
                if (!userToCheck.data.email) throw new Error('User not found');
                // Check pass
                const isChecked = await this.verifyPassword(
                    {
                        userId: userToCheck.data._id,
                        password: queryParams.password
                    },
                    connectionParams
                );
                if (!isChecked) throw new Error('Incorrect password');
                user = userToCheck.data;
                break

            case 'cpf':
                users = await userController.readAllByCpf({ cpf: queryParams.user }, connectionParams);
                for (const el of users.data) {

                    const isChecked = await this.verifyPassword(
                        {
                            userId: el._id,
                            password: queryParams.password
                        },
                        connectionParams
                    );

                    // Check pass
                    if (isChecked) user = el;
                }
                if (!user) throw new Error('Incorrect password');
                break

            case 'username':
                users = await userController.readAllByUsername({ username: queryParams.user }, connectionParams);
                for (const el of users.data) {

                    const isChecked = await this.verifyPassword(
                        {
                            userId: el._id,
                            password: queryParams.password
                        },
                        connectionParams
                    );

                    // Check pass
                    if (isChecked) user = el;
                }
                if (!user) throw new Error('Incorrect password');
                break

            default:
                break
        }

        // Create user data to return
        const userToFront = {
            _id: user._id,
            email: user.email,
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
 * Get user.
 * @param       {object}    queryParams         -required
 * @property    {string}    userId              -required
 * @property    {string}    projectId           -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.getUser = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check user type
        const user = await userController.readOneByUniqueId({ id: queryParams.userId }, connectionParams);
        if (!user.data.email) throw new Error('User not found');

        let userToFront = user.data;

        // Get role and verified
        const project = userToFront.projects.find(el => el.projectId._id.toString() === queryParams.projectId);
        if (!project) throw new Error('Client does not have authorization');
        userToFront['role'] = project['role'];
        userToFront['verified'] = project['verified'];

        delete userToFront.projects;

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User info successful returned', userToFront);

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
 * @property    {string}    role                -required
 * @property    {string}    expiresIn           -required
 */
exports.generateNewToken = async (queryParams) => {

    // Generate token
    const authentication_token = jwt.sign({ id: queryParams.userId, role: queryParams.role }, queryParams.jwtSecret, { expiresIn: queryParams.expiresIn });

    return authentication_token;
}

/**
 * Get payload of a token.
 * @param       {object}    queryParams         -required
 * @property    {string}    token               -required
 * @property    {string}    jwtSecret           -required
 */
exports.getTokenPayload = async (queryParams) => {

    // Get token payload
    const payload = jwt.verify(queryParams.token, queryParams.jwtSecret);

    return payload;

}

/**
 * Verify password of a user.
 * @param       {object}    queryParams         -required
 * @property    {string}    userId              -required
 * @property    {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.verifyPassword = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const user = await User.findOne({
            $and: [
                { _id: new ObjectId(queryParams.userId) },
                { _deletedAt: null },
            ]
        });

        // Disconnect to database
        await mongoose.disconnect();

        if (!user) return false;

        const isChecked = await bcrypt.compare(queryParams.password, user.password);
        if (!isChecked) return false;

        return true

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return false;

    }
}