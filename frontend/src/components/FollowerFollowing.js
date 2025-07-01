import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function FollowerFollowing(props) {
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleView = () => {
    navigate("/creatorprofile", { state: { email: props.profile.email } });
  };

  // Wrap loadData in useCallback to prevent recreation on every render
  const loadData = useCallback(async () => {
    try {
      const profileResponse = await fetch(
        `${import.meta.env.REACT_APP_BACKEND_URL}/api/myprofiledata`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: props.profile.email }),
        }
      );

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("Error loading profile data:", errorText);
        return;
      }

      const profileRes = await profileResponse.json();

      const currentUserEmail = localStorage.getItem("userEmail");
      if (profileRes && profileRes[0]) {
        const followers = Array.isArray(profileRes[0].follower)
          ? profileRes[0].follower
          : []; // Ensure it's an array
        const isUserFollowing = followers.includes(currentUserEmail);
        setIsFollowing(isUserFollowing);
      }
    } catch (error) {
      console.error("Failed to load follow status:", error);
    }
  }, [props.profile.email]); // Add props.profile.email as a dependency

  useEffect(() => {
    loadData();
  }, [loadData]); // Only loadData as a dependency since it's memoized

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    const currentUserEmail = localStorage.getItem("userEmail");

    if (!currentUserEmail) {
      alert("Please log in to follow creators."); // Use an alert or toast for better UX
      return;
    }

    if (isLoading) return; // Prevent multiple clicks while loading

    setIsLoading(true); // Start loading

    // Determine the action based on the current UI state
    const intendedAction = isFollowing ? "unfollow" : "follow";
    const previousIsFollowingState = isFollowing; // Store for potential rollback

    // Optimistically update UI
    setIsFollowing(!previousIsFollowingState);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/followfollowing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentUserEmail,
            profileUserEmail: props.profile.email,
            action: intendedAction, // Send the intended action (follow/unfollow)
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData.error);
        // Rollback UI on error
        setIsFollowing(previousIsFollowingState);
        alert(
          `Failed to ${intendedAction} user: ${
            errorData.error || "Server error"
          }`
        );
        return; // Stop execution if API call failed
      }

      // If successful, the UI is already optimistically updated correctly
      // You might want to re-fetch to ensure consistency, but it's often not strictly necessary if backend confirms success.
      // loadData(); // Consider if you really need to re-fetch the entire profile here
      // If the backend returns the updated profile, you could use that:
      // const updatedProfileData = await response.json();
      // setIsFollowing(updatedProfileData.isFollowing); // Assuming backend sends this back
    } catch (error) {
      console.error("Error following user:", error);
      // Rollback UI on network error
      setIsFollowing(previousIsFollowingState);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div
      className="card mt-3 shadow"
      style={{
        width: "100%",
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
      }}
      onClick={handleView}
    >
      <div className="d-flex align-items-center p-3">
        <img
          src={props.profile.profilePic}
          alt="Profile"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "50%",
            border: "2px solid #007bff",
          }}
        />

        <div className="ms-3 w-100 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1" style={{ fontWeight: "bold", color: "#FFF" }}>
              {props.profile.username}
            </h5>
          </div>

          <button
            className={`btn btn-sm ${
              isFollowing ? "btn-success" : "btn-primary"
            }`}
            onClick={handleFollowClick}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}
