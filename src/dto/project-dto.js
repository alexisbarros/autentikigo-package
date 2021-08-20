exports.getProjectDTO = (data) => {
    return {
        name: data.name,
        path: data.path,
        tokenTtl: data.tokenTtl,
    }
};