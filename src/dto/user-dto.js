exports.getUserDTO = (data) => {
    return {
        _id: data._id,
        email: data.email,
        type: data.type,
        personInfo: data.personInfo,
        companyInfo: data.companyInfo,
        projects: data.projects,
    }
};