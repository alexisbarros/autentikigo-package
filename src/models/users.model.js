// Modules
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let authorizedCompany = new Schema({

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthorizedCompany'
    },

    verified: {
        type: Boolean,
        required: true,
        default: false
    },

    role: {
        type: String,
        required: false,
        default: 'user'
    }

});

// Schema
let UserSchema = new Schema({

    email: {
        type: String,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    password: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true,
        enum: [
            'person',
            'company',
        ],
        default: 'person'
    },

    personInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    },

    authorizedCompanies: [
        authorizedCompany
    ],

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

});

module.exports = mongoose.model('User', UserSchema);