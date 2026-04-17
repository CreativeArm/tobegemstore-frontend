import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  FaSliders,
  FaXmark,
  FaChevronDown,
  FaChevronUp,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import { productAPI } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import './ShopPage.css';

const CATEGORIES = [
  { label: 'All Products', value: '' },
  { label: 'Earrings', value: 'earrings' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Bracelets', value: 'bracelets' },
  { label: 'Rings', value: 'rings' },
  { label: 'Wristwatches', value: 'wristwatches' },
  { label: 'Lip Gloss', value: 'lipgloss' },
  { label: 'Anklets', value: 'anklets' },
  { label: 'Hair Accessories', value: 'hair-accessories' },
  { label: 'Other', value: 'other' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-rating' },
  { label: 'Best Selling', value: '-totalSold' },
];

const PRICE_RANGES = [
  { label: 'Under ₦5,000', min: 0, max: 5000 },
  { label: '₦5,000 – ₦15,000', min: 5000, max: 15000 },
  { label: '₦15,000 – ₦30,000', min: 15000, max: 30000 },
  { label: '₦30,000 – ₦60,000', min: 30000, max: 60000 },
  { label: 'Over ₦60,000', min: 60000, max: '' },
];

export default function ShopPage() {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: urlCategory || searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    new: searchParams.get('new') || '',
    bestseller: searchParams.get('bestseller') || '',
    inStock: '',
    page: 1,
    limit: 12,
  });

  const [localSearch, setLocalSearch] = useState(filters.search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (urlCategory) setFilters(f => ({ ...f, category: urlCategory, page: 1 }));
  }, [urlCategory]);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', sort: '-createdAt', search: '', featured: '', new: '', bestseller: '', inStock: '', page: 1, limit: 12 });
    setLocalSearch('');
  };

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.featured, filters.new, filters.bestseller, filters.inStock, filters.search].filter(Boolean).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch);
  };

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="container shop-header-inner">
          <div>
            <h1 className="shop-title">
              {filters.category ? CATEGORIES.find(c => c.value === filters.category)?.label : 'All Products'}
            </h1>
            <p className="shop-count">{total} {total === 1 ? 'product' : 'products'} found</p>
          </div>
          <div className="shop-controls">
            <form onSubmit={handleSearchSubmit} className="shop-search">
              <FaMagnifyingGlass size={14} />
              <input
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="shop-search-input"
              />
              {localSearch && <button type="button" onClick={() => { setLocalSearch(''); updateFilter('search', ''); }}><FaXmark size={12} /></button>}
            </form>
            <select className="sort-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button className="filter-toggle" onClick={() => setFiltersOpen(p => !p)}>
              <FaSliders size={16} />
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="container shop-body">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${filtersOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
              )}
              <button className="icon-btn sidebar-close" onClick={() => setFiltersOpen(false)}><FaXmark size={18} /></button>
            </div>
          </div>

          {/* Category Filter */}
          <FilterSection title="Category" defaultOpen>
            <div className="filter-options">
              {CATEGORIES.map(cat => (
                <label key={cat.value} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={filters.category === cat.value}
                    onChange={e => updateFilter('category', e.target.value)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range" defaultOpen>
            <div className="filter-options">
              {PRICE_RANGES.map(range => (
                <label key={range.label} className="filter-option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.minPrice === String(range.min) && filters.maxPrice === String(range.max)}
                    onChange={() => {
                      updateFilter('minPrice', range.min);
                      updateFilter('maxPrice', range.max);
                    }}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
            <div className="custom-price">
              <input type="number" placeholder="Min ₦" className="price-input" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
              <span>–</span>
              <input type="number" placeholder="Max ₦" className="price-input" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
            </div>
          </FilterSection>

          {/* Special Filters */}
          <FilterSection title="Special">
            <div className="filter-options">
              {[
                { label: 'Featured', key: 'featured' },
                { label: 'New Arrivals', key: 'new' },
                { label: 'Bestsellers', key: 'bestseller' },
                { label: 'In Stock Only', key: 'inStock' },
              ].map(f => (
                <label key={f.key} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters[f.key] === 'true'}
                    onChange={e => updateFilter(f.key, e.target.checked ? 'true' : '')}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* Products */}
        <div className="shop-products">
          {loading ? (
            <div className="products-grid">
              {[...Array(filters.limit)].map((_, i) => (
                <div key={i} className="skeleton product-skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div style={{ fontSize: 60, opacity: 0.3 }}>◇</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-title" onClick={() => setOpen(p => !p)}>
        {title}
        {open ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}
