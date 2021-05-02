const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const permissionSchema = new Schema({

    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module'
    },

    actions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AclAction'
        },
    ],

});

const AclSchema = new Schema({

    name: {
        type: String,
        required: true,
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    permissions: [
        permissionSchema,
    ],

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
    collection: 'ACL',
});

module.exports = mongoose.model('Acl', AclSchema);