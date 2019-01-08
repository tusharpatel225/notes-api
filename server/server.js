require('./config/config');
const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongodb.js');
const {note} = require('./models/notes.js');
const {user} = require('./models/users.js');
const {bioData} = require('./models/bioData')
const {authenticate} = require('./middleware/authenticate.js');
const express  = require('express');
const bodyParser  = require('body-parser');
const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("Service started at port : "+port);
});
app.get('/notes', authenticate, (req, res) => {
  note.find({_creator : req.user._id}).then((notes) => {
    res.send({notes});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/notes/:id', authenticate, (req, res) => {
  if(!ObjectID.isValid(req.param("id")))
    return res.status(400).send("Invalid id : "+req.param("id"));
  note.findOne({
    _id : req.params.id,
    _creator : req.user._id
  }).then((note) => {
    if(note)
      res.send({note});
    else
      return res.status(400).send("Not Found");
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.delete('/notes', authenticate, (req, res) => {
  if(!ObjectID.isValid(req.param("id")))
    return res.status(400).send("Invalid id : "+req.param("id"));
  note.findOneAndRemove(
    {
      _id: req.param("id"),
      _creator : req.user._id
    }).then((note) => {
    res.send({note});
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.post('/note/', authenticate, (req, res) => {
  if(!ObjectID.isValid(req.body._id))
    return res.status(400).send("Invalid id : "+req.body._id);
  if(!req.body.title&&!req.body.body)
    return res.status(400).send("Body or Title is require");
  note.findOneAndUpdate(
    {
      _id : req.body._id,
      _creator : req.user._id
    },
    {
      $set:{title : req.body.title, body : req.body.body}
    },{returnNewDocument:true}).then((note) => {
    res.send({note});
  }, (e) => {
    return res.status(400).send(e);
  });
});
app.post('/notes', authenticate, (req, res) => {
  var n1 = new note(
    {
      title : req.body.title,
      body : req.body.body,
      _creator : req.user._id
    }
  );
  n1.save().then((row) => {
    res.send(row);
  }, (err) => {
    res.send(err);
  });
});

app.post('/users', (req, res) => {
  if(!req.body.email&&!req.body.password)
    return res.status(400).send("email or password is require");
  var u = new user(
    {
      email : req.body.email,
      password : req.body.password
    }
  );
  u.save()
  .then(() => {
    return u.generateAuthToken();
  })
  .then((token) => {
      res.send({token:token});
  })
  .catch((err) => {
    res.status(400).send(err);
  })

 });

 app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
 });

 app.post('/users/login', (req, res) => {
   user.findByCrerdentials(req.body.email, req.body.password).then((u) => {
     return u.generateAuthToken().then((token) => {
       res.send({token:token});
     });
   })
   .catch((err) => {
      res.status(401).send(err);
   });
 });

app.delete('/users/logout', authenticate, (req, res) => {
    console.log(req.params);
  req.user.removeToken(req.param('token')).then(() => {
    res.status(200).send();
  }, () => {
    res.status(401).send();
  });
});
app.post('/users/bioData', authenticate, (req, res) => {
  let b = new bioData(
      {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        gen : req.body.gen,
        address : req.body.address,
        dob : req.body.dob,
        countryId : req.body.countryId,
        stateId : req.body.stateId,
        city : req.body.city,
        mno : req.body.mno,
        hobby : req.body.hobby,
        _creator : req.user._id
      }
  );
    bioData.findOne({
        _creator : req.user._id
    }).then((data) => {
        if(data){
            bioData.findOneAndUpdate(
                {
                    _id : data._id,
                    _creator : req.user._id
                },
                {
                    $set:{
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        gen : req.body.gen,
                        address : req.body.address,
                        dob : req.body.dob,
                        countryId : req.body.countryId,
                        stateId : req.body.stateId,
                        city : req.body.city,
                        mno : req.body.mno,
                        hobby : req.body.hobby,
                    }
                },{returnNewDocument:true}).then((note) => {
                res.send({note});
            }, (e) => {
                return res.status(400).send(e);
            });
        }
        else
        {
            b.save().then((row) => {
                res.send(row);
            }, (err) => {
                res.status(400).send(err);
            });
        }
    }).catch((err)=>{
        console.log(err);
    });

});
app.get('/users/bioData', authenticate, (req, res) => {
  bioData.findOne({
    _creator : req.user._id
  }).then((data) => {
    if(data)
      res.send({data});
  }).catch( (e) => {
    return res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`server start at port ${port}`);
});
