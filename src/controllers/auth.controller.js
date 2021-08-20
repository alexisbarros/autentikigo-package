// Modules
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const httpResponse = require('../utils/http-response');
const fetch = require("node-fetch");
const checkUser = require('../utils/check-user-type');
const uniqueIdValidator = require('cpf-cnpj-validator');
const ObjectId = require('mongoose').Types.ObjectId;

// Controllers
const userController = require('./users.controller');
const peopleController = require('./people.controller');
const companyController = require('./companies.controller');
const aclController = require('./acl.controller');

// Models
const User = require('../models/users.model');
const People = require('../models/people.model');
const Company = require('../models/companies.model');

// DTO
const userDTO = require('../dto/user-dto');

/**
 * Register a user in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    uniqueId            -required
 * @property    {date}      birthday            -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    cpfApiEndpoint      -required
 * @property    {string}    cnpjApiEndpoint     -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.register = async (queryParams, connectionParams) => {

    try {

        // Check if email alredy exists
        const users = await userController.readOneByEmail({ email: queryParams.email }, connectionParams);
        if (users.data.email) throw new Error('The email has already been registered');

        // Check if is a person or company
        const onlyNumbersUniqueId = queryParams.uniqueId.replace(/\D/g, '');
        let userWithUniqueIdRegistered;
        let type, person, company;
        if (uniqueIdValidator.cpf.isValid(onlyNumbersUniqueId)) {
            type = 'person';

            // Check if uniqueId (CPF) alredy use to an user
            userWithUniqueIdRegistered = await userController.readAllByCpf({ cpf: queryParams.uniqueId }, connectionParams);

            if (userWithUniqueIdRegistered && userWithUniqueIdRegistered.data.length) throw new Error('The uniqueId has already been registered');

            // Check if person alredy exists
            person = await peopleController.readOneByUniqueId({ uniqueId: onlyNumbersUniqueId }, connectionParams);
            if (!person.data.uniqueId) {
                let personFromApi = await fetch(`${queryParams.cpfApiEndpoint}${onlyNumbersUniqueId}`).then(res => res.json());

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
        }
        else if (uniqueIdValidator.cnpj.isValid(onlyNumbersUniqueId)) {

            type = 'company';

            // Check if uniqueId (CNPJ) alredy use to an user
            userWithUniqueIdRegistered = await userController.readAllByCnpj({ cnpj: queryParams.uniqueId }, connectionParams);
            if (userWithUniqueIdRegistered && userWithUniqueIdRegistered.data.length) throw new Error('The uniqueId has already been registered');

            // Check if company alredy exists
            company = await companyController.readOneByUniqueId({ uniqueId: onlyNumbersUniqueId }, connectionParams);
            if (!company.data.uniqueId) {
                let companyFromApi = await fetch(`${queryParams.cnpjApiEndpoint}${onlyNumbersUniqueId}`).then(res => res.json());

                if (companyFromApi.status) {

                    // Create username
                    const username = await companyController.createUsername({ name: companyFromApi.fantasia }, connectionParams);
                    if (username.code === 400) throw new Error(username.message);

                    let birthday = companyFromApi.inicioAtividade.split('/');
                    birthday = `${birthday[1]}/${birthday[0]}/${birthday[2]}`;
                    const companyToAdd = {
                        uniqueId: queryParams.uniqueId,
                        username: username.data.username,
                        companyName: companyFromApi.razao,
                        fantasyName: companyFromApi.fantasia,
                        responsible: companyFromApi.responsavel,
                        address: companyFromApi.matrizEndereco,
                        country: queryParams.country,
                        simples: companyFromApi.simplesNacional,
                        phones: companyFromApi.telefones,
                        situation: companyFromApi.situacao,
                        legalNature: companyFromApi.naturezaJuridica,
                        cnae: companyFromApi.cnae,
                        birthday: new Date(birthday),
                    };

                    const newCompany = await companyController.create(companyToAdd, connectionParams);

                    if (newCompany.code !== 200) {
                        throw new Error(newCompany.message);
                    } else {
                        company.data = newCompany.data;
                    }

                } else throw Error('CNPJ API erro.');

            }

            // Check if birthday is correct
            let paramsBirthday = queryParams.birthday.split('/');
            paramsBirthday = new Date(`${paramsBirthday[1]}/${paramsBirthday[0]}/${paramsBirthday[2]}`);
            if (
                paramsBirthday.getDate() !== new Date(company.data.birthday).getDate() ||
                paramsBirthday.getMonth() !== new Date(company.data.birthday).getMonth() ||
                paramsBirthday.getFullYear() !== new Date(company.data.birthday).getFullYear()
            ) {
                throw new Error('Birth date doesnt correspond to the CPF');
            }
        } else {
            throw new Error('Invalid CPF/CNPJ');
        }

        // Create a user in db
        const userToRegister = {
            email: queryParams.email,
            password: queryParams.password,
            type: type,
            personInfo: type === 'person' ? person.data._id : null,
            companyInfo: type === 'company' ? company.data._id : null,
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

        return httpResponse.error(e.message, {});

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
        let userLogged;
        const userType = await checkUser.checkUserType(queryParams.user);

        switch (userType) {
            case 'email':
                userLogged = await this.loginWithEmail({ email: queryParams.user, password: queryParams.password }, connectionParams);
                if (userLogged.code !== 200) throw new Error(userLogged.message);
                user = userLogged.data;
                break

            case 'cpf':
                userLogged = await this.loginWithCpf({ cpf: queryParams.user.replace(/\D/g, ''), password: queryParams.password }, connectionParams);
                if (userLogged.code !== 200) throw new Error(userLogged.message);
                user = userLogged.data;
                break

            case 'cnpj':
                userLogged = await this.loginWithCnpj({ cnpj: queryParams.user.replace(/\D/g, ''), password: queryParams.password }, connectionParams);
                if (userLogged.code !== 200) throw new Error(userLogged.message);
                user = userLogged.data;
                break

            case 'username':
                userLogged = await this.loginWithUsername({ username: queryParams.user, password: queryParams.password }, connectionParams);
                if (userLogged.code !== 200) throw new Error(userLogged.message);
                user = userLogged.data;
                break

            default:
                break
        }

        // Create user data to return
        const userToFront = userDTO.getUserDTO(user);

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user with e-mail.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.loginWithEmail = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get user by e-mail
        const user = await User.findOne().and([
            { _deletedAt: null },
            { email: queryParams.email },
        ])
            .populate({ path: 'projects', populate: { path: 'projectId' } })
            .exec();
        if (!user) throw new Error('User not found');

        // Check password
        const correctPassword = await bcrypt.compare(queryParams.password, user.password);
        if (!correctPassword) throw new Error('Incorrect password');

        // Create user data to return
        const userToFront = userDTO.getUserDTO(user);

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user with cpf.
 * @param       {object}    queryParams         -required
 * @property    {string}    cpf                 -required
 * @property    {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.loginWithCpf = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get person
        const person = await People.findOne().and([
            { uniqueId: queryParams.cpf },
            { _deletedAt: null }
        ]);
        if (!person) throw new Error('Person not found');

        // Get user by cpf
        const user = await User.findOne().and([
            { personInfo: new ObjectId(person._id) },
            { _deletedAt: null },
        ])
            .populate({ path: 'projects', populate: { path: 'projectId' } })
            .exec();
        if (!user) throw new Error('User not found');

        // Check password
        const correctPassword = await bcrypt.compare(queryParams.password, user.password);
        if (!correctPassword) throw new Error('Incorrect password');

        // Create user data to return
        const userToFront = userDTO.getUserDTO(user);

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user with cnpj.
 * @param       {object}    queryParams         -required
 * @property    {string}    cnpj                -required
 * @property    {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.loginWithCnpj = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get company
        const company = await Company.findOne().and([
            { uniqueId: queryParams.cnpj },
            { _deletedAt: null }
        ]);
        if (!company) throw new Error('Company not found');

        // Get user by cnpj
        const user = await User.findOne().and([
            { companyInfo: new ObjectId(company._id) },
            { _deletedAt: null },
        ])
            .populate({ path: 'projects', populate: { path: 'projectId' } })
            .exec();
        if (!user) throw new Error('User not found');

        // Check password
        const correctPassword = await bcrypt.compare(queryParams.password, user.password);
        if (!correctPassword) throw new Error('Incorrect password');

        // Create user data to return
        const userToFront = userDTO.getUserDTO(user);

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user with username.
 * @param       {object}    queryParams         -required
 * @property    {string}    username            -required
 * @property    {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.loginWithUsername = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get person
        const person = await People.findOne().and([
            { username: queryParams.username },
            { _deletedAt: null }
        ]);
        if (!person) throw new Error('Person not found');

        // Get user by cpf
        const user = await User.findOne().and([
            { personInfo: new ObjectId(person._id) },
            { _deletedAt: null },
        ])
            .populate({ path: 'projects', populate: { path: 'projectId' } })
            .exec();
        if (!user) throw new Error('User not found');

        // Check password
        const correctPassword = await bcrypt.compare(queryParams.password, user.password);
        if (!correctPassword) throw new Error('Incorrect password');

        // Create user data to return
        const userToFront = userDTO.getUserDTO(user);

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User successfully logged', userToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

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

        // Get user populated
        let user = await User.findById(queryParams.userId)
            .and([{ _deletedAt: null }]).select('_id email type personInfo companyInfo projects')
            .populate({ path: 'personInfo companyInfo', select: '-_deletedAt -_createdAt -_updatedAt -__v' })
            .populate({
                path: 'projects',
                populate: {
                    path: 'projectId acl',
                    select: 'name projectId permissions',
                    populate: {
                        path: 'permissions',
                        populate: {
                            path: 'actions moduleId',
                            select: 'name _id menu'
                        },
                    }
                }
            })
            .exec();

        if (!user) throw new Error('User not found');
        user = user.toJSON();

        // Get acl and verified
        const project = user.projects.find(el => el.projectId._id.toString() === queryParams.projectId);
        if (!project) throw new Error('Client does not have authorization');
        user['acl'] = project['acl'];
        user['verified'] = project['verified'];

        delete user.projects;

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('User info successful returned', user);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

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
 * @property    {string}    projectId           -required
 * @property    {string}    acl                 -required
 * @property    {string}    expiresIn           -required
 */
exports.generateNewToken = async (queryParams) => {

    // Generate token
    const authentication_token = jwt.sign(
        { id: queryParams.userId, acl: queryParams.acl, projectId: queryParams.projectId },
        queryParams.jwtSecret,
        { expiresIn: queryParams.expiresIn }
    );

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

        if (!user) throw new Error('User not found');

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