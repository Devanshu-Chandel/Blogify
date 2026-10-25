import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner"

const Comments = ({ postId }) => {
  const { isLoggedIn, userId } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/comments/post/${postId}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/comments/post/${postId}`, { text });
      setComments([...comments, res.data]); // add to the end of the list
      setText("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not add comment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${id}`);
      setComments(comments.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not delete comment");
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            required
            rows={3}
            className="w-full border p-2 rounded"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Comment</button>
        </form>
      ) : (
        <p className="text-sm text-gray-600 mb-6">
          <Link to="/login" className="text-blue-600 font-medium">Login</Link> to comment.
        </p>
      )}

      {loading && <p className="text-gray-500">Loading comments...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-gray-500">No comments yet.</p>
      )}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c._id} className="bg-gray-50 border rounded p-3">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>
                <b className="text-gray-800">{c.author?.name || "Unknown"}</b>{" "}
                · {new Date(c.createdAt).toLocaleDateString()}
              </span>
              {c.author?._id === userId && (
                <button onClick={() => handleDelete(c._id)} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;