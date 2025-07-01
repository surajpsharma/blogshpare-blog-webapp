import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

export default function CreatorCard(props) {
  const navigate = useNavigate();

  // State to track if the user is following the creator
  const [isFollowing, setIsFollowing] = useState(false);

  // Get current user's email from localStorage
  const currentUserEmail = localStorage.getItem("userEmail");

  const handleView = () => {
    navigate("/creatorprofile", { state: { email: props.profile.email } });
  };

  // useCallback to memoize loadData, preventing unnecessary re-creation
  const loadData = useCallback(async () => {
    try {
      if (!props.profile || !props.profile.email) {
        console.warn(
          "CreatorCard: Profile data or email is missing for loadData."
        );
        return;
      }

      const profileResponse = await fetch(`${config.apiUrl}/myprofiledata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: props.profile.email }),
      });

      if (!profileResponse.ok) {
        console.error(
          "Failed to fetch profile data for CreatorCard:",
          profileResponse.status,
          profileResponse.statusText
        );
        return;
      }

      const profileRes = await profileResponse.json();

      if (profileRes[0] && Array.isArray(profileRes[0].follower)) {
        // Check if the current user's email is in the fetched follower list
        const isUserFollowing =
          profileRes[0].follower.includes(currentUserEmail);
        setIsFollowing(isUserFollowing); // Update the follow state
      } else {
        setIsFollowing(false); // Default to not following if follower list is empty or malformed
      }
    } catch (error) {
      console.error("Error in CreatorCard loadData:", error);
    }
  }, [props.profile, currentUserEmail]); // Removed unnecessary props.profile.email dependency

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is a dependency because it's memoized with useCallback

  const handleFollowClick = async (e) => {
    e.stopPropagation(); // Prevents the card's onClick (handleView) from firing

    if (!currentUserEmail) {
      navigate("/Login", { state: { message: "Please log in to follow." } });
      return;
    }

    // Determine the action to send based on the current UI state
    // If currently 'following', the action will be 'unfollow'. If not, 'follow'.
    const actionToSend = isFollowing ? "unfollow" : "follow";
    const previousIsFollowingState = isFollowing; // Store current state for potential rollback

    // --- CRITICAL DEBUGGING ---
    console.log("CreatorCard: handleFollowClick initiated.");
    console.log("currentUserEmail:", currentUserEmail);
    console.log("profileUserEmail:", props.profile.email);
    console.log("actionToSend:", actionToSend); // Check what action is being prepared
    // --- END CRITICAL DEBUGGING ---

    // Optimistic UI update
    setIsFollowing(!isFollowing);

    try {
      const response = await fetch(`${config.apiUrl}/followfollowing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserEmail: currentUserEmail,
          profileUserEmail: props.profile.email,
          action: actionToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error message from backend
        console.error(
          "CreatorCard: Error response from backend:",
          errorData.error
        );
        // Revert the state in case of failure
        setIsFollowing(previousIsFollowingState); // Rollback to original state
        alert(
          `Failed to ${actionToSend} user: ${errorData.error || "Server error"}`
        );
      } else {
        // Backend was successful. Re-fetch data to get updated follower counts.
        console.log(
          `CreatorCard: Successfully changed follow status to: ${actionToSend}`
        );
        loadData(); // Re-fetch data to reflect actual counts after backend update
      }
    } catch (error) {
      console.error(
        "CreatorCard: Network or unexpected error during follow/unfollow:",
        error
      );
      // Revert the state in case of network error
      setIsFollowing(previousIsFollowingState); // Rollback to original state
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <div
        className="card mt-3 shadow"
        style={{
          width: "18rem",
          height: "340px",
          cursor: "pointer",
          borderRadius: "15px",
          overflow: "hidden",
          transition: "transform 0.2s",
        }}
        onClick={handleView}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src={props.profile.profilePic}
          className="card-img-top"
          alt="Profile"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderRadius: "50%",
            margin: "10px auto",
            border: "3px solid #007bff",
          }}
        />
        <div className="card-body text-center">
          <h5
            className="card-title"
            style={{ fontWeight: "bold", color: "#FFFF" }}
          >
            {props.profile.username}
          </h5>
          <div className="container w-100">
            <div
              className="d-inline h-100 fs-6 text-muted"
              style={{
                minHeight: "3em",
                maxHeight: "3em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
              }}
            >
              {props.profile.bio ? props.profile.bio : "         "}
            </div>
          </div>

          {/* Follow/Following Button */}
          {currentUserEmail !== props.profile.email && ( // Only show button if not viewing own profile
            <button
              className={`btn btn-sm ${
                isFollowing ? "btn-success" : "btn-primary"
              } mt-2 w-100`}
              onClick={handleFollowClick}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
