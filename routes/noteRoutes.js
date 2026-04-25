const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const upload = require('../config/multer');

router.get('/', noteController.getAllNotes);

// Middleware to protect routes
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        req.session.error = 'You must be logged in to upload notes';
        return res.redirect('/auth/login');
    }
    next();
};

router.get('/upload', requireAuth, noteController.getUpload);
router.post('/upload', requireAuth, upload.single('file'), noteController.postUpload);

router.post('/:id/like', requireAuth, noteController.likeNote);
router.post('/:id/comment', requireAuth, noteController.commentNote);
router.get('/:id/download', noteController.downloadNote);

module.exports = router;
