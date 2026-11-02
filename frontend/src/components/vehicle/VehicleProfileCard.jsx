import React, { useState, useEffect } from 'react';
import {
  Zap,
  BatteryCharging,
  Gauge,
  Plug,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Info,
  Car,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  EV_CATALOG,
  EV_BRANDS,
  EV_CONNECTOR_TYPES,
  EV_VEHICLE_TYPES,
} from '../../data/evVehicles';

export default function VehicleProfileCard({ onVehicleSaved, standalone = false }) {
  const { user, saveVehicle, deleteVehicle } = useAuth();
  const currentVehicle = user?.vehicle?.model ? user.vehicle : null;

  const [isEditing, setIsEditing] = useState(!currentVehicle);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  // Form State
  const [selectedBrand, setSelectedBrand] = useState(currentVehicle?.brand || 'Tata Motors');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [customModel, setCustomModel] = useState(currentVehicle?.model || '');
  const [batteryCapacity, setBatteryCapacity] = useState(currentVehicle?.batteryCapacity || 40.5);
  const [rangeKm, setRangeKm] = useState(currentVehicle?.rangeKm || 453);
  const [vehicleType, setVehicleType] = useState(currentVehicle?.vehicleType || 'Electric Car');
  const [maxChargingSpeed, setMaxChargingSpeed] = useState(currentVehicle?.maxChargingSpeed || 50);
  const [connectorType, setConnectorType] = useState(currentVehicle?.connectorType || 'CCS2');

  const showToast = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4500);
  };

  // Sync form state when user vehicle changes
  useEffect(() => {
    if (user?.vehicle?.model) {
      setSelectedBrand(user.vehicle.brand || 'Tata Motors');
      setCustomModel(user.vehicle.model || '');
      setBatteryCapacity(user.vehicle.batteryCapacity || 40.5);
      setRangeKm(user.vehicle.rangeKm || 453);
      setVehicleType(user.vehicle.vehicleType || 'Electric Car');
      setMaxChargingSpeed(user.vehicle.maxChargingSpeed || 50);
      setConnectorType(user.vehicle.connectorType || 'CCS2');
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [user?.vehicle]);

  // Models filtered by selected brand
  const brandModels = EV_CATALOG.filter((m) => m.brand === selectedBrand);

  // When brand changes, auto-select first model from catalog or reset to custom
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    const firstFromBrand = EV_CATALOG.find((m) => m.brand === brand);
    if (firstFromBrand) {
      setSelectedModelId(firstFromBrand.id);
      applyModelSpecs(firstFromBrand);
    } else {
      setSelectedModelId('custom');
      setCustomModel('');
    }
  };

  // When model is chosen from dropdown, pre-populate specifications automatically
  const handleModelChange = (modelId) => {
    setSelectedModelId(modelId);
    if (modelId === 'custom') {
      setCustomModel('');
      return;
    }
    const found = EV_CATALOG.find((m) => m.id === modelId);
    if (found) {
      applyModelSpecs(found);
    }
  };

  const applyModelSpecs = (preset) => {
    setCustomModel(preset.model);
    setBatteryCapacity(preset.batteryCapacity);
    setRangeKm(preset.rangeKm);
    setVehicleType(preset.vehicleType);
    setMaxChargingSpeed(preset.maxChargingSpeed);
    setConnectorType(preset.connectorType);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customModel.trim()) {
      showToast('Please specify your vehicle model name.', 'error');
      return;
    }

    const cap = parseFloat(batteryCapacity);
    if (isNaN(cap) || cap <= 0) {
      showToast('Please provide a valid battery capacity (kWh).', 'error');
      return;
    }

    const range = parseFloat(rangeKm);
    if (isNaN(range) || range <= 0) {
      showToast('Please provide a valid driving range (km).', 'error');
      return;
    }

    const speed = parseFloat(maxChargingSpeed);
    if (isNaN(speed) || speed <= 0) {
      showToast('Please provide a valid max charging capacity (kW).', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        brand: selectedBrand,
        model: customModel.trim(),
        batteryCapacity: cap,
        rangeKm: range,
        vehicleType,
        maxChargingSpeed: speed,
        connectorType,
      };

      await saveVehicle(payload);
      setIsEditing(false);
      showToast(`Vehicle saved: ${customModel}`, 'success');
      if (onVehicleSaved) onVehicleSaved(payload);
    } catch (err) {
      showToast(err.message || 'Failed to save vehicle details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this vehicle profile?')) return;
    setLoading(true);
    try {
      await deleteVehicle();
      setIsEditing(true);
      showToast('Vehicle profile removed.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove vehicle.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all ${standalone ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0a8754] shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0d233a] leading-tight">
              {currentVehicle && !isEditing ? 'My Electric Vehicle' : 'Add Your Vehicle (EV Profile)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Personalize route energy calculations, charging speeds &amp; connector matching
            </p>
          </div>
        </div>

        {/* Action Toggle (Edit / Cancel) */}
        {currentVehicle && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#0a8754] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Vehicle</span>
              </button>
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                title="Remove vehicle"
                className="p-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      {feedback.text && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-slate-100 border border-slate-200 text-slate-800'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ============================================================
          VIEW 1: Active Saved Vehicle Display Card (Non-Editing Mode)
          ============================================================ */}
      {!isEditing && currentVehicle && (
        <div className="space-y-4">
          {/* Main Title Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#0a8754] text-white">
                  {currentVehicle.brand || 'EV Profile'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                  {currentVehicle.vehicleType || 'Electric Car'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active for Recommendations</span>
                </span>
              </div>
              <h4 className="text-xl font-black text-[#0d233a]">{currentVehicle.model}</h4>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real-World Range</span>
              <span className="text-2xl font-black text-[#0a8754]">{currentVehicle.rangeKm} <span className="text-xs font-semibold text-slate-600">km</span></span>
            </div>
          </div>

          {/* 4 Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Battery Capacity */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Battery</span>
                <span className="font-extrabold text-slate-800 text-sm">{currentVehicle.batteryCapacity} kWh</span>
              </div>
            </div>

            {/* Range */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0a8754] shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Max Range</span>
                <span className="font-extrabold text-slate-800 text-sm">{currentVehicle.rangeKm} km</span>
              </div>
            </div>

            {/* Max Charging Speed */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Max Charge</span>
                <span className="font-extrabold text-slate-800 text-sm">{currentVehicle.maxChargingSpeed} kW</span>
              </div>
            </div>

            {/* Connector Type */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Plug className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Connector</span>
                <span className="font-extrabold text-slate-800 text-sm truncate block max-w-[95px]" title={currentVehicle.connectorType}>
                  {currentVehicle.connectorType}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
            <Info className="w-4 h-4 text-[#0a8754] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Personalized Recommendation Active:</strong> ChargeNav will calculate battery drain for this {currentVehicle.batteryCapacity} kWh pack, filter compatible {currentVehicle.connectorType} charging points, and cap effective charging rates at {currentVehicle.maxChargingSpeed} kW.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW 2: Interactive Vehicle Input / Edit Form
          ============================================================ */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Quick preset notice */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-[#0a8754] shrink-0 mt-0.5" />
            <p>
              Select your manufacturer and model below to auto-fill verified battery capacity, range, and fast-charging parameters. You can also customize any field manually.
            </p>
          </div>

          {/* Row 1: Brand / Manufacturer & Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Brand Dropdown */}
            <div>
              <label htmlFor="vehicle-brand" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Manufacturer / Brand <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicle-brand"
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
              >
                {EV_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Preset Dropdown */}
            <div>
              <label htmlFor="vehicle-model-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Popular Model Selection
              </label>
              <select
                id="vehicle-model-select"
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
              >
                <option value="">-- Choose from {selectedBrand} catalog --</option>
                {brandModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.model} ({m.batteryCapacity} kWh)
                  </option>
                ))}
                <option value="custom">✏️ Enter custom model details below</option>
              </select>
            </div>
          </div>

          {/* Row 2: Model Name & Vehicle Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Vehicle Model Name (Editable) */}
            <div>
              <label htmlFor="vehicle-model-text" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vehicle Model Name <span className="text-red-500">*</span>
              </label>
              <input
                id="vehicle-model-text"
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. Tata Nexon EV Empowered+"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            {/* Vehicle Type (Electric Car / Electric Scooter) */}
            <div>
              <label htmlFor="vehicle-type-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vehicle Category <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicle-type-select"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
              >
                {EV_VEHICLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Specifications Grid (Battery, Range, Max kW, Connector) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            
            {/* Battery Capacity (kWh) */}
            <div>
              <label htmlFor="battery-capacity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Battery Capacity (kWh) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="battery-capacity"
                  type="number"
                  step="0.1"
                  min="1"
                  max="200"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                  kWh
                </span>
              </div>
            </div>

            {/* Driving Range (km) */}
            <div>
              <label htmlFor="battery-range" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Charge Range (km) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="battery-range"
                  type="number"
                  step="1"
                  min="20"
                  max="1200"
                  value={rangeKm}
                  onChange={(e) => setRangeKm(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                  km
                </span>
              </div>
            </div>

            {/* Maximum Charging Capacity (kW) */}
            <div>
              <label htmlFor="max-charging-speed" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Charging Rate (kW) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="max-charging-speed"
                  type="number"
                  step="0.5"
                  min="1"
                  max="500"
                  value={maxChargingSpeed}
                  onChange={(e) => setMaxChargingSpeed(e.target.value)}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                  kW
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Connector Type Selection */}
          <div>
            <label htmlFor="connector-type-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Connector Type <span className="text-red-500">*</span>
            </label>
            <select
              id="connector-type-select"
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
            >
              {EV_CONNECTOR_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {currentVehicle && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Vehicle...' : currentVehicle ? 'Update Vehicle Profile' : 'Save & Add Vehicle'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

