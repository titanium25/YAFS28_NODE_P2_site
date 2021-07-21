const axios = require('axios')

const movieURL = "http://localhost:2020/api/movies";
const memberURL = "http://localhost:2020/api/members";
const subsURL = "http://localhost:2020/api/subs";

/**
 * -------------- Movies ----------------
 */


exports.getAllMovies = (page, size, find) => {
    return axios.get(movieURL + '?page=' + page + '&size=' + size + '&find=' + find)
}

exports.countMovies = () => {
    return axios.get(movieURL + '/lib/count')
}

exports.updateMovies = (id, obj) => {
    return axios.patch(movieURL + '/' + id, obj)
}

exports.getMovieById = (id) => {
    return axios.get(movieURL + '/get/' + id)
}

exports.addMovie = (obj) => {
    return axios.post(movieURL, obj)
}

exports.deleteMovie = (id) => {
    return axios.delete(movieURL + '/' + id)
}

/**
 * -------------- Members ----------------
 */

exports.getMembers = () => {
    return axios.get(memberURL)
}

exports.geMemberById = (id) => {
    return axios.get(memberURL + '/get/' + id)
}

exports.deleteMember = (id) => {
    return axios.delete(memberURL + '/' + id)
}

exports.addMember = (obj) => {
    return axios.post(memberURL, obj)
}

exports.updateMember = (id, obj) => {
    return axios.put(memberURL + '/' + id, obj)
}

/**
 * -------------- Subs ----------------
 */

exports.getSubs = () => {
    return axios.get(subsURL)
}

exports.addSubs = (obj) => {
    return axios.post(subsURL, obj)
}

exports.getSubsMoviesByMemberId = (memberId) => {
    return axios.get(subsURL + '/get/' + memberId)
}

exports.deleteSubs = (id) => {
    return axios.delete(subsURL + '/' + id)
}

exports.updateSubs = (id, obj) => {
    return axios.put(subsURL + '/' + id, obj)
}