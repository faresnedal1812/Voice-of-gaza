import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminAndWriterOnlyPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  //   currentUser && currentUser?.role === "writer" ? : ==> that same of
  return currentUser?.role === "writer" || currentUser?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to={"/sign-in"} />
  );
}
