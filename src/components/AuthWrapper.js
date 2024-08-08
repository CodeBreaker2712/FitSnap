import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

const centeredContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
};

function AuthWrapper({ children }) {
  return (
    <div style={centeredContainerStyle}>
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
              return { given_name: 'First Name is required' };
            }
            if (!formData.family_name) {
              return { family_name: 'Last Name is required' };
            }
            if (!formData.email) {
              return { email: 'Email is required' };
            }
          },
        }}
      >
        {children}
      </Authenticator>
    </div>
  );
}

export default AuthWrapper;