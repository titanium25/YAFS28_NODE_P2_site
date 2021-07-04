const User = require('../models/userModel');
const jsonDAL = require('../DAL/jsonDAL')

const bcrypt = require('bcryptjs');


exports.getAllUsers = async function () {

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let usersDataArr = usersJSON.usersData;
    let usersDB = await User.find({})

    let allUserData = [];

    usersDB.forEach((x, y) => {
        allUserData.push({
            id: x._id,
            firstName: usersDataArr[y].firstName,
            lastName: usersDataArr[y].lastName,
            username: x.username,
            timeOut: usersDataArr[y].timeOut,
            created: usersDataArr[y].created,
            isAdmin: x.isAdmin,
            isActivated: x.isActivated
        })
    })
    return allUserData;
}

exports.getUser = function (id) {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

exports.updateUser = async function (req) {
    // Pull data from the front end form
    const {userId, firstName, lastName, username, timeOut, isAdmin} = req.body
    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let usersDataArr = usersJSON.usersData;

    let errors = [];

    // Check required fields
    if (!firstName || !lastName || !username || !timeOut) {
        errors.push({msg: 'Please dont leave blank fields'});
        return errors;
    } else {
        User.findByIdAndUpdate(userId, {
            username,
            isAdmin
        })

        let findUser = usersDataArr.find(user => user.id == userId)
        let index = usersDataArr.indexOf(findUser)
        usersDataArr[index].firstName = firstName
        usersDataArr[index].lastName = lastName
        usersDataArr[index].timeOut = timeOut
        await jsonDAL.saveUser(usersJSON)

        return `User ${username} updated successfully`
    }
}

// Add new User to DB and JSON file
exports.addUser = async function (req) {
    // Pull data from the front end form
    const {firstName, lastName, username, timeOut, isAdmin} = req.body;

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let usersDataArr = usersJSON.usersData;

    // Create new User in DB
    const newUser = new User({
        username,
        isAdmin,
        isActivated: false
    });

    await newUser.save()

    usersDataArr.push({
        id: newUser._id,
        firstName,
        lastName,
        timeOut,
        created: new Date()
    })
    // Create new User in JSON
    await jsonDAL.saveUser(usersJSON)

    return `New user ${username} added successfully`
}


exports.deleteUser = async function (id) {
    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let usersDataArr = usersJSON.usersData;
    let usersDB = await User.findByIdAndDelete(id)

    let findUser = usersDataArr.find(user => user.id == id)
    let index = usersDataArr.indexOf(findUser)
    usersDataArr.splice(index, 1)
    await jsonDAL.saveUser(usersJSON)

    return `User ${usersDB.username} deleted successfully`
}