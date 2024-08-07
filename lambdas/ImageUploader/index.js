const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    try {
        // Parse the body to get imageBase64 and metadata
        const requestBody = JSON.parse(event.body);
        const { imageBase64, metadata } = requestBody;

        // Decode the base64 image
        const buffer = Buffer.from(imageBase64, 'base64');

        // Generate a unique file name
        const fileName = `uploads/${uuidv4()}.jpg`; // Using .jpg extension

        // Parameters for the S3 upload
        const params = {
            Bucket: 'fitsnap-bucket',
            Key: fileName, // the unique name of the file to be saved in S3
            Body: buffer,
            ContentEncoding: 'base64', // Specify base64 encoding
            ContentType: 'image/jpeg', // Content type for JPEG images
            Metadata: metadata // Metadata to be stored with the image
        };

        // Upload the image to S3
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully at ${data.Location}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image uploaded successfully!',
                data: data
            })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to upload image',
                error: error.message
            })
        };
    }
};
