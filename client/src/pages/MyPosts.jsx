import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import PostCard from "../components/PostCard";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner"

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/posts/me")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete post");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My posts</h2>
        <Link to="/write" className="bg-blue-500 text-white px-4 py-2 rounded">
          Write a post
        </Link>
      </div>

      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-gray-500 text-center">You haven't written anything yet.</p>
      )}

      <ul className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post}>
            <div className="space-x-4 mt-3">
              <Link to={`/edit/${post._id}`} className="text-blue-600">
                <Edit className="inline h-4 w-4 mr-1" /> Edit
              </Link>
              <button onClick={() => handleDelete(post._id)} className="text-red-600">
                <Trash2 className="inline h-4 w-4 mr-1" /> Delete
              </button>
            </div>
          </PostCard>
        ))}
      </ul>
    </div>
  );
};

export default MyPosts;