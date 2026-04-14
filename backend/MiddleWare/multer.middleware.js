import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images')  //specify the destination directory where files will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

        const ext = path.extname(file.originalname)

        cb(null,`${uniqueSuffix}${ext}`)   ///o/p =>1634239082938-123456789.jpg
    }
})
const upload = multer({storage});
export default upload;

