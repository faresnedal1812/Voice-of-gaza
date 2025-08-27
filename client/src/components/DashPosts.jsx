import {
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function DashPosts() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [authors, setAuthors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [postIdToBeDeleted, setPostIdToBeDeleted] = useState(null);
  const [searchData, setSearchData] = useState({});
  const [showPostsError, setShowPostsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromURL = urlParams.get("searchTerm");
    const categoryFromURL = urlParams.get("category");
    if (searchTermFromURL || categoryFromURL) {
      setSearchData({
        ...searchData,
        searchTerm: searchTermFromURL,
        category: categoryFromURL,
      });
    }
    const searchQuery = urlParams.toString();

    const fetchPosts = async () => {
      setShowPostsError(null);
      setShowMore(true);
      try {
        const res = await fetch(`/api/post/getPosts?${searchQuery}`);
        const data = await res.json();
        if (!res.ok) {
          setShowPostsError(data.message);
          return;
        }
        if (res.ok) {
          setPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        setShowPostsError(error.message);
      }
    };
    fetchPosts();
  }, [currentUser._id, location.search]);

  const handleChange = (e) => {
    if (e.target.id === "title") {
      setSearchData({ ...searchData, searchTerm: e.target.value });
    }
    if (e.target.id === "category") {
      setSearchData({ ...searchData, category: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (Object.keys(searchData).length === 0) return;
      const urlParams = new URLSearchParams(location.search);

      urlParams.delete("searchTerm");
      urlParams.delete("category");

      if (searchData.searchTerm && searchData.searchTerm.trim() !== "") {
        urlParams.set("searchTerm", searchData.searchTerm);
      }
      if (searchData.category && searchData.category.trim() !== "") {
        urlParams.set("category", searchData.category);
      }

      const searchQuery = urlParams.toString();
      navigate(`/dashboard?${searchQuery}`);
    } catch (error) {
      setShowPostsError(error.message);
    }
  };

  useEffect(() => {
    const uniqueAuthorIds = [...new Set(posts.map((post) => post.authorId))];

    uniqueAuthorIds.forEach((authorId) => {
      if (!authors[authorId]) {
        getAuthorById(authorId);
      }
    });
  }, [posts]);

  const getAuthorById = async (authorId) => {
    const res = await fetch(`/api/user/getUsers?userId=${authorId}`);
    const data = await res.json();
    if (!res.ok) {
      return;
    }
    if (res.ok && data.users.length > 0) {
      setAuthors({ ...authors, [authorId]: data.users[0] });
    }
  };

  const handleShowMore = async () => {
    try {
      setShowPostsError(null);
      const startIndex = posts.length;
      const res = await fetch(`/api/post/getPosts?startIndex=${startIndex}`);
      const data = await res.json();
      if (!res.ok) {
        setShowMore(false);
        setShowPostsError(data.message);
        return;
      }
      if (res.ok) {
        setPosts([...posts, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      setShowPostsError(error.message);
    }
  };

  const handleDeletePosts = async (postId) => {
    try {
      setShowPostsError(null);
      setShowModal(false);
      const res = await fetch(`/api/post/deletePost/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setShowPostsError(data.message);
        return;
      }
      if (res.ok) {
        setPosts((prev) =>
          prev.filter((post) => post._id !== postIdToBeDeleted)
        );
      }
    } catch (error) {
      setShowPostsError(error.message);
    }
  };

  return (
    <div className="px-3 py-4">
      <form className="mb-6 max-w-5xl" onSubmit={handleSubmit}>
        <div className="flex flex-col mb-3 gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-1 flex-1">
            <Label className="ml-1 text-gray-800">Title</Label>
            <TextInput
              value={searchData.searchTerm || ""}
              onChange={handleChange}
              placeholder="Title..."
              id="title"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <Label className="ml-1 text-gray-800">Category</Label>
            <Select
              id="category"
              value={searchData.category || "Uncategorized"}
              onChange={handleChange}
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="News & Updates">News & Updates</option>
              <option value="Daily Life">Daily Life</option>
              <option value="Humanitarian Stories">Humanitarian Stories</option>
              <option value="Culture & History">Culture & History</option>
              <option value="Resistance & Freedom">Resistance & Freedom</option>
              <option value="Youth & Education">Youth & Education</option>
              <option value="Health & Hospitals">Health & Hospitals</option>
              <option value="Voices from the Ground">
                Voices from the Ground
              </option>
              <option value="Photojournalism">Photojournalism</option>
              <option value="Opinion & Analysis">Opinion & Analysis</option>
              <option value="International Solidarity">
                International Solidarity
              </option>
              <option value="Economy & Infrastructure">
                Economy & Infrastructure
              </option>
              <option value="Environment">Environment</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Button size="lg" type="submit" className="cursor-pointer">
            Search
          </Button>
          {showPostsError && (
            <Alert color="failure" className="flex-1">
              {showPostsError}
            </Alert>
          )}
        </div>
      </form>
      <div className="table-auto md:mx-auto overflow-x-auto scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300">
        <Table hoverable className="shadow-md bg-white">
          <TableHead>
            <TableRow>
              <TableHeadCell>#</TableHeadCell>
              <TableHeadCell>Updated At</TableHeadCell>
              <TableHeadCell>Post Image</TableHeadCell>
              <TableHeadCell>Author</TableHeadCell>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Comments Count</TableHeadCell>
              <TableHeadCell>Views</TableHeadCell>
              <TableHeadCell>Edit/Delete</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y-1 divide-gray-200">
            {posts &&
              currentUser.role === "admin" &&
              posts.map((post, index) => (
                <TableRow key={post._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>
                      {post.image && (
                        <img
                          className="w-14 h-10 object-cover rounded-sm bg-gray-300"
                          src={post.image}
                          alt={post.title}
                        />
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {authors[post.authorId]?.username || "Loading..."}
                  </TableCell>
                  <TableCell className="truncate">
                    {post.title.length > 35
                      ? `${post.title.slice(0, 35)}...`
                      : post.title}
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell className="text-center mt-3">{post.commentsCount}</TableCell>
                  <TableCell className="mt-3 text-center">{post.views}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-center">
                      <Link to={`/update-post/${post._id}`}>
                        <span className="block text-green-500 cursor-pointer hover:underline">
                          Edit
                        </span>
                      </Link>
                      <span
                        onClick={() => {
                          setShowModal(true);
                          setPostIdToBeDeleted(post._id);
                        }}
                        className="block text-red-500 cursor-pointer hover:underline"
                      >
                        Delete
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {posts.length > 0 && showMore && (
          <button
            onClick={handleShowMore}
            className="my-7 cursor-pointer hover:underline text-teal-500 text-center w-full"
          >
            Show More
          </button>
        )}
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          popup
          size="md"
        >
          <ModalHeader />
          <ModalBody className="flex flex-col items-center gap-6">
            <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
            <p className="font-medium text-gray-500">
              Are you sure you want to delete this post?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                color="red"
                className="cursor-pointer"
                onClick={() => handleDeletePosts(postIdToBeDeleted)}
              >
                Yes, I'm sure
              </Button>
              <Button
                color="alternative"
                className="cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                No, Cancel
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
}
