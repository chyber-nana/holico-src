import api from "./axios";

export const createPendingVotePayment = async (payload) => {
  const res = await api.post("/pending-vote-payments", payload);
  return res.data;
};

export const getVotePaymentStatus = async (code) => {
  const res = await api.get(`/pending-vote-payments/track/${code}`);
  return res.data;
};

export const castVote = async (payload) => {
  const res = await api.post("/votes", payload);
  return res.data;
};