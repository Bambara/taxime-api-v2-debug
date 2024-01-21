"use strict";

const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// const config = require("../config");
require("dotenv").config();
// const Driver = require("../models/driver");
// const User = require("../models/user");
// const Vehicle = require("../models/vehicle");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const cryptoHandler = "../controllers/cryptoHandler";
const rand = require("../services/randomnum");

/* author ghost */
// Imports the Google Cloud client library
const path = require("path");
const fs = require("fs");
const { Storage } = require("@google-cloud/storage");

const BASE_URL = process.env.BASE_URL;
const BASE_PORT = process.env.BASE_PORT;

const image_bucket_status = process.env.IMAGE_BUCKET;

const gc = new Storage({
  keyFilename: path.join(
    __dirname,
    "../" + process.env.GOOGLE_STORAGE_KEY_FILE_NAME
  ),
  projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
});

const taximeImageBucket = gc.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME);

app.use(cors());
router.use(cors());

app.use(fileUpload());

//support on x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// exports.uploadImages = function (req, objId, modelName, folderName) {
//     if (!req) {
//         console.log('no req');
//     } else {
//         let id = new mongoose.Types.ObjectId(objId);

//         modelName.findById(id)
//         .exec(function (err, result) {
//             if (err) {
//                 console.log('errr')
//             } else {
//                 if (result !== null) {
//                     var imageFirstName = rand.imagename();
//                     for (let key in req) {

//                         // let targetPath = config.googleBucketImageFolder+ '/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1];
//                         // const blob = taximeImageBucket.file(targetPath);
//                         // const blobStream = blob.createWriteStream({
//                         //     resumable: false,
//                         //     gzip: true,
//                         //     metadata: {
//                         //         contentType: req[key].mimetype,
//                         //     },
//                         // });

//                         // blobStream.on('finish', () => {
//                         //     console.log('image uploaded succesfully');
//                         //     const publicUrl = `https://storage.googleapis.com/${config.googleStorageBucketName}/${blob.name}`
//                         //     console.log(publicUrl);

//                         //     var imagePath = publicUrl;
//                         //     modelName.findByIdAndUpdate(id, imagePath, function (err, result) {
//                         //         if (err) {
//                         //             console.log('Image path saving failed: '+err);
//                         //         } else {
//                         //             console.log('successs saved image path!');
//                         //         }
//                         //     })
//                         // })
//                         // .on('error', (err) => {
//                         //     console.log("Unable to upload image, error : "+err);
//                         // })
//                         // .end(req[key].buffer)

//                         req[key].mv('./public/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1], function (err) {
//                             if (err) {
//                                 console.log('err1');
//                             } else {
//                                 var imagePath = { $set: {} }
//                                 imagePath.$set[key] = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1]
//                                 modelName.findByIdAndUpdate(id, imagePath, function (err, result) {
//                                     if (err) {
//                                         console.log('err2');
//                                     } else {
//                                         console.log('successs!');
//                                     }
//                                 })
//                             }
//                         });
//                     }
//                 }
//                 else {
//                     console.log('err');
//                 }
//             }
//         });
//     }
// };

// exports.uploadImagesCallback = function (req, objId, modelName, folderName, callback) {
//     if (!req) {
//         console.log('no req');
//     } else {
//         let id = new mongoose.Types.ObjectId(objId);

//         modelName.findById(id)
//         .exec(function (err, result) {
//             if (err) {
//                 console.log('errr')
//             } else {
//             if (result !== null) {
//                 var imageFirstName = rand.imagename();
//                 for (let key in req) {

//                     req[key].mv('./public/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1], function (err) {
//                         if (err) {
//                         console.log('err1');
//                         } else {
//                         var imagePath = { $set: {} }
//                         imagePath.$set[key] = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1]
//                         modelName.findByIdAndUpdate(id, imagePath, function (err, result) {
//                             if (err) {
//                             console.log('err2');
//                             } else {
//                             console.log('successs!');
//                             }
//                         })
//                         }
//                     });

//                 }
//                 callback(1);
//             }
//             else {
//                 console.log('err');
//             }
//             }
//         });
//     }
// };

