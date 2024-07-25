const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the public_links collection
const publicSchema = new Schema({
    hash: { type: String, required: true },
    file: { type: Schema.Types.Mixed , required: true },
    uploadedBy: {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now },
});

// Create the model from the schema
const PublicLink = mongoose.model('PublicLink', publicSchema);

module.exports = PublicLink;
