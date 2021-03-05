const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let PersonSchema = new Schema({

    idNumber: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: false,
        default: 'br',
    },

    fullname: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: true,
    },

    mothersName: {
        type: String,
        required: true,
    },

    birthDate: {
        type: Date,
        required: true,
    },
    
    _createdAt: { 
        type: Date,
        required: true,
        default: () => {
            if(!this._createdAt) {            
                return Date.now();
            }
        },
    },

    _updatedAt: { 
        type: Date,
        required: true,
        default: () => {
            if(!this._updatedAt) {            
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

module.exports = mongoose.model('Person', PersonSchema);