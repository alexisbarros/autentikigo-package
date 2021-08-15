// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const Acl = require('../models/acl.model');
require('../models/acl-actions.model');
require('../models/modules.model');

// DTO
const aclDTO = require('../dto/acl-dto');

/**
 * Register acl in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
 * @property    {string}    projectId           -required
 * @property    {array}     permissions         -required
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

        // Create acl in database
        const acl = await Acl.create(aclDTO.getAclDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create acl data to return
        const aclToFront = {
            ...aclDTO.getAclDTO(acl),
            _id: acl._id,
            _createdBy: acl._createdBy,
            _ownedBy: acl._ownedBy,
        };

        return httpResponse.ok('Acl created successfuly', aclToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Get one acl by id.
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

        // Get acl by id
        const acl = await Acl.findById(queryParams.id)
            .and([{ _deletedAt: null }])
            .populate({
                path: 'permissions',
                populate: {
                    path: 'moduleId actions',
                    select: '-_deletedAt -_createdAt -ownerId -_updatedAt -__v'
                }
            })
            .exec();

        if (!acl) throw new Error('ACL not found');

        // Create acl data to return
        const aclToFront = {
            ...aclDTO.getAclDTO(acl),
            _id: acl._id,
            _createdBy: acl._createdBy,
            _ownedBy: acl._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Acl returned successfully', aclToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Get all acls.
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

        // Get all acls
        const acls = await Acl.find({ _deletedAt: null })
            .populate({
                path: 'permissions',
                populate: {
                    path: 'moduleId actions',
                    select: '-_deletedAt -_createdAt -ownerId -_updatedAt -__v'
                }
            })
            .exec();

        if (!acls.length) throw new Error('ACLs not found');

        // Create acl data to return
        const aclsToFront = acls.map(acl => {
            return {
                ...aclDTO.getAclDTO(acl),
                _id: acl._id,
                _createdBy: acl._createdBy,
                _ownedBy: acl._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Acls returned successfully', aclsToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpsResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a acl.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @property    {string}    name                -required
 * @property    {string}    projectId           -required
 * @property    {array}     permissions         -required
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

        // Update acl data
        const acl = await Acl.findByIdAndUpdate(
            queryParams.id,
            {
                ...aclDTO.getAclDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create acl data to return
        const aclToFront = {
            ...aclDTO.getAclDTO(acl),
            _id: acl._id,
            _createdBy: acl._createdBy,
            _ownedBy: acl._ownedBy,
        };

        return httpResponse.ok('Acl updated successfuly', aclToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Delete a acl.
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

        // Delete acl by id
        await Acl.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Acl deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};