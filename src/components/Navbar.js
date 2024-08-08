import React from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Navbar.css';

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
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/" className="navbar-link">Home</Link>
        </div>
        <div className="navbar-right">
          <span className="welcome-message">Welcome, {user.attributes.given_name}</span>
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;