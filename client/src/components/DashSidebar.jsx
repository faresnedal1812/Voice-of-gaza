import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { HiLogout, HiUser, HiTable, HiLogin, HiChartPie } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signout } from "../redux/user/userSlice";
import { FaUsers, FaRegNewspaper } from "react-icons/fa";
import { MdOutlineInsertComment } from "react-icons/md";
import { GiTeamUpgrade } from "react-icons/gi";

export default function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const [roleRequestsCount, setRoleRequestsCount] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
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

  console.log(roleRequestsCount);

  useEffect(() => {
    if (currentUser.role === "admin") {
      const fetchRoleRequests = async () => {
        try {
          const res = await fetch("/api/roleRequest/role-requests");
          const data = await res.json();
          if (!res.ok) {
            return;
          } else {
            setRoleRequestsCount(data.length);
          }
        } catch (error) {
          console.log(error.message);
        }
      };
      fetchRoleRequests();
    }
  }, [currentUser]);

  return (
    <Sidebar className="w-full">
      <SidebarLogo img="./logo2.png" imgAlt="logo" href="/">
        <span className="text-gray-700">Voice of Gaza</span>
      </SidebarLogo>
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem
            icon={HiUser}
            active={tab === "profile"}
            label={
              currentUser.role[0].toUpperCase() + currentUser.role.slice(1)
            }
            labelColor="dark"
            as={"div"}
          >
            <Link to={"/dashboard?tab=profile"}>Profile</Link>
          </SidebarItem>
          {currentUser?.role === "admin" && (
            <>
              <SidebarItem active={tab === "dash"} icon={HiChartPie} as={"div"}>
                <Link to={"/dashboard?tab=dash"}>Dashboard</Link>
              </SidebarItem>
              <SidebarItem active={tab === "users"} icon={FaUsers} as={"div"}>
                <Link to={"/dashboard?tab=users"}>Users</Link>
              </SidebarItem>
              <SidebarItem
                active={tab === "posts"}
                icon={FaRegNewspaper}
                as={"div"}
              >
                <Link to={"/dashboard?tab=posts"}>Posts</Link>
              </SidebarItem>
              <SidebarItem
                active={tab === "comments"}
                icon={MdOutlineInsertComment}
                as={"div"}
              >
                <Link to={"/dashboard?tab=comments"}>Comments</Link>
              </SidebarItem>
              <SidebarItem
                active={tab === "role-requests"}
                icon={GiTeamUpgrade}
                as={"div"}
              >
                <Link
                  to={"/dashboard?tab=role-requests"}
                  className="flex items-center justify-between"
                >
                  Role requests{" "}
                  <span className="bg-red-500 text-white text-sm font-medium rounded-full px-[6px]">
                    {roleRequestsCount}
                  </span>
                </Link>
              </SidebarItem>
            </>
          )}
          <SidebarItem icon={HiLogin} as={"div"}>
            <Link to={"/sign-in"}>Sign in</Link>
          </SidebarItem>
          <SidebarItem icon={HiTable} as={"div"}>
            <Link to={"/sign-up"}>Sign up</Link>
          </SidebarItem>
        </SidebarItemGroup>
        <SidebarItemGroup>
          <SidebarItem
            className="cursor-pointer"
            icon={HiLogout}
            onClick={handleSignOut}
          >
            Sign out
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
