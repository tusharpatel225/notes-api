var mongoose = require('mongoose');
var note = mongoose.model('note', {
  title : {
    type : String,
    trim : true,
    minlength : 1
   },
  body : {
    type : String,
    required : true
  },
  _creator : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  }
});

module.exports = {note};
