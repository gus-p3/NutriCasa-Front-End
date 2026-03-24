import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/api';
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Unit = 'g' | 'kg' | 'ml' | 'l' | 'piezas' | 'tazas';
type Category =
  | 'proteína'
  | 'vegetal'
  | 'fruta'
  | 'cereal'
  | 'lácteo'
  | 'condimento'
  | 'otro';

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  expiresAt?: string;
  addedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<Category, string> = {
  proteína: '🍗',
  vegetal: '🥦',
  fruta: '🍎',
  cereal: '🌾',
  lácteo: '🥛',
  condimento: '🧂',
  otro: '📦',
};

const CATEGORY_STYLES: Record<Category, string> = {
  proteína: 'bg-orange-100 text-orange-800 border-orange-200',
  vegetal:  'bg-green-100 text-green-800 border-green-200',
  fruta:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  cereal:   'bg-amber-100 text-amber-800 border-amber-200',
  lácteo:   'bg-sky-100 text-sky-800 border-sky-200',
  condimento:'bg-purple-100 text-purple-800 border-purple-200',
  otro:     'bg-gray-100 text-gray-700 border-gray-200',
};

const CARD_ACCENT: Record<Category, string> = {
  proteína: 'border-l-orange-400',
  vegetal:  'border-l-green-400',
  fruta:    'border-l-yellow-400',
  cereal:   'border-l-amber-400',
  lácteo:   'border-l-sky-400',
  condimento:'border-l-purple-400',
  otro:     'border-l-gray-400',
};

const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'piezas', 'tazas'];
const CATEGORIES: Category[] = [
  'proteína', 'vegetal', 'fruta', 'cereal', 'lácteo', 'condimento', 'otro',
];

const emptyForm = {
  name: '',
  quantity: '',
  unit: 'piezas' as Unit,
  category: 'otro' as Category,
  expiresAt: '',
};

// ─── Reusable form primitives ─────────────────────────────────────────────────

const FormInput: React.FC<{ label: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-base"
    />
  </div>
);

const FormSelect: React.FC<{ label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-base appearance-none"
    >
      {children}
    </select>
  </div>
);

// ─── Modal wrapper ────────────────────────────────────────────────────────────

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5 overflow-hidden" onClick={e => e.stopPropagation()}>
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-0">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>
    </div>
  </div>
);

const FormError: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl">
    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-base text-red-600">{msg}</p>
  </div>
);

