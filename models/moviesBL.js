const restDAL = require('../DAL/restDAL');
const jsonDAL = require('../DAL/jsonDAL');

// File deleteMovie
const fs = require('fs')

exports.countMovies = async () => {
    return (await restDAL.countMovies()).data;
}

exports.getMovieList = async (page, size, find) => {
    const movies = await restDAL.getAllMovies(page, size, find);
    let k = await movies.data.map(async movie => ({
        _id: movie._id,
        name: movie.name,
        genres: movie.genres,
        premiered: movie.premiered,
        image: movie.image,
        subs: await findMemberNameByMovieId(movie._id)
    }));

    return await Promise.all(k)
}

async function findMemberNameByMovieId(movieId) {
    const subsArr = await restDAL.getSubs();
    const membersArr = []
    await Promise.all(subsArr.data.map(async (subs) =>
        await Promise.all(subs.movies.map(async (element) => {
            if (element.movieId === movieId) {
                let member = await restDAL.geMemberById(subs.memberId)
                let obj = {name: member.data.name, date: element.date}
                membersArr.push(obj)
            }
        }
    ))))
    return await Promise.all(membersArr)
}

exports.addMovie = async (obj) => {
    return await restDAL.addMovie(obj);
}

exports.updateMovie = async (req) => {
    const {movieId, title, premiered, genres, image} = req.body;
    let obj = {
        name: title,
        genres: genres,
        premiered: premiered,
        image: image
    }
    await restDAL.updateMovies(movieId, obj)
    return `Movie "${title}" updated successfully`;
}

exports.deleteMovie = async (req) => {
    let msg = `Movie "${req.body.title}" deleted successfully`
    if (!req.body.image.startsWith('https://')) {
        try {
            fs.unlinkSync('public' + req.body.image)
            //file removed
        } catch (err) {
            console.error(err)
            msg = err
        }
    }
    await restDAL.deleteMovie(req.body.movieId);
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