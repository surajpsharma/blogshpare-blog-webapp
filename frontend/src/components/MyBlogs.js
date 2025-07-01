import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { useNavigate } from 'react-router-dom';

export default function MyBlogs({ blogData, blogCat ,loadData}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  if (!blogData) return null; // Early return if blogData is undefined

  const handleUpdate = (e) => {
    navigate('/updateblog', { state: { blogData, blogCat } });
    setShowOptions(false);
  };

  const handleDelete = (e) => {
    setShowModal(true);
    setBlogToDelete(blogData._id);
  };

  const handleCancel = (e) =>{
     setShowModal(false)
    };

  const handleDeleteConfirm = async (e) => {
    if (!blogToDelete) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deleteblog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blogToDelete }),
      });

      if (response.ok) {
        navigate('/myprofile',{ state: { message :"Blog successfully deleted"} })
      } else {
        alert("Error deleting the blog. Please try again.");
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setShowModal(false);
      setBlogToDelete(null);
    }
    loadData();
  };

  const handleView = (e) => {
    navigate('/viewblog', { state: { blogData } });
  };

  return (
    <div 
      className="card mt-3 mb-3 shadow" 
      style={{ width: "18rem", maxHeight: "480px", position: 'relative', cursor: "pointer" }} 
      
    >
      {/* Options Button */}
      <div className="d-flex justify-content-end position-absolute" style={{ top: '10px', right: '8px', zIndex: 1000 }}>
        <button 
          className="btn btn-light p-1" 
          onClick={(e) => {
            setShowOptions(!showOptions);
          }} 
          style={{ background: 'transparent', border: 'none' }}
        >
           <div className='container p-1' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <span className='dot' style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF', margin: '2px' }}></span>
            <span className='dot' style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF', margin: '2px' }}></span>
            <span className='dot' style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF', margin: '2px' }}></span>
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {showOptions && (
        <div className="dropdown-menu show" style={{ position: 'absolute', top: '10px', right: '25px', zIndex: 1000 }}>
          <button className="dropdown-item" onClick={handleUpdate}>Update</button>
          <button className="dropdown-item text-danger" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {/* Blog Image */}
      <img src={blogData.img} className="card-img-top" alt="Blog" style={{ width: "100%", height: "170px", objectFit: "cover" }} onClick={handleView}/>

      {/* Blog Info */}
      <div className="card-body" onClick={handleView}>
        <h5 className="card-title text-truncate" style={{ height: '1.5em' }}>Title: {blogData.title}</h5>
        <div className="container w-100" style={{ height: '5em', overflow: 'hidden' }}>
          <p className="card-text" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
            Description: {blogData.desc}
          </p>
        </div>
        <div style={{ color: '#f5f5f7', fontWeight: '300' }}>Category: {blogData.categoryName}</div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        handleClose={handleCancel}
        handleConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete the blog titled "${blogData.title}"?`}
        showConfirmButton={true}
      />
    </div>
  );
}






// New component for Create Blog Card
export function CreateBlogCard(props) {
  const navigate = useNavigate();

  const handleCreateBlog = () => {
    navigate('/createblog', { state: { blogCat: props.blogCat } });
  };

  return (
    <div className="col-lg-3 col-sm-6 col-12 d-flex justify-content-center">
      <div
        className="card mt-3 shadow-lg"
        style={{
          width: "18rem",
          maxHeight: "360px",
          borderRadius: "10px",
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div className="card-body text-center">
          <h5 className="card-title fw-bold" style={{ fontSize: "1.25rem" }}>Create a New Blog</h5>
          <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>
            Share your thoughts and experiences with the world!
          </p>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={handleCreateBlog}
            style={{ transition: "background-color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            Create Blog
          </button>
        </div>
      </div>
    </div>
  );
}
