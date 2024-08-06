import React from 'react';
import Auth from './components/Auth';
import Signup from './components/Signup';
import Signin from './components/Signin';
import { Account } from './components/Account';
import Status from './components/Status';

function App() {
  return (
    <Account>
      <Status />
      <Signup />
      <Signin />
    </Account>
  );
}

export default App;
