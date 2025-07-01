import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MyBlogs, { CreateBlogCard } from "../components/MyBlogs";
import Modal from "../components/Modal"; // Ensure this path is correct
import FollowerFollowing from "../components/FollowerFollowing";
import { useMediaQuery } from "react-responsive";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import config from "../config";

export default function MyProfile() {
  const [profileData, setProfileData] = useState({});
  const [blogCat, setBlogCat] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [editView, setEditView] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followingProfiles, setFollowingProfiles] = useState([]);
  const [followerProfiles, setFollowerProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // State to hold the error message
  const navigate = useNavigate();
  const location = useLocation();
  // State for edit form data
  // Removed unused update state variable
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  useEffect(() => {
    // Using a local variable for resize handler instead of state
    const handleResize = () => {
      // This function will be called on window resize
      // We don't need to update state here since useMediaQuery handles responsive changes
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const message = location.state?.message;

    if (message) {
      setErrorMessage(message);
      setShowModal(true);

      // Clear the location state after showing the modal
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    profilePic: "",
    imagePreview: "", // To handle image preview
  });

  // Load profile and blog data
  const loadData = async () => {
    const email = localStorage.getItem("userEmail");

    // Fetch blog data
    let response = await fetch(`${config.apiUrl}/myblogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    let res = await response.json();
    setBlogData(res[0]);
    setBlogCat(res[1]);
    // Fetch profile data
    response = await fetch(`${config.apiUrl}/myprofiledata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    res = await response.json();
    setProfileData(res[0]);
    // // console.log(console.log(console.log()););
    // Set initial editData to current profile data
    setEditData({
      username: res[0].username || "",
      bio: res[0].bio || "",
      profilePic: res[0].profilePic || "",
      imagePreview: res[0].profilePic || "", // Use existing profilePic as initial preview
    });
  };

  // Use useEffect to load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle changes in the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  // Handle profilePic file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 4 * 1024 * 1024; // 4MB
    const inputElement = e.target; // Reference to the input element

    if (file && file.size > maxSize) {
      setErrorMessage("File is too large. Maximum file size is 4MB.");
      setShowModal(true);
      inputElement.value = null;
      return;
    }
    setEditData({
      ...editData,
      profilePic: file, // Store the file object
      imagePreview: URL.createObjectURL(file), // Preview the selected image
    });
  };

  const uploadFile = async (email, file) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("image", file);

    const response = await fetch(`${config.apiUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const responseData = await response.json();
      // Use secure_url from Cloudinary if available, otherwise fall back to path
      return responseData.secure_url || responseData.path;
    }

    console.error("Failed to upload the image.", response);
    return null; // Return null on failure
  };

  // Handle Save/Submit
  const handleSave = async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("userEmail");
    let profilePicPath = editData.profilePic;

    // If profilePic is a file, upload it, otherwise keep it as is
    if (typeof editData.profilePic !== "string") {
      profilePicPath = await uploadFile(email, editData.profilePic); // Assume uploadFile is defined elsewhere
    }
    // Update the profile data
    const updatedProfileData = {
      username: editData.username,
      bio: editData.bio,
      profilePic: profilePicPath,
    };

    await fetch(`${config.apiUrl}/updateprofile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, data: updatedProfileData }),
    });
    loadData(); // Reload data after update
    setEditView(false); // Close the modal
  };

  const handleEditClick = () => {
    setEditView(true); // Open the edit view
    loadData();
  };
  const handleShowFollowers = async () => {
    setShowFollowers(true);
    const followerEmails = profileData.follower || []; // Get the following email list
    if (followerEmails && followerEmails.length > 0) {
      const responseProfiles = await fetch(
        `${config.apiUrl}/followerProfiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emails: followerEmails }),
        }
      );
      const profilesData = await responseProfiles.json();
      setFollowerProfiles(profilesData); // Store the fetched profiles
    }
  };
  const handleShowFollowing = async () => {
    setShowFollowing(true);
    const followingEmails = profileData.following || []; // Get the following email list
    if (followingEmails && followingEmails.length > 0) {
      const responseProfiles = await fetch(
        `${config.apiUrl}/followingProfiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emails: followingEmails }),
        }
      );
      const profilesData = await responseProfiles.json();
      setFollowingProfiles(profilesData); // Store the fetched profiles
    }
  };
  const handleCloseFollowers = () => setShowFollowers(false);
  const handleCloseFollowing = () => setShowFollowing(false);

  const handleClose = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container mt-4 flex-grow-1 border border-dark rounded p-3">
        {isDesktop && (
          <div className="container mt-4 flex-grow-1 border border-dark rounded p-3 d-flex justify-content-center align-items-center">
            {/* Left side: Profile Picture */}
            <div className="profile-pic-container">
              <img
                src={profileData.profilePic}
                alt="Profile"
                className="profile-pic rounded-circle mx-5"
                style={{ width: "160px", height: "160px", objectFit: "cover" }}
              />
            </div>

            {/* Right side: Profile Info */}
            <div
              className="profile-info-container ms-4"
              style={{ maxWidth: "500px" }}
            >
              {/* Username and Edit Profile */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="username mx-4">{profileData.username}</h2>
                <button
                  className=" mx-4 btn btn-sm bg-dark text-success text-decoration-none"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button>
              </div>

              {/* Blogs, Followers, Following */}
              <div className="d-flex justify-content-between mt-3">
                <div
                  className="m-2 m-md-1 mx-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  <strong>{profileData.blogs?.length ?? 0}</strong>
                  <span style={{ marginLeft: "2px" }}>Blog</span>
                </div>
                <div
                  className="m-2 m-md-1 mx-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  <strong>
                    {profileData.follower && profileData.follower.length > 0
                      ? profileData.follower.length
                      : 0}
                  </strong>
                  <Link
                    style={{
                      marginLeft: "1px",
                      textDecoration: "none",
                      color: "white",
                    }}
                    onClick={handleShowFollowers}
                  >
                    Followers
                  </Link>
                </div>
                <div
                  className="m-2 m-md-1 mx-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  <strong>
                    {profileData.following && profileData.following.length > 0
                      ? profileData.following.length
                      : 0}
                  </strong>
                  <Link
                    style={{
                      marginLeft: "1px",
                      textDecoration: "none",
                      color: "white",
                    }}
                    onClick={handleShowFollowing}
                  >
                    Following
                  </Link>
                </div>
              </div>

              {/* Bio */}
              <div className="bio mt-3">
                <p>{profileData.bio}</p>
              </div>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="container mt-4 flex-grow-1 border border-dark rounded p-3 d-flex justify-content-center align-items-start flex-wrap">
            {/* Right side: Profile Info */}
            <div className="profile-info-container ms-2 ms-md-4 d-flex flex-column w-100">
              {/* Mobile view: Username and Edit Profile on top */}
              <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                <h2 className="username">{profileData.username}</h2>
                <button
                  className=" mx-4 btn btn-sm bg-dark text-success text-decoration-none"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button>
              </div>

              {/* Left side: Profile Picture */}
              <div className="profile-pic-container">
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  className="profile-pic rounded-circle"
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Blogs, Followers, Following */}
              <div className="d-flex justify-content-between mt-3">
                <div style={{ margin: "0 5px", fontSize: "0.85rem" }}>
                  <strong>
                    {profileData.blogs && profileData.blogs.length > 0
                      ? profileData.blogs.length
                      : 0}
                  </strong>
                  <span style={{ marginLeft: "1px" }}>Blog</span>
                </div>
                <div style={{ margin: "0 5px", fontSize: "0.85rem" }}>
                  <strong>
                    {profileData.follower && profileData.follower.length > 0
                      ? profileData.follower.length
                      : 0}
                  </strong>
                  <Link
                    style={{
                      marginLeft: "1px",
                      textDecoration: "none",
                      color: "white",
                    }}
                    onClick={handleShowFollowers}
                  >
                    Followers
                  </Link>
                </div>
                <div style={{ margin: "0 5px", fontSize: "0.85rem" }}>
                  <strong>
                    {profileData.following && profileData.following.length > 0
                      ? profileData.following.length
                      : 0}
                  </strong>
                  <Link
                    style={{
                      marginLeft: "1px",
                      textDecoration: "none",
                      color: "white",
                    }}
                    onClick={handleShowFollowing}
                  >
                    Following
                  </Link>
                </div>
              </div>

              {/* Bio */}
              <div className="bio mt-3">
                <p>{profileData.bio}</p>
              </div>
            </div>
          </div>
        )}
        {/* edit modal */}
        {editView && (
          <Modal onClose={() => setEditView(false)}>
            <h5>Edit Your Profile</h5>
            <form onSubmit={handleSave}>
              {/* Profile Picture Preview and Input */}
              <div className="mb-3">
                <label htmlFor="profilePic" className="form-label">
                  Profile Picture
                </label>
                <div>
                  <img
                    src={editData.imagePreview}
                    alt="Profile Preview"
                    className="rounded-circle"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <input
                  type="file"
                  name="profilePic"
                  id="profilePic"
                  className="form-control mt-2"
                  onChange={handleFileChange}
                />
              </div>

              {/* Username Input */}
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              {/* Bio Input */}
              <div className="mb-3">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  className="form-control"
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              {/* Right-aligned Save Button */}
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-success">
                  Save
                </button>
              </div>
            </form>
          </Modal>
        )}
        {/* follower */}
        {showFollowers && (
          <Modal onClose={handleCloseFollowers} width="360px" height="500px">
            {" "}
            {/* Set your desired width here */}
            <h5>Followers:</h5>
            {followerProfiles && followerProfiles.length > 0 ? (
              <div className="row">
                {followerProfiles.map((profile) => (
                  <div className="col-12" key={profile._id}>
                    {" "}
                    {/* Only one per row */}
                    <FollowerFollowing profile={profile} />
                  </div>
                ))}
              </div>
            ) : (
              <p>You don't have any followers.</p>
            )}
          </Modal>
        )}

        {/* following */}
        {showFollowing && (
          <Modal onClose={handleCloseFollowing} width="360px" height="500px">
            <h5>Followings:</h5>
            {followingProfiles && followingProfiles.length > 0 ? (
              <div className="row">
                {followingProfiles.map((profile) => (
                  <div className="col-12 " key={profile._id}>
                    <FollowerFollowing profile={profile} />
                  </div>
                ))}
              </div>
            ) : (
              <p>You are not following anyone</p>
            )}
          </Modal>
        )}
        <hr />
        <div className="row mt-4">
          <h5 className="text-center w-100">Blogs</h5>
          <hr />
          <div className="container">
            {blogCat && blogCat.length > 0 ? (
              blogCat.map((data) => {
                // Filter blogs by category
                const filteredBlogs = blogData.filter(
                  (blog) => blog.categoryName === data.categoryName
                );

                // Check if there are filtered blogs
                if (filteredBlogs && filteredBlogs.length > 0) {
                  return (
                    <div className="row mb-3" key={data._id}>
                      <div className="fs-3 mt-1">{data.categoryName}</div>
                      <hr />
                      {filteredBlogs.map((filterblogs) => (
                        <div
                          key={filterblogs._id}
                          className="col-12 col-md-6 col-lg-3"
                        >
                          <MyBlogs
                            blogData={filterblogs}
                            blogCat={blogCat}
                            loadData={loadData}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                return null; // Do not render category if no blogs match
              })
            ) : (
              <p>No blogs available</p>
            )}
            <CreateBlogCard blogCat={blogCat} />
          </div>
        </div>
      </div>
      {isDesktop && <Footer />}
      <ConfirmationModal
        show={showModal}
        handleClose={handleClose}
        handleConfirm={handleClose} // Use handleClose for dismissing modal
        message={errorMessage}
        showConfirmButton={false} // Show only the cancel button
      />
    </div>
  );
}
