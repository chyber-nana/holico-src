import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrap">
      <img
        className="edge-confetti"
        src="../assets/back1.png"
        alt=",,,"
      />

      <div className="hero-screen">
        <div className="hero-card">
          <div className="hero-topline">

            <div className="hero-school-wrap">
    
              <h2>        <img
              className="top-left-logo"
              src="../assets/topLeft.png"
              alt="School logo"
            />HOLY CHILD SCHOOL</h2>
              <p>presents...</p>
            </div>
          </div>

          <div className="realize-badge">
            <img src="../assets/center.png" alt="center img" />
          </div>

          <button className="start-btn" onClick={() => navigate("/vote")}>
            START VOTING
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;