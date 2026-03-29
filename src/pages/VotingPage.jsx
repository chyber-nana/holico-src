import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../api/categoryApi";
import {
  createPendingVotePayment,
  getVotePaymentStatus,
} from "../api/voteApi";

const PRICE_PER_VOTE = 1;

const VotingPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [popup, setPopup] = useState({
  show: false,
  text: "",
  type: "info", // success | error | info
});
  const [voteCounts, setVoteCounts] = useState({});
  const [payerForm, setPayerForm] = useState({ payerName: "", payerPhone: "" });

  const [flowOpen, setFlowOpen] = useState(false);
  const [flowStep, setFlowStep] = useState(1);
  const [pendingNominee, setPendingNominee] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
  if (popup.show) {
    const timer = setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false }));
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [popup.show]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setPopup({ show: true, text: "Failed to load categories.", type: "error" });
    }
  };

  const categoriesWithLeaders = useMemo(() => {
    return categories.map((category, index) => {
      const nominees = category.nominees || [];
      const sorted = [...nominees].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      const leader = sorted[0] || null;
      const totalVotes = nominees.reduce((sum, nominee) => sum + (nominee.voteCount || 0), 0);
      const leaderPercent =
        leader && totalVotes > 0 ? Math.round(((leader.voteCount || 0) / totalVotes) * 100) : 0;

      return {
        ...category,
        number: index + 1,
        leader,
        leaderPercent,
      };
    });
  }, [categories]);

  const handleVoteCountChange = (nomineeId, value) => {
    const parsed = Number(value);

    setVoteCounts((prev) => ({
      ...prev,
      [nomineeId]: Number.isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 100),
    }));
  };

  const selectedVoteCount = pendingNominee ? voteCounts[pendingNominee.id] || 1 : 1;
  const selectedAmount = selectedVoteCount * PRICE_PER_VOTE;

  const openVoteFlow = (nominee) => {
    setPendingNominee(nominee);
    setPendingRequest(null);
    setFlowStep(1);
    setFlowOpen(true);
    setPayerForm({ payerName: "", payerPhone: "" });
  };

  const closeVoteFlow = () => {
    if (submitting) return;
    setFlowOpen(false);
    setFlowStep(1);
    setPendingNominee(null);
    setPendingRequest(null);
  };

  const goToInstructions = async () => {
    if (!pendingNominee) return;

    try {
      setSubmitting(true);

      const res = await createPendingVotePayment({
        nomineeId: pendingNominee.id,
        voteCount: selectedVoteCount,
        payerName: payerForm.payerName,
        payerPhone: payerForm.payerPhone,
      });

      setPendingRequest(res);
      setFlowStep(2);
    } catch (error) {
      setPopup({
  show: true,
  text: error?.response?.data?.message || "Failed to start payment flow.",
  type: "error",
});
    } finally {
      setSubmitting(false);
    }
  };

  const markAsSubmittedForVerification = () => {
    setFlowStep(3);
    loadCategories();
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setPopup({ show: true, text: "Copied.", type: "success" });
    } catch {
      setPopup({ show: true, text: "Could not copy.", type: "error" });
    }
  };

  const checkTrackingCode = async () => {
    try {
      setTrackingMessage("");
      setTrackingResult(null);

      const res = await getVotePaymentStatus(trackingCode.trim());
      setTrackingResult(res);
    } catch (error) {
      setTrackingMessage(error?.response?.data?.message || "Unable to check code.");
    }
  };

  return (
    <div className="page-wrap vote-page-wrap">
      {popup.show && (
  <div className="popup-overlay" onClick={() => setPopup({ ...popup, show: false })}>
    <div
      className={`popup-card popup-${popup.type}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="popup-content">
        <p>{popup.text}</p>
        <button
          className="popup-close-btn"
          onClick={() => setPopup({ ...popup, show: false })}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

      <div className="vote-page">
        <div className="vote-container">
          <div className="section-card">
            <h1 className="section-title">Categories for Nominations</h1>
            <p className="section-subtitle">
              Choose a category to view nominees and vote.
            </p>

            <div className="category-grid">
              {categoriesWithLeaders.map((category) => (
                <button
                  key={category.id}
                  className="category-tile"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="category-row">
                    <div className="category-number">{category.number}.</div>
                    <div className="category-name">{category.name}</div>
                  </div>

                  <div className="category-progress-wrap">
                    <div className="category-meta">
                      <span>
                        Leader: {category.leader ? category.leader.name : "No votes yet"}
                      </span>
                      <span>{category.leaderPercent}%</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${category.leaderPercent}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="section-card tracking-card">
            <h2 className="panel-title">Check Vote Approval Status</h2>
            <p className="muted">Enter your tracking code to see whether your vote has been approved.</p>

            <div className="tracking-row">
              <input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Enter tracking code e.g. HVC-ABCDEFGH"
              />
              <button className="secondary-small" onClick={checkTrackingCode}>
                Check
              </button>
            </div>

            {trackingMessage && <p className="error-text">{trackingMessage}</p>}

            {trackingResult && (
              <div className={`status-card status-${trackingResult.status}`}>
                <div><strong>Status:</strong> {trackingResult.status}</div>
                <div><strong>Nominee:</strong> {trackingResult.nominee?.name}</div>
                <div><strong>Category:</strong> {trackingResult.category?.name}</div>
                <div><strong>Votes:</strong> {trackingResult.voteCount}</div>
                <div><strong>Amount:</strong> GHS {trackingResult.amount}</div>
                {trackingResult.rejectionReason && (
                  <div><strong>Reason:</strong> {trackingResult.rejectionReason}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedCategory.name}</h2>
                <p className="muted">Select a nominee and vote.</p>
              </div>

              <button className="modal-close" onClick={() => setSelectedCategory(null)}>
                Close
              </button>
            </div>

            <div className="nominee-grid">
              {(selectedCategory.nominees || []).map((nominee) => (
                <div className="nominee-card nominee-card-polished" key={nominee.id}>
                  <img
                    className="nominee-image"
                    src={nominee.image || "https://via.placeholder.com/300x200?text=Nominee"}
                    alt={nominee.name}
                  />

                  <h3 className="nominee-name">{nominee.name}</h3>
                  <p className="nominee-bio">{nominee.bio || "Nominee"}</p>

                  <div className="nominee-vote-controls">
                    <label className="vote-count-label">Number of votes</label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      className="vote-count-input"
                      value={voteCounts[nominee.id] || 1}
                      onChange={(e) => handleVoteCountChange(nominee.id, e.target.value)}
                    />
                  </div>

                  <div className="nominee-footer">
                    
                    <button className="vote-btn" onClick={() => openVoteFlow(nominee)}>
                      VOTE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {flowOpen && pendingNominee && (
        <div className="modal-overlay" onClick={closeVoteFlow}>
          <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
            {flowStep === 1 && (
              <>
                <div className="modal-header">
                  <div>
                    <h2>Payment Summary</h2>
                    <p className="muted">Review your votes before continuing.</p>
                  </div>
                  <button className="modal-close" onClick={closeVoteFlow}>Close</button>
                </div>

                <div className="payment-summary">
                  <div className="payment-row"><span>Nominee</span><strong>{pendingNominee.name}</strong></div>
                  <div className="payment-row"><span>Votes</span><strong>{selectedVoteCount}</strong></div>
                  <div className="payment-row"><span>Price per vote</span><strong>GHS {PRICE_PER_VOTE}</strong></div>
                  <div className="payment-row payment-total"><span>Total</span><strong>GHS {selectedAmount}</strong></div>
                </div>

                <label>Your Name (optional)</label>
                <input
                  value={payerForm.payerName}
                  onChange={(e) => setPayerForm((prev) => ({ ...prev, payerName: e.target.value }))}
                  placeholder="Enter your name"
                />

                <label>Your Phone Number (optional)</label>
                <input
                  value={payerForm.payerPhone}
                  onChange={(e) => setPayerForm((prev) => ({ ...prev, payerPhone: e.target.value }))}
                  placeholder="Enter your phone number"
                />

                <div className="payment-actions">
                  <button className="subtle-btn" onClick={closeVoteFlow}>Cancel</button>
                  <button className="secondary-small" onClick={goToInstructions} disabled={submitting}>
                    {submitting ? "Loading..." : "Next"}
                  </button>
                </div>
              </>
            )}

            {flowStep === 2 && pendingRequest && (
              <>
                <div className="modal-header">
                  <div>
                    <h2>Make Payment</h2>
                    <p className="muted">Send the exact amount using the details below.</p>
                  </div>
                </div>

                <div className="payment-summary">
                  <div className="payment-row"><span>Amount</span><strong>GHS {pendingRequest.payment.amount}</strong></div>
                  <div className="payment-row"><span>MoMo Number</span><strong>{pendingRequest.paymentMeta.momoNumber}</strong></div>
                  <div className="payment-row"><span>Name</span><strong>{pendingRequest.paymentMeta.momoName}</strong></div>
                  <div className="payment-row payment-total"><span>Reference</span><strong>{pendingRequest.payment.reference}</strong></div>
                </div>

                <div className="copy-actions">
                  <button
                    className="primary-small"
                    onClick={() => copyText(pendingRequest.paymentMeta.momoNumber)}
                  >
                    Copy Number
                  </button>
                  <button
                    className="secondary-small"
                    onClick={() => copyText(pendingRequest.payment.reference)}
                  >
                    Copy Reference
                  </button>
                </div>

                <p className="payment-tip">
                  After sending the money, click below so your vote can be submitted for verification.
                </p>

                <div className="payment-actions">
                  <button className="subtle-btn" onClick={() => setFlowStep(1)}>Back</button>
                  <button className="secondary-small" onClick={markAsSubmittedForVerification}>
                    I Have Paid
                  </button>
                </div>
              </>
            )}

            {flowStep === 3 && pendingRequest && (
              <div className="payment-success-state">
                <div className="success-check-wrap">
                  <div className="success-check-circle">
                    <svg className="success-check" viewBox="0 0 52 52" aria-hidden="true">
                      <circle className="success-check-bg" cx="26" cy="26" r="25" />
                      <path className="success-check-mark" d="M14 27.5l8 8 16-17" />
                    </svg>
                  </div>
                </div>

                <h2 className="payment-success-title">Submitted for Verification</h2>
                <p className="muted payment-success-text">
                  Your vote request has been submitted. It will be approved after payment is confirmed.
                </p>

                <div className="payment-summary compact-summary">
                  <div className="payment-row">
                    <span>Tracking Code</span>
                    <strong>{pendingRequest.payment.code}</strong>
                  </div>
                  <div className="payment-row">
                    <span>Reference</span>
                    <strong>{pendingRequest.payment.reference}</strong>
                  </div>
                  <div className="payment-row payment-total">
                    <span>Status</span>
                    <strong>{pendingRequest.payment.status}</strong>
                  </div>
                </div>

                <div className="copy-actions">
                  <button
                    className="primary-small"
                    onClick={() => copyText(pendingRequest.payment.code)}
                  >
                    Copy Tracking Code
                  </button>
                </div>

                <button className="secondary-small success-done-btn" onClick={closeVoteFlow}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;