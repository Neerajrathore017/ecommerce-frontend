
"use client";

import { useEffect, useState } from "react";
import productService from "../../services/productService";
import Card from "../products/card";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await productService.getAll();

      // Supports a plain array or common paginated API responses.
      const items = Array.isArray(response)
        ? response
        : response?.content ??
          response?.data ??
          response?.products ??
          [];

      if (!Array.isArray(items)) {
        throw new Error("Unexpected product API response format.");
      }

      setProducts(items);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      form.price === "" ||
      form.stock === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Enter a name, description, valid price, and whole-number stock."
      );
      return;
    }

    const product = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await productService.update(editingId, product);
        setMessage("Product updated successfully.");
      } else {
        await productService.create(product);
        setMessage("Product created successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name ?? product.productName ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? product.quantity ?? ""),
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name ?? product.productName ?? "this product"}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await productService.delete(product.id);

      if (editingId === product.id) {
        resetForm();
      }

      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

  const filteredProducts = products.filter((product) => {
    const name = product.name ?? product.productName ?? "";
    const description = product.description ?? "";

    return `${name} ${description}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Product Management</h1>
          <p style={styles.subtitle}>
            Create, view, update, and delete products.
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={loadProducts}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={styles.success}>
          {message}
        </p>
      )}

      <section style={styles.card}>
        <h2 style={styles.sectionHeading}>
          {editingId !== null ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Product Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                maxLength={150}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
                required
                maxLength={1000}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Stock Quantity
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                required
                style={styles.input}
              />
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              style={styles.primaryButton}
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.sectionHeading}>
            Products ({filteredProducts.length})
          </h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            style={styles.searchInput}
          />
        </div>

      {loading ? (
  <p>Loading products...</p>
) : filteredProducts.length === 0 ? (
  <p>No products found.</p>
) : (
  <div style={styles.productGrid}>
    {filteredProducts.map((product) => (
      <Card
        key={product.id}
        product={product}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ))}
  </div>
)}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f3f4f6",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  heading: { margin: 0, fontSize: "30px" },
  subtitle: { color: "#6b7280", marginBottom: 0 },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  sectionHeading: { marginTop: 0, fontSize: "20px" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },
  input: {
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    minWidth: 0,
  },
  searchInput: {
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    minWidth: "220px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginTop: "16px",
  },
  primaryButton: {
    padding: "11px 16px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  },
  editButton: {
    padding: "7px 10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    border: 0,
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "7px 10px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: 0,
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "6px",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "6px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  tableWrapper: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    background: "#f9fafb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
};
