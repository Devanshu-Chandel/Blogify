import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { PlusCircle, Edit, Trash2, User } from "lucide-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    API.get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/posts/${editing._id}`, { title, content });
      } else {
        const res = await API.post("/posts", { title, content });
        setPosts([res.data, ...posts]);
      }
      setTitle("");
      setContent("");
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to save post");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/posts/${id}`);
      setPosts(posts.filter((post) => post._id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setEditing(post);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input type="text" 
              placeholder="Title"
              value={title}
              onChange={(e) =>{setTitle(e.target.value)} }
              required
              className="w-full border p-2 rounded"
        />
        <textarea 
        className="w-full border p-2 rounded"
        placeholder="Content"
        value={content}
        onChange={(e) => {setContent(e.target.value)}}
        required
        ></textarea>
        
        <button className=" bg-blue-500 text-white px-4 py-2 rounded
        ">
          {editing ? 'Update post' : 'Add post'}
        </button>
      </form>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post._id} className="border p-4 rounded">
            <h3 className="text-lg font-bold">{post.title}</h3>
            <p>{post.content}</p>
            <p className="text-sm text-gray-500">
              <User className="inline h-4 w-4" /> {post.author?.name || "Unknown"}
            </p>
            <div className="space-x-2 mt-2">
              <button onClick={() => handleEdit(post)} className="text-blue-600">
                <Edit className="inline h-4 w-4 mr-1" /> Edit
              </button>
              <button onClick={() => handleDelete(post._id)} className="text-red-600">
                <Trash2 className="inline h-4 w-4 mr-1" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;
