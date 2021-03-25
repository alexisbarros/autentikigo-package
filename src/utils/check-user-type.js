// Modules
const checkCPF = require('./check-cpf');

/**
 * Check if string is a email.
 * @param       {string}        string 
 * @returns 
 */
const isEmail = (string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(string).toLowerCase());
}

/**
 * Verify the type of user.
 * @param       {string}    user 
 * @returns 
 */
const checkUserType = async (user) => {

    if (isEmail(user)) return 'email';

    const userWithoutDots = user.replace(/[.-\s]/g, '');
    if (checkCPF.checkCPF(userWithoutDots)) return 'cpf';

    if (user.includes('_')) return 'username';

    return null;
};

module.exports = {
    checkUserType,
};
