const axios = require('axios')

const url = "http://localhost:2020/api/movies";

exports.getAll = () => {
    return axios.get(url)
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