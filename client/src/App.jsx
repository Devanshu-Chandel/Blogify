import { Outlet, Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut } from "lucide-react";

const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
}

 
  return (
     
     <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4  py-4 flex items-center justify-between">
          <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-indigo-600 mr-2"/>
          <h1 className="text-2xl font-bold text-gray-900">Blogify</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to='/' className="text-gray-700">Posts</Link>
            {!isLoggedIn && <Link to="/login" className="text-gray-700">Login</Link>} 
            {!isLoggedIn && <Link to='/signup' className="text-gray-700">Signup</Link>}
            {isLoggedIn && (
              <button onClick={handleLogout} className="text-red-500 flex items-center">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="  max-w-4xl mx-auto px-4 py-6">
          <Outlet />
      </main>
    </div>
  );
};

export default App;