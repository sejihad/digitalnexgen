import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.js";

async function deleteFromS3(key) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  await s3.send(new DeleteObjectCommand(params));
}

export default deleteFromS3;
