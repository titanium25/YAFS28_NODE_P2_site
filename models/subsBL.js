const restDAL = require('../DAL/restDAL');

exports.getSubs = async () => {
    const members = await restDAL.getMembers();
    return members.data;
}

exports.deleteSub = async (req) => {
    await restDAL.deleteMember(req.body.id);
    return `Member "${req.body.name}" deleted successfully`;
}
exports.addSub = async (obj) => {
    return await restDAL.addMember(obj);
}

exports.updateSub = async (req) => {
    const {id, name, email, city} = req.body;
    const obj = {name, email, city}
    await restDAL.updateMember(id, obj)
    return `Member "${name}" updated successfully`;
}