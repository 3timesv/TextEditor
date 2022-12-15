import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import {useParams} from 'react-router-dom'

// Set the save interval to 2 seconds
const SAVE_INTERVAL_MS = 2000

// Toolbar options for the editor
const TOOLBAR_OPTIONS = [
    [{header: [1, 2, 3, false]}],
    ["bold", "italic", "underline"],
    ["clean"],
]

export default function TextEditor() {
    // Get the 'id' parameter from the URL and store it in 'documentId'
    const {id: documentId} = useParams()

    // Initialize the 'socket' state variable
    const [socket, setSocket] = useState()

    // Initialize the 'quill' state variable
    const [quill, setQuill] = useState()

    // When the component mounts, create a Socket.io client connection and store it in the 'socket' state variable
    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        // Disconnect the socket when the component unmounts
        return () => {
            s.disconnect()
        }
    }, [])

    // When the 'socket' and 'quill' state variables are initialized, listen for 'load-document' events and set the Quill editor's content
    useEffect(() => {
        if (socket == null || quill == null) return
        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable()
        })
        // Emit a 'get-document' event to request the document from the server
        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])

    // When the 'socket' and 'quill' state variables are initialized, set an interval to save the document to the server
    useEffect(() => {
        if (socket == null || quill == null) return

        // Create an interval that will emit the 'save-document' event to the socket with the contents of the Quill editor as the payload every time it runs.
        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, SAVE_INTERVAL_MS)

        // Return a clean-up function that will be called when the component unmounts and will clear the interval
        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        // Create a handler function that will update the Quill editor with received delta when the "receive-changes" event is emitted by the socket.
        const handler = (delta) => {
            quill.updateContents(delta)
        }

        // Attach the event listener to the socket.
        socket.on('receive-changes', handler)

        // Return a clean-up function that will be called when the component unmounts and will remove the event listener from the socket
        return () => {
            socket.off('receive-changes', handler)
        }
    }, [socket ,quill])


    useEffect(() => {
        if (socket == null || quill == null) return

        // Create a handler function that will emit the "send-changes" event to the socket with the changes made by the user (delta) as the payload, but only if the source of the changes is the user (not another client connected to the socket)
        const handler = (delta, oldDelta, source) => {
            if (source != 'user') return
            socket.emit("send-changes", delta)
        }

        // Attach the event listener to the Quill editor for the "text-change" event
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
        }
    }, [socket ,quill])

    // callback function to create and set up the Quill editor.
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        // Clear the inner HTML of the wrapper element
        wrapper.innerHTML = ""

        // Create a new div element that will be used as the Quill editor
        const editor = document.createElement("div")

        // Append the editor div to the wrapper element
        wrapper.append(editor)

        // Create a new Quill editor instance, passing the editor div and a configuration object as arguments
        const q = new Quill(editor, { theme: "snow", modules: {toolbar: TOOLBAR_OPTIONS }})

        // Disable the editor to prevent the user from making changes until it is fully loaded and ready
        q.disable()

        // Set the initial text of the editor 
        q.setText("Loading...")

        // Save the Quill editor instance to the component state to it can be used elsewhere in the component
        setQuill(q)

    }, [])
    return <div className="container" ref={wrapperRef}></div>
}
