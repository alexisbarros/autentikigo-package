// Modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Model
const User = require('../models/users.model');

// DTO
const userDTO = require('../dto/user-dto');

/**
 * Register user in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    type                -required
 * @property    {string}    personInfo
 * @property    {string}    authorizedCompanies
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

        // Encrypt pass
        const hashedPassword = await bcrypt.hash(queryParams.password, 10);

        // Create user in database
        let data = userDTO.getUserDTO(queryParams);
        data['password'] = hashedPassword;
        let user = await User.create(data);
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create user data to return
        let userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };
        
        console.info('User created successfuly');
        return({
            data: userToFront,
            message: 'User created successfuly',
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
 * Get one user by id.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
exports.readOneByIdNumber = async (queryParams, connectionParams) => {

    try {

        // Connect to database
        await mongoose.connect(connectionParams.connectionString, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Get user by idNumber
        let user = await User.findById(queryParams.id)
        .populate('personInfo')
        .populate('authorizedCompanies')
        .exec();
        
        // Check if user was removed
        if(user._deletedAt) throw { message: 'User removed' };

        // Create user data to return
        let userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };
        
        // Disconnect to database
        await mongoose.disconnect();
        
        console.info('User returned successfully');
        return({
            data: userToFront,
            message: 'User returned successfully',
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
 * Get all users.
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
        
        // Get all users
        let users = await User.find({})
        .populate('personInfo')
        .populate('authorizedCompanies')
        .exec();

        // Filter user tha wasnt removed
        let usersToFront = users.filter(user => !user._deletedAt);

        // Create user data to return
        usersToFront = usersToFront.map(user => {
            return {
                ...userDTO.getUserDTO(user),
                _id: user._id,
            };
        });
        
        // Disconnect to database
        await mongoose.disconnect();
        
        console.info('Users returned successfully');
        return({
            data: usersToFront,
            message: 'Users returned successfully',
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
 * Update a user.
 * @param       {object}    queryParams         -required
 * @property    {string}    _id                  -required
 * @property    {string}    email               -required
 * @property    {string}    type                -required
 * @property    {string}    personInfo
 * @property    {string}    authorizedCompanies
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
    
        // Update user data
        let user = await User.findByIdAndUpdate(
            queryParams._id, 
            {
                ...userDTO.getUserDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );
    
        // Disconnect to database
        await mongoose.disconnect();

        // Create user data to return
        let userToFront = {
            ...userDTO.getUserDTO(user),
            _id: user._id,
        };
        
        console.info('User updated successfuly');
        return({
            data: userToFront,
            message: 'User updated successfuly',
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
 * Delete a user.
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
        
        // Delete user by id
        await User.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });
    
        // Disconnect to database
        await mongoose.disconnect();
    
        console.info('User deleted successfuly');
        return({
            data: {},
            message: 'User deleted successfuly',
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