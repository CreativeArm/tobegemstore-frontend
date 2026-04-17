import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaPenToSquare,
  FaTrashCan,
  FaMagnifyingGlass,
  FaXmark,
} from "react-icons/fa6";
import { productAPI } from "../../utils/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";

const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const MAX_PRODUCT_IMAGES = 2;
const EMPTY = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "earrings",
  stock: "",
  sku: "",
  material: "",
  brand: "TobegemStore",
  isFeatured: false,
  isNewArrival: false,
  isBestseller: false,
  images: Array.from({ length: MAX_PRODUCT_IMAGES }, () => ({ url: "", alt: "" })),
  tags: "",
  features: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ page, limit: 12, search });
      setProducts(data.products);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    const normalizedImages = (p.images?.length ? p.images : [{ url: "", alt: "" }])
      .slice(0, MAX_PRODUCT_IMAGES);
    while (normalizedImages.length < MAX_PRODUCT_IMAGES) {
      normalizedImages.push({ url: "", alt: "" });
    }

    setEditing(p._id);
    setForm({
      ...p,
      tags: p.tags?.join(", ") || "",
      features: p.features?.join("\n") || "",
      images: normalizedImages,
    });
    setModalOpen(true);
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;

    const selected = files.slice(0, MAX_PRODUCT_IMAGES);
    const converted = await Promise.all(selected.map(readFileAsDataUrl));
    const nextImages = converted.map((url, idx) => ({
      url,
      alt: form.images?.[idx]?.alt || `${form.name || "Product"} image ${idx + 1}`,
    }));
    while (nextImages.length < MAX_PRODUCT_IMAGES) {
      nextImages.push({ url: "", alt: "" });
    }
    setForm((f) => ({ ...f, images: nextImages }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await productAPI.getAll(); // placeholder — use admin delete endpoint
      import("../../utils/api").then(({ default: api }) =>
        api.delete(`/products/${id}`).then(() => {
          toast.success("Product deactivated");
          load();
        }),
      );
    } catch {
      toast.error("Failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validImages = form.images
        .slice(0, MAX_PRODUCT_IMAGES)
        .filter((img) => img.url);
      if (validImages.length < MAX_PRODUCT_IMAGES) {
        toast.error("Please upload exactly 2 product images");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        sku: form.sku?.trim() || undefined,
        stock: Number(form.stock),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        features: form.features
          ? form.features
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean)
          : [],
        images: validImages,
      };
      if (editing) {
        const { default: api } = await import("../../utils/api");
        await api.put(`/products/${editing}`, payload);
        toast.success("Product updated!");
      } else {
        const { default: api } = await import("../../utils/api");
        await api.post("/products", payload);
        toast.success("Product created!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  const setImg = (i, k) => (e) =>
    setForm((f) => {
      const imgs = [...f.images];
      imgs[i] = { ...imgs[i], [k]: e.target.value };
      return { ...f, images: imgs };
    });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Products</h1>
            <p className="admin-page-sub">{total} products total</p>
          </div>
          <button className="btn btn-gold" onClick={openCreate}>
            <FaPlus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="admin-search-bar">
          <FaMagnifyingGlass size={15} />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <FaXmark size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.images?.[0]?.url}
                        alt={p.name}
                        className="product-thumb-admin"
                      />
                    </td>
                    <td>
                      <p className="product-name-cell">{p.name}</p>
                      <p className="product-sku-cell">SKU: {p.sku || "—"}</p>
                    </td>
                    <td>
                      <span className="category-pill">{p.category}</span>
                    </td>
                    <td>
                      <span className="price-cell">{fmt(p.price)}</span>
                    </td>
                    <td>
                      <span
                        className={`stock-pill ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "ok"}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`active-pill ${p.isActive ? "active" : "inactive"}`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="tbl-btn edit"
                          onClick={() => openEdit(p)}
                          title="Edit"
                        >
                          <FaPenToSquare size={14} />
                        </button>
                        <button
                          className="tbl-btn del"
                          onClick={() => handleDelete(p._id)}
                          title="Deactivate"
                        >
                          <FaTrashCan size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Math.ceil(total / 12) > 1 && (
          <div className="pagination" style={{ marginTop: 24 }}>
            {[...Array(Math.ceil(total / 12))].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i + 1 ? "active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editing ? "Edit Product" : "Add Product"}</h2>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <FaXmark size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="modal-grid">
                <div className="input-group full">
                  <label className="input-label">Product Name *</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
                <div className="input-group full">
                  <label className="input-label">Short Description</label>
                  <input
                    className="input-field"
                    value={form.shortDescription}
                    onChange={set("shortDescription")}
                    maxLength={200}
                  />
                </div>
                <div className="input-group full">
                  <label className="input-label">Description *</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={form.description}
                    onChange={set("description")}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Price (₦) *</label>
                  <input
                    className="input-field"
                    type="number"
                    value={form.price}
                    onChange={set("price")}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Compare Price (₦)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={form.comparePrice}
                    onChange={set("comparePrice")}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={set("category")}
                  >
                    {[
                      "earrings",
                      "necklaces",
                      "bracelets",
                      "rings",
                      "wristwatches",
                      "lipgloss",
                      "anklets",
                      "hair-accessories",
                      "other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Stock *</label>
                  <input
                    className="input-field"
                    type="number"
                    value={form.stock}
                    onChange={set("stock")}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">SKU</label>
                  <input
                    className="input-field"
                    value={form.sku}
                    onChange={set("sku")}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Material</label>
                  <input
                    className="input-field"
                    value={form.material}
                    onChange={set("material")}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Brand</label>
                  <input
                    className="input-field"
                    value={form.brand}
                    onChange={set("brand")}
                  />
                </div>
                <div className="input-group full">
                  <label className="input-label">Product Images (2 required)</label>
                  <label
                    className={`product-dropzone ${dragActive ? "active" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragActive(false);
                      await handleImageFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        await handleImageFiles(e.target.files);
                        e.target.value = "";
                      }}
                      style={{ display: "none" }}
                    />
                    <p>Drag & drop up to 2 images here, or click to browse</p>
                  </label>
                  <div className="product-upload-previews">
                    {form.images.slice(0, MAX_PRODUCT_IMAGES).map((img, i) => (
                      <div key={i} className="product-upload-preview">
                        {img.url ? (
                          <img src={img.url} alt={img.alt || `Product image ${i + 1}`} />
                        ) : (
                          <div className="product-upload-placeholder">Image {i + 1}</div>
                        )}
                        <input
                          className="input-field"
                          placeholder={`Image ${i + 1} alt text`}
                          value={img.alt || ""}
                          onChange={setImg(i, "alt")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="input-group full">
                  <label className="input-label">Tags (comma separated)</label>
                  <input
                    className="input-field"
                    value={form.tags}
                    onChange={set("tags")}
                    placeholder="gold, earrings, luxury"
                  />
                </div>
                <div className="input-group full">
                  <label className="input-label">Features (one per line)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={form.features}
                    onChange={set("features")}
                  />
                </div>
              </div>
              <div className="modal-checkboxes">
                {[
                  ["isFeatured", "Featured"],
                  ["isNewArrival", "New Arrival"],
                  ["isBestseller", "Bestseller"],
                  ["isActive", "Active"],
                ].map(([k, l]) => (
                  <label key={k} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!form[k]}
                      onChange={set(k)}
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
