import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmationModal from "../components/ConfirmationModal";
import config from "../config";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // State to hold the error message

  let navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const message = location.state?.message;

    if (message) {
      setErrorMessage(message);
      setShowModal(true);

      // Clear the location state after showing the modal
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    const response = await fetch(`${config.apiUrl}/loginuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    const json = await response.json();
    if (!json.success) {
      // Handle the error properly - it could be an array or a string
      if (Array.isArray(json.error)) {
        // If it's an array of validation errors, extract the first message
        setErrorMessage(json.error[0]?.msg || "Validation error");
      } else if (typeof json.error === "object" && json.error !== null) {
        // If it's an object, convert it to a string
        setErrorMessage(JSON.stringify(json.error));
      } else {
        // If it's already a string, use it directly
        setErrorMessage(json.error || "An error occurred");
      }
      setShowModal(true);
    }
    if (json.success) {
      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("authToken", json.authToken);
      navigate("/");
    }
  };

  const onchange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };
  const handleClose = () => {
    setShowModal(false); // Close the modal
  };
  return (
    <>
      <Navbar />
      <div
        className="container-fluid d-flex justify-content-center align-items-center vh-100"
        style={{ marginTop: "-70px" }} // Adjust the margin as needed
      >
        <form
          className="w-100"
          style={{
            maxWidth: "400px",
            border: "2px solid #007bff",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "rgb(53, 57, 53)",
          }}
          onSubmit={handleSubmit}
        >
          <h2 className="text-center text-light mb-4">Login</h2>
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={credentials.email}
              onChange={onchange}
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={onchange}
              id="exampleInputPassword1"
            />
          </div>
          <button type="submit" className="m-3 btn btn-success">
            Login
          </button>
          <Link to="/createuser" className="m-3 btn btn-danger">
            I am a new user
          </Link>
        </form>
      </div>
      <ConfirmationModal
        show={showModal}
        handleClose={handleClose}
        handleConfirm={handleClose} // Use handleClose for dismissing modal
        message={errorMessage}
        showConfirmButton={false} // Show only the cancel button
      />
    </>
  );
}
