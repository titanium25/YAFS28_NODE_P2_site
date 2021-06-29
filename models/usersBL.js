const User = require('../models/userModel');
const jsonDAL = require('../DAL/jsonDAL')

const bcrypt = require('bcryptjs');


exports.getAllUsers = function () {
    return new Promise((resolve, reject) => {
        User.find({}, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
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

exports.updateUser = function (req) {
    const {id, name, email, isAdmin} = req.body
    let errors = [];

    // Check required fields
    if (!name || !email) {
        errors.push({msg: 'Please dont leave blank fields'});
        return errors;
    } else {
        return new Promise((resolve, reject) => {
            User.findByIdAndUpdate(id, {
                name,
                email,
                isAdmin
            }, function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve(console.log('Updated!'))
                }
            })
        });
    }
}

// Add new User to DB and JSON file
exports.addUser = async function (req) {
    // Pull data from the front end form
    const {firstName, lastName, username, timeOut} = req.body;

    // Init. users array
    let usersJSON = await jsonDAL.getUsers();
    let usersDataArr = usersJSON.usersData;

    // Create new User in DB
    new Promise((resolve, reject) => {
        const newUser = new User({
            username,
            isAdmin: false,
            isActivated: false
        });
        newUser.save(async function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(
                    usersDataArr.push({
                        id: newUser._id,
                        firstName,
                        lastName,
                        timeOut,
                        created: new Date()
                    }),
                    // Create new User in JSON
                    await jsonDAL.saveUser(usersJSON)
                )
            }
        })
    });
}


exports.deleteUser = function (id) {
    return new Promise((resolve, reject) => {
        User.findByIdAndDelete(id, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(console.log('Deleted!'))
            }
        })
    })
}