const restDAL = require('../DAL/restDAL');
const utils = require('../lib/utils');

exports.getAllMembers = async () => {
    const members = await restDAL.getMembers();
    let mem = members.data.map(async (obj) => (
            {
                ...obj,
                ui: utils.makeId(),
                movies: await getSubsMoviesByMemberId(obj._id)

            }
        )
    );

    return await Promise.all(mem)
}

// exports.deleteSub = async (req) => {
//     await restDAL.deleteMember(req.body.id);
//     return `Member "${req.body.name}" deleted successfully`;
// }
exports.addSub = async (obj) => {
    return await restDAL.addSubs(obj)
}

// exports.updateSub = async (req) => {
//     const {id, name, email, city} = req.body;
//     const obj = {name, email, city}
//     await restDAL.updateMember(id, obj)
//     return `Member "${name}" updated successfully`;
// }

async function getSubsMoviesByMemberId(memberId) {
    const movieIdArr = await restDAL.getSubsMoviesByMemberId(memberId);
    if (movieIdArr.data.movies) {
        let subs = movieIdArr.data.movies.map(async (obj) =>
            (
                {
                    ...obj,
                    name: await getMovieName(obj.movieId)
                }
            )
        )
        return await Promise.all(subs)
    }

}

// movieId -> [ ] -> movie name
async function getMovieName(movieId) {
    let movie = await restDAL.getMovieById(movieId)
    return movie.data.name
}
