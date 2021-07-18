const restDAL = require('../DAL/restDAL');

exports.getSubs = async () => {
    return await restDAL.getMembers();
}