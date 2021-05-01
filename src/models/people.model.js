const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PersonSchema = new Schema({

    uniqueId: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: false,
        default: 'br',
    },

    name: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
    },

    mother: {
        type: String,
        required: true,
    },

    gender: {
        type: String,
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
    collection: 'Person',
});

module.exports = mongoose.model('Person', PersonSchema);