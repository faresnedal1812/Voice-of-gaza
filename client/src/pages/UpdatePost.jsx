import {
  Select,
  TextInput,
  FileInput,
  Button,
  Spinner,
  Alert,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function UpdatePost() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Uncatigorized",
    image: "",
    content: "",
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { postId } = useParams();
  const navigate = useNavigate();

  console.log(formData);

  useEffect(() => {
    const fetchPostData = async () => {
      setError(false);
      setImageUploadError(false);
      try {
        const res = await fetch(`/api/post/getPosts?postId=${postId}`);
        const data = await res.json();
        setFormData(data.posts[0]);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchPostData();
  }, [postId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
  };

  const uploadImage = async (file) => {
    if (!file) {
      setIsUploadingImage(false);
      setImageUploadError(null);
      return setImageUploadError("Upload faild!");
    }
    try {
      setIsUploadingImage(false);
      const file_size_MB = 2;
      const file_siza_byte = file_size_MB * 1024 * 1024;
      if (file.size > file_siza_byte) {
        setImageUploadError(
          `Image size exceeds ${file_size_MB}MB, upload image with smaller size`
        );
        setImageUrl(null);
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
          setIsUploadingImage(true);
          setImageUploadError(null);
          const progress = ((e.loaded / e.total) * 100).toFixed(0);
          setImageUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setIsUploadingImage(false);
          const response = JSON.parse(xhr.responseText);
          setImageUrl(response.secure_url);
          setImageUploadError(null);
          setFormData({ ...formData, image: response.secure_url });
        } else {
          setIsUploadingImage(false);
          setImageUploadError("Upload failed!");
          setImageUploadProgress(null);
          setImageUrl(null);
          return;
        }
      };

      xhr.onerror = () => {
        setIsUploadingImage(false);
        setImageUploadError("Upload failed!");
        setImageUploadProgress(null);
        setImageUrl(null);
      };

      xhr.send(data);
    } catch (error) {
      setIsUploadingImage(false);
      setImageUploadError("Upload failed!");
      setImageUploadProgress(null);
      setImageUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(
        `/api/post/updatePost/${postId}/${currentUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            image: formData.image,
            content: formData.content,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.message);
        return;
      }
      if (res.ok) {
        setLoading(false);
        setError(false);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover"
      style={{
        backgroundImage: "url('/bg-signup.png')",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // light overlay
        backgroundBlendMode: "lighten", // blend white with image
      }}
    >
      <div className="w-full max-w-3xl mx-auto p-3 ">
        <h1 className="text-3xl font-semibold text-gray-800 text-center my-7">
          Update post
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 my-14 shadow-md rounded-xl px-4 py-8 bg-white z-30"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <TextInput
              value={formData?.title}
              className="flex-1"
              type="text"
              placeholder="Title..."
              id="title"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Select
              value={formData?.category}
              addon="&#9998;"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Uncatigorized">Uncatigorized</option>
              <option value="News & Updates">News & Updates</option>
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
          <div className="flex gap-2 items-center border-4 border-slate-200 border-dashed rounded-lg p-5">
            <FileInput accept="image/*" onChange={handleImageChange} />
            <Button
              disabled={isUploadingImage}
              onClick={() => uploadImage(image)}
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white hover:bg-gradient-to-br focus:ring-purple-300 dark:focus:ring-purple-800 cursor-pointer"
            >
              {isUploadingImage ? (
                <div className="flex gap-1 items-center">
                  <Spinner size="sm" />
                  <span>{imageUploadProgress}% Loading...</span>
                </div>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
          {(formData?.image || imageUrl) && (
            <div className="relative">
              <img
                src={formData?.image || imageUrl}
                alt="image post"
                className="w-full h-[320px] rounded-lg object-cover"
              />
              <MdClose
                className="absolute top-2 right-2 cursor-pointer text-2xl bg-gray-200 rounded-full z-30"
                onClick={() => {
                  setImage(null);
                  setImageUrl(null);
                  setFormData((prev) =>
                    setFormData({
                      ...prev,
                      image: "https://img.freepik.com/free-photo/technology-communication-icons-symbols-concept_53876-120314.jpg?ga=GA1.1.131351233.1739735698&semt=ais_hybrid&w=740",
                    })
                  );
                }}
              />
            </div>
          )}
          <ReactQuill
            theme="snow"
            placeholder="Write Something..."
            required
            id="content"
            value={formData?.content || ""}
            className="h-72 mb-12"
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
          />
          {/* <Textarea
            value={formData?.content || ""}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            id="content"
            placeholder="Type here..."
            rows={4}
          /> */}
          <Button
            disabled={isUploadingImage || loading}
            type="submit"
            className="cursor-pointer"
            outline
            color="gray"
          >
            {loading ? (
              <div className="flex gap-1 items-center">
                <Spinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              "Update"
            )}
          </Button>
          {(imageUploadError || error) && (
            <Alert color="failure">{imageUploadError || error}</Alert>
          )}
        </form>
      </div>
    </div>
  );
}
