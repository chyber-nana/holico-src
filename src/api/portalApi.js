import api from "./axios";

export const getPortalStatus = async () => {
  const res = await api.get("/portal/status");
  return res.data;
};

export const updatePortalStatus = async (payload) => {
  const res = await api.put("/portal/status", payload);
  return res.data;
};

export const closePortalNow = async () => {
  const res = await api.post("/portal/close");
  return res.data;
};

export const reopenPortal = async () => {
  const res = await api.post("/portal/reopen");
  return res.data;
};