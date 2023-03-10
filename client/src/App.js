import TextEditor from './TextEditor'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Define the App component
function App() {
    return (
        // Use the Router component to enable routing in the application
        <Router>
            <h1 className="heading"> Collaborative Text Editor </h1>
            <Switch>
                <Route path="/" exact>
                    <Redirect to={`/documents/${uuidv4()}`} />
                </Route>

                <Route path="/documents/:id">
                    <TextEditor />
                </Route>
            </Switch>
        </Router>
    )
}

export default App;
