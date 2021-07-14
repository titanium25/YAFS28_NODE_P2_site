const restDAL = require('../DAL/restDAL');
const jsonDAL = require('../DAL/jsonDAL');

getMovies = async function () {
    const movies = await restDAL.getAllMovies()
    return movies.data;
}

getMovie = async function (id) {
    const movie = await restDAL.getMovie(id);
    return movie.data;
}

exports.getMovieList = async () => {
    const movies = await restDAL.getAllMovies()
    return await movies.data.map(movie => ({
        id: movie.id,
        name: movie.name,
        genres: movie.genres,
        premiered: movie.premiered,
        rating: movie.rating,
        image: movie.image
    }));
}

exports.addMovie = async (req) => {

}

exports.permissions = async (id) => {
    let permissionsJSON = await jsonDAL.getPermissions();
    let permissionsDataArr = permissionsJSON.permissionsData;
    return permissionsDataArr.find(perm => perm.id === id);
}

exports.findMovie = async (req) => {
    const {title} = req.body

    const allMoviesAPI = await restDAL.getAllMovies()

    return allMoviesAPI.data.filter(movie =>
        (movie.name.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase() === '')
    )
}

exports.getGenres = async function () {
    const response = await jsonDAL.getGenres();
    return response.genres.sort()
}