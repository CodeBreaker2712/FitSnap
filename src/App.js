import React, { useState, useEffect } from 'react';
import './App.css';
import { Amplify, Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import Navbar from './components/Navbar';
import AuthWrapper from './components/AuthWrapper';
import ImageUploader from './components/ImageUploader';
import { BrowserRouter as Router } from 'react-router-dom';

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
      const token = session.getIdToken().getJwtToken();
      setJwtToken(token);
    } catch (error) {
      console.log('Error fetching JWT token:', error);
    }
  };

  return (
    <Router>
      <AuthWrapper>
        {({ user }) => (
          <div>
            <Navbar user={user} />
            <div style={{ padding: '1rem' }}>
              <h1>Welcome to the Home Page</h1>
              <ImageUploader jwtToken={jwtToken} />
            </div>
          </div>
        )}
      </AuthWrapper>
    </Router>
  );
}

export default App;