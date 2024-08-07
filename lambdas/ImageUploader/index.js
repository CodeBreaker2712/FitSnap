const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: headers, body: '' };
    }

    try {
        console.log('Event body:', event.body);
        const requestBody = JSON.parse(event.body);
        console.log('Parsed request body:', JSON.stringify(requestBody));
        
        const { imageBase64, metadata } = requestBody;
        
        if (!imageBase64) {
            throw new Error('imageBase64 is undefined or null');
        }
        
        console.log('Image base64 length:', imageBase64.length);
        console.log('Metadata:', JSON.stringify(metadata));

        const buffer = Buffer.from(imageBase64, 'base64');
        const fileName = `uploads/${uuidv4()}.jpg`;

        const params = {
            Bucket: 'fitsnap-bucket',
            Key: fileName,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            Metadata: metadata || {}
        };

        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully at ${data.Location}`);
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                message: 'Image uploaded successfully!',
                data: data
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                message: 'Failed to upload image',
                error: error.message,
                stack: error.stack
            })
        };
    }
};