// exports.uploadImagesInSubDocuments = function (req, ParentId, ChildId, modelName, folderName) {
//     console.log('inside image upload')
//     if (!req) {
//         console.log('no req');
//     } else {
//         let parentId = new mongoose.Types.ObjectId(ParentId);
//         let childId = new mongoose.Types.ObjectId(ChildId);

//         modelName.findById(parentId)
//         .exec(function (err, result) {
//             if (err) {
//                 console.log('err1')
//             } else {
//                 if (result !== null) {
//                     var imageFirstName = rand.imagename();
//                     for (let key in req) {

//                         req[key].mv('./public/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1], function (err) {
//                             if (err) {
//                             console.log('err2');
//                             } else {
//                             // var imagePath = { $set: {} }
//                             var imagePath = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1]
//                             console.log("imagePath: "+ imagePath);
//                             // if (key === 'mapIcon') {

//                                 var setModifier = { $set: {} };
//                                 setModifier.$set['subCategory.$.' + key ] = imagePath;
//                                 console.log(setModifier);
//                             modelName.update({
//                                 _id: parentId,
//                                 "subCategory._id": childId
//                             }, setModifier
//                             )
//                             .exec(function(err, result) {
//                                 if(err) {
//                                 console.log("err3");
//                                 } else {
//                                 console.log(result)
//                                 }
//                             })

//                         //     // modelName.findByIdAndUpdate(parentId, imagePath, function (err, result) {
//                         //     //   if (err) {
//                         //     //     console.log('err');
//                         //     //   } else {
//                         //     //     console.log('successs!');
//                         //     //   }
//                         //     // })
//                             }
//                         });

//                     }
//                 }
//                 else {
//                     console.log('err');
//                 }
//             }
//         });
//     }
// };

