const uuid = require('uuid')
const multer  = require('multer')
const DIR = './public/img/uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = uuid.v4().toString() + '.' + file.mimetype.split('/').reverse()[0];
        cb(null, fileName)
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // for 2MB
    }
}).single('myImage');

module.exports.upload = upload;