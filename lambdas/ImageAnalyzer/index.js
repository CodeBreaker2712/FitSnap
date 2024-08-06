const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucketName = 'fitsnap-bucket';
  const base64Image = event.body; // Base64 encoded image
  const buffer = Buffer.from(base64Image, 'base64');

  const params = {
    Bucket: bucketName,
    Key: `uploads/${Date.now()}.jpg`, // You can change the file extension based on the image format
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg', // Adjust based on actual image type
  };

  try {
    const data = await s3.upload(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image uploaded successfully',
        location: data.Location,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Image upload failed',
        error: error.message,
      }),
    };
  }
};
