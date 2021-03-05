exports.getAuthorizedCompanyDTO = (data) => {
    return {
        name: data.name,
        redirectUri: data.redirectUri,
    }
};