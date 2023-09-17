import {v2 as cloudinary} from "cloudinary"

export default async function imageUpload(file: any): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  })

  try {
    return await new Promise((resolve, reject) => {
      const result = cloudinary.uploader.upload(
        file,
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
    })
  } catch (error) {
    return "" + error
  }
}
