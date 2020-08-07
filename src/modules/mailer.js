const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const { host, pass, port, user } = require('../config/mail.json');

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
        user,
        pass
    }
});

transport.use('compile', hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resource/mail/')
    },
    viewPath: path.resolve('./src/resource/mail/'),
    extName: '.html',
  }));

module.exports = transport;