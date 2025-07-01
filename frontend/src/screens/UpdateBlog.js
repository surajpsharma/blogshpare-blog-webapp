import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContentSection from "../components/ContentSection";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import ConfirmationModal from "../components/ConfirmationModal";
import config from "../config";

export default function UpdateBlog() {
  const location = useLocation();
  // Wrap blog initialization in useMemo to prevent re-creation on every render
  const blog = useMemo(
    () => location.state?.blogData || {},
    [location.state?.blogData]
  );
  const blogCat = useMemo(
    () => location.state?.blogCat || [],
    [location.state?.blogCat]
  );
  const navigate = useNavigate();
  const [title, setTitle] = useState(blog?.title || "");
  const [description, setDescription] = useState(blog?.desc || "");
  const [thumbnail, setThumbnail] = useState(blog?.img || "");
  const [category, setCategory] = useState(blog?.categoryName || "");
  const [thumbnailPreview, setThumbnailPreview] = useState(blog?.img || "");
  const [contentSections, setContentSections] = useState([]);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // State to hold the error message

  // On initial load, populate content sections from blog data
  useEffect(() => {
    if (blog && blog.contents) {
      const initialSections = blog.contents.map((content, index) => ({
        id: Date.now() + index, // unique ID
        image: content.img, // map img from blog contents
        text: content.paragraph, // map paragraph from blog contents
      }));
      setContentSections(initialSections);
    }
  }, [blog]);

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
    const newContentSections = contentSections.map((section) =>
      section.id === id ? { ...section, image: file } : section
    );
    setContentSections(newContentSections);
  };

  const handleTextChange = (id, e) => {
    const newContentSections = contentSections.map((section) =>
      section.id === id ? { ...section, text: e.target.value } : section
    );
    setContentSections(newContentSections);
  };

  const addContentSection = () => {
    setContentSections([
      ...contentSections,
      { id: Date.now(), image: "", text: "" },
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
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  const removeSection = (id) => {
    setContentSections(contentSections.filter((section) => section.id !== id));
  };

  const uploadFile = async (email, file) => {
    // If the file is already a URL (existing image), skip the upload
    if (
      typeof file === "string" &&
      (file.startsWith("http") || file.startsWith("/"))
    ) {
      return file; // Return the existing URL
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("image", file);

      const response = await fetch(`${config.apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to upload the image. Status:", response.status);
        return null;
      }

      const responseData = await response.json();
      // Use secure_url from Cloudinary if available, otherwise fall back to path
      return responseData.secure_url || responseData.path;
    } catch (error) {
      console.error("Error during file upload:", error);
      return null; // Return null on failure
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail");
    const currentDate = new Date().toISOString();

    try {
      // Ensure thumbnail is either a valid file or an existing URL
      const thumbnailPath = await uploadFile(userEmail, thumbnail);
      if (!thumbnailPath) return; // Stop if thumbnail upload fails

      // Upload content section images (or skip if they are URLs)
      const uploadResponses = await Promise.all(
        contentSections.map((section) => uploadFile(userEmail, section.image))
      );

      // Handle failed image uploads
      if (uploadResponses.some((response) => response === null)) {
        console.error("Failed to upload one or more content section images.");
        return;
      }

      const formattedContents = contentSections.map((section, index) => ({
        img: uploadResponses[index], // Use the uploaded image response or existing URL
        paragraph: section.text,
      }));

      let blogData = {
        title,
        categoryName: category,
        desc: description,
        img: thumbnailPath,
        contents: formattedContents,
        createdAt: currentDate,
        updatedAt: currentDate,
        email: userEmail,
      };

      const response = await fetch(`${config.apiUrl}/updateblog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blog._id, data: blogData }),
      });

      if (!response.ok) {
        console.error("Failed to update the blog. Status:", response.status);
        return;
      }
      // Reset form
      setTitle("");
      setDescription("");
      setThumbnail(null);
      setThumbnailPreview(null);
      setCategory("");
      setContentSections([{ id: Date.now(), image: null, text: "" }]);
      navigate("/myprofile", {
        state: { message: "Blog successfully updated" },
      });
    } catch (error) {
      console.error("An error occurred while updating the blog:", error);
    }
  };

  const handleClose = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container mt-4 flex-grow-1">
        <h2 className="text-center mb-4">Update Blog</h2>
        <form className="border p-4 rounded" onSubmit={handleSubmit}>
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
              {blogCat.map((cat) => (
                <option key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
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
            <label htmlFor="thumbnail" className="form-label">
              Thumbnail Image
            </label>
            <input
              type="file"
              className="form-control"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
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
              Update Blog
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
