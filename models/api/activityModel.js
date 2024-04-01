const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityTableSchema = new Schema({
    tourId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    activityData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
});

const activityTable = mongoose.model('ActivityTable', activityTableSchema);

module.exports = activityTable;
