import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContentSection from "../components/ContentSection";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import ConfirmationModal from "../components/ConfirmationModal";
import config from "../config";

export default function CreateBlog() {
  const location = useLocation();
  const [blogCat, setBlogCat] = useState(location.state?.blogCat || []);
  const navigate = useNavigate();

  // Fetch categories if they weren't passed through location state
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (blogCat.length === 0) {
          const response = await fetch(`${config.apiUrl}/categories`);
          if (response.ok) {
            const data = await response.json();
            setBlogCat(data);
          } else {
            console.error("Failed to fetch categories");
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [blogCat.length]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [category, setCategory] = useState("");
  const [contentSections, setContentSections] = useState([
    { id: Date.now(), image: null, text: "" },
  ]);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // State to hold the error message
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    const maxSize = 4 * 1024 * 1024; // 4MB
    const inputElement = e.target; // Reference to the input element

    if (file && file.size > maxSize) {
      setErrorMessage("File is too large. Maximum file size is 4MB.");
      setShowModal(true);
      inputElement.value = null;
      return;
    }
    setContentSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, image: file } : section
      )
    );
  };

  const handleTextChange = (id, e) => {
    const text = e.target.value;
    setContentSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, text } : section
      )
    );
  };

  const addContentSection = () => {
    setContentSections((prevSections) => [
      ...prevSections,
      { id: Date.now(), image: null, text: "" },
    ]);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 4 * 1024 * 1024; // 4MB
    const inputElement = e.target; // Reference to the input element

    if (file && file.size > maxSize) {
      setErrorMessage("File is too large. Maximum file size is 4MB.");
      setShowModal(true);
      inputElement.value = null;
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail");
    const currentDate = new Date().toISOString();

    try {
      // Upload thumbnail
      const thumbnailPath = await uploadFile(userEmail, thumbnail);
      if (!thumbnailPath) return; // Stop if thumbnail upload fails

      // Upload content section images
      const uploadResponses = await Promise.all(
        contentSections.map((section) => uploadFile(userEmail, section.image))
      );

      const formattedContents = contentSections.map((section, index) => ({
        img: uploadResponses[index], // Use the uploaded image response from the server
        paragraph: section.text,
      }));

      const blogData = {
        title,
        categoryName: category,
        desc: description,
        img: thumbnailPath,
        contents: formattedContents,
        createdAt: currentDate,
        updatedAt: currentDate,
        email: userEmail,
      };

      const response = await fetch(`${config.apiUrl}/createblog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        // Reset form
        setTitle("");
        setDescription("");
        setThumbnail(null);
        setThumbnailPreview(null);
        setCategory("");
        setContentSections([{ id: Date.now(), image: null, text: "" }]);
        navigate("/myprofile", {
          state: { message: "Blog successfully submitted" },
        });
      } else {
        console.error("Failed to submit the blog.");
      }
    } catch (error) {
      if (error.message.includes("504")) {
        console.error("Server timeout: ", error);
        setErrorMessage("The request took too long. Please try again later.");
      } else {
        console.error("An error occurred while submitting the blog: ", error);
        setErrorMessage("An error occurred. Please try again.");
      }

      setShowModal(true);
    }
  };

  const removeSection = (id) => {
    setContentSections((prevSections) =>
      prevSections.filter((section) => section.id !== id)
    );
  };

  const handleClose = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container mt-4 flex-grow-1">
        <h2 className="text-center mb-4">Create a New Blog</h2>
        <form onSubmit={handleSubmit} className="border p-4 rounded">
          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {/* Dynamically generate options from blogCat */}
              {blogCat && blogCat.length > 0 ? (
                blogCat.map((cat) => (
                  <option key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No categories available
                </option>
              )}
            </select>
          </div>

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="mb-3">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="thumbnail" className="form-label">
              Thumbnail Image
            </label>
            <input
              type="file"
              className="form-control"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {contentSections.map((section) => (
            <ContentSection
              key={section.id}
              section={section}
              handleImageChange={handleImageChange}
              handleTextChange={handleTextChange}
              removeSection={() => removeSection(section.id)}
            />
          ))}
          <button
            type="button"
            className="btn btn-outline-primary mb-3"
            onClick={addContentSection}
          >
            <i className="fas fa-plus"></i> Add Content Section
          </button>

          <div className="text-end">
            <button type="submit" className="btn btn-primary">
              Submit Blog
            </button>
          </div>
        </form>
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
