exports.getAclDTO = (data) => {
    return {
        name: data.name,
        projectId: data.projectId,
        permissions: data.permissions,
    }
};