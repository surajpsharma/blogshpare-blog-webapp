// src/pages/CreatorProfile.js

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import config from "../config";

export default function CreatorProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const profileUserEmail = location.state?.email;
  const [blogCat, setBlogCat] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState(null); // Initialize with null for proper loading state
  const [isLoadingFollow, setIsLoadingFollow] = useState(false); // New state for follow button loading
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  // Wrap loadData in useCallback to prevent recreation on every render
  const loadData = useCallback(async () => {
    if (!profileUserEmail) {
      console.warn("No profileUserEmail provided to CreatorProfile.");
      return;
    }

    try {
      const blogsResponse = await fetch(`${config.apiUrl}/myblogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profileUserEmail }),
      });
      if (!blogsResponse.ok) throw new Error("Failed to fetch blogs");
      const blogsRes = await blogsResponse.json();
      setBlogData(blogsRes[0] || []);
      setBlogCat(blogsRes[1] || []);

      const profileResponse = await fetch(`${config.apiUrl}/myprofiledata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profileUserEmail }),
      });
      if (!profileResponse.ok) throw new Error("Failed to fetch profile data");
      const profileRes = await profileResponse.json();
      setProfileData(profileRes[0]);

      const currentUserEmail = localStorage.getItem("userEmail");
      if (profileRes[0]?.follower) {
        const isUserFollowing =
          profileRes[0].follower.includes(currentUserEmail);
        setIsFollowing(isUserFollowing);
      }
    } catch (error) {
      console.error("Error loading creator profile data:", error);
      // Handle error gracefully, e.g., show an error message to the user
    }
  }, [profileUserEmail]); // Add profileUserEmail as a dependency

  useEffect(() => {
    loadData();
  }, [loadData]); // Only loadData as a dependency since it's memoized

  const handleFollowClick = async () => {
    const currentUserEmail = localStorage.getItem("userEmail");
    if (!currentUserEmail) {
      navigate("/Login", { state: { message: "Please log in to follow." } });
      return;
    }

    if (isLoadingFollow) return; // Prevent multiple clicks

    setIsLoadingFollow(true); // Start loading

    // Determine the action based on the current UI state
    const action = isFollowing ? "unfollow" : "follow";
    const previousIsFollowingState = isFollowing; // Store for potential rollback

    // Optimistic UI update
    setIsFollowing(!previousIsFollowingState);

    try {
      const response = await fetch(`${config.apiUrl}/followfollowing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail,
          profileUserEmail: profileData.email, // Use profileData.email which is already fetched
          action: action, // <--- CORRECTED: Send 'action' instead of 'isFollowing'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData.error);
        setIsFollowing(previousIsFollowingState); // Rollback UI on error
        alert(`Failed to ${action} user: ${errorData.error || "Server error"}`);
      } else {
        // If successful, UI is already optimistic. You could refresh specific data if needed.
        // const result = await response.json(); // You might get the updated profile back
        // setIsFollowing(result.isFollowing); // If backend sends this
        console.log(`Successfully changed follow status to: ${action}`);
        // Consider reloading only follower/following counts if necessary, not all data
        // For simplicity, calling loadData() here will re-fetch everything
        loadData(); // Re-fetch data to update follower/following counts
      }
    } catch (error) {
      console.error(
        "Network or unexpected error during follow/unfollow:",
        error
      );
      setIsFollowing(previousIsFollowingState); // Rollback UI on network error
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoadingFollow(false); // End loading
    }
  };

  if (!profileData)
    return <p className="text-center mt-5">Loading profile...</p>; // Better loading message

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container mt-4 flex-grow-1 border border-dark rounded p-3">
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="text-md-start text-center mb-3">
              <h5 className="mb-1 d-flex justify-content-between align-items-center">
                {profileData.username || "username"}
              </h5>
            </div>
            <div className="d-flex align-items-center justify-content-center flex-column flex-md-row">
              <img
                src={profileData.profilePic}
                alt="Profile"
                className="rounded-circle me-4"
                style={{ width: "160px", height: "160px", objectFit: "cover" }}
              />
              <div className="text-md-start text-center">
                <div className="mt-3 d-flex justify-content-around w-100">
                  <div>
                    <strong className=" m-1">
                      {profileData.blogs?.length || 0}
                    </strong>
                    {"   "}
                    Blogs
                  </div>
                  <div>
                    <strong className=" m-1">
                      {profileData.follower?.length || 0}
                    </strong>{" "}
                    Followers
                  </div>
                  <div>
                    <strong className=" m-1">
                      {profileData.following?.length || 0}
                    </strong>{" "}
                    Following
                  </div>
                </div>
              </div>
            </div>
            <p className="mb-0 mt-3">{profileData.bio}</p>
            {/* Added check to ensure profileData exists before showing button */}
            {profileData.email !== localStorage.getItem("userEmail") && ( // Don't show follow button on your own profile
              <button
                className={`btn btn-sm ${
                  isFollowing ? "btn-success" : "btn-primary"
                } mt-2 w-100`}
                onClick={handleFollowClick}
                disabled={isLoadingFollow} // Disable during loading
              >
                {isLoadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
        <hr />
        <div className="row mt-4">
          <h5 className="text-center w-100">Blogs</h5>
          <div className="container">
            {blogCat.length > 0 && blogData.length > 0 ? (
              blogCat.map((cat) => {
                const filtered = blogData.filter(
                  (blog) => blog.categoryName === cat.categoryName
                );
                return filtered.length > 0 ? (
                  <div className="row mb-3" key={cat._id}>
                    <div className="fs-3 mb-3 mt-3">{cat.categoryName}</div>
                    {filtered.map((blog) => (
                      <div className="col-12 col-md-6 col-lg-3" key={blog._id}>
                        <Card blogData={blog} />
                      </div>
                    ))}
                  </div>
                ) : null;
              })
            ) : (
              <p className="text-center fw-bold">No blogs available</p>
            )}
          </div>
        </div>
      </div>
      {isDesktop && <Footer />}
    </div>
  );
}
