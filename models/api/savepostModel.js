const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savepostSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        require: true
    },
});

const savepostdetails = mongoose.model("Savepost",savepostSchema);

module.exports = savepostdetails;