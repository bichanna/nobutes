import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import Notes from './pages/Notes';

render(() =>
  (
    <Router>
      <Route path="/" component={Notes} />
    </Router>
  ),
  document.getElementById('root')
);
