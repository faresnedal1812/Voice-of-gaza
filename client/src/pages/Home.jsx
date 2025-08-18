import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import PostCard from "./../components/PostCard";
import { useSelector } from "react-redux";

export default function Home() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [topViewedPosts, setTopViewedPosts] = useState([]);
  const [topCommentedPosts, setTopCommentedPosts] = useState([]);
  console.log(latestPosts, topViewedPosts, topCommentedPosts);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const res = await fetch(`/api/post/getPosts?limit=3`);
        if (!res.ok) {
          return;
        } else {
          const data = await res.json();
          setLatestPosts(data.posts);
          fetchTopViewedPosts();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchTopViewedPosts = async () => {
      try {
        const res = await fetch("/api/post/topViewed");
        if (!res.ok) {
          return;
        } else {
          const data = await res.json();
          setTopViewedPosts(data);
          fetchTopCommentsPosts();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchTopCommentsPosts = async () => {
      try {
        const res = await fetch("/api/post/topComments");
        if (!res.ok) {
          return;
        } else {
          const data = await res.json();
          setTopCommentedPosts(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchLatestPost();
  }, []);
  return (
    <div>
      <HeroSection />
      {currentUser && (
        <div
          className="min-h-screen w-full bg-contaitn"
          style={{
            backgroundImage: "url('/repeatation.png')",
            backgroundColor: "rgba(255, 255, 255, 0.95)", // light overlay
            backgroundBlendMode: "lighten", // blend white with image
          }}
        >
          <div className={"flex flex-col gap-6 py-7"}>
            {latestPosts && latestPosts.length > 0 && (
              <div className="flex flex-col gap-4 w-full mx-auto">
                <h1 className="font-semibold text-2xl text-center text-gray-700 italic">
                  Recent Posts:
                </h1>
                <div className="flex flex-wrap gap-4 items-start justify-center">
                  {latestPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
            {topViewedPosts && topViewedPosts.length > 0 && (
              <div className="flex flex-col gap-4 w-full mx-auto">
                <h1 className="font-semibold text-2xl text-center text-gray-700">
                  Top Viewed Posts:
                </h1>
                <div className="flex flex-wrap gap-4 items-start justify-center">
                  {topViewedPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
            {topCommentedPosts && topCommentedPosts.length > 0 && (
              <div className="flex flex-col gap-4 w-full mx-auto">
                <h1 className="font-semibold text-2xl text-center text-gray-700">
                  Top Commented Posts:
                </h1>
                <div className="flex flex-wrap gap-4 items-start justify-center">
                  {topCommentedPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
