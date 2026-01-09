import { Link } from "react-router-dom";
import { GoArrowRight } from "react-icons/go";
import { Button } from "flowbite-react";

export default function About() {
  return (
    <div
      className="min-h-screen w-full bg-cover"
      style={{
        backgroundImage: "url('/about.png')", // from public folder
        backgroundColor: "rgba(255, 255, 255, 0.92)", // light overlay
        backgroundBlendMode: "lighten", // blend white with image
      }}
    >
      <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto p-7 text-slate-800">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-semibold text-gray-700">About</h1>
          <p>
            We are committed to delivering high-quality products and services
            tailored to meet the unique needs of our clients.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold text-gray-600">Our Mission</h2>
          <p>
            Our mission is to provide innovative solutions that drive success
            and create lasting value for our cuatomers. We strive to exceed
            expectations through dedication, expertise, and a customer-centric
            approach.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold text-gray-600">Our Team</h2>
          <p>
            Our team is composed of experienced professionals with diverse
            backgrounds and a shared passion for excellence. We believe in
            fostering a collaborative and inclusive work environment where every
            team member can thrive.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold text-gray-600">Our Story</h2>
          <div className="flex flex-col gap-4">
            <p>
              The idea for Voice of Gaza was born from a desire to amplify
              unheard voices in a region often overlooked by mainstream media.
              As developers and storytellers from Gaza, we recognized the urgent
              need for a platform where people could share their experiences,
              insights, and dreams freely and securely.
            </p>
            <p>
              This project began as a simple blog app, but quickly evolved into
              a mission: to preserve and promote authentic Gazan narratives
              through technology. Built using the MERN stack, Voice of Gaza
              empowers users to publish posts, engage in discussions, and
              explore categorized content—all in an intuitive, user-friendly
              environment.
            </p>
            <p>
              Today, Voice of Gaza stands not just as a technical achievement,
              but as a symbol of resilience, expression, and digital freedom.
            </p>
          </div>
        </div>
        <Link to={"/"} className="w-fit">
          <Button
            size="sm"
            className="cursor-pointer flex items-center gap-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white hover:bg-gradient-to-br focus:ring-teal-300 dark:focus:ring-teal-800"
          >
            <span>Go to home page</span>
            <GoArrowRight className="mt-[3px]" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
