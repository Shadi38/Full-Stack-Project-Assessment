
// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.render(
//   <BrowserRouter> 
//     <App />
//   </BrowserRouter>,
//   document.getElementById('root')
// );
// import React from 'react';
// import ReactDOM from 'react-dom/client'; 
// import './index.css';
// import App from './App';
// import { BrowserRouter } from 'react-router-dom';

// // Use createRoot instead of render
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <BrowserRouter basename="/">
//     <App />
//   </BrowserRouter>
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from './history';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HistoryRouter history={history}>
    <App />
  </HistoryRouter>
);

