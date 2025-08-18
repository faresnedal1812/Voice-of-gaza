import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Modal,
  ModalHeader,
  ModalBody,
  ButtonGroup,
} from "flowbite-react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserSuccess,
  signout,
} from "../redux/user/userSlice";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdOutlineArticle, MdPostAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";

export default function DashProfile() {
  const [file, setFile] = useState(null);
  const [fileImageURL, setFileImageURL] = useState(null);
  const [imageUploadingError, setImageUploadingError] = useState(null);
  const [imageUploadingProgress, setImageUploadingProgress] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModalForDeleteUser, setShowModalForDeleteUser] = useState(false);
  const [showModalForDeletePost, setShowModalForDeletePost] = useState(false);
  const [showMyOwnPosts, setShowMyOwnPosts] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postIdTobeDeleted, setPostIdTobeDeleted] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [errorThatRelatedToShowPosts, setErrorThatRelatedToShowPosts] =
    useState(null);
  const [userUpdatedSuccessfuly, setUserUpdatedSuccessfully] = useState(false);

  const { currentUser, loading, error } = useSelector((state) => state.user);

  const fileRef = useRef();
  const dispatch = useDispatch();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFileImageURL(URL.createObjectURL(file)); // temporary image url
    }
  };

  useEffect(() => {
    if (!file) return;
    uploadImage(file);
  }, [file]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `/api/post/getPosts?authorId=${currentUser._id}`
        );
        const data = await res.json();
        if (!res.ok) {
          setShowMore(false);
          setErrorThatRelatedToShowPosts(data.message);
          return;
        }
        if (res.ok) {
          setPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          } else {
            setShowMore(true);
          }
        }
      } catch (error) {
        setErrorThatRelatedToShowPosts(error.message);
      }
    };
    fetchPosts();
  }, [currentUser._id]);

  const uploadImage = async (file) => {
    try {
      setImageUploadingError(null);
      setImageUploadingProgress(null);

      const file_size_MB = 2;
      const file_size_byte = file_size_MB * 1024 * 1024;

      if (file.size > file_size_byte) {
        setImageUploadingError(
          `Image size exceeds ${file_size_MB}MB, upload image with smaller size`
        );
        return;
      }

      const upload_preset = "Voice_of_gaza";
      const cloud_name = "dcdoxdyeu";

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", upload_preset);
      data.append("cloud_name", cloud_name);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        true
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = ((e.loaded / e.total) * 100).toFixed(0);
          setImageUploadingProgress(progress);
          console.log("Upload image url", progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFileImageURL(response.secure_url);
          setFormData({ ...formData, profilePicture: response.secure_url });
          setImageUploadingProgress(null);
        } else {
          setImageUploadingError("Upload failed!");
          setFileImageURL(null);
          setImageUploadingProgress(null);
          return;
        }
      };

      xhr.onerror = () => {
        setImageUploadingError("Upload failed!");
        setFileImageURL(null);
        setImageUploadingProgress(null);
        return;
      };

      xhr.send(data);
    } catch (error) {
      setImageUploadingError("Upload faild!");
      setFileImageURL(null);
      setImageUploadingProgress(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    if (Object.keys(formData).length === 0) {
      dispatch(updateUserFailure("No changes made"));
      return;
    }
    setUserUpdatedSuccessfully(false);
    try {
      const res = await fetch(`/api/user/updateUser/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateUserFailure(data.message));
        setUserUpdatedSuccessfully(false);
        return;
      }
      if (res.ok) {
        dispatch(updateUserSuccess(data));
        setUserUpdatedSuccessfully(true);
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setUserUpdatedSuccessfully(false);
    }
  };

  const handleDeleteUser = async () => {
    setShowModalForDeleteUser(false);
    try {
      const res = await fetch(`/api/user/deleteUser/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return;
      }
      if (res.ok) {
        dispatch(deleteUserSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (!res.ok) {
        return;
      }
      if (res.ok) {
        dispatch(signout());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      setShowModalForDeletePost(false);
      const res = await fetch(`/api/post/deletePost/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorThatRelatedToShowPosts(data.message);
        return;
      }
      if (res.ok) {
        setPosts((prev) => prev.filter((post) => post._id !== id));
      }
    } catch (error) {
      setErrorThatRelatedToShowPosts(error.message);
    }
  };

  const handleShowMore = async () => {
    try {
      const startIndex = posts.length;
      const res = await fetch(`/api/post/getPosts?startIndex=${startIndex}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorThatRelatedToShowPosts(data.message);
        return;
      }
      if (res.ok) {
        setPosts([...posts, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        } else {
          setShowMore(true);
        }
      }
    } catch (error) {
      setErrorThatRelatedToShowPosts(error.message);
    }
  };

  useEffect(() => {
    if (error || errorThatRelatedToShowPosts || imageUploadingError) {
      setShowMyOwnPosts(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error, errorThatRelatedToShowPosts, imageUploadingError]);

  // className="min-h-screen w-full bg-cover"
  // style={{
  //   backgroundImage: "url('/bg-signup.png')",
  //   backgroundColor: "rgba(255, 255, 255, 0.8)", // light overlay
  //   backgroundBlendMode: "lighten", // blend white with image
  // }}

  return (
    <div
      className="min-h-screen w-full bg-cover"
      style={{
        backgroundImage: "url('/bg-signup.png')",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // light overlay
        backgroundBlendMode: "lighten", // blend white with image
      }}
    >
      <div className="w-full mx-auto p-3">
        <h1 className="text-3xl text-center font-semibold my-7">Profile</h1>
        <form
          className="w-full max-w-lg mx-auto flex flex-col gap-4 shadow-md rounded-xl px-4 py-8 bg-white z-30"
          onSubmit={handleSubmit}
        >
          <div className="relative w-32 h-32 self-center rounded-full cursor-pointer overflow-hidden shadow-md">
            {imageUploadingProgress && imageUploadingProgress > 0 && (
              <CircularProgressbar
                value={imageUploadingProgress}
                text={`${imageUploadingProgress}%`}
                styles={{
                  root: {
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  },
                  path: {
                    stroke: `rgba(62,155,199, ${(
                      imageUploadingProgress / 100
                    ).toFixed(0)})`,
                  },
                }}
              />
            )}
            <img
              src={fileImageURL || currentUser.profilePicture}
              alt="user"
              className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
                imageUploadingProgress &&
                imageUploadingProgress < 100 &&
                "opacity-80"
              }`}
              onClick={() => fileRef.current.click()}
            />
          </div>
          <span className="bg-slate-700 w-fit px-2 py-1 text-xs rounded-lg text-white font-semibold mx-auto">
            {currentUser.role[0].toUpperCase() + currentUser.role.slice(1)}
          </span>
          <input
            hidden
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleImageChange}
          />
          <div className="flex flex-col gap-1">
            <Label className="ml-1 text-gray-700 font-medium">Username</Label>
            <TextInput
              placeholder="Username..."
              id="username"
              type="text"
              defaultValue={currentUser.username}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="ml-1 text-gray-700 font-medium">Email</Label>
            <TextInput
              placeholder="Email..."
              id="email"
              type="email"
              defaultValue={currentUser.email}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="ml-1 text-gray-700 font-medium">Password</Label>
            <TextInput
              placeholder="***********"
              id="password"
              type="password"
              onChange={handleChange}
            />
          </div>
          <Button
            disabled={imageUploadingProgress || loading}
            type="submit"
            outline
            color={"gray"}
            className="cursor-pointer"
          >
            {!error && loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Uploading...</span>
              </div>
            ) : (
              <span>Update User</span>
            )}
          </Button>
          <div className="text-sm text-red-600 flex items-center justify-between mt-4">
            <span
              className="cursor-pointer"
              onClick={() => setShowModalForDeleteUser(true)}
            >
              Delete account
            </span>
            <span className="cursor-pointer" onClick={handleSignOut}>
              Sign out
            </span>
          </div>
          {(error || imageUploadingError || errorThatRelatedToShowPosts) && (
            <Alert color="failure">
              {error || imageUploadingError || errorThatRelatedToShowPosts}
            </Alert>
          )}
          {userUpdatedSuccessfuly && (
            <Alert color="success">User updated successfully</Alert>
          )}
        </form>
        <div className="w-full max-w-7xl mx-auto">
          {(currentUser?.role === "writer" ||
            currentUser?.role === "admin") && (
            <div className="my-7 flex justify-center">
              <ButtonGroup outline>
                {posts.length > 0 && (
                  <Button
                    color="dark"
                    className="flex items-center"
                    onClick={() => {
                      setShowMyOwnPosts((prev) => !prev);
                    }}
                  >
                    <MdOutlineArticle className="me-2 h-4 w-4" />
                    Show my own Posts
                  </Button>
                )}
                <Button color="dark">
                  <Link to={"/create-post"} className="flex items-center">
                    <MdPostAdd className="me-2 h-4 w-4" />
                    Create Post
                  </Link>
                </Button>
              </ButtonGroup>
            </div>
          )}

          {showMyOwnPosts && posts && posts.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {posts.map((post) => (
                <div key={post._id}>
                  <PostCard
                    post={{
                      ...post,
                      onDelete: (id) => {
                        setPostIdTobeDeleted(id);
                        setShowModalForDeletePost(true);
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {showMyOwnPosts && showMore && (
            <p
              onClick={handleShowMore}
              className="my-7 text-teal-500 hover:underline text-sm hover:cursor-pointer px-3 text-center"
            >
              Show More
            </p>
          )}
        </div>
        <Modal
          show={showModalForDeleteUser}
          popup
          size="md"
          onClose={() => setShowModalForDeleteUser(false)}
        >
          <ModalHeader />
          <ModalBody className="flex flex-col items-center gap-4">
            <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
            <p className="font-medium text-gray-500">
              Are you sure you want to delete your account?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                color="red"
                className="cursor-pointer"
                onClick={handleDeleteUser}
              >
                Yes, I'm sure
              </Button>
              <Button
                color="alternative"
                className="cursor-pointer"
                onClick={() => setShowModalForDeleteUser(false)}
              >
                No, Cancel
              </Button>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          show={showModalForDeletePost}
          popup
          size="md"
          onClose={() => setShowModalForDeletePost(false)}
        >
          <ModalHeader />
          <ModalBody className="flex flex-col items-center gap-4">
            <HiOutlineExclamationCircle className="w-16 h-16 text-gray-400" />
            <p className="font-medium text-gray-500">
              Are you sure you want to delete this post?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                color="red"
                className="cursor-pointer"
                onClick={() => {
                  setShowModalForDeletePost(false);
                  handleDeletePost(postIdTobeDeleted);
                }}
              >
                Yes, I'm sure
              </Button>
              <Button
                color="alternative"
                className="cursor-pointer"
                onClick={() => setShowModalForDeletePost(false)}
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
