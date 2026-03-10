import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${env.R2_PUBLIC_URL}/${key}`;
}

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return s3GetSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    { expiresIn },
  );
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
  );
}
