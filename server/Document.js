const {Schema, model} = require("mongoose")

// Create a new mongoose schema for documents
const Document = new Schema({
    _id: String,
    data: Object
})

// Export the schema as a model called "Document"
module.exports = model("Document", Document)