const ModalActions: React.FC<{ onCancel: () => void; onConfirm: () => void; saving: boolean; confirmLabel: string; danger?: boolean }> = ({ onCancel, onConfirm, saving, confirmLabel, danger }) => (
  <div className="flex gap-3 pt-1">
    <button onClick={onCancel} disabled={saving} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-base">
      Cancelar
    </button>
    <button onClick={onConfirm} disabled={saving} className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
      {saving && <Loader2 size={16} className="animate-spin" />}
      {saving ? 'Guardando...' : confirmLabel}
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & filter state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'todos'>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [filterUnit, setFilterUnit] = useState<Unit | ''>('');
  const [filterExpiring, setFilterExpiring] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/inventory');
      setItems(res.data.items);
    } catch {
      setError('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  // ── Filtering / search (client-side) ─────────────────────────────────────

  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'todos' || item.category === activeCategory;
      const matchUnit = !filterUnit || item.unit === filterUnit;
      const matchExpiring = !filterExpiring || (item.expiresAt && new Date(item.expiresAt) <= in7Days);
      return matchSearch && matchCategory && matchUnit && matchExpiring;
    });
  }, [items, search, activeCategory, filterUnit, filterExpiring]);

  // Active filters count (excluding category chip which is visible)
  const extraFiltersActive = [!!filterUnit, filterExpiring].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch('');
    setActiveCategory('todos');
    setFilterUnit('');
    setFilterExpiring(false);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setFormData(emptyForm);
    setFormError('');
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    const qty = Number(formData.quantity);
    if (!formData.name.trim() || formData.quantity === '' || isNaN(qty) || qty < 0) { 
      setFormError('El nombre es obligatorio y la cantidad debe ser un número válido >= 0.'); 
      return; 
    }
    setSaving(true); setFormError('');
    try {
      await api.post('/inventory', { name: formData.name.trim(), quantity: Number(formData.quantity), unit: formData.unit, category: formData.category, expiresAt: formData.expiresAt || undefined });
      setShowAddModal(false); fetchInventory();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al agregar ingrediente.');
    } finally { setSaving(false); }
  };

  const openEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({ name: item.name, quantity: String(item.quantity), unit: item.unit, category: item.category, expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : '' });
    setFormError('');
    setActiveCard(null);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    const qty = Number(formData.quantity);
    if (!formData.name.trim() || formData.quantity === '' || isNaN(qty) || qty < 0) { 
      setFormError('El nombre es obligatorio y la cantidad debe ser un número válido >= 0.'); 
      return; 
    }
    setSaving(true); setFormError('');
    try {
      await api.put(`/inventory/${selectedItem._id}`, { name: formData.name.trim(), quantity: Number(formData.quantity), unit: formData.unit, category: formData.category, expiresAt: formData.expiresAt || undefined });
      setShowEditModal(false); fetchInventory();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al actualizar.');
    } finally { setSaving(false); }
  };

  const openDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setActiveCard(null);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await api.delete(`/inventory/${selectedItem._id}`);
      setShowDeleteModal(false); fetchInventory();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Cargando tu alacena…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package size={22} className="text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Mi Alacena</h1>
              </div>
              <p className="text-green-100 text-sm mt-1 ml-[52px]">
                {items.length} ingrediente{items.length !== 1 ? 's' : ''} en tu inventario
              </p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-5 py-3 rounded-xl shadow-md hover:bg-green-50 hover:shadow-lg hover:-translate-y-0.5 transition-all text-base self-start md:self-auto"
            >
              <Plus size={18} />
              Agregar ingrediente
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SEARCH + FILTERS BAR (floats over hero)
      ══════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">

          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ingrediente…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-base font-semibold transition-all ${showFilters || extraFiltersActive > 0 ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              <SlidersHorizontal size={16} />
              Filtros
              {extraFiltersActive > 0 && (
                <span className="bg-white text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {extraFiltersActive}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable extra filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Unidad</label>
                  <select
                    value={filterUnit}
                    onChange={e => setFilterUnit(e.target.value as Unit | '')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Cualquier unidad</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer pb-0.5">
                    <div
                      onClick={() => setFilterExpiring(v => !v)}
                      className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${filterExpiring ? 'bg-green-500' : 'bg-gray-200'}`}
                      style={{ width: 40, height: 22 }}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${filterExpiring ? 'translate-x-[18px]' : 'translate-x-0'}`} style={{ width: 18, height: 18, transform: filterExpiring ? 'translateX(18px)' : 'translateX(0)' }} />
                    </div>
                    <span className="text-base text-gray-700 font-medium">Próximos a vencer (7 días)</span>
                  </label>
                </div>
              </div>
              {extraFiltersActive > 0 && (
                <button onClick={clearAllFilters} className="mt-3 text-sm text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors font-medium">
                  <X size={12} /> Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Category chips */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setActiveCategory('todos')}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === 'todos' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'}`}
            >
              Todos
            </button>
            {CATEGORIES.filter(cat => items.some(i => i.category === cat)).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? 'todos' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === cat ? 'bg-green-600 text-white border-green-600' : `${CATEGORY_STYLES[cat]} hover:opacity-80`}`}
              >
                {CATEGORY_EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm font-medium flex-1">{error}</p>
            <button onClick={fetchInventory} className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Reintentar
            </button>
          </div>
        )}

        {/* No results of search/filter */}
        {!error && filtered.length === 0 && items.length > 0 && (
          <div className="text-center py-20">
            <Search size={52} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">Sin resultados</h3>
            <p className="text-gray-400 text-sm mb-5">No encontramos ingredientes con esos filtros.</p>
            <button onClick={clearAllFilters} className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Truly empty */}
        {!error && items.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package size={40} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Tu alacena está vacía</h3>
            <p className="text-gray-400 text-sm mb-6">Agrega ingredientes para empezar a usar NutriCasa al máximo.</p>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md">
              <Plus size={20} />
              Agregar primer ingrediente
            </button>
          </div>
        )}

        {/* Results label */}
        {!error && filtered.length > 0 && (search || activeCategory !== 'todos' || extraFiltersActive > 0) && (
          <p className="text-sm text-gray-400 mb-5 font-medium">
            Mostrando <span className="text-gray-700">{filtered.length}</span> de {items.length} ingredientes
          </p>
        )}

        {/* ── Items grid ── */}
        {!error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(item => {
              const isActive = activeCard === item._id;
              const expiring = item.expiresAt && new Date(item.expiresAt) <= in7Days;
              return (
                <div
                  key={item._id}
                  onClick={() => setActiveCard(isActive ? null : item._id)}
                  className={`relative bg-white rounded-2xl border border-l-4 ${CARD_ACCENT[item.category]} border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group ${isActive ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                >
                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${CATEGORY_STYLES[item.category].split(' ').slice(0,1).join(' ')} border ${CATEGORY_STYLES[item.category].split(' ').slice(2).join(' ')}`}>
                        {CATEGORY_EMOJI[item.category]}
                      </div>
                      {/* Action buttons — visible on active */}
                      <div
                        className={`flex gap-1.5 transition-all duration-150 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(item)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 text-base leading-snug mb-0.5 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{item.quantity} {item.unit}</p>

                    {/* Category chip */}
                    <span className={`inline-flex items-center mt-2.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[item.category]}`}>
                      {item.category}
                    </span>

                    {/* Expiration warning */}
                    {item.expiresAt && (
                      <div className={`mt-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${expiring ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        <span>{expiring ? '⚠️' : '📅'}</span>
                        {expiring ? 'Vence pronto' : 'Vence'}: {new Date(item.expiresAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>

                  {/* Hover hint */}
                  {!isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB mobile ── */}
      <button
        onClick={openAdd}
        className="fixed bottom-7 right-7 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 hover:scale-110 transition-all flex items-center justify-center z-40 md:hidden"
      >
        <Plus size={26} />
      </button>

      {/* ══════════════════ MODALS ══════════════════════ */}

      {/* Add */}
      {showAddModal && (
        <Modal title="➕ Agregar ingrediente" onClose={() => setShowAddModal(false)}>
          {formError && <FormError msg={formError} />}
          <FormInput label="Nombre" placeholder="Ej: Pechuga de pollo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Cantidad" type="number" step="any" min="0" placeholder="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
            <FormSelect label="Unidad" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value as Unit })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </FormSelect>
          </div>
          <FormSelect label="Categoría" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
          </FormSelect>
          <FormInput label="Fecha de vencimiento (opcional)" type="date" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
          <ModalActions onCancel={() => setShowAddModal(false)} onConfirm={handleAdd} saving={saving} confirmLabel="Agregar" />
        </Modal>
      )}

      {/* Edit */}
      {showEditModal && selectedItem && (
        <Modal title="✏️ Editar ingrediente" onClose={() => setShowEditModal(false)}>
          {formError && <FormError msg={formError} />}
          <FormInput label="Nombre" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Cantidad" type="number" step="any" min="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
            <FormSelect label="Unidad" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value as Unit })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </FormSelect>
          </div>
          <FormSelect label="Categoría" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
          </FormSelect>
          <FormInput label="Fecha de vencimiento (opcional)" type="date" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
          <ModalActions onCancel={() => setShowEditModal(false)} onConfirm={handleEdit} saving={saving} confirmLabel="Guardar cambios" />
        </Modal>
      )}

      {/* Delete */}
      {showDeleteModal && selectedItem && (
        <Modal title="Eliminar ingrediente" onClose={() => setShowDeleteModal(false)}>
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              ¿Seguro que deseas eliminar <strong className="text-gray-800">{selectedItem.name}</strong> de tu alacena?
              <br /><span className="text-gray-400 text-xs">Esta acción no se puede deshacer.</span>
            </p>
          </div>
          <ModalActions onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} saving={saving} confirmLabel="Sí, eliminar" danger />
        </Modal>
      )}
    </div>
  );
};

export default Inventory;