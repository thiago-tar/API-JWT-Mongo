const fs = require('fs');
const path = require('path');

module.exports = app => {

    const controller = 'Controller.js'
    fs
        .readdirSync(__dirname)
        // .filter(file => (file.indexOf('.') !== 0 && file !== "index.js"))
        .filter(file => file.includes(controller, file.indexOf(controller, controller.length - 1)))
        .forEach(file => require(path.resolve(__dirname, file))(app));
};