const restDAL = require('../../DAL/restDAL');

exports.addSubs = async (obj) => {
    return await restDAL.addSubs(obj)
}

exports.getSubs = async (memberId) => {
    const subsArr = await restDAL.getSubsById(memberId);
    if (subsArr.data.movies) {
        return await Promise.all(subsArr.data.movies.map(async (sub) =>
            (
                {
                    ...sub,
                    name: await (await restDAL.getMovieById(sub.movieId)).data.name
                }
            )
        ))
    }
}