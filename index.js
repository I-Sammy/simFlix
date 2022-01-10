const express = require('express');
const morgan = require('morgan');
const app = express();

//Create JSON object
let myMovies = [
  {
    title: 'Lupin',
    director: ['Louis Leterrier',  'Marcela Said'],
    genre: ['Crime', 'Thriller', 'Mystery', 'Drama'],
    releaseYear: 2021
  },
  {
    title: 'How To Get Away With Murder',
    director: ['Bill D\'Elia', 'Shonda Rhimes'],
    genre:['Thriller', 'Mystery', 'Drama', 'Legal'],
    releasedYear: 2014
  },
  {
    title: 'Squid Game',
    director: 'Hwang Dong-hyuk',
    genre: ['Survival', 'Thriller', 'Horror','Drama'],
    releasedYear: 2021
  },
  {
    title: 'Orphan',
    director: 'Jaume Collet-Serra',
    genre: ['Psychological', 'Drama', 'Crime', 'Horror'],
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
    genre: ['Thriller', 'Psychological Thriller'],
    releasedYear: 2018
  },
  {
    title: 'Shutter Island',
    director: 'Martin Scorsese',
    genre:['neo-noir', 'psychological thriller','Medical fiction'],
    releasedYear: 2010
  },
  {
    title: 'Iron Man',
    director: 'Jon Favreau',
    genre: ['Sci-Fi', 'Action', 'Superhero Film',  'Mystery', 'Drama'],
    releasedYear: 2008
  },
  {
    title: 'Maleficent',
    director: 'Robert Stromberg',
    genre: ['Action', 'Dark Fantasy Adventure', 'Thriller', 'Fairytale'],
    releasedYear: 2014
  },
  {
    title: 'Free Guy',
    director: 'Shawn Levy',
    genre: ['Sci-fi', 'Action', 'Comedy'],
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
