import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = +page;
  const limitNumber = +limit;

  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "page number or limit number must be provided as positive numbers");

  }

 const pipline = [
      {
        $match :{
          ...(query && {
            $or : [
              {title : new RegExp(query,"i")},
              {description: new RegExp(query,"i")}
            ],
          }),
          ...(userId &&{user:userId})
        },
      },
      {
        $sort :{
          [sortBy]: sortType==="asc" ? 1 : -1
        },
      },
    ];

    const options = {
      page: pageNumber,
      limit: limitNumber,
    }
  const videos = await Video.aggregatePaginate(pipline,options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos found successfully"));
});

const publishAllVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(401, "please give me title and description ");
  }

  const videoFileLocalStore = req.files?.videoFile[0].path;
  if (!videoFileLocalStore) {
    throw new ApiError(400, "videoFile not upload on local storage");
  }
  const thumbnailLocalStore = req.files?.thumbnail[0].path;
  if (!thumbnailLocalStore) {
    throw new ApiError(400, "thumbnail not uploaded on local storage");
  }

  const video = await uploadOnCloudinary(videoFileLocalStore);
  if (!video) {
    throw new ApiError(401, "videoFile not upload  on cloudinary ");
  }
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalStore);

  if (!thumbnailUpload) {
    throw new ApiError(400, "thumbnail file not upload on cloudinary ");
  }

  const videoObject = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnailUpload.url,
    title,
    description,
    user: req.user ? req.user._id : null,
  });
  if (!videoObject) {
    throw new ApiError(501, "video object not create ");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, videoObject, "video object create successfully ")
    );

  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "provide video Id ");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id ");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "Video not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "video found successfully"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(401, "title and description are required");
  }

  const existingVideo = await Video.findById(videoId)

  if (!existingVideo) {
    throw new ApiError(401,"video not found")
  }


  let thumbnail = existingVideo.thumbnail

  const thumbnailLocal = req.files?.thumbnail[0]?.path;

  if (thumbnailLocal) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocal);
    if (!uploadedThumbnail || !uploadedThumbnail.url) {
      throw new ApiError(501,"thumbnail not uploaded to cloudinary")
    }
    thumbnail=uploadedThumbnail.url
  }

  

  

  const updateVideosDetail = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail
      },
    },
    {
      new: true,
    }
  );
    if (!updateVideosDetail) {
      throw new ApiError(501,"Video details not updated properly")
    }


  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        updateVideosDetail,
        "title , description and thumbnail updated sucessfully "
      )
    );

  // if (!isValidObjectId(videoId)) {
  //   throw new ApiError(401, "VideoId not found");
  // }

  // const thumbnailUploadOnLocalPath = req.files?.thumbnail[0]?.path

  // if (!thumbnailUploadOnLocalPath) {
  //   throw new ApiError(400,"thumbnail not uploaded properly on localstorage")
  // }

  // const thumbnail = await uploadOnCloudinary(thumbnailUploadOnLocalPath)

  // if (!thumbnail) {
  //   throw new ApiError(501,"thumbnail not upload on cloudinary ")
  // }

  // const updatedValue = await Video.findByIdAndUpdate(
  //   videoId,
  //   {
  //     $set: {
  //       title,
  //       description,
  //       thumbnail: thumbnail.url,
  //     },
  //   },
  //   { new: true }
  // );

  // if (!updatedValue) {
  //   throw new ApiError(401, "information not updated succesfully");
  // }

  // return res
  //   .status(200)
  //   .json(new ApiResponse(201, updatedValue, "Value update successfully"));
  // TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "provide video id please");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "videoId not valid");
  }

  const removeVideo = await Video.findByIdAndDelete(
    videoId,

    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, removeVideo, "Your video remove successfully "));

  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError("provide right video id ");
  }
  const foundVideo = await Video.findById(videoId);
  if (!foundVideo) {
    throw new ApiError("video not uploaded successfully");
  }

  foundVideo.isPublished = !foundVideo.isPublished;
  await foundVideo.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        foundVideo,
        "Video publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAllVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

// import { Video } from "../models/video.model.js";
// import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// // Get All Videos
// const getAllVideos = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 10,
//     query,
//     sortBy = "createdAt",
//     sortType = "desc",
//     userId,
//   } = req.query;

//   const pageNumber = +page;
//   const limitNumber = +limit;

//   if (pageNumber < 1 || limitNumber < 1) {
//     throw new ApiError(400, "Page number or limit must be positive numbers");
//   }

//   // Build query options
//   const queryOptions = {
//     ...(query && {
//       $or: [
//         { title: new RegExp(query, "i") },
//         { description: new RegExp(query, "i") },
//       ],
//     }),
//     ...(userId && { user: userId }),
//   };

//   // Pagination options
//   const options = {
//     page: pageNumber,
//     limit: limitNumber,
//     sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
//   };

//   // Retrieve paginated videos
//   const videos = await Video.aggregatePaginate(queryOptions, options);

//   res.status(200).json(new ApiResponse(200, videos, "Videos retrieved successfully"));
// });

// // Get Video By ID
// const getVideoById = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   if (!videoId) {
//     throw new ApiError(400, "Video ID is required");
//   }

//   const video = await Video.findById(videoId);

//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
// });

// // Publish or Upload Video
// const publishAllVideo = asyncHandler(async (req, res) => {
//   const { title, description } = req.body;
//   const videoFile = req.files?.videoFile?.[0];
//   const thumbnail = req.files?.thumbnail?.[0];

//   if (!title || !videoFile) {
//     throw new ApiError(400, "Title and video file are required");
//   }

//   const newVideo = await Video.create({
//     title,
//     description,
//     videoUrl: videoFile.path,
//     thumbnailUrl: thumbnail ? thumbnail.path : undefined,
//     user: req.user._id,
//   });

//   res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
// });

// // Update Video
// const updateVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   const { title, description } = req.body;
//   const thumbnail = req.file;

//   const video = await Video.findById(videoId);

//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   // Update fields
//   video.title = title || video.title;
//   video.description = description || video.description;
//   if (thumbnail) {
//     video.thumbnailUrl = thumbnail.path;
//   }

//   await video.save();

//   res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
// });

// // Delete Video
// const deleteVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   const video = await Video.findByIdAndDelete(videoId);

//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
// });

// // Toggle Publish Status
// const togglePublishStatus = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   const video = await Video.findById(videoId);

//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   // Toggle publish status
//   video.isPublished = !video.isPublished;
//   await video.save();

//   res.status(200).json(new ApiResponse(200, video, "Video publish status toggled"));
// });

// export {
//   getAllVideos,
//   getVideoById,
//   publishAllVideo,
//   updateVideo,
//   deleteVideo,
//   togglePublishStatus,
// };
