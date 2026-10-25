import { Link } from "react-router-dom";
import { User, Calendar , Heart } from "lucide-react";

const PostCard = ({ post, children }) => {
  const excerpt =
    post.content.length > 150 ? post.content.slice(0, 150) + "..." : post.content;

  return (
    <li className="border p-4 rounded bg-white">
      <Link to={`/posts/${post._id}`}>
        <h3 className="text-lg font-bold hover:text-indigo-600">{post.title}</h3>
      </Link>
      <p className="text-gray-700 mt-1">{excerpt}</p>
      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
        <span>
          <User className="inline h-4 w-4 mr-1" />
          {post.author?.name || "Unknown"}
        </span>
        <span>
          <Calendar className="inline h-4 w-4 mr-1" />
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span>
         <Heart className="inline h-4 w-4 mr-1" />
          {post.likes?.length || 0}
</span>
      </div>
      {children}
    </li>
  );
};

export default PostCard;