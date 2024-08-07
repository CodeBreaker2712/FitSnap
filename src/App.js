import React, { useState, useEffect } from 'react';
import './App.css';
import { Amplify } from 'aws-amplify';
// import { awsExports } from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Auth } from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_l5AOax0Ak",
    userPoolWebClientId: "l02pfaqp87bh2kdr14h77d5tb"
  }
});


function App() {
  const [jwtToken, setJwtToken] = useState('');

  useEffect(() => {
    fetchJwtToken();
  }, []);

  const fetchJwtToken = async () => {
    try {
      const session = await Auth.currentSession();
      console.log("toekn", session);
      const token = session.getIdToken().getJwtToken();
      console.log("token", token);
      setJwtToken(token);
    } catch (error) {
      console.log('Error fetching JWT token:', error);
    }
  };


  return (
    <Authenticator
      initialState="signIn"
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div><label>First name</label></div>
                <input
                  type="text"
                  name="given_name"
                  placeholder="Please enter your first name"
                />
                <div><label>Last name</label></div>
                <input
                  type="text"
                  name="family_name"
                  placeholder="Please enter your last name"
                />
                <div><label>Email</label></div>
                <input
                  type="text"
                  name="email"
                  placeholder="Please enter a valid email"
                />
              </>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp(formData) {
          if (!formData.given_name) {
            return {
              given_name: 'First Name is required',
            };
          }
          if (!formData.family_name) {
            return {
              family_name: 'Last Name is required',
            };
          }
          if (!formData.email) {
            return {
              email: 'Email is required',
            };
          }
        },
      }}
    >
      {({ signOut, user }) => (
        <div>
          {/* <Account>
            <Status />
          </Account> */}
          <button onClick={signOut}>Signout</button>
          {jwtToken}
        </div>
      )}
    </Authenticator>
  );
}

export default App;