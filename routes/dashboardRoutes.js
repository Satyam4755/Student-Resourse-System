const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Middleware to protect dashboard route
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        req.session.error = 'You must be logged in to view dashboard';
        return res.redirect('/auth/login');
    }
    next();
};

router.get('/', requireAuth, dashboardController.getDashboard);
router.post('/delete/:id', requireAuth, dashboardController.deleteNote);

module.exports = router;
