const jsonFile = require("jsonfile");

const fileNameUsers = __dirname + "/users.json";

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
