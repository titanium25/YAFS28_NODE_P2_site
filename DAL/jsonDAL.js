const jsonFile = require("jsonfile");

const fileNameUsers = __dirname + "/users.json";
const filePermissions = __dirname + "/permissions.json";
const fileNameGenres = __dirname +  "/genresList.json";


exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        jsonFile.readFile(fileNameUsers, (err, res) => {
            if (err) {
                reject(err);
            };
            resolve(res);
        });
    });
};


exports.saveUser = (obj) => {
    return new Promise((resolve, reject) => {
        jsonFile.writeFile(fileNameUsers, obj, {spaces: 2}, function (err) {
            if (err){
                reject(err);
            } else {
                resolve("User Saved!");
            }
        })
    })
}

exports.getPermissions = () => {
    return new Promise((resolve, reject) => {
        jsonFile.readFile(filePermissions, (err, res) => {
            if (err) {
                reject(err);
            };
            resolve(res);
        });
    });
};


exports.savePermissions = (obj) => {
    return new Promise((resolve, reject) => {
        jsonFile.writeFile(filePermissions, obj, {spaces: 2}, function (err) {
            if (err){
                reject(err);
            } else {
                resolve("Permissions Saved!");
            }
        })
    })
}

exports.getGenres = () => {
    return new Promise((resolve, reject) => {
        jsonFile.readFile(fileNameGenres, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};
