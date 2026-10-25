import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner"

const LikeButton = ({ postId, initialLikes = [] }) => {
  const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(initialLikes);

  const liked = isLoggedIn && likes.includes(userId);

  const handleClick = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      const res = await API.put(`/posts/${postId}/like`);
      setLikes(res.data.likes); // server sends back the new list
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not update like");
    }
  };

  return (
    <button onClick={handleClick} className="inline-flex items-center gap-1 text-gray-600">
      <Heart
        className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
      />
      {likes.length}
    </button>
  );
};

export default LikeButton;