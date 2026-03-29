import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar public-navbar">
      <div className="nav-brand">HOLICO SRC VOTING</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/vote">Vote</Link>
      </div>
    </nav>
  );
};

export default Navbar;