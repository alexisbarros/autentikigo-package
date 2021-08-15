// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const Module = require('../models/modules.model');

// DTO
const moduleDTO = require('../dto/modules-dto');

/**
 * Register module in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
 * @property    {string}    projectId           -required
 * @property    {object}    menu                -required
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

        // Create module in database
        const module = await Module.create(moduleDTO.getModuleDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create module data to return
        const moduleToFront = {
            ...moduleDTO.getModuleDTO(module),
            _id: module._id,
            _createdBy: module._createdBy,
            _ownedBy: module._ownedBy,
        };

        return httpResponse.ok('Module created successfuly', moduleToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Get one module by id.
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

        // Get module by id
        const module = await Module.findById(queryParams.id).and([{ _deletedAt: null }]);

        if (!module) throw new Error('Module not found');

        // Create module data to return
        const moduleToFront = {
            ...moduleDTO.getModuleDTO(module),
            _id: module._id,
            _createdBy: module._createdBy,
            _ownedBy: module._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Module returned successfully', moduleToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Get all modules.
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

        // Get all modules
        const modules = await Module.find({ _deletedAt: null });

        if (!modules.length) throw new Error('Modules not found');

        // Create module data to return
        const modulesToFront = modules.map(module => {
            return {
                ...moduleDTO.getModuleDTO(module),
                _id: module._id,
                _createdBy: module._createdBy,
                _ownedBy: module._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Modules returned successfully', modulesToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpsResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a module.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @property    {string}    name                -required
 * @property    {string}    projectId           -required
 * @property    {object}    menu                -required
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

        // Update module data
        const module = await Module.findByIdAndUpdate(
            queryParams.id,
            {
                ...moduleDTO.getModuleDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create module data to return
        const moduleToFront = {
            ...moduleDTO.getModuleDTO(module),
            _id: module._id,
            _createdBy: module._createdBy,
            _ownedBy: module._ownedBy,
        };

        return httpResponse.ok('Module updated successfuly', moduleToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Delete a module.
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

        // Delete module by id
        await Module.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Module deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};