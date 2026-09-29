import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

/**
 * Storage Client supporting MinIO (local dev) and Cloudflare R2 / AWS S3 (production).
 * Implements S3 SDK v3 commands with graceful fallback for local development.
 */
class StorageService {
  private client: S3Client
  private bucket: string

  constructor() {
    this.bucket = env.S3_BUCKET_NAME
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    })
  }

  getBucketName(): string {
    return this.bucket
  }

  /**
   * Retrieves an object from S3/MinIO.
   */
  async getObject(key: string): Promise<{ data: Uint8Array; contentType: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const response = await this.client.send(command)
      const contentType = response.ContentType || 'application/octet-stream'

      if (!response.Body) {
        throw new Error(`Empty body returned for object ${key}`)
      }

      const byteArray = await response.Body.transformToByteArray()
      return { data: byteArray, contentType }
    } catch (err: unknown) {
      logger.warn({ key, err }, 'Failed to fetch object from S3 storage')
      throw err
    }
  }

  /**
   * Puts an object into S3/MinIO.
   */
  async putObject(
    key: string,
    body: Uint8Array | Buffer | string,
    contentType: string,
    cacheControl?: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: typeof body === 'string' ? Buffer.from(body) : body,
      ContentType: contentType,
      CacheControl: cacheControl,
    })

    await this.client.send(command)
  }

  /**
   * Checks if an object exists and returns its metadata.
   */
  async headObject(key: string): Promise<{ size: number; contentType?: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
      const response = await this.client.send(command)
      return {
        size: response.ContentLength ?? 0,
        contentType: response.ContentType,
      }
    } catch {
      return null
    }
  }

  /**
   * Initiates an S3 multipart upload for large video files.
   */
  async createMultipartUpload(key: string, contentType = 'video/mp4'): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    })

    const response = await this.client.send(command)
    if (!response.UploadId) {
      throw new Error(`Failed to initiate multipart upload for ${key}`)
    }
    return response.UploadId
  }

  /**
   * Generates a presigned URL for an upload part (default 30-minute expiry).
   */
  async getSignedUploadPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresIn = 1800
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    })

    return getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Completes an S3 multipart upload.
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<void> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({
          PartNumber: p.partNumber,
          ETag: p.etag,
        })),
      },
    })

    await this.client.send(command)
  }

  /**
   * Aborts an in-progress S3 multipart upload.
   */
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    })

    await this.client.send(command)
  }
}

export const storage = new StorageService()
