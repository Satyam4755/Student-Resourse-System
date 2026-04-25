const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');

exports.getAllNotes = async (req, res) => {
    try {
        const query = {};
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { subject: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query).populate('uploadedBy', 'username').sort({ createdAt: -1 });
        res.render('notes/index', { notes, searchQuery: req.query.search || '' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getUpload = (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    res.render('notes/upload');
};

exports.postUpload = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        if (!req.file) {
            req.session.error = 'Please upload a valid ZIP file.';
            return res.redirect('/notes/upload');
        }

        const { title, description, subject, tags } = req.body;
        
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const note = new Note({
            title,
            description,
            subject,
            tags: tagArray,
            fileUrl: `/uploads/${req.file.filename}`,
            uploadedBy: req.session.userId
        });

        await note.save();
        req.session.success = 'Note uploaded successfully!';
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.session.error = 'Server Error limits or missing fields';
        res.redirect('/notes/upload');
    }
};

exports.likeNote = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).send('Note not found');

        const userId = req.session.userId;
        const index = note.likes.indexOf(userId);

        if (index === -1) {
            note.likes.push(userId); // Like
        } else {
            note.likes.splice(index, 1); // Unlike
        }

        await note.save();
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.commentNote = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).send('Note not found');

        const { text } = req.body;
        if (text && text.trim().length > 0) {
            note.comments.push({
                text: text.trim(),
                userId: req.session.userId,
                username: req.session.username
            });
            await note.save();
        }
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).send('Note not found');

        // Increment download count
        note.downloads += 1;
        await note.save();

        const filePath = path.join(__dirname, '..', note.fileUrl);
        res.download(filePath, err => {
            if (err) console.error("Error downloading file:", err);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
