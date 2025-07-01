import React, { useState, useEffect } from "react";
import Comment from "../components/Comment";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useMediaQuery } from "react-responsive";
import "../components/BlogStyles.css";
import config from "../config";

export default function ViewBlog() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // Removed unused state variables
  const [authorName, setAuthorName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const blog = location.state?.blogData;
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  useEffect(() => {
    if (!blog) {
      navigate("/");
      return;
    }

    const fetchComments = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/commentdata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: blog._id }),
        });

        if (response.ok) {
          const data = await response.json();
          const formattedComments = data.map((comment) => ({
            _id: comment._id,
            username: comment.username,
            email: comment.email,
            content: comment.content,
            timestamp: comment.createdAt,
          }));
          setComments(formattedComments);
        } else {
          console.error("Error fetching comments:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchAuthorName = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: blog.email }),
        });
        if (response.ok) {
          const data = await response.json();
          setAuthorName(data.username);
        }
      } catch (err) {
        console.error("Error fetching author name:", err);
      }
    };

    fetchComments();
    fetchAuthorName();
  }, [blog, navigate]);

  const fetchUsername = async (email) => {
    try {
      const response = await fetch(`${config.apiUrl}/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.username;
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
    return "Guest";
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/Login", { state: { message: "Please log in to comment." } });
      return;
    }

    if (newComment.trim() === "") return;

    const fetchedUsername = await fetchUsername(email);

    const newCommentData = {
      blogId: blog._id,
      content: newComment,
      email: email,
      username: fetchedUsername,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(`${config.apiUrl}/addcomment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommentData),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedComment = {
          _id: data._id,
          username: data.username,
          email: data.email,
          content: data.content,
          timestamp: data.createdAt,
        };
        setComments((prev) => [...prev, formattedComment]);
        setNewComment("");
      } else {
        console.error("Error saving comment:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleDeleteComment = async (index) => {
    const commentToDelete = comments[index];
    try {
      const response = await fetch(`${config.apiUrl}/deletecomment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentToDelete._id }),
      });

      if (response.ok) {
        setComments((prev) => prev.filter((_, i) => i !== index));
      } else {
        console.error("Error deleting comment:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async (index, newContent) => {
    const currentComment = comments[index];
    const updatedCommentData = {
      blogId: blog._id,
      content: newContent,
      email: currentComment.email,
      username: currentComment.username,
      createdAt: currentComment.timestamp,
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(`${config.apiUrl}/updatecomment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentComment._id,
          data: updatedCommentData,
        }),
      });

      if (response.ok) {
        const savedComment = await response.json();
        const formattedComment = {
          _id: savedComment._id,
          username: savedComment.username,
          email: savedComment.email,
          content: savedComment.content,
          timestamp: savedComment.updatedAt,
        };
        setComments((prev) =>
          prev.map((comment, idx) =>
            idx === index ? formattedComment : comment
          )
        );
      } else {
        console.error("Error updating comment:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const currentUserEmail = localStorage.getItem("userEmail");
  const isBlogOwner = currentUserEmail === blog.email;

  const handleClick = () => {
    if (isBlogOwner) {
      navigate("/myprofile");
    } else {
      navigate("/creatorprofile", { state: { email: blog.email } });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <article className="blog-post bg-dark text-light p-4 rounded shadow">
              {/* Blog Header */}
              <header className="blog-header mb-4">
                <h1 className="display-4 fw-bold text-center mb-3">
                  {blog.title || "Blog Title"}
                </h1>

                {/* Featured Image */}
                {blog.img && (
                  <div className="featured-image-container mb-4">
                    <img
                      src={blog.img}
                      alt="Featured"
                      className="img-fluid rounded w-100"
                      style={{ maxHeight: "500px", objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Author and Date Info */}
                <div className="d-flex justify-content-between align-items-center mb-4 text-muted border-bottom pb-3">
                  <div className="author-info">
                    <span
                      className="author-name fw-bold btn text-success p-0"
                      onClick={handleClick}
                    >
                      <i className="fas fa-user-circle me-2"></i>@
                      {authorName || "Unknown Author"}
                    </span>
                  </div>
                  <div className="publish-info">
                    <span className="publish-date">
                      <i className="far fa-calendar-alt me-2"></i>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="ms-3 badge bg-secondary">
                      {blog.categoryName}
                    </span>
                  </div>
                </div>
              </header>

              {/* Blog Description */}
              {blog.desc && (
                <div className="blog-description mb-4">
                  <p className="lead fst-italic">{blog.desc}</p>
                </div>
              )}

              {/* Blog Content */}
              <div className="blog-content">
                {blog.contents ? (
                  blog.contents.map((section, index) => (
                    <div key={index} className="content-section mb-5">
                      {section.img && (
                        <div className="section-image mb-3">
                          <img
                            src={section.img}
                            alt={`section-${index}`}
                            className="img-fluid rounded"
                            style={{
                              width: "100%",
                              maxHeight: "500px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}
                      <div className="section-text">
                        <p className="fs-5 lh-lg">{section.paragraph}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted">
                    No content available for this blog.
                  </p>
                )}
              </div>

              {/* Comments Section */}
              <section className="comments-section mt-5 pt-4 border-top">
                <h3 className="mb-4">
                  <i className="far fa-comments me-2"></i>Comments
                </h3>

                {comments && comments.length > 0 ? (
                  <div className="comments-list">
                    {comments.map((comment, index) => (
                      <Comment
                        key={index}
                        username={comment.username}
                        userEmail={comment.email}
                        content={comment.content}
                        timestamp={comment.timestamp}
                        onDelete={() => handleDeleteComment(index)}
                        onEdit={(newContent) =>
                          handleEditComment(index, newContent)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-comments text-center p-3 bg-dark border border-secondary rounded mb-4">
                    <p className="mb-0">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}

                {/* Add Comment Form */}
                <div className="add-comment mt-4">
                  <h4 className="mb-3">
                    <i className="fas fa-pen me-2"></i>Add a Comment
                  </h4>
                  <form onSubmit={handleCommentSubmit}>
                    <div className="mb-3">
                      <textarea
                        className="form-control bg-dark text-light border-secondary"
                        rows="3"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-paper-plane me-2"></i>Post Comment
                    </button>
                  </form>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
      {isDesktop && <Footer />}
    </>
  );
}
