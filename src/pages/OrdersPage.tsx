/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShoppingBag,
  Clock,
  PlusCircle,
  CheckCircle,
  Briefcase,
  Info,
} from "lucide-react";
import { LedgerEntry, PARTS_CATALOG, SUPPLIERS_DB } from "../types";

interface OrdersPageProps {
  ledger: LedgerEntry[];
  onAddLedgerEntry: (entry: LedgerEntry) => void;
}

export default function OrdersPage({ ledger, onAddLedgerEntry }: OrdersPageProps) {
  const purchaseOrders = ledger.filter((l) => l.outcome === "rejected");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create New Order Form States
  const [formPartId, setFormPartId] = useState("SNS-07");
  const [formSupplierId, setFormSupplierId] = useState("");
  const [formQuantity, setFormQuantity] = useState(1);
  const [orderNotification, setOrderNotification] = useState("");

  const suppliersForSelectedPart = SUPPLIERS_DB[formPartId] || [];

  // Handle supplier list sync
  React.useEffect(() => {
    if (suppliersForSelectedPart.length > 0) {
      setFormSupplierId(suppliersForSelectedPart[0].supplier_id);
    }
  }, [formPartId]);

  // Handle manual order creation
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenPart = PARTS_CATALOG.find((p) => p.part_id === formPartId)!;
    const chosenSupplier = suppliersForSelectedPart.find((s) => s.supplier_id === formSupplierId)!;
    
    const timestamp = new Date().toTimeString().split(" ")[0];
    const orderId = `PO-MANUAL-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newLedgerEntry: LedgerEntry = {
      id: orderId,
      part_id: formPartId,
      part_name: chosenPart.name,
      criticality: chosenPart.criticality,
      outcome: "rejected",
      defectType: "Manual Procurement Injection",
      timestamp,
      chosenSupplierId: chosenSupplier.supplier_id,
      chosenSupplierName: chosenSupplier.name,
      orderCost: chosenSupplier.cost * formQuantity,
      deliveryDays: chosenSupplier.delivery_days,
      tradeOffIgnored: "Manual operator request",
    };

    onAddLedgerEntry(newLedgerEntry);
    setOrderNotification(`Successfully created Purchase Order ${orderId}!`);
    setShowCreateModal(false);

    setTimeout(() => {
      setOrderNotification("");
    }, 4000);
  };

  // Status visualizers
  const [canceledOrders, setCanceledOrders] = useState<Set<string>>(new Set());

  const toggleCancel = (id: string) => {
    if (canceledOrders.has(id)) {
      canceledOrders.delete(id);
      setCanceledOrders(new Set(canceledOrders));
    } else {
      canceledOrders.add(id);
      setCanceledOrders(new Set(canceledOrders));
    }
  };

  return (
    <div className="space-y-6" id="orders-tracking-page">
      {/* Toast alert */}
      {orderNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-emerald-500 text-emerald-800 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce font-mono text-xs">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span className="font-bold">{orderNotification}</span>
        </div>
      )}

      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-500/15 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-700 uppercase font-black">
              [AGENT PROCUREMENT DIRECTIVES &amp; CONTRACT TRACKING]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            Purchase Orders Tracker
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Monitor active parts replacement log entries, cancel standard backlog shipments, or dispatch emergency manual reorders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-black font-mono tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5 text-cyan-400" /> Manual Reorder
        </button>
      </div>

      {/* Main Grid: Orders list table */}
      <div className="glass-panel border border-white/60 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/45 mb-4">
          <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4.5 h-4.5 text-cyan-600" /> Active Purchase Contracts ({purchaseOrders.length})
          </h3>
          <span className="text-[9px] font-mono text-slate-600 font-bold">MCP TOOL: place_order</span>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/45 rounded-2xl bg-white/20 py-24 shadow-inner">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-slate-600 uppercase tracking-wider font-mono font-bold">
              No active reorders logged in the registry
            </p>
            <p className="text-[10px] text-slate-700 font-semibold font-sans mt-1">
              Fulfillment triggers automatically as the conveyor scanner flags defective items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-800 border-collapse">
              <thead>
                <tr className="border-b border-white/45 text-slate-500 text-[10px] tracking-wider uppercase font-black">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Part Type</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Delivery Lead</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3">Logistics SLA</th>
                  <th className="py-2.5 px-3 text-center">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 font-semibold">
                {purchaseOrders.map((order) => {
                  const isCanceled = canceledOrders.has(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/30 transition-colors ${
                        isCanceled ? "opacity-45 line-through" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-black text-indigo-950">{order.id}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] bg-white/80 px-1.5 py-0.5 rounded-full border border-white text-indigo-950 font-black shadow-sm">
                          {order.part_id}
                        </span>
                        <span className="text-slate-800 ml-1.5 block md:inline font-sans font-black">
                          {order.part_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800">{order.chosenSupplierName}</td>
                      <td className="py-3 px-3 text-slate-800">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-cyan-600 animate-pulse" /> {order.deliveryDays} Days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-black">
                        ${order.orderCost?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {isCanceled ? (
                          <span className="text-[8px] bg-rose-500/15 text-rose-700 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-black">
                            CANCELED
                          </span>
                        ) : (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5 w-fit">
                            <CheckCircle className="w-2.5 h-2.5" /> AUTO-ORDERED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!isCanceled ? (
                            <button
                              onClick={() => toggleCancel(order.id)}
                              className="px-2.5 py-1 text-[9px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-700 font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                canceledOrders.delete(order.id);
                                setCanceledOrders(new Set(canceledOrders));
                              }}
                              className="px-2.5 py-1 text-[9px] bg-white/70 hover:bg-white border border-white/80 rounded-lg text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Order Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/95 border border-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl backdrop-blur-3xl">
            <h2 className="text-base font-display font-black text-indigo-950 flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-indigo-600" /> Manual Purchase Invoice
            </h2>

            <form onSubmit={handleCreateOrder} className="space-y-4 font-mono text-xs">
              {/* Part selector */}
              <div className="space-y-1">
                <label className="text-slate-600 block font-bold">Select Part Type</label>
                <select
                  value={formPartId}
                  onChange={(e) => setFormPartId(e.target.value)}
                  className="w-full bg-white/90 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 text-indigo-950 font-black cursor-pointer shadow-inner"
                >
                  {PARTS_CATALOG.map((p) => (
                    <option key={p.part_id} value={p.part_id}>
                      {p.part_id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier selector */}
              <div className="space-y-1">
                <label className="text-slate-600 block font-bold">Select Supplier Vendor</label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full bg-white/90 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 text-indigo-950 font-black cursor-pointer shadow-inner"
                >
                  {suppliersForSelectedPart.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.name} (${s.cost} - {s.delivery_days}d Lead)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity selector */}
              <div className="space-y-1">
                <label className="text-slate-600 block font-bold">Unit Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/90 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 text-indigo-950 font-black shadow-inner"
                />
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-2 shadow-sm">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] text-slate-800 font-semibold leading-normal">
                  Dispatched manual purchase contracts will append directly to the active ledger with operator authorization.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 border border-slate-300 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl font-black shadow-sm cursor-pointer font-sans"
                >
                  Deploy PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
