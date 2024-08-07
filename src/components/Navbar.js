import React from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      navigate('/');
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <div>Welcome, {user.attributes.given_name}</div>
      <button onClick={handleSignOut}>Sign Out</button>
    </nav>
  );
}

export default Navbar;