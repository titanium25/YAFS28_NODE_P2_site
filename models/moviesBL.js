const restDAL = require('../DAL/restDAL');
const jsonDAL = require('../DAL/jsonDAL');

// File delete
const fs = require('fs')

exports.countMovies = async () => {
    return (await restDAL.count()).data;
}

getMovies = async function () {
    const movies = await restDAL.getAll()
    return movies.data;
}

getMovie = async function (id) {
    const movie = await restDAL.getById(id);
    return movie.data;
}

exports.getMovieList = async (page, size) => {
    const movies = await restDAL.getAll(page, size)
    return await movies.data.map(movie => ({
        _id: movie._id,
        name: movie.name,
        genres: movie.genres,
        premiered: movie.premiered,
        image: movie.image
    }));
}

exports.addMovie = async (obj) => {
    return await restDAL.add(obj);
}

exports.updateMovie = async (id, obj) => {
    return await restDAL.update(id, obj)
}

exports.deleteMovie = async (req) => {
    let msg = `Movie ${req.body.title} deleted successfully`
    if(!req.body.image.startsWith('https://')) {
        try {
            fs.unlinkSync('public' + req.body.image)
            //file removed
        } catch (err) {
            console.error(err)
            msg = err
        }
    }
    await restDAL.delete(req.body.movieId);
    return msg;
}

// ToDo: Not belong in here
exports.permissions = async (id) => {
    let permissionsJSON = await jsonDAL.getPermissions();
    let permissionsDataArr = permissionsJSON.permissionsData;
    return permissionsDataArr.find(perm => perm.id === id);
}

exports.findMovie = async (req) => {
    const title = req.body.title.toLowerCase()
    const allMoviesAPI = await restDAL.search()

    return allMoviesAPI.data.filter(movie =>
        (movie.name.toLowerCase().includes(title) || title === '')
    )
}

exports.getGenres = async function () {
    const response = await jsonDAL.getGenres();
    return response.genres.sort()
}