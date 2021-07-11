const restDAL = require('../DAL/restDAL')

exports.getMovies = async function () {
    let movies = await restDAL.getAllMovies();
    return movies.data;
}