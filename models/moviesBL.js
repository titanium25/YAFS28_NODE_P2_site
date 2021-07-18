const restDAL = require('../DAL/restDAL');
const jsonDAL = require('../DAL/jsonDAL');

// File delete
const fs = require('fs')

exports.countMovies = async () => {
    return (await restDAL.count()).data;
}

exports.getMovieList = async (page, size, find) => {
    const movies = await restDAL.getAll(page, size, find)
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

exports.updateMovie = async (req) => {
    const {movieId, title, premiered, genres, image} = req.body;
    let obj = {
        name: title,
        genres: genres,
        premiered: premiered,
        image: image
    }
    await restDAL.update(movieId, obj)
    return `Movie "${title}" updated successfully`;
}

exports.deleteMovie = async (req) => {
    let msg = `Movie "${req.body.title}" deleted successfully`
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

exports.getGenres = async function () {
    const response = await jsonDAL.getGenres();
    return response.genres.sort()
}