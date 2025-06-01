import AWS from 'aws-sdk';
// import { Readable } from 'stream';

interface paramsData {
  path: string;
  content: any;
  ContentType: string;
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
export const s3BucketUploader = async(BucketData: paramsData) => {
  const params = {
    Bucket:  process.env.AWS_S3_BUCKET_NAME,
    Key: BucketData.path,
    Body: BucketData.content,
    ContentType: BucketData.ContentType,
    ACL: 'public-read',
  };

  // Upload the file to S3
  try {
    const data = await s3.upload(params).promise();
    return { fileUrl: data.Location }; // Return the file URL
  } catch (error) {
    throw new Error("Failed to upload file to S3");
  }
}


// Helper function to parse the S3 URL
const parseS3Url = (url: string) => {
  const urlParts = url.split('.s3.');
  const bucketName = urlParts[0].split('//')[1];
  const key = urlParts[1].split('.amazonaws.com/')[1];
  return { bucketName, key };
};

export const checkS3FileExists = async (fileUrl: string) => {
  try {
    const { bucketName, key } = parseS3Url(fileUrl);

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    // Use headObject to check if the file exists
    await s3.headObject(params).promise();
    return true; // File exists
  } catch (error) {
    if (error.code === 'NotFound') {
      return false; // File does not exist
    }
    throw new Error(`Error checking file existence: ${error.message}`);
  }
};
