import { ArrowRightIcon, Button } from "flowbite-react";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function TrendingPostByViews() {
  const [trendingPostByViews, setTrendingPostByViews] = useState({});

  console.log(trendingPostByViews);

  useEffect(() => {
    const fetchTrendingPostByViews = async () => {
      try {
        const res = await fetch(`/api/post/topViewed`);
        const data = await res.json();
        if (!res.ok) {
          return;
        }
        setTrendingPostByViews(data[0]);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchTrendingPostByViews();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border border-teal-500 p-3 rounded-tl-3xl rounded-br-3xl">
      <div className="flex-1 text-gray-700 flex flex-col gap-4 text-center">
        <h2 className="text-2xl font-semibold">
          Want to show the trending post by views?
        </h2>
        <p className="text-sm text-gray-500">
          Click the button below to explore the most viewed post in the
          community and see what captured everyone's attention.
        </p>
        <Link to={`/post/${trendingPostByViews.slug}`}>
          <Button className="w-full flex items-center gap-1 cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800 rounded-tl-none rounded-br-none">
            Click here <ArrowRightIcon className="mt-1" />
          </Button>
        </Link>
      </div>
      <div className="flex-1 w-full">
        <img
          className="h-[250px] w-full object-cover rounded-xl"
          src={trendingPostByViews.image}
          alt="post image"
        />
      </div>
    </div>
  );
}