exports.uploadImages = function (req, objId, modelName, folderName) {
  if (!req) {
    console.log("no req");
  } else {
    let id = new mongoose.Types.ObjectId(objId);

    modelName.findById(id).exec(function (err, result) {
      if (err) {
        console.log("errr");
      } else {
        if (result !== null) {
          var imageFirstName = rand.imagename();
          for (let key in req) {
            if (image_bucket_status) {
              let targetPath =
                process.env.GOOGLE_BUCKET_IMAGE_FOLDER +
                "/" +
                folderName +
                "/" +
                imageFirstName +
                "_" +
                key +
                "." +
                req[key].mimetype.split("/")[1];
              const targetFile = taximeImageBucket.file(targetPath);

              const fileContents = Buffer.from(req[key].data, "base64");
              fs.writeFile(req[key].name, fileContents, (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log("file saved to ", req[key].name);

                fs.createReadStream(req[key].name)
                  .pipe(
                    targetFile.createWriteStream({
                      metadata: {
                        "Cache-Control": "public, max-age=31536000",
                        contentType: req.type,
                      },
                    })
                  )
                  .on("error", (err) => {
                    console.log(err);
                    //restify.InternalServerError(err);
                  })
                  .on("finish", () => {
                    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${targetPath}`;

                    var imagePath = { $set: {} };
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log(
                            "uploadImages: Image path saving failed: " + err
                          );
                        } else {
                          console.log(
                            "uploadImages: successs saved image path!"
                          );
                        }
                      }
                    );
                  });
              });
            } else {
              req[key].mv(
                "./public/images/" +
                  folderName +
                  "/" +
                  imageFirstName +
                  "_" +
                  key +
                  "." +
                  req[key].mimetype.split("/")[1],
                function (err) {
                  if (err) {
                    console.log("err1");
                  } else {
                    const publicUrl =
                      BASE_URL.concat(":").concat(BASE_PORT) +
                      "/images/" +
                      folderName +
                      "/" +
                      imageFirstName +
                      "_" +
                      key +
                      "." +
                      req[key].mimetype.split("/")[1];

                    var imagePath = { $set: {} };
                    //imagePath.$set[key] = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1];
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log(
                            "uploadImages: Image path saving failed: " + err
                          );
                          //console.log('err2');
                        } else {
                          console.log(
                            "uploadImages: successs saved image path!"
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        } else {
          console.log("err");
        }
      }
    });
  }
};

exports.uploadProfileImageCallback = function (
  req,
  objId,
  modelName,
  folderName,
  callback
) {
  if (!req) {
    console.log("no req");
  } else {
    let id = new mongoose.Types.ObjectId(objId);

    return modelName.findById(id).exec(function (err, result) {
      if (err) {
        console.log("errr");
      } else {
        if (result !== null) {
          var imageFirstName = rand.imagename();
          for (let key in req) {
            if (image_bucket_status) {
              let targetPath =
                process.env.GOOGLE_BUCKET_IMAGE_FOLDER +
                "/" +
                folderName +
                "/" +
                imageFirstName +
                "_" +
                key +
                "." +
                req[key].mimetype.split("/")[1];
              const targetFile = taximeImageBucket.file(targetPath);

              const fileContents = Buffer.from(req[key].data, "base64");
              fs.writeFile(req[key].name, fileContents, (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log("file saved to ", req[key].name);

                fs.createReadStream(req[key].name)
                  .pipe(
                    targetFile.createWriteStream({
                      metadata: {
                        "Cache-Control": "public, max-age=31536000",
                        contentType: req.type,
                      },
                    })
                  )
                  .on("error", (err) => {
                    restify.InternalServerError(err);
                  })
                  .on("finish", () => {
                    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${targetPath}`;

                    var imagePath = { $set: {} };
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log("Image path saving failed: " + err);
                        } else {
                          console.log(
                            "uploadImagesCallback: successs saved image path!"
                          );
                        }
                      }
                    );
                  });
              });
            } else {
              return req[key].mv(
                "./public/images/" +
                  folderName +
                  "/" +
                  imageFirstName +
                  "_" +
                  key +
                  "." +
                  req[key].mimetype.split("/")[1],
                function (err) {
                  if (err) {
                    console.log("err1");
                  } else {
                    const publicUrl =
                      BASE_URL.concat(":").concat(BASE_PORT) +
                      "/images/" +
                      folderName +
                      "/" +
                      imageFirstName +
                      "_" +
                      key +
                      "." +
                      req[key].mimetype.split("/")[1];

                    var imagePath = { $set: {} };
                    //imagePath.$set[key] = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1];
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log("Image path saving failed: " + err);
                          //console.log('err2');
                        } else {
                          console.log(
                            "uploadImagesCallback: successs saved image path!"
                          );
                          return callback(publicUrl);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
          callback(1);
        } else {
          console.log("err");
        }
      }
    });
  }
};

exports.uploadImagesCallback = function (
  req,
  objId,
  modelName,
  folderName,
  callback
) {
  if (!req) {
    console.log("no req");
  } else {
    let id = new mongoose.Types.ObjectId(objId);

    modelName.findById(id).exec(function (err, result) {
      if (err) {
        console.log("errr");
      } else {
        if (result !== null) {
          var imageFirstName = rand.imagename();
          for (let key in req) {
            if (image_bucket_status) {
              let targetPath =
                process.env.GOOGLE_BUCKET_IMAGE_FOLDER +
                "/" +
                folderName +
                "/" +
                imageFirstName +
                "_" +
                key +
                "." +
                req[key].mimetype.split("/")[1];
              const targetFile = taximeImageBucket.file(targetPath);

              const fileContents = Buffer.from(req[key].data, "base64");
              fs.writeFile(req[key].name, fileContents, (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log("file saved to ", req[key].name);

                fs.createReadStream(req[key].name)
                  .pipe(
                    targetFile.createWriteStream({
                      metadata: {
                        "Cache-Control": "public, max-age=31536000",
                        contentType: req.type,
                      },
                    })
                  )
                  .on("error", (err) => {
                    restify.InternalServerError(err);
                  })
                  .on("finish", () => {
                    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${targetPath}`;

                    var imagePath = { $set: {} };
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log("Image path saving failed: " + err);
                        } else {
                          console.log(
                            "uploadImagesCallback: successs saved image path!"
                          );
                        }
                      }
                    );
                  });
              });
            } else {
              req[key].mv(
                "./public/images/" +
                  folderName +
                  "/" +
                  imageFirstName +
                  "_" +
                  key +
                  "." +
                  req[key].mimetype.split("/")[1],
                function (err) {
                  if (err) {
                    console.log("err1");
                  } else {
                    const publicUrl =
                      BASE_URL.concat(":").concat(BASE_PORT) +
                      "/images/" +
                      folderName +
                      "/" +
                      imageFirstName +
                      "_" +
                      key +
                      "." +
                      req[key].mimetype.split("/")[1];

                    var imagePath = { $set: {} };
                    //imagePath.$set[key] = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1];
                    imagePath.$set[key] = publicUrl;

                    modelName.findByIdAndUpdate(
                      id,
                      imagePath,
                      function (err, result) {
                        if (err) {
                          console.log("Image path saving failed: " + err);
                          //console.log('err2');
                        } else {
                          console.log(
                            "uploadImagesCallback: successs saved image path!"
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
          callback(1);
        } else {
          console.log("err");
        }
      }
    });
  }
};

exports.uploadImagesInSubDocuments = function (
  req,
  ParentId,
  ChildId,
  modelName,
  folderName
) {
  console.log("inside image upload");
  if (!req) {
    console.log("no req");
  } else {
    let parentId = new mongoose.Types.ObjectId(ParentId);
    let childId = new mongoose.Types.ObjectId(ChildId);

    modelName.findById(parentId).exec(function (err, result) {
      if (err) {
        console.log("err1");
      } else {
        if (result !== null) {
          var imageFirstName = rand.imagename();

          for (let key in req) {
            if (image_bucket_status) {
              let targetPath =
                process.env.GOOGLE_BUCKET_IMAGE_FOLDER +
                "/" +
                folderName +
                "/" +
                imageFirstName +
                "_" +
                key +
                "." +
                req[key].mimetype.split("/")[1];
              const targetFile = taximeImageBucket.file(targetPath);

              const fileContents = Buffer.from(req[key].data, "base64");
              fs.writeFile(req[key].name, fileContents, (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log("file saved to ", req[key].name);

                fs.createReadStream(req[key].name)
                  .pipe(
                    targetFile.createWriteStream({
                      metadata: {
                        "Cache-Control": "public, max-age=31536000",
                        contentType: req.type,
                      },
                    })
                  )
                  .on("error", (err) => {
                    restify.InternalServerError(err);
                  })
                  .on("finish", () => {
                    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${targetPath}`;

                    var setModifier = { $set: {} };
                    setModifier.$set["subCategory.$." + key] = publicUrl;
                    console.log(setModifier);

                    modelName
                      .update(
                        {
                          _id: parentId,
                          "subCategory._id": childId,
                        },
                        setModifier
                      )
                      .exec(function (err, result) {
                        if (err) {
                          console.log(
                            "uploadImagesInSubDocuments: Image path saving failed: " +
                              err
                          );
                          console.log(setModifier);
                        } else {
                          console.log(
                            "uploadImagesInSubDocuments: upload Images In Sub Documents succesess"
                          );
                        }
                      });
                  });
              });
            } else {
              req[key].mv(
                "./public/images/" +
                  folderName +
                  "/" +
                  imageFirstName +
                  "_" +
                  key +
                  "." +
                  req[key].mimetype.split("/")[1],
                function (err) {
                  if (err) {
                    console.log("err2");
                  } else {
                    const publicUrl =
                      BASE_URL.concat(":").concat(BASE_PORT) +
                      "/images/" +
                      folderName +
                      "/" +
                      imageFirstName +
                      "_" +
                      key +
                      "." +
                      req[key].mimetype.split("/")[1];

                    // var imagePath = { $set: {} }
                    //var imagePath = '/images/' + folderName + '/' + imageFirstName + '_' + key + '.' + req[key].mimetype.split('/')[1]
                    //console.log("imagePath: "+ imagePath);

                    var setModifier = { $set: {} };
                    setModifier.$set["subCategory.$." + key] = publicUrl;
                    console.log(setModifier);

                    modelName
                      .update(
                        {
                          _id: parentId,
                          "subCategory._id": childId,
                        },
                        setModifier
                      )

                      .exec(function (err, result) {
                        if (err) {
                          console.log(
                            "uploadImagesInSubDocuments: Image path saving failed: " +
                              err
                          );
                        } else {
                          console.log(
                            "uploadImagesInSubDocuments: upload Images In Sub Documents succesess"
                          );
                        }
                      });
                  }
                }
              );
            }
          }
        } else {
          console.log("err");
        }
      }
    });
  }
};
