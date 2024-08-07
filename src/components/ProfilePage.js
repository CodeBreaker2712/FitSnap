import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

const ProfilePage = () => {
  const location = useLocation();
  const { formData } = location.state || { formData: {} };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Profile Page
        </Typography>
        <Typography variant="body1">
          <strong>First Name:</strong> {formData.firstName}
        </Typography>
        <Typography variant="body1">
          <strong>Last Name:</strong> {formData.lastName}
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {formData.email}
        </Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage;
