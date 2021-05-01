// Modules
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    verified: {
        type: Boolean,
        required: true,
        default: false
    },

    acl: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Acl',
        required: false,
    }

});

// Schema
const UserSchema = new Schema({

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

    projects: [
        projectSchema
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
    collection: 'User',
});

module.exports = mongoose.model('User', UserSchema);