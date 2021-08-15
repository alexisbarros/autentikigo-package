// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const AclAction = require('../models/acl-actions.model');

// DTO
const aclActionDTO = require('../dto/acl-actions-dto');

/**
 * Register acl action in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
 * @property    {string}    description         -required
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

        // Create acl action in database
        const aclAction = await AclAction.create(aclActionDTO.getAclActionDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create acl action data to return
        const aclActionToFront = {
            ...aclActionDTO.getAclActionDTO(aclAction),
            _id: aclAction._id,
            _createdBy: aclAction._createdBy,
            _ownedBy: aclAction._ownedBy,
        };

        return httpResponse.ok('ACL action created successfuly', aclActionToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Get one aclAction by id.
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

        // Get aclAction by id
        const aclAction = await AclAction.findById(queryParams.id).and([{ _deletedAt: null }]);

        if (!aclAction) throw new Error('ACL action not found');

        // Create aclAction data to return
        const aclActionToFront = {
            ...aclActionDTO.getAclActionDTO(aclAction),
            _id: aclAction._id,
            _createdBy: aclAction._createdBy,
            _ownedBy: aclAction._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('AclAction returned successfully', aclActionToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Get all aclActions.
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

        // Get all aclActions
        const aclActions = await AclAction.find({ _deletedAt: null });

        if (!aclAction.length) throw new Error('ACL action not found');

        // Create aclAction data to return
        const aclActionsToFront = aclActions.map(aclAction => {
            return {
                ...aclActionDTO.getAclActionDTO(aclAction),
                _id: aclAction._id,
                _createdBy: aclAction._createdBy,
                _ownedBy: aclAction._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('AclActions returned successfully', aclActionsToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpsResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a aclAction.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @property    {string}    name                -required
 * @property    {string}    description         -required
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

        // Update aclAction data
        const aclAction = await AclAction.findByIdAndUpdate(
            queryParams.id,
            {
                ...aclActionDTO.getAclActionDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create aclAction data to return
        const aclActionToFront = {
            ...aclActionDTO.getAclActionDTO(aclAction),
            _id: aclAction._id,
            _createdBy: aclAction._createdBy,
            _ownedBy: aclAction._ownedBy,
        };

        return httpResponse.ok('AclAction updated successfuly', aclActionToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Delete a aclAction.
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

        // Delete aclAction by id
        await AclAction.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('AclAction deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};