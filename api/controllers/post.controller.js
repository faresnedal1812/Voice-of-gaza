import Joi from "joi";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import { getFollowers } from "../utils/getFollowers.js";
import Notification from "./../models/notification.model.js";
import User from "../models/user.model.js";

const keywords = [
  "gaza",
  "palestine",
  "palestinian",
  "occupation",
  "siege",
  "resistance",
  "nakba",
  "intifada",
  "idf",
  "israeli",
  "settler",
  "apartheid",
  "freedom",
  "blockade",
  "war",
  "airstrike",
  "humanitarian",
  "rafah",
  "west bank",
  "jerusalem",
  "al-aqsa",
  "hamas",
  "fateh",
  "ceasefire",
  "massacre",
  "genocide",
  "solidarity",
  "displacement",
  "bombardment",
  "freedom fighters",
  "zionism",
  "injustice",
  "martyr",
  "refugee",
  "aid",
  "shelling",
  "death toll",
  "freedom of speech",
];

export const createPost = async (req, res, next) => {
  if (req.user.role !== "writer" && req.user.role !== "admin") {
    return next(errorHandler(401, "You are not allowed to create post!"));
  }
  if (req.body.title && req.body.title.length < 8) {
    return next(
      errorHandler(400, "Title of post must contain 8 characters at least!")
    );
  }
  if (req.body.content && req.body.content.length < 10) {
    return next(
      errorHandler(400, "Content of post must contain 10 characters at least!")
    );
  }

  try {
    // const isRelated = /gaza|palestine|occupation|siege|resistance/i.test(`${title} ${content}`);
    const isRelated = new RegExp(keywords.join("|"), "i").test(
      `${req.body.title} ${req.body.content}`
    );
    if (!isRelated) {
      return next(
        errorHandler(
          400,
          "Post must be related to Voice of Gaza (e.g., Gaza, Palestine, etc.)."
        )
      );
    }

    const slug =
      req.body.title
        .toLowerCase()
        .split(" ")
        .join("-")
        .replace(/[^a-z0-9-]+/g, "") + new Date().getTime(); // make a slug unique
    const newPost = new Post({
      ...req.body,
      authorId: req.user.id,
      slug,
    });
    const savedPost = await newPost.save();

    const author = await User.findById(req.user.id);

    const followers = await getFollowers(req.user.id);
    for (const follower of followers) {
      await Notification.create({
        sender: req.user.id,
        receiver: follower._id,
        type: "post",
        message: `${author.username} has published a new post.`,
      });
    }

    console.log(followers);

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  if (
    (req.user.role !== "writer" || req.user.id !== req.params.userId) &&
    req.user.role !== "admin"
  ) {
    return next(errorHandler(401, "You are not allowed to update this post!"));
  }
  if (req.body.title && req.body.title.length < 8) {
    console.log("first");
    return next(
      errorHandler(400, "Title of post must contain 8 characters at least!")
    );
  }
  if (req.body.content && req.body.content.length < 10) {
    return next(
      errorHandler(400, "Content of post must contain 10 characters at least!")
    );
  }
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, "Post not found!"));
    }

    if (req.body.title || req.body.content) {
      const newTitle = req.body.title || post.title;
      const newContent = req.body.content || post.content;
      // checks if any of the keywords appear in the combined string of title + content
      const isRelated = new RegExp(keywords.join("|"), "i").test(
        `${newTitle} ${newContent}`
      );

      if (!isRelated) {
        return next(
          errorHandler(
            400,
            "Post must be related to Voice of Gaza (e.g., Gaza, Palestine, etc.)."
          )
        );
      }
    }
    if (req.body.category) {
      const allowedCategory = Post.schema.path("category").enumValues;
      if (req.body.category && !allowedCategory.includes(req.body.category)) {
        return next(errorHandler(400, "Invalid category"));
      }
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          image: req.body.image,
          category: req.body.category,
          slug:
            req.body.title
              .toLowerCase()
              .split(" ")
              .join("-")
              .replace(/[^a-z0-9-]+/g, "") + new Date().getTime(),
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  const querySchema = Joi.object({
    startIndex: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1).max(18).default(9),
    sort: Joi.string().valid("asc", "desc").default("desc"),
    sortBy: Joi.string().valid("updatedAt", "comments").default("updatedAt"),
    postId: Joi.string().hex().length(24),
    authorId: Joi.string().hex().length(24),
    slug: Joi.string().min(1),
    category: Joi.string().min(1),
    searchTerm: Joi.string().max(100),
    // searchTerm: Joi.string().allow("").max(100),
  }).unknown(true);
  try {
    // We will use this to safely process any special characters (like +, %26, etc.) that are URL-encoded.
    const cleanedQuery = {};
    for (const key in req.query) {
      const decodedValue = decodeURIComponent(req.query[key]);
      if (decodedValue !== "") {
        cleanedQuery[key] = decodedValue;
      }
    }
    // Check if the queries in request from the client side is apply the rules that i put them in Joi Package
    const { value: validatedQuery, error } = querySchema.validate(cleanedQuery);

    if (error) {
      return next(errorHandler(400, error.details[0].message));
    }

    const {
      startIndex,
      limit,
      sort,
      sortBy,
      postId,
      authorId,
      slug,
      category,
      searchTerm,
    } = validatedQuery;

    const sortDirection = sort === "asc" ? 1 : -1;
    const sortField = sortBy === "comments" ? "commentsCount" : "updatedAt";

    // this code is work but its not clean and slow

    /* const posts = await Post.find({
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.authorId && { authorId: req.query.authorId }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    }); */

    // this code is more readability, performance, and robustness

    const query = {};

    if (postId) query._id = postId;
    if (authorId) query.authorId = authorId;
    if (slug) query.slug = { $regex: slug, $options: "i" };

    // Increment views when accessing by postId or slug
    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    } else if (slug) {
      const postToUpdate = await Post.findOne({
        slug: { $regex: slug, $options: "i" },
      });
      if (postToUpdate) {
        await Post.findByIdAndUpdate(postToUpdate._id, { $inc: { views: 1 } });
      }
    }

    //  This means: "Only filter by category if it is not 'Uncategorized'."
    if (category && category !== "Uncategorized") {
      if (category) query.category = { $regex: category, $options: "i" };
    }
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { content: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // Promise.all() waits until all three finish, so this way is faster than the previous way

    const [posts, totalPosts, lastMonthPosts] = await Promise.all([
      Post.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(startIndex)
        .limit(limit),
      Post.countDocuments(query), // Count based on the same filters
      Post.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
    ]);

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "writer") {
    return next(errorHandler(401, "You are not allowed to delete this post!"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("Post has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const getTopViewedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ views: -1 }).limit(3);
    if (!posts) {
      return nexr(errorHandler(404, "Top viewed Posts not found!"));
    }
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

export const getTopCommentsPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ commentsCount: -1 }).limit(3);
    if (!posts) {
      return nexr(errorHandler(404, "Top Comments Posts not found!"));
    }
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
