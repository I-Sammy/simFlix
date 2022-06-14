const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
//app.use(cors()); //allows all origins
//to allow only selected origins
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234',
'https://simflix1.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies =  Models.Movie;
const Users = Models.User;

/*mongoose.connect('mongodb://localhost:27017/simFlixDB',
  { useNewUrlParser: true, useUnifiedTopology: true });*/
  mongoose.connect(process.env.CONNECTION_URI
  ,{ useNewUrlParser: true, useUnifiedTopology: true });


app.use (morgan('common')); //log all request on terminal
app.use(express.static('public')); // serve all static file in public folder

//Get index request/route
app.get('/', (req, res) =>{
  res.send('Welcome to the Movie World!'); //respond to index route
});

//Get documentation request/route
app.get('/documentation', (req, res) => {
  res.sendFile ('public/documentation.html', {root: __dirname }); //respond through express.static
});

//Add a new user
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 3}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
], (req, res) => {
    //Validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(422).json({errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' Already exists');
      } else {
        Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Read All User information
app.get('/users',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Read user info by username
app.get('/users/:Username',passport.authenticate('jwt', { session: false }),(req,res)=>{
  Users.findOne({Username: req.params.Username})
    .then((user)=>{
      res.json(user);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+err);
    });
});

//Update user info by Username
app.put("/users/:Username", passport.authenticate('jwt', { session: false }),// Validation logic
  [
    check('Username', 'Username is required (min 3 characters).').isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric()
  ], (req, res) => {
    // Check validation object for errors
    let errors = validationResult(req);
    let hashedPassword = undefined;

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // If Password is given in request body, create hashedPassword from given Password
    if(req.body.hasOwnProperty('Password')){
      hashedPassword = Users.hashPassword(req.body.Password);
    }
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        BirthDate: req.body.BirthDate
      }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error" + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});



//Get a detailed list of all movies
//temporarily deactivated token
app.get('/movies', passport.authenticate('jwt', { session: false }),(req, res) =>{
  Movies.find()
  .then((movies)=>{
    res.status(201).json(movies);
  })
  .catch((err)=>{
    res.status(500).send('Error: '+err);
  });
});

//Get data about a movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.findOne({Title:req.params.title})
  .then((movie)=>{
    res.status(201).json(movie);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: '+ err)
  });
});

//Get genre details by genre name
app.get('/genres/:genrename', passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.findOne({"Genre.Name": req.params.genrename})
  .then((movie)=>{
    res.status(201).json(movie.Genre);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: '+err);
  });
});

//Get data about a director by name
app.get('/directors/:Directorname',passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({"Director.Name": req.params.Directorname})
    .then((movie)=>{
      res.json(movie.Director)
    })
    .catch((err)=>{
      res.status(500).send('Error: '+err);
    });
});


//Delete the user profile
app.delete("/users/:deleteUser", passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndRemove({ Username: req.params.deleteUser })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error" + err);
    });
});

//add movie to favorite list of an user
app.post("/users/:Username/:movieid", passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.movieid }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(error.response.data);
        console.error(err);
        res.status(500).send("Error" + err);

      } else {
        console.log("sending array info");
        res.json(updatedUser);
      }
    }
  );
});

//delete a movie from a specific user's favorite list
app.delete("/users/:Username/:movieid", passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.movieid }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error" + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});


/*app.use(express.static('public', {
    extensions: ['html'],
}));*/
//Create error handler
app.use((err, req, res, next) => {
  console.error(err.stack); //log all caught error to terminal
  res.status(500).send('An error has been found!'+err);
  next();
});

//Listen to requests on port 8080
/*app.listen(8080, () =>{
  console.log('This app is listening on port 8080.');
});*/
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
