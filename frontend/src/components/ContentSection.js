import React, { useState, useEffect } from 'react';

export default function ContentSection({ section, handleImageChange, handleTextChange, removeSection }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Effect to set the preview URL based on section.image
  useEffect(() => {
    if (section.image) {
      if (typeof section.image === 'string') {
        // If it's an existing image URL, use it directly
        setPreviewUrl(section.image);
      } else {
        // If it's a File object, create a preview URL
        const objectUrl = URL.createObjectURL(section.image);
        setPreviewUrl(objectUrl);
        // Cleanup the object URL when the component unmounts or when section.image changes
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setPreviewUrl(null); // Reset the preview URL if there's no image
    }
  }, [section.image]); // Only trigger when section.image changes

  const handleImagePreview = (sectionId, event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageChange(sectionId, event); // Call the parent handler for the image change

      // Revoke the old object URL and create a new one for the new image file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      // Cleanup the old URL when the component updates
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="mb-3">
      {/* Preview the selected image */}
      {previewUrl && (
        <div className="mb-3">
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
          />
        </div>
      )}

      <label htmlFor={`contentImage${section.id}`} className="form-label">Content Image</label>
      <input
        type="file"
        className="form-control"
        id={`contentImage${section.id}`}
        accept="image/*"
        onChange={(e) => handleImagePreview(section.id, e)} // Handle both preview and image change
      />

      <label htmlFor={`contentText${section.id}`} className="form-label mt-2">Content Text</label>
      <textarea
        className="form-control"
        id={`contentText${section.id}`}
        rows="3"
        value={section.text}
        onChange={(e) => handleTextChange(section.id, e)}
      ></textarea>

      <div className="text-end mt-2">
        <button type="button" className="btn btn-danger" onClick={removeSection}>
          Remove
        </button>
      </div>
    </div>
  );
}
