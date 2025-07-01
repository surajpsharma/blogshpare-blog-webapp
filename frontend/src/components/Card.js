import React from "react";
import { useNavigate } from "react-router-dom";
import "./BlogStyles.css";

export default function Card(props) {
  const navigate = useNavigate();

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Navigates to the viewblog page, passing the current blog data in the state.
   */

  /*******  6c286e02-6470-4c57-bbfa-ec53b5e51a4e  *******/ const handleView =
    () => {
      navigate("/viewblog", { state: { blogData: props.blogData } });
    };

  return (
    <div className="blog-card-container">
      <div
        className="blog-card bg-dark text-light rounded overflow-hidden shadow-lg border border-secondary"
        style={{
          width: "100%",
          height: "100%",
          cursor: "pointer",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onClick={handleView}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 255, 0, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
        }}
      >
        {/* Image Container */}
        <div className="blog-card-img-container position-relative">
          <img
            src={props.blogData.img}
            className="blog-card-img w-100"
            alt={props.blogData.title}
            style={{ height: "180px", objectFit: "cover" }}
          />
          <div className="category-badge position-absolute top-0 end-0 m-2">
            <span className="badge bg-success text-white">
              {props.blogData.categoryName}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="blog-card-content p-3">
          <h5 className="blog-card-title fw-bold mb-2 text-success">
            {props.blogData.title}
          </h5>

          <div className="blog-card-description mb-3">
            <p
              className="text-light-50 mb-0"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                opacity: "0.8",
              }}
            >
              {props.blogData.desc}
            </p>
          </div>

          {/* Footer with date and read more */}
          <div className="blog-card-footer d-flex justify-content-between align-items-center mt-auto">
            <small className="text-muted">
              <i className="far fa-calendar-alt me-1"></i>
              {new Date(props.blogData.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </small>
            <span className="read-more text-success">
              Read More <i className="fas fa-arrow-right ms-1"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
