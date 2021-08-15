// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const Company = require('../models/companies.model');

// DTO
const companyDTO = require('../dto/companies-dto');

/**
 * Register company in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    uniqueId            -required
 * @property    {string}    username            -required
 * @property    {string}    companyName         -required
 * @property    {string}    fantasyName         -required
 * @property    {object}    responsible         -required
 * @property    {object}    address             -required
 * @property    {string}    country             -required
 * @property    {object}    simples             -required
 * @property    {object}    phones              -required
 * @property    {object}    situation           -required
 * @property    {object}    legalNature         -required
 * @property    {object}    cnae                -required
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

        // Create company in database
        const company = await Company.create(companyDTO.getCompaniesDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create company data to return
        const companyToFront = {
            ...companyDTO.getCompaniesDTO(company),
            _id: company._id,
            _createdBy: company._createdBy,
            _ownedBy: company._ownedBy,
        };

        return httpResponse.ok('Company created successfuly', companyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Get one company by uniqueId.
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

        // Get company by uniqueId
        const company = await Company.findOne({
            $and: [
                { uniqueId: queryParams.uniqueId },
                { _deletedAt: null }
            ]
        });

        if (!company) throw new Error('Company not found');

        // Create company data to return
        const companyToFront = {
            ...companyDTO.getCompaniesDTO(company),
            _id: company._id,
            _createdBy: company._createdBy,
            _ownedBy: company._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Company returned successfully', companyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Get one company by username.
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

        // Get company by username
        const company = await Company.findOne({
            $and: [
                { username: queryParams.username },
                { _deletedAt: null }
            ]
        });

        if (!company) throw new Error('Company not found');

        // Create company data to return
        const companyToFront = {
            ...companyDTO.getCompaniesDTO(company),
            _id: company._id,
            _createdBy: company._createdBy,
            _ownedBy: company._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Company returned successfully', companyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

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
        const people = await Company.find({
            _deletedAt: null
        });

        if (!people.length) throw new Error('People not found');

        // Create company data to return
        const peopleToFront = people.map(company => {
            return {
                ...companyDTO.getCompaniesDTO(company),
                _id: company._id,
                _createdBy: company._createdBy,
                _ownedBy: company._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('People returned successfully', peopleToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Update a company.
 * @param       {object}    queryParams         -required
 * @property    {string}    _id                  -required
 * @property    {string}    uniqueId            -required
 * @property    {string}    username            -required
 * @property    {string}    companyName         -required
 * @property    {string}    fantasyName         -required
 * @property    {object}    responsible         -required
 * @property    {object}    address             -required
 * @property    {string}    country             -required
 * @property    {object}    simples             -required
 * @property    {object}    phones              -required
 * @property    {object}    situation           -required
 * @property    {object}    legalNature         -required
 * @property    {object}    cnae                -required
 * @property    {date}      birthday            -required
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

        // Update company data
        const company = await Company.findByIdAndUpdate(
            queryParams._id,
            {
                ...companyDTO.getCompaniesDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create company data to return
        const companyToFront = {
            ...companyDTO.getCompaniesDTO(company),
            _id: company._id,
            _createdBy: company._createdBy,
            _ownedBy: company._ownedBy,
        };

        return httpResponse.ok('Company updated successfuly', companyToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Delete a company.
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

        // Delete company by id
        await Company.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Company deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Create username.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
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
        const companiesWithSameUsername = await Company.find({
            username: { $regex: "^" + usernamePrefix }
        });

        // Create username
        const username = `${usernamePrefix}${companiesWithSameUsername.length}`

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Username created', { username: username });

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};