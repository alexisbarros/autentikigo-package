exports.getCompaniesDTO = (data) => {
    return {
        uniqueId: data.uniqueId.replace(/\D/g, ''),
        username: data.username,
        companyName: data.companyName,
        fantasyName: data.fantasyName,
        responsible: data.responsible,
        address: data.address,
        country: data.country,
        simples: data.simples,
        phones: data.phones,
        situation: data.situation,
        legalNature: data.legalNature,
        cnae: data.cnae,
        birthday: data.birthday,
    }
};