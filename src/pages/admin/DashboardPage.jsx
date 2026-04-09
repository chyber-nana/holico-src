import { useEffect, useMemo, useState } from "react";
import {
  getCategoryLeaders,
  getDashboardSummary,
  getFullResults,
} from "../../api/adminApi";

import {
  closePortalNow,
  getPortalStatus,
  reopenPortal,
  updatePortalStatus,
} from "../../api/portalApi";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalStatus, setPortalStatus] = useState(null);
  const [portalTime, setPortalTime] = useState("");
  const [portalBusy, setPortalBusy] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [summaryData, leadersData, resultsData, portalData] =
          await Promise.all([
            getDashboardSummary(),
            getCategoryLeaders(),
            getFullResults(),
            getPortalStatus(),
          ]);

        setSummary(summaryData);
        setLeaders(leadersData);
        setResults(resultsData);
        setPortalStatus(portalData);

        if (portalData?.votingEndsAt) {
          const dt = new Date(portalData.votingEndsAt);
          const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setPortalTime(local);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const savePortalTime = async () => {
    try {
      setPortalBusy(true);
      const res = await updatePortalStatus({
        votingEndsAt: portalTime ? new Date(portalTime).toISOString() : null,
        isVotingClosed: false,
      });
      setPortalStatus({
        ...portalStatus,
        ...res.settings,
        portalClosed: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPortalBusy(false);
    }
  };

  const handleCloseNow = async () => {
    try {
      setPortalBusy(true);
      const res = await closePortalNow();
      setPortalStatus({
        ...portalStatus,
        ...res.settings,
        portalClosed: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPortalBusy(false);
    }
  };

  const handleReopen = async () => {
    try {
      setPortalBusy(true);
      const res = await reopenPortal();
      setPortalStatus({
        ...portalStatus,
        ...res.settings,
        portalClosed: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPortalBusy(false);
    }
  };

  const leaderPolls = useMemo(() => {
    return results.map((category) => {
      const nominees = category.nominees || [];
      const totalVotes = nominees.reduce(
        (sum, nominee) => sum + (nominee.voteCount || 0),
        0,
      );
      const leader = nominees[0] || null;
      const percent =
        leader && totalVotes > 0
          ? Math.round(((leader.voteCount || 0) / totalVotes) * 100)
          : 0;

      return {
        ...category,
        leader,
        totalVotes,
        percent,
      };
    });
  }, [results]);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="section-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <div className="muted">Voting overview and current leaders.</div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="loading-summary-grid">
              <div className="loading-card" />
              <div className="loading-card" />
              <div className="loading-card" />
            </div>

            <div className="admin-panel" style={{ marginBottom: 16 }}>
              <h2 className="panel-title">Leader Polls</h2>
              <div className="loading-leader-grid">
                <div className="loading-leader-card" />
                <div className="loading-leader-card" />
                <div className="loading-leader-card" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="summary-grid">
              <div className="admin-card summary-card">
                <div className="summary-label">Total Categories</div>
                <div className="summary-value">
                  {summary?.totalCategories ?? 0}
                </div>
              </div>
              <div className="admin-card summary-card">
                <div className="summary-label">Total Nominees</div>
                <div className="summary-value">
                  {summary?.totalNominees ?? 0}
                </div>
              </div>
              <div className="admin-card summary-card">
                <div className="summary-label">Total Votes</div>
                <div className="summary-value">{summary?.totalVotes ?? 0}</div>
              </div>
            </div>

            <div className="admin-panel" style={{ marginBottom: 16 }}>
              <h2 className="panel-title">Voting Portal Control</h2>

              <div className="portal-status-line">
                <span>
                  Status:{" "}
                  <strong>
                    {portalStatus?.portalClosed ? "Closed" : "Open"}
                  </strong>
                </span>
              </div>

              <label>Countdown End Time</label>
              <input
                type="datetime-local"
                value={portalTime}
                onChange={(e) => setPortalTime(e.target.value)}
              />

              <div className="row-actions">
                <button
                  type="button"
                  className="primary-small"
                  onClick={savePortalTime}
                  disabled={portalBusy}
                >
                  Save Countdown
                </button>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={handleCloseNow}
                  disabled={portalBusy}
                >
                  Close Now
                </button>

                <button
                  type="button"
                  className="secondary-small"
                  onClick={handleReopen}
                  disabled={portalBusy}
                >
                  Reopen
                </button>
              </div>

              {portalStatus?.votingEndsAt && (
                <p className="muted" style={{ marginTop: 10 }}>
                  Current end time:{" "}
                  {new Date(portalStatus.votingEndsAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="admin-panel" style={{ marginBottom: 16 }}>
              <h2 className="panel-title">Leader Polls</h2>
              <div className="leader-grid">
                {leaderPolls.map((category) => (
                  <div className="leader-card" key={category.id}>
                    <h4>{category.name}</h4>
                    <div className="leader-row">
                      <span>{category.leader?.name || "No leader yet"}</span>
                      <span>{category.percent}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      Total votes: {category.totalVotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
