const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const jsonDAL = require('../DAL/jsonDAL');
const sendEmail = require("../lib/emailSender");
const crypto = require('crypto');

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
            email: x.email,
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
    let {
        firstName, lastName, username, timeOut, isAdmin, email,
        vs, cs, ds, us, vm, cm, dm, um
    } = req.body;

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;

    let findUser = usersDataArr.find(user => user.id === req.body.userId)
    let index = usersDataArr.indexOf(findUser)

    usersDataArr[index].firstName = firstName
    usersDataArr[index].lastName = lastName
    usersDataArr[index].timeOut = timeOut
    await jsonDAL.saveUser(usersJSON)

    let findPerm = permissionsDataArr.find(perm => perm.id === req.body.userId)
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


    await User.findByIdAndUpdate(req.body.userId, {
        username,
        isAdmin
    })

}

// Add new User to DB and JSON
exports.addUser = async function (req) {
    // Pull data from the front end form
    let {
        firstName, lastName, username, timeOut, isAdmin, email,
        vs, cs, ds, us, vm, cm, dm, um
    } = req.body;

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;

    let obj = {}
    if (email === '') {
        obj.username = username,
            obj.isAdmin = isAdmin
    } else {
        obj.username = username,
            obj.email = email,
            obj.isAdmin = isAdmin
    }

    // Create new User in DB
    let user = await new User(obj).save();

    // Request a weekday along with a long date
    let options = {timeZone: 'Asia/Jerusalem', hour12: false};
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
        id: user._id,
        vs: (typeof vs != 'undefined'),
        cs: (typeof cs != 'undefined'),
        ds: (typeof ds != 'undefined'),
        us: (typeof us != 'undefined'),
        vm: (typeof vm != 'undefined'),
        cm: (typeof cm != 'undefined'),
        dm: (typeof dm != 'undefined'),
        um: (typeof um != 'undefined')
    })

    if (email) {
        // Create verification token for new user
        let token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        }).save();

        // Send email
        const message = `<h1>Hello ${user.username}</h1>
                         <h2>Welcome to YAFS28:P2 project</h2>
                         <p>
                            Admin register for you this account. 
                            Please click on link below to activate your profile.
                         </p>
                          Press <a href=${process.env.BASE_URL}/user/verify/${user._id}/${token.token}>
                          here 
                          </a>
                          to verify your email.`;
        await sendEmail(email, 'Verify Email', message);
    }


    // Save user data to JSON
    await jsonDAL.saveUser(usersJSON)
    // Save user permission to JSON
    await jsonDAL.savePermissions(permissionsJSON)

}


exports.deleteUser = async function (id) {
    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let permissionsJSON = await jsonDAL.getPermissions()
    let usersDataArr = usersJSON.usersData;
    let permissionsDataArr = permissionsJSON.permissionsData;

    let u = await User.findById(id);
    let un = u.username;

    await User.findByIdAndDelete(id).catch(err => console.log(err))
    await Token.deleteOne({userId: id}).catch(err => console.log(err))

    let findUser = usersDataArr.find(user => user.id === id)
    let findPermissions = permissionsDataArr.find(perm => perm.id === id)
    let indexUser = usersDataArr.indexOf(findUser)
    let indexPerm = permissionsDataArr.indexOf(findPermissions)
    usersDataArr.splice(indexUser, 1)
    permissionsDataArr.splice(indexPerm, 1)
    await jsonDAL.saveUser(usersJSON)
    await jsonDAL.savePermissions(permissionsJSON)

    return un;
}


