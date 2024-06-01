import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import Notes from './pages/Notes';

function Placeholder() {
  return <p>Placeholder</p>;
}

function Root(props) {
  return <div class='m-5'>
    {props.children}
  </div>;
}

function App () {
  return (
    <Router root={Root}>
      <Route path="/" component={Notes} />
      <Route path="/note/:id" component={Placeholder} />
    </Router>
  );
}

render(<App/>, document.getElementById('root'));
