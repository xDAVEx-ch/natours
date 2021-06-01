const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must provide a name']
    },
    email: {
        type: String,
        required: [true, 'Must provide a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Must provide a real email']
    },

    photo: String,

    password: {
        type: String,
        required: [true, 'Must provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Must confirm the password'],
        validate: {
            validator: function(element) {
                return element === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: {
        type: Date,
        required: [true, 'No creation date']
    }
});

userSchema.pre('save', async function(next) {
    //isModified() from schema, let us see the modified field
    //We don't want to re-encrypt the password when we update for example email
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    //Won't store this field
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.correctPassword = async function(candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
}

userSchema.methods.changesPasswordAfter = function(JWTtimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(JWTtimestamp, changedTimestamp);
        return JWTtimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
}
const User = mongoose.model('User', userSchema);

module.exports = User;