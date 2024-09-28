import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from '../models/subsribe.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "enter valid channelId ");
  }

  const channel = await  Subscription.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "channel not found");
  }

  const userId = req.user._id;
  const isSubscribed = channel.subscribers.includes(userId);

  if (isSubscribed) {
    channel.subscribers = channel.subscribers.filter(
      (id) => id.toString() !== userId.toString()
    );
  } else {
    channel.subscribers.push(userId);
  }

  await channel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "toggle subscription successfully"));

  // TODO: toggle subscription
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "enter valid channelId ");
  }

  const channel = await Subscription.findById(channelId);

  if (!channel) {
    throw new ApiError(400, "subscriber not found");
  }

  const userId = req.user._id;

  const channelSubscriber = channel.subscribers.includes(userId);

  if (!channelSubscriber) {
    throw new ApiError(404, "channel subscribers not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscriber,
        "chennal subscriber find successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(404, "enter valid subscriberId");
  }

  const userId = req.user._id;

  const subscribedChannels = await Subscription.find({
    subscribers: { $in: [userId] },
  });

  if (!subscribedChannels || subscribedChannels.length === 0) {
    throw new ApiError(404, "User is not subscribed to any channels");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "channel found"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
