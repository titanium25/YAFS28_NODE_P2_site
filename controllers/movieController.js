var express = require('express');
var router = express.Router();

// Menu page
router.get('/', function (req, res, next) {
    res.render('menu');
});

module.exports = router;