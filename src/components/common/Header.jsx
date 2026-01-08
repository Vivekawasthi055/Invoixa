import { Link } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { useAuth } from "./AuthContext";

function Header() {
  const { user } = useAuth();

  return (
    <header>
      <h2>Invoixa</h2>

      {user ? (
        <button onClick={logoutUser}>Logout</button>
      ) : (
        <button>
          <Link to="/login">Login</Link>
        </button>
      )}
    </header>
  );
}

export default Header;
