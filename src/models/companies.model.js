const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CompanySchema = new Schema({

    uniqueId: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
    },

    companyName: {
        type: String,
        required: true,
    },

    fantasyName: {
        type: String,
        required: true,
    },

    responsible: {
        type: String,
        required: true,
    },

    address: {
        type: Object,
        required: true,
    },

    country: {
        type: String,
        required: false,
        default: 'br',
    },

    simples: {
        type: Object,
        required: true,
    },

    phones: {
        type: Object,
        required: true,
    },

    situation: {
        type: Object,
        required: true,
    },

    legalNature: {
        type: Object,
        required: true,
    },

    cnae: {
        type: Object,
        required: true,
    },

    birthday: {
        type: Date,
        required: true,
    },

    _createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    _ownedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    collection: 'Company',
});

module.exports = mongoose.model('Company', CompanySchema);