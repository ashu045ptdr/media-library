// const { uploadToMinIO, getFromMinIO } = require("../services/minioService");
// const { saveToDynamoDB, fetchMediaList, fetchMediaMetadata } = require("../services/dynamoDBService");
// const { v4: uuidv4 } = require("uuid");

// async function uploadMedia(req, res) {
//   try {
//     const file = req.file;
//     // const { metadata } = req.body;
//     const metadata = JSON.parse(req.body.metadata);

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

// // async function listMedia(req, res) {
// //   try {
// //     const mediaList = await fetchMediaList();
// //     res.status(200).json({ media: mediaList });
// //   } catch (error) {
// //     console.error("Error fetching media list:", error);
// //     res.status(500).json({ error: "Internal server error." });
// //   }
// // }
// async function listMedia(req, res) {
//     try {
//       const mediaList = await fetchMediaList();  // Fetch media from DynamoDB
//       const updatedMediaList = mediaList.map(media => {
//         return {
//           mediaId: media.mediaId,  // Ensure mediaId exists
//           metadata: media.metadata,  // Ensure metadata exists
//           imageUrl: `http://localhost:5000/api/media/${media.mediaId}` // Dynamically generate media URL for frontend
//         };
//       });
  
//       res.status(200).json({ media: updatedMediaList });  // Return the updated media list
//     } catch (error) {
//       console.error("Error fetching media list:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   }
  
  

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

// // async function getMedia(req, res) {
// //     try {
// //       const { id } = req.params;
  
// //       // Fetch metadata from DynamoDB
// //       const command = new GetItemCommand({
// //         TableName: "media",
// //         Key: { mediaId: { S: id } }
// //       });
  
// //       const result = await dynamoDB.send(command);
// //       if (!result.Item) {
// //         return res.status(404).json({ error: "Media not found." });
// //       }
  
// //       // Get stored file format
// //       const contentType = result.Item.contentType.S; 
  
// //       // Stream file from MinIO
// //       minioClient.getObject("media-bucket", id, (err, stream) => {
// //         if (err) {
// //           console.error("Error fetching file from MinIO:", err);
// //           return res.status(500).json({ error: "File retrieval failed." });
// //         }
  
// //         // Set correct Content-Type before sending response
// //         res.setHeader("Content-Type", contentType);
// //         stream.pipe(res);
// //       });
  
// //     } catch (error) {
// //       console.error("Error in getMedia:", error);
// //       res.status(500).json({ error: "Internal server error." });
// //     }
// //   }
// async function getMedia(req, res) {
//     try {
//       const { id } = req.params;
  
//       // Fetch metadata from DynamoDB
//       const metadata = await fetchMediaMetadata(id);
//       if (!metadata) return res.status(404).json({ error: "Media not found." });
  
//       // Fetch the actual media file from MinIO
//       const stream = await getFromMinIO(id);
//       res.setHeader("Content-Type", "image/jpeg");  // Set correct content type
//       stream.pipe(res);  // Stream the file to the response
//     } catch (error) {
//       console.error("Error retrieving media:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   }
  
  

// module.exports = { uploadMedia, listMedia, getMedia };


const { uploadToMinIO, getFromMinIO, deleteFromMinIO  } = require("../services/minioService");
const { saveToDynamoDB, fetchMediaList, fetchMediaMetadata, deleteFromDynamoDB  } = require("../services/dynamoDBService");
const { v4: uuidv4 } = require("uuid");

async function uploadMedia(req, res) {
  try {
    const file = req.file;
    const metadata = JSON.parse(req.body.metadata);

    if (!file || !metadata) {
      return res.status(400).json({ error: "File and metadata are required." });
    }

    const mediaId = uuidv4();
    const etag = await uploadToMinIO(mediaId, file.buffer);
    await saveToDynamoDB(mediaId, metadata, etag, file.size);

    res.status(200).json({ message: "File uploaded successfully!", mediaId });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function listMedia(req, res) {
  try {
    const mediaList = await fetchMediaList();  // This function should return an array of media items
    const updatedMediaList = mediaList.map(media => {
      return {
        mediaId: media.mediaId,
        metadata: media.metadata,
        imageUrl: `http://localhost:5000/api/media/${media.mediaId}` // Dynamically generate image URL
      };
    });

    res.status(200).json({ media: updatedMediaList });  // Return the updated media list
  } catch (error) {
    console.error("Error fetching media list:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getMedia(req, res) {
  try {
    const { id } = req.params;
    const metadata = await fetchMediaMetadata(id);

    if (!metadata) {
      return res.status(404).json({ error: "Media not found." });
    }

    const stream = await getFromMinIO(id);
    res.setHeader("Content-Type", "image/jpeg");  // Adjust based on media type
    stream.pipe(res);
  } catch (error) {
    console.error("Error retrieving media:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function deleteMedia(req, res) {
    try {
      const { id } = req.params;
  
      // 1. Fetch the media metadata from DynamoDB
      const mediaMetadata = await fetchMediaMetadata(id);
      if (!mediaMetadata) {
        return res.status(404).json({ error: "Media not found." });
      }
  
      // 2. Delete the file from MinIO
      const deleteResult = await deleteFromMinIO(id);
      if (!deleteResult) {
        return res.status(500).json({ error: "Failed to delete media from MinIO." });
      }
  
      // 3. Delete the metadata from DynamoDB
      const deleteMetadataResult = await deleteFromDynamoDB(id);
      if (!deleteMetadataResult) {
        return res.status(500).json({ error: "Failed to delete media metadata from DynamoDB." });
      }
  
      // 4. Respond with success
      res.status(200).json({ message: "Media deleted successfully." });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }

module.exports = { uploadMedia, listMedia, getMedia, deleteMedia };
