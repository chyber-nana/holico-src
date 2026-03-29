import api from "./axios";

export const loginAdmin = async (payload) => {
  const res = await api.post("/admin/login", payload);
  return res.data;
};

export const getDashboardSummary = async () => {
  const res = await api.get("/dashboard/summary");
  return res.data;
};

export const getCategoryLeaders = async () => {
  const res = await api.get("/dashboard/leaders");
  return res.data;
};

export const getFullResults = async () => {
  const categoriesRes = await api.get("/categories");
  return categoriesRes.data.map((category) => ({
    ...category,
    nominees: [...(category.nominees || [])].sort(
      (a, b) => (b.voteCount || 0) - (a.voteCount || 0)
    ),
  }));
};

export const getPendingVotePayments = async () => {
  const res = await api.get("/pending-vote-payments");
  return res.data;
};

export const approvePendingVotePayment = async (id) => {
  const res = await api.post(`/pending-vote-payments/${id}/approve`);
  return res.data;
};

export const rejectPendingVotePayment = async (id, payload) => {
  const res = await api.post(`/pending-vote-payments/${id}/reject`, payload);
  return res.data;
};