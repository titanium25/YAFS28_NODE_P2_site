const User = require('../models/userModel');
const jsonDAL = require('../DAL/jsonDAL');

exports.getAllUsers = async function () {

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;
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
            isActivated: x.isActivated,
            vs: permissionsDataArr[y].vs,
            cs: permissionsDataArr[y].cs,
            ds: permissionsDataArr[y].ds,
            us: permissionsDataArr[y].us,
            vm: permissionsDataArr[y].vm,
            cm: permissionsDataArr[y].cm,
            dm: permissionsDataArr[y].dm,
            um: permissionsDataArr[y].um
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
    const {
        userId, firstName, lastName, username, timeOut, isAdmin,
        vs, cs, ds, us, vm, cm, dm, um
    } = req.body

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;

    let errors = [];

    // Check required fields not blank
    if (!firstName || !lastName || !username || !timeOut) {
        errors.push({msg: 'Please dont leave blank fields'});
    }
    // Check if username is unique
    // let searchForUserInDB = await User.find({username})
    // if (searchForUserInDB.length > 0) {
    //     errors.push({msg: 'This username is already exists'});
    // }
    // Check if inputs got white spaces
    if (hasWhiteSpace(username) || hasWhiteSpace(firstName) || hasWhiteSpace(lastName)) {
        errors.push({msg: 'Please dont use white spaces in inputs'});
    }
    // Check if inputs got numbers
    let hasNumber = /\d/;
    if (hasNumber.test(firstName) || hasNumber.test(lastName)) {
        errors.push({msg: 'Please dont use numbers in name fields'});
    }
    // Check if values too long
    if (username.length > 12 || firstName.length > 12 || lastName.length > 12) {
        errors.push({msg: 'Inputs must be shorter than 12 charters'});
    }
    if (errors.length > 0) {
        return errors;
    } else {

        let findUser = usersDataArr.find(user => user.id == userId)
        let index = usersDataArr.indexOf(findUser)
        usersDataArr[index].firstName = firstName
        usersDataArr[index].lastName = lastName
        usersDataArr[index].timeOut = timeOut
        await jsonDAL.saveUser(usersJSON)

        let findPerm = permissionsDataArr.find(perm => perm.id === userId)
        let indexPerm = permissionsDataArr.indexOf(findPerm)
        permissionsDataArr[indexPerm].vs = (typeof vs != 'undefined')
        permissionsDataArr[indexPerm].cs = (typeof cs != 'undefined')
        permissionsDataArr[indexPerm].ds = (typeof ds != 'undefined')
        permissionsDataArr[indexPerm].us = (typeof us != 'undefined')
        permissionsDataArr[indexPerm].vm = (typeof vm != 'undefined')
        permissionsDataArr[indexPerm].cm = (typeof cm != 'undefined')
        permissionsDataArr[indexPerm].dm = (typeof dm != 'undefined')
        permissionsDataArr[indexPerm].um = (typeof um != 'undefined')
        await jsonDAL.savePermissions(permissionsJSON)

        new Promise((resolve, reject) => {
            User.findByIdAndUpdate(userId, {
                username,
                isAdmin
            }, function (err) {
                if (err) {
                    reject(err)
                }
            })
        });
    }
}

// Add new User to DB and JSON file
exports.addUser = async function (req) {
    // Pull data from the front end form
    const {
        firstName, lastName, username, timeOut, isAdmin,
        vs, cs, ds, us, vm, cm, dm, um
    } = req.body;

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;


    // Create new User in DB
    const newUser = new User({
        username,
        isAdmin,
        isActivated: false
    });

    // Save new user to mongoDB
    await newUser.save()
        .then(async (user) => {
            // request a weekday along with a long date
            let options = {timeZone: 'Asia/Jerusalem', hour12: false };
            // Create user data in JSON
            usersDataArr.push({
                id: user._id,
                firstName,
                lastName,
                timeOut,
                created: new Date().toLocaleString('en-GB', options).replace(/T/, ' ').      // replace T with a space
                    replace(/\..+/, '')     // delete the dot and everything after
            })

            // Create new Permissions in JSON
            permissionsDataArr.push({
                id: newUser._id,
                vs: (typeof vs != 'undefined'),
                cs: (typeof cs != 'undefined'),
                ds: (typeof ds != 'undefined'),
                us: (typeof us != 'undefined'),
                vm: (typeof vm != 'undefined'),
                cm: (typeof cm != 'undefined'),
                dm: (typeof dm != 'undefined'),
                um: (typeof um != 'undefined')
            })

            // Save user data to JSON
            await jsonDAL.saveUser(usersJSON)
            // Save user permission to JSON
            await jsonDAL.savePermissions(permissionsJSON)

        })
        .catch(err => console.log(err))
}


exports.deleteUser = async function (id) {
    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;

    let usersDB = await User.findByIdAndDelete(id)

    let findUser = usersDataArr.find(user => user.id === id)
    let findPermissions = permissionsDataArr.find(perm => perm.id === id)
    let indexUser = usersDataArr.indexOf(findUser)
    let indexPerm = permissionsDataArr.indexOf(findPermissions)
    usersDataArr.splice(indexUser, 1)
    permissionsDataArr.splice(indexPerm, 1)
    await jsonDAL.saveUser(usersJSON)
    await jsonDAL.savePermissions(permissionsJSON)

    return `User ${usersDB.username} deleted successfully`
}

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}
