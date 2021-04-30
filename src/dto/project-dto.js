exports.getProjectDTO = (data) => {
    return {
        name: data.name,
        redirectUri: data.redirectUri,
    }
};