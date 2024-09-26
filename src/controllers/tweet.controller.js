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
  const user = await User.findById(req.user._id);

  const tweet = await Tweet.find({ user: user._id });

  if (!tweet?.length) {
    throw new ApiError(404, "tweet not found ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "user tweet find successfullly"));

  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  const userId = req.user._id;

  if (!content) {
    throw new ApiError(401, "Plese give new content");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet does not exist");
  }

  if (Tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(404, "You are not authorized to update this tweet ");
  }

  Tweet.content = content;
  const updatedTweet = await Tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweetupdate successfully"));
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
 const userId = req.user._id


  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Plese enter valid tweet id");
  }

if (Tweet.owner.toString() !== userId.toString()) {
  throw new ApiError(404,"you are not authorized for delete this tweet")
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
