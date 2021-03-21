// Modules
const jwt = require('jsonwebtoken');
const httpResponse = require('./utils/http-response');

// Controllers
const authController = require('./controllers/auth.controller');
const authorizedCompanyController = require('./controllers/authorized-companies.controller');
const userController = require('./controllers/users.controller');

// DTO
const personDTO = require('../src/dto/person-dto');

/**
 * Register user and authorize company
 * @param       {object}    queryParams         -required
 * @property    {string}    idNumber            -required
 * @property    {date}      birthDate           -required
 * @property    {string}    email               -required
 * @property    {string}    password            -required
 * @property    {string}    clientId            -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
register = async (queryParams, connectionParams) => {

    try {

        // Authenticate user
        const user = await authController.register({
            idNumber: queryParams.idNumber,
            birthDate: queryParams.birthDate,
            email: queryParams.email,
            password: queryParams.password,
            jwtSecret: queryParams.jwtSecret,
            jwtRefreshSecret: queryParams.jwtRefreshSecret
        }, {
            connectionString: connectionParams.connectionString
        });

        if (user.code !== 200) throw new Error(user.message);

        // Authorize client
        return login(queryParams, connectionParams);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }

}

/**
 * Login user and authorize company.
 * @param       {object}    queryParams         -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @property    {string}    clientId            -required
 * @param       {string}    email               -required
 * @param       {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
login = async (queryParams, connectionParams) => {

    try {

        // Authenticate user
        const auth = await authController.login({
            email: queryParams.email,
            password: queryParams.password,
            jwtSecret: queryParams.jwtSecret,
            jwtRefreshSecret: queryParams.jwtRefreshSecret,
        }, {
            connectionString: connectionParams.connectionString
        });

        if (auth.code !== 200) throw new Error(auth.message);

        // Get user info
        let user = await userController.readOneByIdNumber({
            id: auth.data._id
        }, {
            connectionString: connectionParams.connectionString
        });

        // Transform user info and authorized companies in array of objectId
        user.data.personInfo = user.data.personInfo._id;
        user.data.authorizedCompanies = (user.data.authorizedCompanies || []).map(el => el._id);

        // Authorize client
        const authorizedCompany = await authorizedCompanyController.readOneById({
            id: queryParams.clientId
        }, {
            connectionString: connectionParams.connectionString
        })

        if (!authorizedCompany.data.name) throw new Error('Client does not exist. Check your client Id');

        let userToUpdate = user.data;

        // Check if company has already authorized
        const authorizedCompanies = (userToUpdate['authorizedCompanies'] || []);
        if (!authorizedCompanies.includes(authorizedCompany.data._id))
            userToUpdate['authorizedCompanies'] = [...authorizedCompanies, authorizedCompany.data._id];

        const userUpdated = await userController.update(
            userToUpdate, { connectionString: connectionParams.connectionString },
        );

        if (userUpdated.code === 200) {
            const dataToReturn = {
                "token": auth.data.authentication_token,
                "refreshToken": auth.data.authentication_refresh_token,
                "redirectUri": authorizedCompany.data.redirectUri
            }

            return httpResponse.ok('Successfull login and authorize', dataToReturn);
        }

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Authentication middleware.
 * @param       {object}    queryParams         -required
 * @property    {string}    token               -required
 * @property    {string}    refreshToken        -required
 * @property    {string}    jwtSecret           -required
 * @property    {string}    jwtRefreshSecret    -required
 * @property    {string}    clientId            -required
 * @param       {string}    userId              -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
middleware = async (queryParams, connectionParams) => {

    try {

        let dataToReturn = {
            "token": queryParams.token,
            "refreshToken": queryParams.refreshToken,
        }

        // Check token
        const checkToken = await authController.tokenIsValid({
            token: queryParams.token,
            jwtSecret: queryParams.jwtSecret
        });
        if (!checkToken) {

            // Check if user authorized company to get his data
            // Search user
            let user = await userController.readOneByIdNumber({
                id: queryParams.userId
            }, {
                connectionString: connectionParams.connectionString
            });
            if (!user.data._id) throw new Error('User not found');

            // Transform authorized companies in array of objectId
            user.data.authorizedCompanies = (user.data.authorizedCompanies || []).map(el => el._id);

            // Get authorize client
            const authorizedCompany = await authorizedCompanyController.readOneById({
                id: queryParams.clientId
            }, {
                connectionString: connectionParams.connectionString
            })
            if (!authorizedCompany.data.name) throw new Error('Client does not exist. Check your client Id');

            // Check if company has already authorized
            const authorizedCompanies = (user.data.authorizedCompanies || []);
            if (!authorizedCompanies.includes(authorizedCompany.data._id))
                throw new Error('Client is not authorized');

            // Check refresh token
            const checkRefreshToken = await authController.tokenIsValid({
                token: queryParams.refreshToken,
                jwtSecret: queryParams.jwtRefreshSecret
            });
            if (!checkRefreshToken) throw new Error('Refresh token invalid');

            const authentication_token = await authController.generateNewToken({
                jwtSecret: queryParams.jwtSecret,
                userId: queryParams.userId,
                expiresIn: '10m'
            });

            const authentication_refresh_token = await authController.generateNewToken({
                jwtSecret: queryParams.jwtRefreshSecret,
                userId: queryParams.userId,
                expiresIn: '7d'
            });

            dataToReturn = {
                "token": authentication_token,
                "refreshToken": authentication_refresh_token,
            };

        }

        return httpResponse.ok('User authenticated', dataToReturn);

    } catch (e) {

        return httpResponse.error(e.message, {});

    }
}

/**
 * Authorize company of a logged user
 * @param       {object}    queryParams             -required
 * @property    {string}    jwtSecret               -required
 * @property    {string}    clientId                -required
 * @property    {string}    authentication_token    -required
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
authorizeCompany = async (queryParams, connectionParams) => {
    try {
        // Get user id in jwt
        const jwt_claim = await jwt.verify(queryParams.authentication_token, queryParams.jwtSecret);
        const user_id = jwt_claim.id;

        // Get user info
        let user = await userController.readOneByIdNumber({
            id: user_id
        }, {
            connectionString: connectionParams.connectionString
        });

        // Transform user info and authorized companies in array of objectId
        user.data.personInfo = user.data.personInfo._id;
        user.data.authorizedCompanies = (user.data.authorizedCompanies || []).map(el => el._id);

        // Authorize client
        const authorizedCompany = await authorizedCompanyController.readOneById({
            id: queryParams.clientId
        }, {
            connectionString: connectionParams.connectionString
        });

        if (!authorizedCompany.data.name) throw new Error('Client does not exist. Check your client Id');

        let userToUpdate = user.data;

        // @todo Check if company has already authorized
        const authorizedCompanies = (userToUpdate['authorizedCompanies'] || []);
        if (!authorizedCompanies.includes(authorizedCompany.data._id))
            userToUpdate['authorizedCompanies'] = [...authorizedCompanies, authorizedCompany.data._id];

        const userUpdated = await userController.update(
            userToUpdate, { connectionString: connectionParams.connectionString }
        );

        if (userUpdated.code === 200) {
            const dataToReturn = {
                "redirectUri": authorizedCompany.data.redirectUri
            };

            return httpResponse.ok('Company authorized', dataToReturn);
        }

    } catch (e) {

        return httpResponse.error(e.name + ': ' + e.message, {});

    }
}

/**
 * Get user info
 * @param       {object}    queryParams             -required
 * @property    {string}    jwtSecret               -required
 * @property    {string}    clientId                -required
 * @property    {string}    authentication_token    -required
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
getUserInfo = async (queryParams, connectionParams) => {
    try {
        // Get user id in jwt
        const jwt_claim = await jwt.verify(queryParams.authentication_token, queryParams.jwtSecret);
        const user_id = jwt_claim.id;

        // Get user info
        let user = await userController.readOneByIdNumber({
            id: user_id
        }, {
            connectionString: connectionParams.connectionString
        });

        // Transform authorized companies in array of objectId
        user.data.authorizedCompanies = (user.data.authorizedCompanies || []).map(el => el._id);

        // Authorize client
        const authorizedCompany = await authorizedCompanyController.readOneById({
            id: queryParams.clientId
        }, {
            connectionString: connectionParams.connectionString
        })

        if (!authorizedCompany.data.name) throw new Error('Client does not exist. Check your client Id');

        // Check if company has authorization
        const authorizedCompanies = (user.data.authorizedCompanies || []);
        if (!authorizedCompanies.includes(authorizedCompany.data._id)) {
            throw new Error('Client has no authorization to get user info');
        }

        if (user.code === 200) {
            const dataToReturn = {
                "userInfo": personDTO.getPersonDTO(user.data.personInfo)
            };

            return httpResponse.ok('Get user info successfull', dataToReturn);
        }

    } catch (e) {

        return httpResponse.error(e.name + ': ' + e.message, {});

    }
}

module.exports = {
    register,
    login,
    middleware,
    authorizeCompany,
    getUserInfo,
}