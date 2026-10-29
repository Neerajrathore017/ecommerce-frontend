"use client";

export default function Card({ product, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>
          {product.name ?? product.productName ?? "Unnamed Product"}
        </h3>
        <span style={styles.id}>#{product.id}</span>
      </div>

      <p style={styles.description}>
        {product.description ?? "No description available"}
      </p>

      <div style={styles.details}>
        <div>
          <span style={styles.label}>Price</span>
          <strong style={styles.price}>
            {product.price != null
              ? `₹${Number(product.price).toFixed(2)}`
              : "—"}
          </strong>
        </div>

        <div>
          <span style={styles.label}>Stock</span>
          <strong>{product.stock ?? product.quantity ?? "—"}</strong>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={() => onEdit(product)} style={styles.editButton}>
          Edit
        </button>

        <button onClick={() => onDelete(product)} style={styles.deleteButton}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },
  name: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },
  id: {
    fontSize: "12px",
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  description: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
    minHeight: "42px",
    margin: 0,
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
  },
  label: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "6px",
  },
  price: {
    color: "#059669",
    fontSize: "18px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  editButton: {
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  deleteButton: {
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
};