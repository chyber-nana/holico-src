import { useEffect, useState } from "react";
import { createCategory, getCategories, updateCategory } from "../../api/categoryApi";

const initialForm = {
  name: "",
  slug: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setFetching(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load categories");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const makeSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "name") {
        next.slug = makeSlug(value);
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const onEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setMessage("Category updated successfully");
      } else {
        await createCategory(payload);
        setMessage("Category added successfully");
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="section-header">
        <h2>Manage Categories</h2>
      </div>

      {message && <p className="muted">{message}</p>}

      <div className="panel-grid">
        <div className="admin-panel">
          <h3>{editingId ? "Edit Category" : "Add Category"}</h3>

          <form onSubmit={handleSubmit}>
            <label>Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. FACE OF HOLICO"
              required
            />

            <label>Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. face-of-holico"
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
              rows={4}
            />

            <div className="row-actions">
              <button className="primary-small" type="submit" disabled={loading}>
                {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Category" : "Add Category"}
              </button>

              {editingId && (
                <button type="button" className="subtle-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-panel">
          <h3>Existing Categories</h3>

          {fetching ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div className="table-scroll">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td>{cat.name}</td>
                      <td>{cat.slug}</td>
                      <td>{cat.description || "-"}</td>
                      <td>
                        <button className="primary-small" onClick={() => onEdit(cat)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}