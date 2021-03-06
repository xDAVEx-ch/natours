const crypto = require('crypto');
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

    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },

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
            //Only works on create and save. Mongoose doesn't keep the current obj in memory
            //That's why don't use findByIdAndUpdate
            validator: function(element) {
                return element === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type: Boolean,
        default: true,
        select: false
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

userSchema.pre('save', function(next){
    //isNew returns true when documents are new
    //Add passwordChangedAt when password is modified and document isn't new
    if(!this.isModified('password') || this.isNew) return next();

    /* Sometimes the JWT is issue at any moment before our database in MongoDB
        because saving info in Mongo tend to be slow. To correct this problem,
        substracting one second to passwordChangedAt will delay enough to finish
        on time.
    */
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    //this points to the current query

    this.find({ active: {$ne: false} });

    next();
});

userSchema.methods.changesPasswordAfter = function(JWTtimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(JWTtimestamp, changedTimestamp);
        return JWTtimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
}
/* Reset tokens (no JWT) are like passwords. They need encryption and are use to
let users manage their account. */
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
const User = mongoose.model('User', userSchema);

module.exports = User;