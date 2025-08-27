import { Button, Select, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "./../components/PostCard";

export default function Search() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "Uncategorized",
  });

  const location = useLocation();
  const navigate = useNavigate();
  console.log(sidebarData);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromURL = urlParams.get("searchTerm") || "";
    const sortFromURL = urlParams.get("sort") || "desc";
    const categoryFromURL = urlParams.get("category") || "Uncategorized";
    if (searchTermFromURL || sortFromURL || categoryFromURL) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromURL,
        sort: sortFromURL,
        category: categoryFromURL,
      });
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/post/getPosts?${searchQuery}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          setLoading(false);
          if (data.posts.length === 9) {
            setShowMore(true);
          } else {
            setShowMore(false);
          }
        }
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "Uncategorized";
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const lengthOfPosts = posts.length;
    const startIndex = lengthOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    try {
      const res = await fetch(`/api/post/getPosts?${searchQuery}`);
      if (!res.ok) {
        setShowMore(false);
        return;
      } else {
        const data = await res.json();
        setPosts([...posts, ...data.posts]);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* SideBar */}
      <div className="p-7 border-b border-gray-300 md:border-r md:border-b-0 md:min-h-screen">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700 whitespace-nowrap">
              Search Term:{" "}
            </label>
            <TextInput
              className="w-full"
              id="searchTerm"
              placeholder="Search Term..."
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">Sort: </label>
            <Select
              id="sort"
              className="w-full"
              value={sidebarData.sort}
              onChange={handleChange}
            >
              <option>asc</option>
              <option>desc</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">Category: </label>
            <Select
              id="category"
              className="w-full"
              value={sidebarData.category}
              onChange={handleChange}
            >
              <option>Uncategorized</option>
              <option>News & Updates</option>
              <option>Daily Life</option>
              <option>Humanitarian Stories</option>
              <option>Culture & History</option>
              <option>Resistance & Freedom</option>
              <option>Youth & Education</option>
              <option>Health & Hospitals</option>
              <option>Voices from the Ground</option>
              <option>Photojournalism</option>
              <option>Opinion & Analysis</option>
              <option>International Solidarity</option>
              <option>Economy & Infrastructure</option>
              <option>Environment</option>
            </Select>
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-br from-green-400 to-blue-600 text-white hover:bg-gradient-to-bl focus:ring-green-200 dark:focus:ring-green-800"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <Spinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              "Apply Filters"
            )}
          </Button>
        </form>
      </div>
      {/* Search Results */}
      <div className="p-7 flex-1 min-h-screen">
        <h1 className="font-semibold text-2xl text-gray-600 md:border-b border-gray-300 py-3">
          Post results:
        </h1>
        <div className="sm:flex sm:flex-wrap gap-4 p-4">
          {!loading && posts.length === 0 && (
            <p className="font-semibold text-2xl text-gray-600 md:border-b border-gray-300 py-3">
              No posts found!
            </p>
          )}
          {loading && (
            <div className="flex items-center gap-2 font-semibold text-2xl text-gray-600 md:border-b border-gray-300 py-3">
              <Spinner size="md" />
              <span>Loading...</span>
            </div>
          )}
          {!loading &&
            posts &&
            posts.map((post) => (
              <div className="flex gap-4">
                <PostCard key={post._id} post={post} />
              </div>
            ))}
        </div>
          {posts && showMore && (
            <span
              onClick={handleShowMore}
              className="cursor-pointer text-teal-500 hover:underline text-sm ml-5"
            >
              Show More
            </span>
          )}
      </div>
    </div>
  );
}
