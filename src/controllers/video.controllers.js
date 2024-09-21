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
    throw new ApiError(
      400,
      "page number or limit number must be probide positive number "
    );
  }

  const options = {
    page: pageNumber,
    limit: limitNumber,
    sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
    ...(query && {
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
      ],
    }),
    ...(userId && { user: userId }),
  };

  const videos = await Video.paginate(options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "video found successfully "));
});

const publishAllVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(401, "please give me title and description ");
  }
  const { videoFile, thumbnail } = req.files;

  if (!videoFile || !thumbnail) {
    throw new ApiError(
      401,
      "videoFile and thumbnail not upload successfully on localstorage "
    );
  }

  const videoFileLocalStore = req.files.videoFile[0].path;
  const thumbnailLocalStore = req.files.thumbnail[0].path;

  const video = await uploadOnCloudinary(videoFileLocalStore);
  if (!video) {
    throw new ApiError(401, "video not upload successfully on cloudinary ");
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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "VideoId not found");
  }

  const updatedValue = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  if (!updatedValue) {
    throw new ApiError(401, "information not updated succesfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, updatedValue, "Value update successfully"));
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "videoId is false");
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
    .json(200, foundVideo, "Video publish status toggled successfully");
});

export {
  getAllVideos,
  publishAllVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
