import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import back1 from "../assets/back1.png";
import topLeft from "../assets/topLeft.png";
import center from "../assets/center.png";
import { getPortalStatus } from "../api/portalApi";

const getCountdownParts = (targetDate) => {
  if (!targetDate) return null;

  const now = new Date().getTime();
  const end = new Date(targetDate).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const HomePage = () => {
  const navigate = useNavigate();
  const [portalStatus, setPortalStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await getPortalStatus();
        setPortalStatus(data);
        setCountdown(getCountdownParts(data.votingEndsAt));
      } catch (error) {
        console.error(error);
      }
    };

    loadStatus();
  }, []);

  useEffect(() => {
    if (!portalStatus?.votingEndsAt) return;

    const timer = setInterval(() => {
      setCountdown(getCountdownParts(portalStatus.votingEndsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [portalStatus]);

  const portalClosed = portalStatus?.portalClosed;

  return (
    <div className="page-wrap">
      <img className="edge-confetti" src={back1} alt="" />

      <div className="hero-screen">
        {portalClosed ? (
          <div className="section-card portal-ended-card">
            <h1 className="section-title">Voting Has Ended</h1>
            <p className="section-subtitle">
              Thank you for participating in HOLICO SRC Voting.
            </p>
          </div>
        ) : (
          <div className="hero-card">
            <div className="hero-topline">
              <div className="hero-school-wrap">
                <h2>
                  <img className="top-left-logo" src={topLeft} alt="School logo" />
                  HOLY CHILD SCHOOL
                </h2>
                <p>presents...</p>
              </div>
            </div>

            <div className="realize-badge">
              <img src={center} alt="center img" />
            </div>

            {countdown && (
              <div className="countdown-bar">
                <div className="countdown-box">
                  <strong>{countdown.days}</strong>
                  <span>Days</span>
                </div>
                <div className="countdown-box">
                  <strong>{countdown.hours}</strong>
                  <span>Hours</span>
                </div>
                <div className="countdown-box">
                  <strong>{countdown.minutes}</strong>
                  <span>Minutes</span>
                </div>
                <div className="countdown-box">
                  <strong>{countdown.seconds}</strong>
                  <span>Seconds</span>
                </div>
              </div>
            )}

            <button className="start-btn" onClick={() => navigate("/vote")}>
              START VOTING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;