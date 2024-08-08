import React, { useState, useEffect } from 'react';
import './App.css';
import { Amplify, Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import Navbar from './components/Navbar';
import AuthWrapper from './components/AuthWrapper';
import ImageUploader from './components/ImageUploader';
import Results from './components/Results';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_jQqmfFhGF",
    userPoolWebClientId: "7q905bojpeani6qj860dgga8b5"
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
          <div className="app-container">
            <Navbar user={user} />
            <div className="content-container">
              <Routes>
                <Route path="/" element={
                  <div>
                    <h1 className="page-title">Welcome to FitSnap</h1>
                    <ImageUploader jwtToken={jwtToken} />
                  </div>
                } />
                <Route path="/results" element={<Results />} />
              </Routes>
            </div>
          </div>
        )}
      </AuthWrapper>
    </Router>
  );
}

export default App;