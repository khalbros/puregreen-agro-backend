import path from "path"
import {createWriteStream, createReadStream} from "fs"
import {v2 as cloudinary} from "cloudinary"

export default async function imageUpload(file: any): Promise<string> {
  let {filename} = file

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  })

  try {
    return await new Promise((resolve, reject) => {
      const result = cloudinary.uploader.upload_stream(
        {
          allowed_formats: ["jpg", "png"],
          folder: "puregreen-agro",
        },
        function (err, file) {
          if (file) {
            resolve(file.url)
          }
          if (err) {
            reject(err)
          }
        }
      )
      createReadStream(file).pipe(result)
    })
  } catch (error) {
    throw new Error("" + error)
  }
}
