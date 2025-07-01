import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BlogStyles.css";

export default function Comment({
  username,
  userEmail,
  content,
  timestamp,
  onDelete,
  onEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content); // State to hold edited comment content
  const currentUserEmailEmail = localStorage.getItem("userEmail");

  const handleEdit = () => {
    onEdit(editedContent); // Call the onEdit function passed as prop
    setIsEditing(false); // Close the editing state
  };

  // Check if the current user is the owner of the comment
  const isCommentOwner = currentUserEmailEmail === userEmail;
  const navigate = useNavigate();
  const handleClick = () => {
    if (isCommentOwner) {
      navigate("/myprofile");
    } else {
      navigate("/creatorprofile", { state: { email: userEmail } });
    }
  };
  return (
    <div className="comment-item bg-dark border border-secondary rounded p-3 mb-3">
      <div className="comment-content">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="user-info d-flex align-items-center">
            <div
              className="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: "40px", height: "40px", fontSize: "18px" }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <h6 className="mb-0">
              <span
                className="btn text-success p-0 fw-bold"
                onClick={handleClick}
              >
                @{username}
              </span>
            </h6>
          </div>

          {isCommentOwner && (
            <div className="comment-actions">
              <button
                className={`btn ${
                  isEditing ? "btn-outline-warning" : "btn-outline-primary"
                } btn-sm me-2`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <i
                  className={`fas ${isEditing ? "fa-times" : "fa-edit"} me-1`}
                ></i>
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={onDelete}
              >
                <i className="fas fa-trash-alt me-1"></i>
                Delete
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="form-control bg-dark text-light border-secondary mb-2"
              rows="3"
              placeholder="Edit your comment..."
            />
            <button className="btn btn-success btn-sm" onClick={handleEdit}>
              <i className="fas fa-save me-1"></i>
              Save Changes
            </button>
          </div>
        ) : (
          <div className="comment-text p-2 rounded">
            <p className="mb-2">{content}</p>
          </div>
        )}

        <div className="comment-meta text-muted mt-2 d-flex align-items-center">
          <i className="far fa-clock me-1"></i>
          <small>
            {new Date(timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </div>
      </div>
    </div>
  );
}
