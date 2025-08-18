import Notification from "../models/notification.model.js";
import RoleRequest from "../models/roleRequest.model.js";
import { errorHandler } from "../utils/error.js";
import User from "./../models/user.model.js";

export const createRequestRole = async (req, res, next) => {
  const { userId } = req.params;
  const { message } = req.body;
  if (userId !== req.user.id || req.user.role !== "reader") {
    return next(
      errorHandler(
        401,
        "You are not allowed to request role change unless you are a reader and it's your own account."
      )
    );
  }
  if (!message || message.trim().length === 0) {
    return next(errorHandler(400, "Message is required!"));
  }
  if (message.length > 200) {
    return next(
      errorHandler(400, "Message must be less than or equal 200 character!")
    );
  }
  try {
    const existingRequest = await RoleRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingRequest) {
      return next(
        errorHandler(400, "You already have a pending role request!")
      );
    }

    const newRoleRequest = new RoleRequest({
      userId,
      message: message.trim(),
      status: "pending",
    });
    await newRoleRequest.save();

    const userThatSendRequest = await User.findById(userId);
    const adminUsers = await User.find({ role: "admin" });
    // console.log(adminUsers);

    for (const admin of adminUsers) {
      console.log(admin._id);
      await Notification.create({
        sender: userId,
        receiver: admin._id,
        type: "Role request",
        message: `${userThatSendRequest.username} request to change his role from reader to writer.`,
      });
    }

    res
      .status(201)
      .json({ message: "Your role request has been submitted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getRoleRequests = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(errorHandler(401, "Only admin can show role requests!"));
  }
  try {
    const roleRequests = await RoleRequest.find({ status: "pending" }).populate(
      "userId",
      "username email profilePicture"
    );
    res.status(200).json(roleRequests);
  } catch (error) {
    next(error);
  }
};

export const approveRoleRequest = async (req, res, next) => {
  const { roleRequestId } = req.params;
  if (req.user.role !== "admin") {
    return next(
      errorHandler(401, "You are not authorized to approve role requests.")
    );
  }
  try {
    const roleRequesst = await RoleRequest.findById(roleRequestId);

    if (!roleRequesst) {
      return next(errorHandler(404, "Role request not found."));
    }
    const roleRequestUpdated = await RoleRequest.findByIdAndUpdate(
      roleRequesst._id,
      { status: "approved" },
      {
        new: true,
      }
    );

    await User.findByIdAndUpdate(roleRequesst.userId, {
      role: "writer",
    });

    await Notification.create({
      sender: req.user.id,
      receiver: roleRequesst.userId,
      type: "Role update",
      message:
        "Your role request has been approved by admin and you are now a writer.",
      isRead: false,
    });
    return res.status(200).json({
      message: "Role request has been approved.",
      data: roleRequestUpdated,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectRoleRequest = async (req, res, next) => {
  const { roleRequestId } = req.params;
  if (req.user.role !== "admin") {
    return next(
      errorHandler(401, "You are not authorized to reject role requests.")
    );
  }
  try {
    const roleRequesst = await RoleRequest.findById(roleRequestId);

    if (!roleRequesst) {
      return next(errorHandler(404, "Role request not found."));
    }
    const roleRequestUpdated = await RoleRequest.findByIdAndUpdate(
      roleRequesst._id,
      { status: "reject" },
      {
        new: true,
      }
    );

    await Notification.create({
      sender: req.user.id,
      receiver: roleRequesst.userId,
      type: "Role update",
      message: "Your role request has been rejected by admin.",
      isRead: false,
    });
    return res.status(200).json({
      message: "Role request has been rejected.",
      data: roleRequestUpdated,
    });
  } catch (error) {
    next(error);
  }
};
