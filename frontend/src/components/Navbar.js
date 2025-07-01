import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa"; // Importing icons

export default function Navbar() {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
  const handleNavbarToggle = () => {
    setIsNavbarCollapsed((prevState) => !prevState);
  };

  const navigate = useNavigate();
  const location = useLocation(); // To get the current path

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/Login");
  };

  const isProfilePage = location.pathname === "/myprofile"; // Check if user is on the profile page
  const isLoginPage = location.pathname === "/Login";
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand fs-2 fw-bold fst-italic" to="/">
          BlogSphare
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleNavbarToggle}
          aria-controls="navbarNav"
          aria-expanded={!isNavbarCollapsed}
          aria-label="Toggle navigation"
        >
          {/* Change icon based on navbar state */}
          {isNavbarCollapsed ? (
            <span className="navbar-toggler-icon"></span> // Hamburger icon
          ) : (
            <span>&#10005;</span> // "X" (cross) icon
          )}
        </button>

        <div
          className={`collapse navbar-collapse ${
            !isNavbarCollapsed ? "show" : ""
          }`}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">
                Home
              </Link>
            </li>
            {!isProfilePage && (
              <li className="nav-item">
                <Link className="nav-link" aria-current="page" to="/creators">
                  Creator
                </Link>
              </li>
            )}
          </ul>

          {/* Login/Logout Logic */}
          {!localStorage.getItem("authToken") ? (
            <>
              {isLoginPage ? (
                <Link
                  className="btn btn-outline-light mx-1 rounded-pill px-3"
                  to="/createuser"
                >
                  <FaUserPlus className="me-2" /> Sign Up
                </Link>
              ) : (
                <Link
                  className="btn btn-outline-light mx-1 rounded-pill px-3"
                  to="/Login"
                >
                  <FaSignInAlt className="me-2" /> Login
                </Link>
              )}
            </>
          ) : (
            <div className="d-flex align-items-center">
              {!isProfilePage && (
                <Link
                  className="btn btn-outline-light mx-1 rounded-pill px-3"
                  to="/myprofile"
                >
                  <FaUserCircle className="me-2" /> My Profile
                </Link>
              )}
              <button
                className="btn btn-outline-danger mx-1 rounded-pill px-3"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
