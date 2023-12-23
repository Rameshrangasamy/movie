const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const covertDirObjectToResponseObject = dirObject => {
  return {
    directorId: dirObject.director_id,
    directorName: dirObject.director_name,
  }
}

// Get movies API

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie
    ORDER BY 
    movie_id;`

  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

// Post movie API

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    ( ${directorId}, "${movieName}", '${leadActor}');`

  const addMovie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

// Get movie API

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT 
    * 
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};`
  const newMovie = await db.get(getMovieQuery)
  response.send(convertDbObjectToResponseObject(newMovie))
})

// Put movie API

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor= '${leadActor}'
  WHERE
    movie_id = ${movieId};`

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// Delete movie API

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// GET directors API

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director
    ORDER BY 
    director_id;`

  const directorsArray = await db.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      covertDirObjectToResponseObject(eachDirector),
    ),
  )
})

// GET movie with directorId API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesQuery = `
    SELECT 
    movie_name
    FROM 
    movie
    WHERE 
    director_id = ${directorId};`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app;
