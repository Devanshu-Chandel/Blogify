import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { isLoggedIn } = useAuth();

  // wait 400ms after typing stops before searching, and go back to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError("");
    API.get("/posts", { params: { page, limit: 6, search: debouncedSearch } })
      .then((res) => {
        setPosts(res.data.posts);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Could not load posts. Is the server running?");
      })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Latest posts</h2>
        {isLoggedIn ? (
          <Link to="/write" className="bg-blue-500 text-white px-4 py-2 rounded">
            Write a post
          </Link>
        ) : (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 font-medium">Login</Link> or{" "}
            <Link to="/signup" className="text-blue-600 font-medium">sign up</Link> to write
          </p>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded pl-9 pr-3 py-2 bg-white"
        />
      </div>

      {loading && <p className="text-gray-500 text-center">Loading posts...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-500 text-center">
          {debouncedSearch
            ? `No posts found for "${debouncedSearch}".`
            : "No posts yet. Write the first one!"}
        </p>
      )}

      {!loading && (
        <ul className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="flex items-center px-3 py-1 border rounded bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="flex items-center px-3 py-1 border rounded bg-white disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;