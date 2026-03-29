import { useEffect, useState } from "react";
import {
  approvePendingVotePayment,
  getPendingVotePayments,
  rejectPendingVotePayment,
} from "../../api/adminApi";

const PendingPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    try {
      const data = await getPendingVotePayments();
      setPayments(data);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load pending payments.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    try {
      setBusyId(id);
      setMessage("");
      await approvePendingVotePayment(id);
      setMessage("Payment approved and votes added.");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Approval failed.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection?", "Payment not found or wrong amount");
    if (reason === null) return;

    try {
      setBusyId(id);
      setMessage("");
      await rejectPendingVotePayment(id, { reason });
      setMessage("Payment rejected.");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Rejection failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Pending Payments</h1>
          <div className="muted">Approve or reject submitted vote payments.</div>
        </div>
      </div>

      {message && <p className="muted">{message}</p>}

      <div className="admin-panel">
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Reference</th>
                <th>Nominee</th>
                <th>Category</th>
                <th>Votes</th>
                <th>Amount</th>
                <th>Payer</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.reference}</td>
                  <td>{item.nominee?.name}</td>
                  <td>{item.category?.name}</td>
                  <td>{item.voteCount}</td>
                  <td>GHS {item.amount}</td>
                  <td>{item.payerName || "-"}</td>
                  <td>{item.payerPhone || "-"}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      <button
                        className="primary-small"
                        disabled={busyId === item.id || item.status !== "pending"}
                        onClick={() => approve(item.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="danger-btn"
                        disabled={busyId === item.id || item.status !== "pending"}
                        onClick={() => reject(item.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan="10">No payment requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingPaymentsPage;