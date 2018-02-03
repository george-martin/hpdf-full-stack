import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Auth } from './Auth';
import {Profile} from './Profile';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
class App extends Component {
  render() {

    return (
      <MuiThemeProvider>
        <Router>
          <div>
            <Route exact path="/" component={Auth}/>
            <Route exact path="/profile" component={Profile}/>
          </div>
        </Router>
      </MuiThemeProvider>
    );

  }
}

export default App;
