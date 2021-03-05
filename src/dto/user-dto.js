exports.getUserDTO = (data) => {
    return {
        email: data.email,
        type: data.type,
        personInfo: data.personInfo,
        authorizedCompanies: data.authorizedCompanies,
    }
};