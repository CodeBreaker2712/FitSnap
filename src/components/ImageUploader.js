import React, { useState } from 'react';

function ImageUploader({ jwtToken }) {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

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
        } else {
          console.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageSelect} />
      {imageUrl && <img src={imageUrl} alt="Selected" style={{ maxWidth: '300px', marginTop: '1rem' }} />}
      <br />
      <button onClick={handleImageSubmit} disabled={!imageFile} style={{ marginTop: '1rem' }}>
        Submit Image
      </button>
    </div>
  );
}

export default ImageUploader;