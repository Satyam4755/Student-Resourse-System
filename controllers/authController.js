const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('auth/login');
};

exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            req.session.error = 'Invalid credentials';
            return res.redirect('/auth/login');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.error = 'Invalid credentials';
            return res.redirect('/auth/login');
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/notes'); // Redirect to feed
    } catch (err) {
        console.error(err);
        req.session.error = 'Server Error';
        res.redirect('/auth/login');
    }
};

exports.getSignup = (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('auth/signup');
};

exports.postSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.session.error = 'Username already exists';
            return res.redirect('/auth/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();

        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.success = 'Account created successfully!';
        res.redirect('/notes');
    } catch (err) {
        console.error(err);
        req.session.error = 'Server Error';
        res.redirect('/auth/signup');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        res.redirect('/auth/login');
    });
};
