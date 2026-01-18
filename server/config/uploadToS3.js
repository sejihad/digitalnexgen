import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.js";

async function uploadToS3(file, folder) {
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: file.data,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(params));

  return {
    url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
    key: fileName,
  };
}

export default uploadToS3;
