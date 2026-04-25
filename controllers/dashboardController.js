const Note = require('../models/Note');

exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const userId = req.session.userId;

        // Fetch all notes uploaded by user
        const notes = await Note.find({ uploadedBy: userId }).sort({ createdAt: -1 });

        let totalLikes = 0;
        let totalComments = 0;
        let totalDownloads = 0;

        notes.forEach(note => {
            totalLikes += note.likes.length;
            totalComments += note.comments.length;
            totalDownloads += note.downloads;
        });

        res.render('dashboard/index', {
            notes,
            stats: {
                totalNotes: notes.length,
                totalLikes,
                totalComments,
                totalDownloads
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteNote = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const note = await Note.findById(req.params.id);
        if(!note) return res.redirect('/dashboard');

        if(note.uploadedBy.toString() !== req.session.userId) {
            req.session.error = "Unauthorized";
            return res.redirect('/dashboard');
        }

        // remove file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', note.fileUrl);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        await Note.findByIdAndDelete(req.params.id);
        req.session.success = "Note deleted successfully";
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
