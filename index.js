const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan');

const app = express();

app.use(bodyParser.json());

//Create JSON object
let myMovies = [
  {
    title: 'Lupin',
    director: 'Louis Leterrier',
    genre: 'Crime',
    releasedYear: 2021
  },
  {
    title: 'How To Get Away With Murder',
    director: 'Bill D\'Elia',
    genre:'Thriller',
    releasedYear: 2014
  },
  {
    title: 'Squid Game',
    director: 'Hwang Dong-hyuk',
    genre: 'Survival',
    releasedYear: 2021
  },
  {
    title: 'Orphan',
    director: 'Jaume Collet-Serra',
    genre: 'Psychological',
    releasedYear: 2009
  },
  {
    title: 'Like A Boss',
    director: 'Miguel Arteta',
    genre: 'Comedy',
    releasedYear: 2020
  },
  {
    title: 'Acrimony',
    director: 'Tyler Perry',
    genre: 'Thriller',
    releasedYear: 2018
  },
  {
    title: 'Shutter Island',
    director: 'Martin Scorsese',
    genre:'neo-noir',
    releasedYear: 2010
  },
  {
    title: 'Iron Man',
    director: 'Jon Favreau',
    genre: 'Sci-Fi',
    releasedYear: 2008
  },
  {
    title: 'Maleficent',
    director: 'Robert Stromberg',
    genre: 'Dark Fantasy Adventure',
    releasedYear: 2014
  },
  {
    title: 'Free Guy',
    director: 'Shawn Levy',
    genre: 'Action',
    releasedYear: 2021
  }
];

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

//Get movies request/route
app.get('/movies', (req, res) =>{
  res.json(myMovies); //return json object containing movies
});

app.use(express.static("public"));

//Get a list of all movies
app.get('/movies', (req, res) => {
  res.status(200).json(myMovies);
});

//Get data about a movie by title
app.get('/movies/:title', (req, res) => {
  res.status(200).json(
    myMovies.find(movie => {
      return movie.title === req.params.title;
    })
  );
});

//Get genre details about a movie by title
app.get('/genres/:genre', (req, res) => {
  res.status(200).json(
    myMovies.find(genre => {
      return genre.genre === req.params.genre;
    })
  );
});

//Get data about a director by name
app.get('/directors/:directorName', (req, res) => {
  res.status(200).json(
    myMovies.find(director => {
      return director.director === req.params.directorName;
    })
  );
});

//Get data about all movies under the given releasd year
app.get('/movies/:releasedYear', (req, res) => {
    res.status(200).json(
      myMovies.find(releasedYear => {
        return movie.releasedYear === req.params.releasedYear;
      })
    );
});

//Add a new user
app.post('/users/:newUser', (req, res) => {
  res.send("Registration complete.");
});
/*app.post('/users/:newUser', (req, res) => {
  let newUser = req.body;

  if (!newUser.name) {
    const message = 'Missing user name in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});*/

//Update user information
app.put("/users/:username", (req, res) => {
  res.send("User Profile Updated");
});
//Delete the user profile
app.delete("/users/:deleteUser", (req, res) => {
  res.send("Profile Deleted!");
});

app.post('/favorite/:movieName', (req, res) => {
    res.send('Movie was added to favorites');
});
app.delete('/favorite/:movieName', (req, res) => {
    res.send('Movie was deleted');
});

/*app.use(express.static('public', {
    extensions: ['html'],
}));*/
//Create error handler
app.use((err, req, res, next) => {
  console.error(err.stack); //log all caught error to terminal
  res.status(500).send('An error has been found!');
  next();
});

//Listen to requests on port 8080
app.listen(8080, () =>{
  console.log('This app is listening on port 8080.');
});
