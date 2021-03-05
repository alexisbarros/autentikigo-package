// Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
        let data = authorizedCompanyDTO.getAuthorizedCompanyDTO(queryParams);
        data['secret'] = hashedSecret;
        let authorizedCompany = await AuthorizedCompany.create(data);
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create authorizedCompany data to return
        let authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };
        
        console.info('Authorized Company created successfuly');
        return({
            data: authorizedCompanyToFront,
            message: 'Authorized Company created successfuly',
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
        let authorizedCompany = await AuthorizedCompany.findById(queryParams.id);
        
        // Check if authorizedCompany was removed
        if(authorizedCompany._deletedAt) throw { message: 'Authorized Company removed' };

        // Create authorizedCompany data to return
        let authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };
        
        // Disconnect to database
        await mongoose.disconnect();
        
        console.info('Authorized Company returned successfully');
        return({
            data: authorizedCompanyToFront,
            message: 'Authorized Company returned successfully',
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
        let authorizedCompanies = await AuthorizedCompany.find({});

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
        
        console.info('Authorized Companies returned successfully');
        return({
            data: authorizedCompaniesToFront,
            message: 'Authorized Companies returned successfully',
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
        let authorizedCompany = await AuthorizedCompany.findByIdAndUpdate(
            queryParams._id,
            {
                ...authorizedCompanyDTO.getAuthorizedCompanyDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create authorizedCompany data to return
        let authorizedCompanyToFront = {
            ...authorizedCompanyDTO.getAuthorizedCompanyDTO(authorizedCompany),
            _id: authorizedCompany._id,
        };
        
        console.info('Authorized Company updated successfuly');
        return({
            data: authorizedCompanyToFront,
            message: 'Authorized Company updated successfuly',
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
    
        console.info('Authorized Company deleted successfuly');
        return({
            data: {},
            message: 'Authorized Company deleted successfuly',
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