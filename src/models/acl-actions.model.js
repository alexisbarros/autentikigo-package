const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AclActionSchema = new Schema({

    name: {
        type: String,
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
    collection: 'ACLAction',
});

module.exports = mongoose.model('AclAction', AclActionSchema);