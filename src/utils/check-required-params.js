/**
 * Check if required params was set.
 * @param   {array}     requiredFields      -required
 * @param   {object}    params              -required
 */
const checkParams = (requiredFields, params) => {
    requiredFields.forEach(el => {
        if (!params[el]) throw Error(`Param '${el}' is required.`);
    });
};

module.exports = {
    checkParams,
}