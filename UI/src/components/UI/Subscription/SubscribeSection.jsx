import { useState } from "react";
import { newsletterAPI } from "../../../services/api";
import subscribeImg from "../../../assets/subscribe.png";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await newsletterAPI.subscribe(email);
    setEmail("");
  };

  return (
    <section
      style={{
        background: "#241a2d",
        padding: "20px 0",
      }}
    >
      {/* MAIN FLEX */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        
        {/* LEFT CONTENT */}
        <div
          style={{
            flex: 1,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>
            Subscribe For Get Update Every New Courses
          </h2>

          <p style={{ marginTop: "10px", color: "#f3e8ff" }}>
            20k+ students daily learn with EduVerse. Subscribe for new courses.
          </p>

          {/* FORM CENTER */}
          <div
            style={{
              display: "flex",
              justifyContent: "center", 
              marginTop: "16px",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "12px",
                  width: "250px",
                  border: "none",
                  outline: "none",
                }}
              />

              <button
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "linear-gradient(90deg,#7b2fbe,#9d4edd)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end", 
          }}
        >
          <img
            src={subscribeImg}
            alt="subscribe"
            style={{
              width: "100%",
              maxWidth: "400px",
              objectFit: "contain",
            }}
          />
        </div>

      </div>
    </section>
  );
};

export default SubscribeSection;