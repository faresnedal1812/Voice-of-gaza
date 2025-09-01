import React from "react";
import { Link } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function PostCard({ post }) {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className="bg-gray-300 group relative h-[370px] md:w-[350px] w-[310px] border border-gray-500 hover:border-2 overflow-hidden rounded-lg transition-all">
      <Link to={`/post/${post.slug}`}>
        <img
          src={post.image}
          alt="post cover"
          className="h-[260px] w-full object-cover group-hover:h-[200px] transition-all duration-300 z-20"
        />
      </Link>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold line-clamp-1 text-gray-800 truncate">
            {post.title.length > 35
              ? `${post.title.slice(0, 35)}...`
              : post.title}
          </p>
          <span className="text-xs text-gray-600">{post.views} Views</span>
        </div>
        <span className="italic text-sm">{post.category}</span>
        <p
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="text-xs font-medium line-clamp-1 italic text-gray-600"
        ></p>
        <div className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 flex justify-between items-center">
          <Link
            to={`/post/${post.slug}`}
            className="flex-3 border border-gray-500 text-gray-800 hover:bg-gray-600 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
          >
            Read article
          </Link>
          {(currentUser.role == "admin" ||
            currentUser._id === post.authorId) && (
            <div className="flex flex-1 flex-col items-start text-sm">
              <Link
                to={`/update-post/${post._id}`}
                className="text-green-600 hover:underline flex gap-1 items-center"
              >
                <FiEdit />
                Edit
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof post.onDelete === "function") {
                    post.onDelete(post._id);
                  }
                }}
                className="text-red-600 hover:underline flex gap-1 items-center"
              >
                <MdClose />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
