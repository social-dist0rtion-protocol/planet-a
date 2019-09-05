import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from 'react-router-dom';
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "rimble-ui";
import theme from "./theme";


ReactDOM.render(
  <ThemeProvider theme={theme} style={{ height: '100%' }}>
    <I18nextProvider i18n={i18n}>
      <Router>
        <App />
      </Router>
    </I18nextProvider>
  </ThemeProvider>,
  document.getElementById('root')
);
