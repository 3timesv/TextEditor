// Import the mongoose library and the Document schema
const mongoose = require("mongoose")
const Document = require("./Document")

// Connect to the local MongoDB instance
mongoose.connect('mongodb://localhost/write-pad', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
})

// Import and initialize the Socket.io server
const io = require("socket.io")(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    },
})

// Default value for a new document
const defaultValue = ""

// Listen for new socket connections 
io.on("connection", socket => {
    // Listen for the 'get-document' event, which is triggered when a client requests a document
    socket.on('get-document', async documentId => {
        // find or create the requested document
        const document = await findOrCreateDocument(documentId)
        // Join the socket to the room corresponding to the document ID
        socket.join(documentId)
        // Send the document to the client
        socket.emit("load-document", document.data)

        // Listen for the 'send-changes' event, which is triggered when a client wants to apply changes to the document
        socket.on('send-changes', delta => {
            // Emit the 'receive-changes' event to all other sockets in the room, including the changes
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        // Listen for the 'save-document' event which is triggered when a client wants to save the document to the database
        socket.on("save-document", async data => {
            // Update the document in the database with the new data
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })
})

// Async function to find or create a document by ID
async function findOrCreateDocument(id) {
    // If no ID was provided, return null
    if (id == null) return

    // Try to find the document by ID
    const document = await Document.findById(id)
    // If document was found, return it
    if (document) return document
    // Otherwise, create a new document with the provided ID and the default value
    return await Document.create({_id: id, data: defaultValue})
} 
