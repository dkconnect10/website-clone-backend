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


