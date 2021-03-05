// Modules
const jwt = require('jsonwebtoken');

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
 * @property    {string}    jwtsecret           -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
registerUserAndAuthorizeCompany = async (queryParams, connectionParams) => {

    try {

        // Authenticate user
        let user = await authController.register({
            idNumber: queryParams.idNumber,
            birthDate: queryParams.birthDate,
            email: queryParams.email,
            password: queryParams.password,
            jwtsecret: queryParams.jwtsecret
        }, {
            connectionString: connectionParams.connectionString
        });

        if (user.code !== 200) {
            throw {
                message: user.message
            }
        } else {

            // Authorize client
            return loginUserAndAuthorizeCompany(queryParams, connectionParams);

        }

    } catch (e) {
        return e.message;
    }

}

/**
 * Login user and authorize company.
 * @param       {object}    queryParams         -required
 * @property    {string}    jwtsecret           -required
 * @property    {string}    clientId            -required
 * @param       {string}    email               -required
 * @param       {string}    password            -required
 * @param       {object}    connectionParams    -required
 * @property    {string}    connectionString    -required
 */
loginUserAndAuthorizeCompany = async (queryParams, connectionParams) => {

    try {

        // Authenticate user
        let auth = await authController.login({
            email: queryParams.email,
            password: queryParams.password,
            jwtsecret: queryParams.jwtsecret
        }, {
            connectionString: connectionParams.connectionString
        });

        if (auth.code !== 200) {
            throw {
                message: auth.message
            }
        } else {

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
            let authorizedCompany = await authorizedCompanyController.readOneById({
                id: queryParams.clientId
            }, {
                connectionString: connectionParams.connectionString
            })
            if (authorizedCompany.data.name) {
                let userToUpdate = user.data;

                // @todo Check if company has already authorized
                let authorizedCompanies = (userToUpdate['authorizedCompanies'] || []);
                if (!authorizedCompanies.includes(authorizedCompany.data._id))
                    userToUpdate['authorizedCompanies'] = [...authorizedCompanies, authorizedCompany.data._id];

                let userUpdated = await userController.update(
                    userToUpdate, {
                        connectionString: connectionParams.connectionString
                    }
                )

                if (userUpdated.code === 200) {
                    return {
                        "autentikigo-token": auth.data.authentication_token,
                        "redirectUri": authorizedCompany.data.redirectUri
                    }
                }

            } else {
                throw {
                    message: 'Client does not exist. Check your client Id'
                }
            }

        }

    } catch (e) {
        return e.message;
    }
}

/**
 * Authorize company of a logged user
 * @param       {object}    queryParams             -required
 * @property    {string}    jwtsecret               -required
 * @property    {string}    clientId                -required
 * @property    {string}    authentication_token    -required
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
authorizeCompany = async (queryParams, connectionParams) => {
    try {
        // Get user id in jwt
        let jwt_claim = await jwt.verify(queryParams.authentication_token, queryParams.jwtsecret);
        let user_id = jwt_claim.id;

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
        let authorizedCompany = await authorizedCompanyController.readOneById({
            id: queryParams.clientId
        }, {
            connectionString: connectionParams.connectionString
        })
        if (authorizedCompany.data.name) {
            let userToUpdate = user.data;

            // @todo Check if company has already authorized
            let authorizedCompanies = (userToUpdate['authorizedCompanies'] || []);
            if (!authorizedCompanies.includes(authorizedCompany.data._id))
                userToUpdate['authorizedCompanies'] = [...authorizedCompanies, authorizedCompany.data._id];

            let userUpdated = await userController.update(
                userToUpdate, {
                    connectionString: connectionParams.connectionString
                }
            )
            if (userUpdated.code === 200) {
                return {
                    "redirectUri": authorizedCompany.data.redirectUri
                }
            }

        } else {
            throw {
                message: 'Client does not exist. Check your client Id'
            }
        }
    } catch (e) {
        return e.message;
    }
}

/**
 * Get user info
 * @param       {object}    queryParams             -required
 * @property    {string}    jwtsecret               -required
 * @property    {string}    clientId                -required
 * @property    {string}    authentication_token    -required
 * @param       {object}    connectionParams        -required
 * @property    {string}    connectionString        -required
 */
getUserInfo = async (queryParams, connectionParams) => {
    try {
        // Get user id in jwt
        let jwt_claim = await jwt.verify(queryParams.authentication_token, queryParams.jwtsecret);
        let user_id = jwt_claim.id;

        // Get user info
        let user = await userController.readOneByIdNumber({
            id: user_id
        }, {
            connectionString: connectionParams.connectionString
        });

        // Transform authorized companies in array of objectId
        user.data.authorizedCompanies = (user.data.authorizedCompanies || []).map(el => el._id);

        // Authorize client
        let authorizedCompany = await authorizedCompanyController.readOneById({
            id: queryParams.clientId
        }, {
            connectionString: connectionParams.connectionString
        })
        
        if (authorizedCompany.data.name) {

            // Check if company has authorization
            let authorizedCompanies = (user.data.authorizedCompanies || []);
            if (!authorizedCompanies.includes(authorizedCompany.data._id)) {
                throw {
                    message: 'Client has no authorization to get user info',
                }
            }

            if (user.code === 200) {
                return {
                    "userInfo": personDTO.getPersonDTO(user.data.personInfo)
                }
            }

        } else {
            throw {
                message: 'Client does not exist. Check your client Id'
            }
        }
    } catch (e) {
        return e.message;
    }
}

module.exports = {
    registerUserAndAuthorizeCompany,
    loginUserAndAuthorizeCompany,
    authorizeCompany,
    getUserInfo,
}