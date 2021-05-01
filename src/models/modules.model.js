const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MenuSchema = new Schema({

    name: {
        type: String,
    },

    route: {
        type: String,
    },

    submenu: [
        MenuSchema,
    ]

});

let ModuleSchema = new Schema({

    name: {
        type: String,
        required: true,
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    menu: MenuSchema,

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
    collection: 'Module',
});

module.exports = mongoose.model('Module', ModuleSchema);