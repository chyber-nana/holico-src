import api from "./axios";

export const getNominees = async () => {
  const res = await api.get("/nominees");
  return res.data;
};

export const createNominee = async (formData) => {
  const res = await api.post("/nominees", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateNominee = async (id, formData) => {
  const res = await api.put(`/nominees/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteNominee = async (id) => {
  const res = await api.delete(`/nominees/${id}`);
  return res.data;
};