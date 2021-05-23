exports.getPeopleDTO = (data) => {
    return {
        uniqueId: data.uniqueId.replace(/\D/g, ''),
        country: data.country,
        name: data.name,
        username: data.username,
        mother: data.mother,
        birthday: data.birthday,
        gender: data.gender,
    }
};