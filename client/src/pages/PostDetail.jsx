import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { Edit, Trash2, User, Calendar, ArrowLeft } from "lucide-react";
import LikeButton from "../components/LikeButton";
import Comments from "../components/Comments";
import { toast } from "sonner"

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.response?.data?.msg || "Could not load post"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete post");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!post) return null;

  const isOwner = isLoggedIn && post.author?._id === userId;

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded p-6">
      <Link to="/" className="text-sm text-gray-600 inline-flex items-center mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to posts
      </Link>
      <h2 className="text-3xl font-bold mb-2">{post.title}</h2>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <span>
          <User className="inline h-4 w-4 mr-1" />
          {post.author?.name || "Unknown"}
        </span>
        <span>
          <Calendar className="inline h-4 w-4 mr-1" />
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
      <div className="mt-6">
  <LikeButton postId={post._id} initialLikes={post.likes} />
</div>

      {isOwner && (
        <div className="space-x-4 mt-6 border-t pt-4">
          <Link to={`/edit/${post._id}`} className="text-blue-600">
            <Edit className="inline h-4 w-4 mr-1" /> Edit
          </Link>
          <button onClick={handleDelete} className="text-red-600">
            <Trash2 className="inline h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      )}
      <Comments postId={post._id} />
    </div>
  );
};

export default PostDetail;