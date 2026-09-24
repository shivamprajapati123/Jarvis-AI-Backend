import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "../config/s3.js"

export const uploadToS3=async (filename,buffer,contentType)=>{
 const bucketName=process.env.AWS_BUCKET_NAME?.trim()
 if(!bucketName){
  throw new Error("AWS_BUCKET_NAME is not configured")
 }

 await s3.send(
    new PutObjectCommand({
        Bucket:bucketName,
        Body:buffer,
        Key:filename,
        ContentType:contentType
    })

 )

 return filename
}