exports.getModuleDTO = (data) => {
    return {
        name: data.name,
        projectId: data.projectId,
        menu: data.menu,
    }
};