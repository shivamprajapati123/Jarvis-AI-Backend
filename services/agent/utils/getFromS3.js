import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getFromS3=async (filename,expiresIn=600)=>{
  const bucketName=process.env.AWS_BUCKET_NAME?.trim()
  if(!bucketName){
    throw new Error("AWS_BUCKET_NAME is not configured")
  }

  return await getSignedUrl(
    s3,
    new GetObjectCommand({
        Bucket:bucketName,
        Key:filename
    }
    ),
    {expiresIn}
  )
}