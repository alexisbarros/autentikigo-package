exports.getProjectDTO = (data) => {
    return {
        name: data.name,
        description: data.description,
        site: data.site,
    }
};