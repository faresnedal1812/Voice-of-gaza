import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { FaTimes } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToBeDeleted, setCommentIdToBeDeleted] = useState("");
  const [searchData, setSearchData] = useState({ role: "all" });
  const [showCommentsError, setShowCommentsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const contentFromUrl = urlParams.get("content");
    if (contentFromUrl) {
      setSearchData({
        ...searchData,

        content: contentFromUrl,
      });
    }

    const fetchComments = async () => {
      setShowCommentsError(null);
      setShowMore(true);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/comment/getComments?${searchQuery}`);
        const data = await res.json();
        if (!res.ok) {
          return setShowCommentsError(data.message);
        }
        if (res.ok) {
          setComments(data.comments);
          if (data.comments.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        setShowCommentsError(error.message);
      }
    };

    if (currentUser.role === "admin") {
      fetchComments();
    }
  }, [currentUser._id, location.search]);

  const handleShowMore = async () => {
    const urlParams = new URLSearchParams(location.search);
    const contentFromUrl = urlParams.get("content");
    const searchQuery = urlParams.toString();
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/api/comment/getComments?startIndex=${startIndex}&${searchQuery}`
      );
      const data = await res.json();
      if (!res.ok) {
        setShowMore(false);
        return;
      }
      if (res.ok) {
        setComments([...comments, ...data.comments]);
        if (data.comments.length < 9) {
          setShowMore(false);
        } else {
          setShowMore(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComments = async (commentId) => {
    try {
      setShowModal(false);
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return;
      }
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToBeDeleted)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = (e) => {
    if (e.target.id === "content") {
      setSearchData({ ...searchData, content: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (Object.keys(searchData).length === 0) return;
      const urlParams = new URLSearchParams(location.search);

      urlParams.delete("content");

      if (searchData.content && searchData.content.trim() !== "") {
        urlParams.set("content", searchData.content);
      }

      const searchQuery = urlParams.toString();
      navigate(`/dashboard?${searchQuery}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-3 py-4">
      {/* Search section */}
      <form className="mb-6 max-w-5xl" onSubmit={handleSubmit}>
        <div className="flex flex-col mb-3 gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-1 flex-1">
            <Label className="ml-1 text-gray-800">Content</Label>
            <TextInput
              value={searchData.content || ""}
              onChange={handleChange}
              placeholder="Content"
              id="content"
              type="text"
            />
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Button size="lg" type="submit" className="cursor-pointer">
            Search
          </Button>
          {showCommentsError && (
            <Alert color="failure" className="flex-1">
              {showCommentsError}
            </Alert>
          )}
        </div>
      </form>
      {/* Table Section */}
      <div className="table-auto md:mx-auto overflow-x-auto scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300">
        {currentUser?.role === "admin" ? (
          <>
            <Table hoverable className="shadow-md bg-white">
              <TableHead>
                <TableRow>
                  <TableHeadCell>#</TableHeadCell>
                  <TableHeadCell>Updated At</TableHeadCell>
                  <TableHeadCell>Content</TableHeadCell>
                  <TableHeadCell>number of likes</TableHeadCell>
                  <TableHeadCell>Username</TableHeadCell>
                  <TableHeadCell>Delete</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comments &&
                  comments?.length > 0 &&
                  comments.map((comment, index) => (
                    <TableRow
                      key={comment._id}
                      className="divide-y-1 divide-gray-200"
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {new Date(comment.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium truncate">
                        {comment.content}
                      </TableCell>
                      <TableCell className="font-medium truncate text-center">
                        {comment.likes.length}
                      </TableCell>
                      <TableCell className="font-medium truncate">
                        {comment.userId.username}
                      </TableCell>
                      <TableCell>
                        <FaTimes
                          onClick={() => {
                            setShowModal(true);
                            setCommentIdToBeDeleted(comment._id);
                          }}
                          className="text-red-500 text-lg cursor-pointer"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {comments?.length > 0 && showMore && (
              <button
                onClick={handleShowMore}
                className="text-teal-500 cursor-pointer my-7 text-center w-full hover:underline"
              >
                Show More
              </button>
            )}
          </>
        ) : (
          <p className="text-center my-7 font-semibold text-xl">
            There is no comments here!
          </p>
        )}
        {showModal && (
          <Modal
            show={showModal}
            popup
            size="md"
            onClose={() => setShowModal(false)}
          >
            <ModalHeader />
            <ModalBody className="flex flex-col items-center gap-6">
              <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
              <p className="font-medium text-gray-500">
                Are you sure you want to delete this comment?
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  color="red"
                  className="cursor-pointer"
                  onClick={() => handleDeleteComments(commentIdToBeDeleted)}
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
        )}
      </div>
    </div>
  );
}
