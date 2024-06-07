import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import Notes from './pages/Notes';
import Note from './pages/Note';

function App () {
  return (
    <Router>
      <Route path="/" component={Notes} />
      <Route path="/note/:id" component={Note} />
    </Router>
  );
}

render(<App/>, document.getElementById('root'));
