const axios = require('axios')

const url = "https://api.tvmaze.com/shows";

exports.getAllMovies = function () {
    return axios.get(url)
}
exports.getMovie = function (id) {
    return axios.get(url + '/' + id)
}