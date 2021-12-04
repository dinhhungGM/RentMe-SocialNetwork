const S3 = require("aws-sdk/clients/s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const bucket_name = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_S3_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  accessKeyId,
  secretAccessKey,
  region,
});

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucket_name,
    // acl: "private",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  })
});

const singleUpload = upload.single("file");

const uploadFiles = (req, res) => {
  singleUpload(req, res, (err) => {
    if (err ) {
      // A Multer error occurred when uploading.
      console.log(err);
      return res.status(400).json({
        success: false,
        err,
        message: "Error uploading file",
      });
    }
    
    return res.json({
      success: true,
      message: "uploaded",
      public_id: req.file.key,
      secure_url: req.file.location,
    });
  });
};

const deleteUploadedFile = (req, res) => {
    const { public_id } = req.params;
    const params = {
        Bucket: bucket_name,
        Key: public_id,
    };
    s3.deleteObject(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                success: false,
                err,
                message: "Error deleting file",
            });
        }
        return res.json({
            success: true,
            message: "deleted",
        });
    });
};

module.exports = {
    uploadFiles,
    deleteUploadedFile
};
