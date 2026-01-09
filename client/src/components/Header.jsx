import {
  Button,
  Navbar,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
  Dropdown,
  Avatar,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  Modal,
  ModalHeader,
  ModalBody,
  Textarea,
  Spinner,
  Alert,
  Label,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { themeToggle } from "../redux/theme/themeSlice";
import { CgProfile } from "react-icons/cg";
import { HiLogout } from "react-icons/hi";
import { signout } from "../redux/user/userSlice";
import { useEffect, useState } from "react";
import { MdOutlineNotificationsActive } from "react-icons/md";
import moment from "moment";

export default function Header() {
  const path = useLocation().pathname;
  const { theme } = useSelector((state) => state.theme);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [requestRoleError, setRequestRoleError] = useState(null);
  const [requestRoleSuccess, setRequestRoleSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModalOfContactUs, setShowModalOfContactUs] = useState(false);
  const [formData, setFormData] = useState({
    email: currentUser && currentUser.email,
  });

  // console.log(message);
  // console.log(location.pathname, location.search);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromURL = urlParams.get("searchTerm");
    if (searchTermFromURL) {
      setSearchTerm(searchTermFromURL);
    }
  }, [location.search]);

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

  const handleSubmitSearch = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `/api/notification/getNotifications/${currentUser._id}`
        );
        const data = await res.json();
        if (!res.ok) {
          return;
        }
        setNotifications(data);
        setUnreadCount(
          data.filter((notification) => !notification.isRead).length
        );
      } catch (error) {
        console.log("Failed to load notifications", error);
      }
    };
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, location.pathname]);

  // console.log(notifications, unreadCount);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `/api/notification/markAsRead/${notificationId}`,
        { method: "PUT" }
      );
      const data = await res.json();
      if (!res.ok) {
        return;
      }
      setUnreadCount((prev) => {
        if (prev === 0) prev = 0;
        prev - 1;
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // for (const notification of notifications) {
      //   if (notification._id === notificationId) {
      //     setNotifications([...notifications, (notification.isRead = true)]);
      //   }
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`/api/notification/markAllAsRead`, {
        method: "PUT",
      });
      if (!res.ok) {
        return;
      }
      setUnreadCount(0);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      // for (const notification of notifications) {
      //   setNotifications([...notifications, (notification.isRead = true)]);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRequestRoleSuccess(null);
    setRequestRoleError(null);
    try {
      const res = await fetch(
        `/api/roleRequest/request-role/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setRequestRoleError(data.message);
        setLoading(false);
        return;
      }
      if (res.ok) {
        setRequestRoleSuccess(data.message);
        setLoading(false);
      }
    } catch (error) {
      setRequestRoleError(error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmitContactUs = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Feedback from ${formData.name} about Voice of Gaza Website`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    );
    window.location.href = `mailto:nedalfares53@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <Navbar className="border-b border-gray-300 shadow-md">
      <Link to={"/"}>
        <img
          src="/logo-_1_.svg"
          alt="logo"
          className=" h-10 w-14 rounded-full object-contain"
        />
      </Link>
      <form
        onSubmit={handleSubmitSearch}
        className="hidden md:inline outline-none"
      >
        <TextInput
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          defaultValue={path === "/search" ? searchTerm : ""}
        />
      </form>
      <Link to={"/search"}>
        <Button pill color="light" className="inline md:hidden">
          <AiOutlineSearch />
        </Button>
      </Link>
      {/* for any tag, his order is 0 */}
      <div className="flex gap-2 md:order-1 items-center">
        {currentUser && (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="relative">
                <MdOutlineNotificationsActive className="text-3xl cursor-pointer" />
                <span className="absolute top-[-13px] right-0 text-xs bg-red-500 rounded-full px-1 text-white font-medium">
                  {unreadCount || 0}
                </span>
              </div>
            }
          >
            <DropdownHeader className="flex items-center justify-between">
              <span className="font-medium text-gray-600">
                {notifications.length === 0
                  ? "No notifications"
                  : "Notifications"}
              </span>
              {notifications.length > 0 && (
                <span
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-green-400 hover:underline cursor-pointer"
                >
                  Mark all as read
                </span>
              )}
            </DropdownHeader>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification._id}>
                  <DropdownItem
                    onClick={() => handleMarkAsRead(notification._id)}
                    className={`flex flex-col items-start gap-2 ${
                      !notification.isRead && "bg-gray-100"
                    }`}
                  >
                    <span className="text-xs text-yellow-500">
                      {moment(notification.createdAt)
                        .fromNow()
                        .charAt(0)
                        .toUpperCase() +
                        moment(notification.createdAt).fromNow().slice(1)}
                    </span>
                    <div className="flex items-center justify-between w-full">
                      <span className="bg-teal-500 px-2 py-1 rounded-xl text-white font-medium text-xs">
                        {notification.type}
                      </span>
                      {notification.isRead ? (
                        <span className="text-xs italic underline text-green-500">
                          Seen
                        </span>
                      ) : (
                        <span className="text-xs italic underline text-red-500">
                          Unread
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        className="w-9 h-9 rounded-full"
                        src={notification.sender.profilePicture}
                        alt=""
                      />
                      <p>{notification.message}</p>
                    </div>
                  </DropdownItem>
                  <DropdownDivider />
                </div>
              ))}
            </div>
          </Dropdown>
        )}
        <Button pill color="light" onClick={() => dispatch(themeToggle())}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={currentUser.profilePicture}
                rounded
                className="cursor-pointer"
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm truncate">
                {currentUser.username}
              </span>
              <span className="block text-sm truncate font-medium">
                {currentUser.email}
              </span>
            </DropdownHeader>
            <Link to={"/dashboard?tab=profile"}>
              <DropdownItem icon={CgProfile}>Profile</DropdownItem>
            </Link>
            <DropdownDivider />
            <DropdownItem icon={HiLogout} onClick={handleSignOut}>
              Sign out
            </DropdownItem>
          </Dropdown>
        ) : (
          <Link to={"/sign-in"}>
            <Button className="bg-gradient-to-br from-green-400 to-blue-600 text-white hover:bg-gradient-to-bl focus:ring-green-200 dark:focus:ring-green-800">
              Sign In
            </Button>
          </Link>
        )}
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink as={"div"} active={path === "/"}>
          <Link to={"/"}>Home</Link>
        </NavbarLink>
        <NavbarLink as={"div"} active={path === "/about"}>
          <Link to={"/about"}>About</Link>
        </NavbarLink>
        <NavbarLink
          className="cursor-pointer"
          onClick={() => setShowModalOfContactUs((prev) => !prev)}
          as={"div"}
        >
          Contact Us
        </NavbarLink>
        {currentUser?.role === "reader" && (
          <NavbarLink
            className="cursor-pointer"
            as={"div"}
            onClick={() => setShowModal(true)}
          >
            Request to role
          </NavbarLink>
        )}
      </NavbarCollapse>
      {showModal && (
        <Modal
          show={showModal}
          size="lg"
          popup
          onClose={() => {
            setShowModal(false);
            setRequestRoleError(false);
            setRequestRoleSuccess();
          }}
        >
          <ModalHeader />
          <ModalBody className="text-center flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-red-500">
              Request Role Upgrade
            </h2>
            <p className="text-gray-600 text-sm font-medium">
              Request from admin to change your role from reader to writer.
            </p>
            <p className="text-gray-500 text-xs font-medium">
              Your request will be considered by the admin, and then you will be
              answered with a notice.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Textarea
                id="message"
                rows={3}
                placeholder="Please explain why you would like to change your role..."
                onChange={(e) => setMessage(e.target.value)}
                className="placeholder:font-medium"
              />
              <Button
                color={"teal"}
                outline
                type="submit"
                className="cursor-pointer flex items-center gap-1"
              >
                {loading && <Spinner className="mb-1" size="sm" />}
                Send Request
              </Button>
            </form>
            {requestRoleError && (
              <Alert color="failure">{requestRoleError}</Alert>
            )}
            {requestRoleSuccess && (
              <Alert color="success">{requestRoleSuccess}</Alert>
            )}
          </ModalBody>
        </Modal>
      )}
      <Modal
        show={showModalOfContactUs}
        size="lg"
        popup
        onClose={() => setShowModalOfContactUs(false)}
      >
        <ModalHeader className="bg-slate-700" />
        <ModalBody className="bg-slate-700 text-center flex flex-col gap-4">
          <h1 className="text-white font-semibold text-3xl">Contact Us</h1>
          <p className="text-white text-sm">
            Hava questions or feedback? Get in touch with us.
          </p>
          <form
            onSubmit={handleSubmitContactUs}
            className="bg-slate-600 rounded-lg text-start p-3 flex flex-col gap-2"
          >
            <div className="flex flex-col gap-2">
              <Label className="text-white ml-1">Name</Label>
              <TextInput
                type="text"
                id="name"
                placeholder="Enter your name..."
                color="info"
                className="text-teal-900 rounded-none border-none outline-none"
                required
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-white ml-1">Email</Label>
              <TextInput
                type="email"
                id="email"
                placeholder="Enter your email..."
                color="info"
                className="text-teal-900 rounded-none border-none outline-none"
                // defaultValue={currentUser && currentUser.email}
                required
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-white ml-1">Message</Label>
              <Textarea
                type="message"
                id="message"
                placeholder="Enter your message..."
                rows={4}
                color="info"
                className="text-teal-900 border-none outline-none rounded-lg"
                required
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-br from-green-400 to-blue-600 text-white hover:bg-gradient-to-bl focus:ring-green-200 dark:focus:ring-green-800"
            >
              Send
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </Navbar>
  );
}
