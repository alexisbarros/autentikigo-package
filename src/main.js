// Modules
const httpResponse = require('./utils/http-response');
const checkRequiredParams = require('./utils/check-required-params');

// Controllers
const authController = require('./controllers/auth.controller');
const projectController = require('./controllers/projects.controller');
const userController = require('./controllers/users.controller');

/**
 * Register user
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
register = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['uniqueId', 'birthday', 'email', 'password', 'cpfApiEndpoint', 'cnpjApiEndpoint', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Authenticate user
        const user = await authController.register({
            uniqueId: queryParams.uniqueId,
            birthday: queryParams.birthday,
            email: queryParams.email,
            password: queryParams.password,
            cpfApiEndpoint: queryParams.cpfApiEndpoint,
            cnpjApiEndpoint: queryParams.cnpjApiEndpoint,
        }, {
            connectionString: connectionParams.connectionString
        });

        if (user.code !== 200) throw new Error(user.message);

        return httpResponse.ok('User registered successfully', user.data);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user.
 * @param       {object}    queryParams         -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @property    {string}    projectId           -required
 * @param       {string}    user                -required
 * @param       {string}    password            -required          
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
login = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['user', 'password', 'projectId', 'jwtSecret', 'jwtRefreshSecret', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Authenticate user
        const auth = await authController.login({
            user: queryParams.user,
            password: queryParams.password,
        }, {
            connectionString: connectionParams.connectionString
        });

        if (auth.code !== 200) throw new Error(auth.message);

        // Get user info
        let user = await userController.readOneByUniqueId({
            id: auth.data._id
        }, {
            connectionString: connectionParams.connectionString
        });

        // Check if project has already authorized
        const projects = (user.data.projects || []);
        const project = await projects.find(el => el.projectId._id.toString() === queryParams.projectId);
        if (!project) throw new Error('Project does not have authorization');
        if (!project.verified) throw new Error('User is not verified');

        // Get acl
        const acl = project.acl;

        const authentication_token = await authController.generateNewToken({
            jwtSecret: queryParams.jwtSecret,
            userId: user.data._id,
            acl: acl,
            expiresIn: '10m'
        });

        const authentication_refresh_token = await authController.generateNewToken({
            jwtSecret: queryParams.jwtRefreshSecret,
            userId: user.data._id,
            acl: acl,
            expiresIn: '7d'
        });

        const dataToReturn = {
            "token": authentication_token,
            "refreshToken": authentication_refresh_token,
            "site": project.site
        }

        return httpResponse.ok('Successfull login', dataToReturn);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Authorize project of a logged user
 * @param       {object}    queryParams             -required
 * @property    {string}    projectId                -required
 * @property    {string}    userId                  -required
 * @property    {string}    acl                    
 * @property    {boolean}   verified                    
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
authorizeProject = async (queryParams, connectionParams) => {
    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['projectId', 'userId', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Get user info
        let user = await userController.readOneByUniqueId({
            id: queryParams.userId
        }, {
            connectionString: connectionParams.connectionString
        });

        if (user.code !== 200) throw new Error(user.message);

        // Transform user info and authorized projects in array of objectId
        user.data.personInfo = user.data.personInfo && user.data.personInfo._id;
        user.data.companyInfo = user.data.companyInfo && user.data.companyInfo._id;
        user.data.projects = user.data.projects.map(el => {
            return {
                'projectId': el.projectId._id.toString(),
                'verified': el.verified,
                'acl': el.acl || null,
            }
        });

        // Authorize client
        const project = await projectController.readOneById({
            id: queryParams.projectId
        }, {
            connectionString: connectionParams.connectionString
        })

        if (!project.data.name) throw new Error('Project does not exist. Check your project Id');

        let userToUpdate = user.data;

        // Check if project has already authorized
        const projects = (userToUpdate['projects'] || []);
        if (!projects.some(authorizedProjectByUser => authorizedProjectByUser.projectId === project.data._id.toString())) {
            userToUpdate['projects'] = [
                ...projects,
                {
                    projectId: project.data._id,
                    verified: queryParams.verified || false,
                    acl: queryParams.acl || null,
                }
            ];
        }

        const userUpdated = await userController.update(
            userToUpdate, { connectionString: connectionParams.connectionString },
        );

        if (userUpdated.code !== 200) throw new Error(userUpdated.message);

        const dataToReturn = {
            "site": project.data.site
        };

        return httpResponse.ok('Project authorized', dataToReturn);

    } catch (e) {

        return httpResponse.error(e.name + ': ' + e.message, {});

    }
}

/**
 * Middleware
 * @param       {object}    queryParams         -required
 * @property    {string}    token               -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    userId              -required
 * @property    {string}    projectId           -required
 * @property    {array}     roles               -required
 * @property    {string}    endpoint            -required
 * @property    {string}    method              -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
middleware = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['token', 'jwtSecret', 'userId', 'projectId', 'roles', 'endpoint', 'method', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Check refresh token
        const checkRefreshToken = await authController.tokenIsValid({
            token: queryParams.token,
            jwtSecret: queryParams.jwtSecret
        });
        if (!checkRefreshToken) throw new Error('Refresh token invalid');

        // Get user
        const user = await userController.readOneByUniqueId({
            id: queryParams.userId
        }, {
            connectionString: connectionParams.connectionString
        });

        // Get user role
        const authorizationInfo = user.data.projects.find(el => el.projectId._id.toString() === queryParams.projectId)
        if (!authorizationInfo) throw new Error('User is not authorized');
        if (!authorizationInfo.verified) throw new Error('User is not verified');
        const userRole = authorizationInfo.role;

        // Check if user has authorization to use specific endpoint
        const role = queryParams.roles.find(el => el.group === userRole);
        if (!role) throw new Error('User is not authorized to access this endpoint');
        const permissions = role.permissions;
        let userHasAuthorization = false;
        for (const permission of permissions) {
            if (permission['resource'].slice(-1) === '*') {
                if (
                    queryParams.endpoint.startsWith(permission['resource'].slice(0, -1)) &&
                    permission['methods'].includes(queryParams.method)
                ) userHasAuthorization = true;
            } else {
                if (
                    queryParams.endpoint === permission['resource'] &&
                    permission['methods'].includes(queryParams.method)
                ) userHasAuthorization = true;
            }
        }

        if (!userHasAuthorization) throw new Error('User is not authorized to access this endpoint');

        return httpResponse.ok('User is authorized to access this endpoint', {});

    } catch (e) {
        return httpResponse.error(e.message, {});
    }

}

/**
 * Get user info.
 * @param       {object}    queryParams         -required
 * @property    {string}    token               -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    projectId            -required      
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
getUserInfo = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['token', 'projectId', 'jwtSecret', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Get payload of token
        const payload = await authController.getTokenPayload({
            token: queryParams.token,
            jwtSecret: queryParams.jwtSecret
        });

        // Get user info
        let user = await authController.getUser({
            userId: payload.id,
            projectId: queryParams.projectId,
        }, {
            connectionString: connectionParams.connectionString
        });
        if (!user.data._id) throw new Error('User not found');

        return httpResponse.ok('User info successful returned', user.data);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Generate new token.
 * @param       {object}    queryParams         -required
 * @property    {string}    refreshToken        -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @property    {string}    projectId            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
refreshToken = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['refreshToken', 'projectId', 'jwtRefreshSecret', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Get payload of token
        const payload = await authController.getTokenPayload({
            token: queryParams.refreshToken,
            jwtSecret: queryParams.jwtRefreshSecret
        });


        // Check if user authorized project to get his data
        // Search user
        let user = await userController.readOneByUniqueId({
            id: payload.id
        }, {
            connectionString: connectionParams.connectionString
        });
        if (!user.data._id) throw new Error('User not found');

        // Transform authorized projects in array of objectId
        user.data.projects = (user.data.projects || []).map(el => el.projectId._id.toString());

        // Get authorize project
        const project = await projectController.readOneById({
            id: queryParams.projectId
        }, {
            connectionString: connectionParams.connectionString
        })
        if (!project.data.name) throw new Error('Project does not exist. Check your project Id');

        // Check if project has already authorized
        const projects = (user.data.projects || []);
        if (!projects.includes(project.data._id.toString()))
            throw new Error('Client is not authorized');

        // Check refresh token
        const checkRefreshToken = await authController.tokenIsValid({
            token: queryParams.refreshToken,
            jwtSecret: queryParams.jwtRefreshSecret
        });
        if (!checkRefreshToken) throw new Error('Refresh token invalid');

        const authentication_token = await authController.generateNewToken({
            jwtSecret: queryParams.jwtSecret,
            userId: payload.id,
            acl: payload.acl,
            expiresIn: '10m'
        });

        const authentication_refresh_token = await authController.generateNewToken({
            jwtSecret: queryParams.jwtRefreshSecret,
            userId: payload.id,
            acl: payload.acl,
            expiresIn: '7d'
        });

        const dataToReturn = {
            "token": authentication_token,
            "refreshToken": authentication_refresh_token,
        };

        return httpResponse.ok('User authenticated', dataToReturn);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Generate token to recover password.
 * @param       {object}    queryParams         -required
 * @param       {string}    email               -required
 * @property    {string}    jwtSecret           -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
generateRecoveryPasswordToken = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['email', 'jwtSecret', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Get user
        const user = await userController.readOneByEmail({
            email: queryParams.email
        }, {
            connectionString: connectionParams.connectionString
        });

        if (!user.data.email) throw new Error('User not found');

        // Generate recovery password token
        const recoveryPasswordToken = await authController.generateNewToken({
            jwtSecret: queryParams.jwtSecret,
            userId: user.data._id,
            expiresIn: '10m',
        });

        return httpResponse.ok('password recovery token successfully generated', { recoveryPasswordToken });

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Change password.
 * @param       {object}    queryParams             -required
 * @param       {string}    password                -required
 * @param       {string}    recoveryPasswordToken   -required
 * @property    {string}    jwtSecret               -required
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
changePassword = async (queryParams, connectionParams) => {

    try {

        // Check required params
        checkRequiredParams.checkParams(
            ['password', 'recoveryPasswordToken', 'jwtSecret', 'connectionString'],
            {
                ...queryParams,
                ...connectionParams
            }
        );

        // Check token
        const checkToken = await authController.tokenIsValid({
            token: queryParams.recoveryPasswordToken,
            jwtSecret: queryParams.jwtSecret
        });
        if (!checkToken) throw new Error('Invalid token');

        // Get user id in payload
        const payload = await authController.getTokenPayload({
            token: queryParams.recoveryPasswordToken,
            jwtSecret: queryParams.jwtSecret
        });

        // Change user password
        const user = await userController.updatePassword({
            userId: payload.id,
            password: queryParams.password
        }, {
            connectionString: connectionParams.connectionString
        });

        if (user.code !== 200) throw new Error(user.message);

        return httpResponse.ok('Password update successfuly', {});

    } catch (e) {

        return httpResponse.error(e.message, {});

    }

}

module.exports = {
    register,
    login,
    authorizeProject,
    middleware,
    getUserInfo,
    refreshToken,
    generateRecoveryPasswordToken,
    changePassword,
}