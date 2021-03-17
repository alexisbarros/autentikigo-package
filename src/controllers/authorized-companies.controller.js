// Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const httpResponse = require('../utils/http-response');

// Model
const AuthorizedCompany = require('../models/authorized-companies.model');

// DTO
const authorizedCompanyDTO = require('../dto/authorized-company-dto');

/**
 * Register authorizedCompany in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
 * @property    {string}    redirectUri         -required
 * @property    {string}    secret              -required
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

        // Encrypt secret
        const hashedSecret = await bcrypt.hash(queryParams.secret, 10);

        // Create authorizedCompany in database
        const data = authorizedCompanyDTO.getAuthorizedCompanyDTO(queryParams);
        data['secret'] = hashedSecret;
        const authorizedCompany = await AuthorizedCompany.create(data);

        // Disconnect to database
        await mongoose.disconnect();

        // Create authorizedCompany data to return
        const authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };

        return httpResponse.ok('Authorized Company created successfuly', authorizedCompanyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Get one authorizedCompany by id.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneById = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get authorizedCompany by id
        const authorizedCompany = await AuthorizedCompany.findById(queryParams.id);

        // Check if authorizedCompany was removed
        if (authorizedCompany._deletedAt) throw new Error('Authorized Company removed');

        // Create authorizedCompany data to return
        const authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Authorized Company returned successfully', authorizedCompanyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

}

/**
 * Get all authorizedCompanies.
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

        // Get all authorizedCompanies
        const authorizedCompanies = await AuthorizedCompany.find({});

        // Filter authorizedCompany tha wasnt removed
        let authorizedCompaniesToFront = authorizedCompanies.filter(authorizedCompany => !authorizedCompany._deletedAt);

        // Create authorizedCompany data to return
        authorizedCompaniesToFront = authorizedCompaniesToFront.map(authorizedCompany => {
            return {
                ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
                _id: authorizedCompany._id,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Authorized Companies returned successfully', authorizedCompaniesToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpsResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a authorizedCompany.
 * @param       {object}    queryParams         -required
 * @property    {string}    _id                  -required
 * @property    {string}    name                -required
 * @property    {string}    redirectUri         -required
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

        // Update authorizedCompany data
        const authorizedCompany = await AuthorizedCompany.findByIdAndUpdate(
            queryParams._id,
            {
                ...authorizedCompanyDTO.getAuthorizedCompanyDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create authorizedCompany data to return
        const authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };

        return httpResponse.ok('Authorized Company updated successfuly', authorizedCompanyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Delete a authorizedCompany.
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

        // Delete authorizedCompany by id
        await AuthorizedCompany.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Authorized Company deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.name + ': ' + e.message, {});

    }

};