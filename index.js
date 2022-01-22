const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies =  Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/simFlixDB',
  { useNewUrlParser: true, useUnifiedTopology: true });


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
app.post('/users',(req,res) => {
    Users.findOne({Username: req.body.Username})
      .then((user) => {
        if(user){
          return res.status(400).send(req.body.Username + 'Username already exists.');
        }
        else{
          Users.create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            BirthDate: req.body.BirthDate
          })
          .then((user)=> {
            res.status(201).json(user);
          })
          .catch((error)=>{
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
        }
      })
      .catch((error)=> {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

//Read All User information
app.get('/users', (req, res) => {
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
app.get('/users/:Username',(req,res)=>{
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
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
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
app.get('/movies', (req, res) =>{
  Movies.find()
  .then((movies)=>{
    res.status(201).json(movies);
  })
  .catch((err)=>{
    res.status(500).send('Error: '+err);
  });
});

//Get data about a movie by title
app.get('/movies/:title', (req, res) => {
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
app.get('/genres/:genrename', (req, res) => {
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
app.get('/directors/:Directorname', (req, res) => {
    Movies.findOne({"Director.Name": req.params.Directorname})
    .then((movie)=>{
      res.json(movie.Director)
    })
    .catch((err)=>{
      res.status(500).send('Error: '+err);
    });
});


//Delete the user profile
app.delete("/users/:deleteUser", (req, res) => {
  Users.findOneAndRemove({ userName: req.params.deleteUser })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.userName + " was not found");
      } else {
        res.status(200).send(req.params.userName + " was deleted");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error" + err);
    });
});

//add movie to favorite list of an user
app.post("/users/:Username/movies/:title", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.title }
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

//delete a movie from a specific user's favorite list
app.delete("/users/:Username/movies/:title", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.title }
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
app.listen(8080, () =>{
  console.log('This app is listening on port 8080.');
});
