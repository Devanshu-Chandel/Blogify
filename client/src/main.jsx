import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import WritePost from "./pages/WritePost";
import MyPosts from "./pages/MyPosts";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider Toaster position="top-right" richColors >
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Posts />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route
            path="write"
            element={<ProtectedRoute><WritePost /></ProtectedRoute>}
          />
          <Route
            path="edit/:id"
            element={<ProtectedRoute><WritePost /></ProtectedRoute>}
          />
          <Route
            path="my-posts"
            element={<ProtectedRoute><MyPosts /></ProtectedRoute>}
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);