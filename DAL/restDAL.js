const axios = require('axios')

const url = "http://localhost:2020/api/movies";

exports.getAll = (page, size) => {
    return axios.get(url + '?page=' + page + '&size=' + size)
}

exports.search = () => {
    return axios.get(url + '/search')
}

exports.count = () => {
    return axios.get(url + '/lib/count')
}

exports.update = (id, obj) => {
    return axios.patch(url + '/' + id, obj)
}

exports.getById = (id) => {
    return axios.get(url + '/' + id)
}

exports.add = (obj) => {
    return axios.post(url, obj)
}

exports.delete = (id) => {
    return axios.delete(url + '/' + id)
}