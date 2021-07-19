const axios = require('axios')

const movieURL = "http://localhost:2020/api/movies";
const memberURL = "http://localhost:2020/api/members";

exports.getAll = (page, size, find) => {
    return axios.get(movieURL + '?page=' + page + '&size=' + size + '&find=' + find)
}

exports.count = () => {
    return axios.get(movieURL + '/lib/count')
}

exports.update = (id, obj) => {
    return axios.patch(movieURL + '/' + id, obj)
}

exports.getById = (id) => {
    return axios.get(movieURL + '/' + id)
}

exports.add = (obj) => {
    return axios.post(movieURL, obj)
}

exports.delete = (id) => {
    return axios.delete(movieURL + '/' + id)
}

/*
/### Members
 */

exports.getMembers = () => {
    return axios.get(memberURL)
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