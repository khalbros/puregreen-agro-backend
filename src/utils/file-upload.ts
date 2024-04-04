import {v2 as cloudinary} from "cloudinary"
import sharp from "sharp"

export default async function imageUpload(file: any): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  })

  try {
    return await new Promise(async (resolve, reject) => {
      // Resize and compress the image
      const imageBuffer = Buffer.from(file.data, "base64")
      const resizedBuffer = await sharp(imageBuffer)
        .resize({fit: "inside", width: 800}) // Adjust the width as needed
        .jpeg({quality: 80}) // Adjust quality as needed
        .toBuffer()

      cloudinary.uploader
        .upload_stream(
          {
            folder: "puregreen-agro",
            invalidate: true,
            overwrite: true,
          },
          function (err, result) {
            if (result) {
              resolve(result.secure_url)
            }
            if (err) {
              reject(err)
            }
          }
        )
        .end(resizedBuffer)
    })
  } catch (error) {
    return "" + error
  }
}
