// Modules
const mongoose = require('mongoose');
const httpResponse = require('../utils/http-response');

// Model
const Project = require('../models/projects.model');

// DTO
const projectDTO = require('../dto/project-dto');

/**
 * Register project in db.
 * @param       {object}    queryParams         -required
 * @property    {string}    name                -required
 * @property    {string}    description         -required
 * @property    {string}    site                -required
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

        // Create project in database
        const project = await Project.create(projectDTO.getProjectDTO(queryParams));

        // Disconnect to database
        await mongoose.disconnect();

        // Create project data to return
        const projectToFront = {
            ...projectDTO.getProjectDTO(project),
            _id: project._id,
            _createdBy: project._createdBy,
            _ownedBy: project._ownedBy,
        };

        return httpResponse.ok('Project created successfuly', projectToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Get one project by id.
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

        // Get project by id
        const project = await Project.findById(queryParams.id).and([{ _deletedAt: null }]);

        if (!project) throw new Error('Project not found');

        // Create project data to return
        const projectToFront = {
            ...projectDTO.getProjectDTO(project),
            _id: project._id,
            _createdBy: project._createdBy,
            _ownedBy: project._ownedBy,
        };

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Project returned successfully', projectToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

}

/**
 * Get all projects.
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

        // Get all projects
        const projects = await Project.find({ _deletedAt: null });

        if (!projects.length) throw new Error('Projects not found');

        // Create project data to return
        const projectsToFront = projects.map(project => {
            return {
                ...projectDTO.getProjectDTO(project),
                _id: project._id,
                _createdBy: project._createdBy,
                _ownedBy: project._ownedBy,
            };
        });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Projects returned successfully', projectsToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpsResponse.error(e.name + ': ' + e.message, {});

    }

};

/**
 * Update a project.
 * @param       {object}    queryParams         -required
 * @property    {string}    id                  -required
 * @property    {string}    name                -required
 * @property    {string}    descriptioin        -required
 * @property    {string}    site                -required
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

        // Update project data
        const project = await Project.findByIdAndUpdate(
            queryParams.id,
            {
                ...projectDTO.getProjectDTO(queryParams),
                _updatedAt: Date.now(),
            }
        );

        // Disconnect to database
        await mongoose.disconnect();

        // Create project data to return
        const projectToFront = {
            ...projectDTO.getProjectDTO(project),
            _id: project._id,
            _createdBy: project._createdBy,
            _ownedBy: project._ownedBy,
        };

        return httpResponse.ok('Project updated successfuly', projectToFront);

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};

/**
 * Delete a project.
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

        // Delete project by id
        await Project.findByIdAndUpdate(queryParams.id, { _deletedAt: Date.now() });

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.ok('Project deleted successfuly', {});

    } catch (e) {

        // Disconnect to database
        await mongoose.disconnect();

        return httpResponse.error(e.message, {});

    }

};