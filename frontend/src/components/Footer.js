import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedin,
  faTwitter,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <>
      <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-5 border-top">
        <div className="col-md-4 d-flex flex-column align-items-center">
          <h6 className="text-muted">About</h6>
          <p className="text-muted">Learn more about our mission and values.</p>
          <div>
            <a
              href="https://instagram.com/__suraj__sharma____"
              className="text-muted mx-2"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://www.linkedin.com/in/suraj-sharma-b72156287"
              className="text-muted mx-2"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://twitter.com"
              className="text-muted mx-2"
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="https://github.com/surajpsharma"
              className="text-muted mx-2"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>

        <div className="col-md-4 d-flex flex-column align-items-center">
          <h6 className="text-muted">Contact Us</h6>
          <p className="text-muted">For support, reach out to us at:</p>
          <a href="mailto:surajsharma030805@gmail.com" className="text-muted">
            surajsharma030805@gmail.com
          </a>
        </div>

        <div className="col-md-4 d-flex align-items-center">
          <span className="text-muted">© 2024 BlogSphare, Inc</span>
        </div>
      </footer>
    </>
  );
}
