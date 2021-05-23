exports.getUserDTO = (data) => {
    return {
        email: data.email,
        type: data.type,
        personInfo: data.personInfo,
        companyInfo: data.companyInfo,
        projects: data.projects,
    }
};