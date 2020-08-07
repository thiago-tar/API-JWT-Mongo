const express = require('express');
const User = require('../models/User');
const router = express.Router();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth.json')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuario ja existe' })

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id })
        });

    } catch (err) {
        return res.status(400).send({ error: '_Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuario Não encontrado' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha Invalida' });

    user.password = undefined;

    return res.send({
        user,
        token: generateToken({ id: user.id })
    });
});

router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            },
        }, { new: true, useFindAndModify: false }
        );

        mailer.sendMail({
            to: email,
            from: 'thiago.assis@hotmail.com',
            template: "auth/forgotPassword",
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' });

            return res.send();
        });

    } catch (error) {
        res.status(400).send({ error: 'Erro on forgot password, try again' });
    }
});

router.post('/resetPassword', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

        if (!user)
            res.status(400).send({ error: 'User not found' })

        if (token !== user.passwordResetToken)
            res.status(400).send({ error: 'Incorrect Token' })

        if (new Date() > user.passwordResetExpires)
            res.status(400).send({ error: 'Expired Token' })

        user.password = password;

        await user.save();

        res.send();

    } catch (error) {
        res.status(400).send({ error: 'Cannot reset password, try again' });
    }



});

module.exports = (app) => app.use('/auth', router);