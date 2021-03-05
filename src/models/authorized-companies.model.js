const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

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

// Encrypt secret
AuthorizedCompanySchema.pre('save', async function(next) {
    
    // var authorizedCompany = this;

    // // only hash the secret if it has been modified (or is new)
    // if (!authorizedCompany.isModified('secret')) return next();

    // const hashedSecret = await bcrypt.hash(authorizedCompany.secret, SALT_WORK_FACTOR);

    // authorizedCompany.secret = hashedSecret;

    // next();

    // // generate a salt
    // bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {

    //     if (err) return next(err);

    //     // hash the secret using our new salt
    //     bcrypt.hash(authorizedCompany.secret, salt, function(err, hash) {
    //         if (err) return next(err);

    //         // override the cleartext secret with the hashed one
    //         authorizedCompany.secret = hash;

    //         next();

    //     });

    // });

});

AuthorizedCompanySchema.methods.compareSecret = function(candidatePassword, cb) {
    
    bcrypt.compare(candidatePassword, this.secret, function(err, isMatch) {
        
        if (err) return cb(err);
        
        cb(null, isMatch);

    });

};

module.exports = mongoose.model('AuthorizedCompany', AuthorizedCompanySchema);