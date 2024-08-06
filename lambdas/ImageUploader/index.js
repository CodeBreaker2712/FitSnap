const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    try {
        // Parse the body to get imageBase64
        const requestBody = JSON.parse(event.body);
        const { imageBase64 } = requestBody;
        
        // Decode the base64 image
        const buffer = Buffer.from(imageBase64, 'base64');

        // Generate a unique file name
        const fileName = `${uuidv4()}.jpg`;

        // Parameters for the S3 upload
        const params = {
            Bucket: 'fitsnap-bucket',
            Key: fileName, // the unique name of the file to be saved in S3
            Body: buffer,
            ContentEncoding: 'base64', // required if the image is base64 encoded
            ContentType: 'image/jpeg' // adjust accordingly if image type is different
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
