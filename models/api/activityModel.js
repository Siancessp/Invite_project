const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityTableSchema = new Schema({
    tourId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    dynamicFields: {
        type: Schema.Types.Mixed,
        required: true
    }
});

const activityTable = mongoose.model('ActivityTable', activityTableSchema);

module.exports = activityTable;
