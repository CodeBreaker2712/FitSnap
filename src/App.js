import React, { useState, useEffect } from 'react';
import './App.css';
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Navbar from './components/Navbar';
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
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

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

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = async () => {
    if (!imageFile) {
      console.error('No image selected');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      try {
        const response = await fetch('https://f9ngw4hasj.execute-api.us-east-1.amazonaws.com/dev/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ image: base64Url })
        });

        if (response.ok) {
          console.log('Image uploaded successfully');
          // You can add further actions here, like showing a success message
        } else {
          console.error('Failed to upload image');
          // You can add error handling here, like showing an error message
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // You can add error handling here, like showing an error message
      }
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <Router>
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
        {({ user }) => (
          <div>
            <Navbar user={user} />
            <div style={{ padding: '1rem' }}>
              <h1>Welcome to the Home Page</h1>
              <input type="file" accept="image/*" onChange={handleImageSelect} />
              {imageUrl && <img src={imageUrl} alt="Selected" style={{ maxWidth: '300px', marginTop: '1rem' }} />}
              <br />
              <button onClick={handleImageSubmit} disabled={!imageFile} style={{ marginTop: '1rem' }}>
                Submit Image
              </button>
            </div>
          </div>
        )}
      </Authenticator>
    </Router>
  );
}

export default App;