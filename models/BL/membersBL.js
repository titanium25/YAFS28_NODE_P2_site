const restDAL = require('../../DAL/restDAL');
const utils = require('../../lib/utils');
const subsBL = require('../BL/subsBL');

// Get all members
exports.getMembers = async (find) => {
    const membersArr = await restDAL.getMembers(find);
    return await Promise.all(membersArr.data.map(async (member) => (
            {
                ...member,
                ui: utils.makeId(), // unique id for front end show/hide window
                movies: await subsBL.getSubs(member._id) || '', // load movies that member watched
                dropDownList: await (await restDAL.dropDown(member._id)).data // load movies that member has not watched
            }
        )
    ))
}

// Delete member and his sub by member id
exports.deleteMemberAndSub = async (memberId) => {
    await restDAL.deleteSubs(memberId)
    await restDAL.deleteMember(memberId);
}

// Add a new member
exports.addMember = async (obj) => {
    return await restDAL.addMember(obj)
}

// Update member
exports.updateMember = async (req) => {
    const {id, name, email, city} = req.body;
    const obj = {name, email, city}
    await restDAL.updateMember(id, obj)
    return `Member "${name}" updated successfully`;
}

