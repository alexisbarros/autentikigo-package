const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let AuthorizedCompanySchema = new Schema({

    name: {
        type: String,
        required: true,
    },

    redirectUri: {
        type: String,
        required: true,
        match: [
            /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/,
            'Please fill a valid email address'
        ],
    },

    secret: {
        type: String,
        required: true
    },

    _createdAt: {
        type: Date,
        required: true,
        default: () => {
            if (!this._createdAt) {
                return Date.now();
            }
        },
    },

    _updatedAt: {
        type: Date,
        required: true,
        default: () => {
            if (!this._updatedAt) {
                return Date.now();
            }
        },
    },

    _deletedAt: {
        type: Date,
        required: false,
        default: null
    },

}, {
    collection: 'AuthorizedCompanies',
});

module.exports = mongoose.model('AuthorizedCompany', AuthorizedCompanySchema);