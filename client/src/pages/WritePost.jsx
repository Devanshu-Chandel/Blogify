import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner"

const WritePost = () => {
  const { id } = useParams(); // present only when editing
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    API.get(`/posts/${id}`)
      .then((res) => {
        if (res.data.author?._id !== userId) {
          navigate("/"); // not your post
          return;
        }
        setTitle(res.data.title);
        setContent(res.data.content);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = id
        ? await API.put(`/posts/${id}`, { title, content })
        : await API.post("/posts", { title, content });
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save post");
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 bg-white p-6 border rounded">
      <h2 className="text-xl font-semibold">{id ? "Edit post" : "Write a new post"}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={10}
        className="w-full border p-2 rounded"
      />
      <div className="space-x-2">
        <button disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
          {saving ? "Saving..." : id ? "Update post" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default WritePost;