import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Header from "./components/Header";
import FooterComp from "./components/FooterComp";
import PrivateRoute from "./components/PrivateRoute";
import CreatePost from "./pages/CreatePost";
import WriterOnlyPrivateRoute from "./components/WriterOnlyPrivateRoute";
import UpdatePost from "./pages/UpdatePost";
import PostPage from "./pages/PostPage";
import Search from "./pages/Search";
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:postSlug" element={<PostPage />} />
        </Route>
        <Route element={<WriterOnlyPrivateRoute />}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:postId" element={<UpdatePost />} />
        </Route>
      </Routes>
      <FooterComp />
    </BrowserRouter>
  );
}
