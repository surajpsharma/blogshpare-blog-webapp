import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import "../components/BlogStyles.css";
import config from "../config";

export default function Home() {
  const [search, setSearch] = useState("");
  const [blogCat, setBlogCat] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const isDtop = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 570px)" });
  const isDesktop = useMediaQuery({ query: "(min-width: 570px)" });

  const loadData = async () => {
    try {
      let response = await fetch(`${config.apiUrl}/blogdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Ensure that the fetch was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse the response as JSON
      const data = await response.json();
      // Assuming data[0] is blog data and data[1] is blog category
      setBlogData(data[0]);
      setBlogCat(data[1]);
    } catch (error) {
      console.error("Error fetching blog data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <Navbar />

      <div>
        <div
          id="carouselExampleFade"
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner" id="carousel">
            {isMobile && (
              <div
                className="carousel-caption position-absolute top-0 start-0 m-1 "
                style={{ zIndex: "10000" }}
              >
                <div className="justify-content-center">
                  <div className="d-flex align-items-center">
                    <h1 className="text-light fs-5 fw-bold">
                      Explore Our World of Blogs
                    </h1>
                    <p className="text-dark fs-6">
                      Dive into captivating stories, ideas, and insights on a
                      wide range of topics!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isDesktop && (
              <div className="carousel-caption " style={{ zIndex: "10000" }}>
                <div className="justify-content-center">
                  <h1 className=" text-light fs-3 fw-bold">
                    Explore Our World of Blogs
                  </h1>
                  <p className="text-dark fs-4">
                    Dive into captivating stories, ideas, and insights on a wide
                    range of topics!
                  </p>
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="carousel-item active">
              <img
                src="/Image/blog1.jpg"
                className="d-block w-100"
                alt="Nature"
              />
            </div>
            <div className="carousel-item">
              <img
                src="/Image/blog2.jpg"
                className="d-block w-100"
                alt="Sports"
              />
            </div>
            <div className="carousel-item">
              <img
                src="/Image/blog3.jpg"
                className="d-block w-100"
                alt="Travel"
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      {isMobile && (
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <div className="container py-5">
        {/* Blog Categories Section */}
        {Array.isArray(blogCat) && blogCat.length > 0 ? (
          blogCat.map((data) => {
            const filteredBlogs = Array.isArray(blogData)
              ? blogData.filter(
                  (blog) =>
                    blog.categoryName === data.categoryName &&
                    blog.title.toLowerCase().includes(search.toLowerCase())
                )
              : [];

            if (filteredBlogs && filteredBlogs.length > 0) {
              return (
                <section className="category-section mb-5" key={data._id}>
                  <div className="category-header d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                      <h2 className="category-title fs-2 text-success mb-0">
                        {data.categoryName}
                      </h2>
                      <span className="ms-3 badge bg-dark text-light">
                        {filteredBlogs.length} posts
                      </span>
                    </div>
                    <div
                      className="category-line flex-grow-1 mx-4"
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(to right, #198754, transparent)",
                      }}
                    ></div>
                  </div>

                  <div className="row g-4">
                    {filteredBlogs.map((filterblogs) => (
                      <div
                        key={filterblogs._id}
                        className="col-12 col-md-6 col-lg-4 mb-4"
                      >
                        <Card blogData={filterblogs} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }
            return null;
          })
        ) : (
          <div className="no-blogs-container text-center py-5">
            <div className="no-blogs-icon mb-3">
              <i className="fas fa-newspaper fa-4x text-muted"></i>
            </div>
            <h3 className="text-muted">No blogs available</h3>
            <p className="text-muted">Be the first to create a blog post!</p>
          </div>
        )}

        {/* No Search Results */}
        {blogData &&
          blogData.length > 0 &&
          search &&
          Array.isArray(blogCat) &&
          blogCat.every((cat) => {
            const hasBlogs = blogData.some(
              (blog) =>
                blog.title.toLowerCase().includes(search.toLowerCase()) &&
                blog.categoryName === cat.categoryName
            );
            return !hasBlogs;
          }) && (
            <div className="no-results text-center py-5">
              <div className="no-results-icon mb-3">
                <i className="fas fa-search fa-4x text-muted"></i>
              </div>
              <h3 className="text-muted">No blogs found matching "{search}"</h3>
              <p className="text-muted">
                Try a different search term or browse all categories
              </p>
              <button
                className="btn btn-outline-success mt-3"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            </div>
          )}
      </div>

      {isDtop && <Footer />}
    </div>
  );
}
