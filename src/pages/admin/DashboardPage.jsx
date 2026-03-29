import { useEffect, useMemo, useState } from "react";
import {
  getCategoryLeaders,
  getDashboardSummary,
  getFullResults,
} from "../../api/adminApi";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [summaryData, leadersData, resultsData] = await Promise.all([
          getDashboardSummary(),
          getCategoryLeaders(),
          getFullResults(),
        ]);

        setSummary(summaryData);
        setLeaders(leadersData);
        setResults(resultsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const leaderPolls = useMemo(() => {
    return results.map((category) => {
      const nominees = category.nominees || [];
      const totalVotes = nominees.reduce(
        (sum, nominee) => sum + (nominee.voteCount || 0),
        0
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

            <div className="admin-panel">
              <h2 className="panel-title">Leader Table</h2>
              <div className="loading-table">
                <div className="loading-table-row" />
                <div className="loading-table-row" />
                <div className="loading-table-row" />
                <div className="loading-table-row" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="summary-grid">
              <div className="admin-card summary-card">
                <div className="summary-label">Total Categories</div>
                <div className="summary-value">{summary?.totalCategories ?? 0}</div>
              </div>
              <div className="admin-card summary-card">
                <div className="summary-label">Total Nominees</div>
                <div className="summary-value">{summary?.totalNominees ?? 0}</div>
              </div>
              <div className="admin-card summary-card">
                <div className="summary-label">Total Votes</div>
                <div className="summary-value">{summary?.totalVotes ?? 0}</div>
              </div>
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

            <div className="admin-panel">
              <h2 className="panel-title">Leader Table</h2>
              <div className="table-scroll">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Leader</th>
                      <th>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((item, index) => (
                      <tr key={`${item.category}-${index}`}>
                        <td>{item.category}</td>
                        <td>{item.leader?.name || "No leader yet"}</td>
                        <td>{item.leader?.voteCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;