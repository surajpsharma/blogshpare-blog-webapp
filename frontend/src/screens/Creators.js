// src/pages/Creators.js

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CreatorCard from "../components/CreatorCard";
import { useMediaQuery } from "react-responsive";
import config from "../config";

export default function Creators() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  useEffect(() => {
    const fetchProfiles = async () => {
      // You can keep this localStorage.getItem("userEmail") if you use it for other logic
      // but it's not needed for fetching *all* profiles in this specific backend route.
      const email = localStorage.getItem("userEmail");
      console.log("🔍 Email in localStorage:", email);

      try {
        console.log(
          "🔄 Fetching profiles from:",
          `${config.apiUrl}/usersprofile`
        );

        const response = await fetch(`${config.apiUrl}/usersprofile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check for response.ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error("🚫 Server response error:", errorText);
          throw new Error(
            `HTTP error! status: ${
              response.status
            }, message: ${errorText.substring(0, 100)}...`
          );
        }

        // Try to parse the response as JSON
        let data;
        try {
          data = await response.json();
          console.log("📦 Profiles returned:", data);
        } catch (parseError) {
          console.error("🚫 JSON parse error:", parseError);
          console.error("🚫 Response text:", await response.text());
          throw new Error("Failed to parse server response as JSON");
        }

        if (Array.isArray(data)) {
          setProfiles(data);
        } else {
          console.error("Backend didn't return an array for profiles:", data);
          setProfiles([]);
        }
      } catch (error) {
        console.error("❌ Error fetching profiles:", error);
        setProfiles([]); // Set empty profiles array on error
      }
    };

    fetchProfiles();
  }, []); // Empty dependency array means this runs once on component mount

  const filteredProfiles = profiles.filter((profile) =>
    profile.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="container my-3">
        <input
          className="form-control"
          type="search"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="container">
        <div className="row g-3">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <div className="col-lg-3 col-sm-6 col-12" key={profile._id}>
                <CreatorCard profile={profile} />
              </div>
            ))
          ) : (
            <p className="text-center">No user available</p>
          )}
        </div>
      </div>
      {isDesktop && <Footer />}
    </div>
  );
}
