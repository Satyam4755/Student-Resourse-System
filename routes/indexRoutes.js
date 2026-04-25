const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/', (req, res) => res.redirect('/notes'));

module.exports = router;
