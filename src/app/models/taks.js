const mongoose = require('../../database');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true
    },
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;