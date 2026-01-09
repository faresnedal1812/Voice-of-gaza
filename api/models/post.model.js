import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/technology-communication-icons-symbols-concept_53876-120314.jpg?ga=GA1.1.131351233.1739735698&semt=ais_hybrid&w=740",
    },
    category: {
      type: String,
      enum: [
        "Uncategorized",
        "News & Updates",
        "Daily Life",
        "Humanitarian Stories",
        "Culture & History",
        "Resistance & Freedom",
        "Youth & Education",
        "Health & Hospitals",
        "Voices from the Ground",
        "Photojournalism",
        "Opinion & Analysis",
        "International Solidarity",
        "Economy & Infrastructure",
        "Environment",
      ],
      default: "Uncategorized",
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
