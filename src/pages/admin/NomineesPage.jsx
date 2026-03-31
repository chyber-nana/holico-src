import { useEffect, useState } from "react";
import { getCategories } from "../../api/categoryApi";
import {
  createNominee,
  deleteNominee,
  getNominees,
  updateNominee,
} from "../../api/nomineeApi";

const initialForm = {
  name: "",
  bio: "",
  categoryId: "",
};

const NomineesPage = () => {
  const [nominees, setNominees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nomineeData, categoryData] = await Promise.all([
        getNominees(),
        getCategories(),
      ]);

      setNominees(nomineeData);
      setCategories(categoryData);
    } catch {
      setMessage("Failed to load nominees.");
    }
  };

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const resetForm = () => {
    setForm(initialForm);
    setImageFile(null);
    setEditingId(null);

    const fileInput = document.getElementById("nominee-image-file");
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("bio", form.bio);
      payload.append("categoryId", String(Number(form.categoryId)));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingId) {
        await updateNominee(editingId, payload);
        setMessage("Nominee updated.");
      } else {
        await createNominee(payload);
        setMessage("Nominee created.");
      }

      resetForm();
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save nominee.");
    }
  };

  const onEdit = (nominee) => {
    setEditingId(nominee.id);
    setForm({
      name: nominee.name,
      bio: nominee.bio || "",
      categoryId: nominee.categoryId,
    });
    setImageFile(null);

    const fileInput = document.getElementById("nominee-image-file");
    if (fileInput) fileInput.value = "";
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm("Delete this nominee?");
    if (!confirmed) return;

    try {
      await deleteNominee(id);
      setMessage("Nominee deleted.");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Nominee Management</h1>
          <div className="muted">Create, update, and remove nominees.</div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="admin-panel">
          <h2 className="panel-title">{editingId ? "Edit Nominee" : "Add Nominee"}</h2>

          <form onSubmit={onSubmit}>
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Nominee name"
              required
            />

            <label>Image Upload</label>
            <input
              id="nominee-image-file"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={onFileChange}
            />

            {editingId && (
              <p className="muted">
                Leave the file empty if you want to keep the current image.
              </p>
            )}

            <label>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              placeholder="Short bio"
            />

            <label>Category</label>
            <select name="categoryId" value={form.categoryId} onChange={onChange} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="row-actions">
              <button type="submit" className="secondary-small">
                {editingId ? "Update" : "Create"}
              </button>

              {editingId && (
                <button type="button" className="subtle-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            {message && <p className="muted">{message}</p>}
          </form>
        </div>

        <div className="admin-panel">
          <h2 className="panel-title">All Nominees</h2>

          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Votes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nominees.map((nominee) => (
                  <tr key={nominee.id}>
                    <td>
                      {nominee.image ? (
                        <img
                          src={nominee.image}
                          alt={nominee.name}
                          className="nominee-thumb"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{nominee.name}</td>
                    <td>{nominee.category?.name}</td>
                    <td>{nominee.voteCount}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="primary-small" onClick={() => onEdit(nominee)}>
                          Edit
                        </button>
                        <button className="danger-btn" onClick={() => onDelete(nominee.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NomineesPage;
