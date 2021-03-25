
/**
 * Check if cpf is valid.
 * @param       {string}    cpf     -required 
 * @returns     {boolean}
 */
const checkCPF = (cpf) => {
    var sum;
    var remainder;

    sum = 0;
    if (cpf == "00000000000") return false;

    if (cpf.length > 11) return false;

    for (i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if ((remainder == 10) || (remainder == 11)) remainder = 0;
    if (remainder != parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if ((remainder == 10) || (remainder == 11)) remainder = 0;
    if (remainder != parseInt(cpf.substring(10, 11))) return false;

    return true;
}

module.exports = {
    checkCPF,
}