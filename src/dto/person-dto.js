exports.getPersonDTO = (data) => {
    return {
        idNumber: data.idNumber,
        country: data.country,
        fullname: data.fullname,
        username: data.username,
        mothersName: data.mothersName,
        birthDate: data.birthDate,
    }
};