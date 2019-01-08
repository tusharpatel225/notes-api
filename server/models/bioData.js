const mongoose = require('mongoose');
const bioData = mongoose.model('bioData', {
    _creator : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        unique : true
    },
    firstName : {
        type : String,
        trim : true,
        minlength : 1,
        required : true
    },
    lastName : {
        type : String,
        trim : true,
        minlength : 1,
        required : true
    },
    gen : {
        type : String,
        minlength : 1,
        required : true
    },
    address : {
        type : String,
        trim : true,
        minlength : 1,
        required : true
    },
    dob : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    countryId : {
        type : Number,
        required : true
    },
    stateId : {
        type : Number,
        required : true
    },
    mno : {
        type : String,
        trim : true,
        minlength : 1,
        required : true
    },
    hobby : {
        type : String
    }
});

module.exports = {bioData};