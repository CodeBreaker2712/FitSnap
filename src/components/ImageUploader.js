import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

function ImageUploader({ jwtToken }) {
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const base64Url = reader.result.split(',')[1]; // Remove the data:image/jpeg;base64, part
            console.log('Base64 data:', base64Url.substring(0, 50) + '...'); // Log first 50 characters
            try {
                const response = await fetch('https://f9ngw4hasj.execute-api.us-east-1.amazonaws.com/dev/image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    },
                    body: JSON.stringify({ imageBase64: base64Url, metadata: {} })
                });

                if (response.ok) {
                    const responseData = await response.json();
                    const s3ObjectKey = responseData.data.Key;
                    localStorage.setItem('lastUploadedImageKey', s3ObjectKey);
                    console.log('Image uploaded successfully');
                    setIsModalOpen(true);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to upload image:', errorData);
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
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default ImageUploader;