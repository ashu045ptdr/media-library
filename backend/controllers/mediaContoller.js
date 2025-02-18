// const { uploadToMinIO, getFromMinIO } = require("../services/minioService");
// const { saveToDynamoDB, fetchMediaList, fetchMediaMetadata } = require("../services/dynamoDBService");
// const { v4: uuidv4 } = require("uuid");

// async function uploadMedia(req, res) {
//   try {
//     const file = req.file;
//     const { metadata } = req.body;

//     if (!file || !metadata) {
//       return res.status(400).json({ error: "File and metadata are required." });
//     }

//     const mediaId = uuidv4();
//     const etag = await uploadToMinIO(mediaId, file.buffer);
//     await saveToDynamoDB(mediaId, metadata, etag, file.size);

//     res.status(200).json({ message: "File uploaded successfully!", mediaId });
//   } catch (error) {
//     console.error("Error uploading media:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// }

// async function listMedia(req, res) {
//   try {
//     const mediaList = await fetchMediaList();
//     res.status(200).json({ media: mediaList });
//   } catch (error) {
//     console.error("Error fetching media list:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// }

// // async function getMedia(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const metadata = await fetchMediaMetadata(id);
// //     if (!metadata) return res.status(404).json({ error: "Media not found." });

// //     const stream = await getFromMinIO(id);
// //     res.setHeader("Content-Type", "image/jpeg");
// //     stream.pipe(res);
// //   } catch (error) {
// //     console.error("Error retrieving media:", error);
// //     res.status(500).json({ error: "Internal server error." });
// //   }
// // }

// async function getMedia(req, res) {
//     try {
//       const { id } = req.params;
  
//       // Fetch metadata from DynamoDB
//       const command = new GetItemCommand({
//         TableName: "media",
//         Key: { mediaId: { S: id } }
//       });
  
//       const result = await dynamoDB.send(command);
//       if (!result.Item) {
//         return res.status(404).json({ error: "Media not found." });
//       }
  
//       // Get stored file format
//       const contentType = result.Item.contentType.S; 
  
//       // Stream file from MinIO
//       minioClient.getObject("media-bucket", id, (err, stream) => {
//         if (err) {
//           console.error("Error fetching file from MinIO:", err);
//           return res.status(500).json({ error: "File retrieval failed." });
//         }
  
//         // Set correct Content-Type before sending response
//         res.setHeader("Content-Type", contentType);
//         stream.pipe(res);
//       });
  
//     } catch (error) {
//       console.error("Error in getMedia:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   }

// module.exports = { uploadMedia, listMedia, getMedia };



const { uploadToMinIO, getFromMinIO } = require("../services/minioService");
const { saveToDynamoDB, fetchMediaList, fetchMediaMetadata } = require("../services/dynamoDBService");
const { v4: uuidv4 } = require("uuid");

// ✅ Upload Media
async function uploadMedia(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required." });
    }

    const metadata = req.body.metadata || "{}"; // Ensure metadata exists
    const mediaId = uuidv4();
    const contentType = file.mimetype; // Get correct MIME type

    // ✅ Upload to MinIO
    const etag = await uploadToMinIO(mediaId, file.buffer, contentType);

    // ✅ Save Metadata to DynamoDB
    await saveToDynamoDB(mediaId, metadata, etag, file.size, contentType);

    res.status(200).json({ message: "File uploaded successfully!", mediaId });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// ✅ Fetch All Media
async function listMedia(req, res) {
  try {
    const mediaList = await fetchMediaList();
    const formattedMedia = mediaList.map(media => ({
      id: media.mediaId.S,
      metadata: JSON.parse(media.metadata.S),
      fileSize: media.fileSize.N,
      uploadDate: media.uploadDate.S,
      imageUrl: `http://localhost:9000/media-bucket/${media.mediaId.S}`
    }));
    res.status(200).json({ media: formattedMedia });
  } catch (error) {
    console.error("Error fetching media list:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

// ✅ Fetch Single Media (Streaming)
async function getMedia(req, res) {
  try {
    const { id } = req.params;
    const mediaMetadata = await fetchMediaMetadata(id);

    if (!mediaMetadata) {
      return res.status(404).json({ error: "Media not found." });
    }

    const contentType = mediaMetadata.contentType.S;

    // ✅ Stream file from MinIO
    getFromMinIO(id, (err, stream) => {
      if (err) {
        console.error("Error fetching file from MinIO:", err);
        return res.status(500).json({ error: "File retrieval failed." });
      }
      res.setHeader("Content-Type", contentType);
      stream.pipe(res);
    });

  } catch (error) {
    console.error("Error in getMedia:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { uploadMedia, listMedia, getMedia };
