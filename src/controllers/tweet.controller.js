import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "contend not found");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(401, "Your tweet not posting successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "your tweet post successfully"));

  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "please enter valid userId");
  }

  const tweet = await Tweet.find({ user: userId });

  if (!tweet) {
    throw new ApiError(404, "tweet not found ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "user tweet find successfullly"));

  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { tweetId } = req.params;

  if (!newContent) {
    throw new ApiError(401, "Plese give new content");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(401, "tweet not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweetupdate successfully"));
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Plese enter valid tweet id");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(501, "tweets not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { successfully: true }, "Tweet remove successfully")
    );

  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
