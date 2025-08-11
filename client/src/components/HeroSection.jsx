import { Blockquote, Button } from "flowbite-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <div className="relative w-full">
      <img
        src="/voice-of-gaza-home-page.png"
        alt="voice of gaza"
        className="h-screen w-full object-fill opacity-45"
      />
      <div className="absolute top-0 left-0 py-16 px-4 sm:py-36 sm:px-16 lg:px-28 flex flex-col gap-5 sm:max-w-4xl">
        <h1 className="text-3xl sm:text-4xl text-yellow-50 font-semibold">
          Bearing wirness to the devastation and suffering in gaza.
        </h1>
        <p className="text-yellow-50 font-medium">
          Real stories, verified updates, and voices from those living through
          the crisis — unfiltered and uncensored.
        </p>
        <Blockquote className="text-amber-100">
          "We speak so the world will never say it didn’t know."
        </Blockquote>
        <div className="flex gap-4 text-amber-100 underline">
          <span>
            <strong>3,200+</strong> stories shared
          </span>
          <span>
            <strong>50+</strong> contributors
          </span>
          <span>
            <strong>Updated</strong> daily
          </span>
        </div>

        <Link to={"/search"} className="w-fit">
          <Button color={"red"}>Discover Posts</Button>
        </Link>
      </div>
    </div>
  );
}
