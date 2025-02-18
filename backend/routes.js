const express = require("express");
const { uploadMedia, listMedia, getMedia, deleteMedia } = require("./controllers/mediaContoller");

module.exports = (upload) => {
  const router = express.Router();
  router.post("/upload", upload.single("file"), uploadMedia);
  router.get("/media", listMedia);
  router.get("/media/:id", getMedia);
  router.delete("/media/:id", deleteMedia);
  return router;
};
