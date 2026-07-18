<div align="center">

<img width="100%" alt="banner" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,100:6C5CE7&height=220&section=header&text=SYNTH-LINE%20VIRTUAL&fontSize=54&fontColor=ffffff&fontAlignY=38&desc=Autonomous%2C%20Criticality-Aware%20QC%20%26%20Procurement%20Orchestration&descAlignY=58&descSize=18&animation=fadeIn" />

<br/>

<p>
  <img src="https://img.shields.io/badge/status-LIVE-00C853?style=for-the-badge&labelColor=0F172A" alt="status" />
  <img src="https://img.shields.io/badge/stack-NITROSTACK-6C5CE7?style=for-the-badge&labelColor=0F172A" alt="stack" />
  <img src="https://img.shields.io/badge/agents-4%20MCP%20Agents-2196F3?style=for-the-badge&labelColor=0F172A" alt="agents" />
  <img src="https://img.shields.io/badge/vision-OpenCV-EF5350?style=for-the-badge&labelColor=0F172A" alt="vision" />
  <img src="https://img.shields.io/badge/license-MIT-9E9E9E?style=for-the-badge&labelColor=0F172A" alt="license" />
</p>

<table>
<tr><td align="center">

🤖 **Detect** &nbsp;·&nbsp; ⚖️ **Triage** &nbsp;·&nbsp; 💸 **Source** &nbsp;·&nbsp; 🌐 **Audit** &nbsp;·&nbsp; 🚀 **Ship**

</td></tr>
</table>

<p>
  <a href="#-problem-statement"><b>Problem</b></a> ·
  <a href="#-proposed-solution"><b>Solution</b></a> ·
  <a href="#-architecture"><b>Architecture</b></a> ·
  <a href="#-the-agent-pipeline"><b>Agents</b></a> ·
  <a href="#-tech-stack"><b>Tech Stack</b></a> ·
  <a href="https://synth-line-omni-6-omni-bots-amrita-university-amritapuri-campus.app.nitrocloud.ai"><b>🔗 Live Demo</b></a>
</p>

</div>

<br/>

---

## 📖 Table of Contents

- [Problem Statement](#-problem-statement)
- [Proposed Solution](#-proposed-solution)
- [Architecture](#-architecture)
- [The Agent Pipeline](#-the-agent-pipeline)
- [Feature Walkthrough](#-feature-walkthrough)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)
- [License](#-license)

---

<div align="center">

| 🤖 Agents | ⚡ Fastest Response | 🌐 Vendors Indexed | 📋 Ledger Tracking | ✅ Compliance |
|:---:|:---:|:---:|:---:|:---:|
| **4** MCP agents | **12ms** (Triage) | **24** global suppliers | Live non-conformance ledger | ISO 9001 verified exports |

</div>

---

## 🧩 Problem Statement

**The "Siloed Cascade" (and the "Dumb Reorder") in Modern Manufacturing**

In most Industry 4.0 lines today, a computer-vision system that spots a defect acts as a passive alarm — it just tells a human. That human then has to physically pull the part, dig through machine logs for maintenance clues, and manually update the ERP/inventory system. Three separate systems, one human bottleneck, no shared reasoning.

Even where reorder automation *does* exist, it's usually a flat, context-blind rule: *"part goes below threshold → reorder from default supplier."* That rule treats a cosmetic trim clip and a safety-critical radar sensor identically. It either always chases the **lowest price** (leaving a critical line starved for days on a slow, cheap shipment) or always chases the **fastest vendor** (overpaying for parts where a slower, cheaper option would've been fine). Neither failure mode is visible until the line stalls or the budget report comes in over.

> The gap isn't sensing — factories already have plenty of cameras and sensors. The gap is **autonomous, criticality-aware orchestration**: nothing today reasons across the CV alert, the part's real importance to the line, the supplier network, and the sourcing action — then acts on all of it, without a human in the loop.

---

## 💡 Proposed Solution

**Synth-Line Virtual** is a self-contained, fully deployable digital twin of a QC and procurement floor, built entirely on **Nitrostack** — every agent, every tool call, every hosted endpoint runs through Nitrostack's **MCP layer**, **API layer**, and **Cloud hosting**, with nothing bolted on from outside the stack.

A simulated conveyor line streams live optical frames through a real defect-detection model. When a defect is flagged, a **4-agent cognitive pipeline** — each agent a discrete MCP tool-calling entity registered on the same Nitrostack MCP server — takes over end to end: detect → triage → source → audit.

Every agent's reasoning (cognitive memory, dispatched MCP interfaces, live logs) is surfaced on a Nitrostack Cloud–hosted dashboard, so the trade-off the system just made is **explicit and auditable**, not a hidden default.

---

## 🏗 Architecture

```
                    ┌─────────────────────────────────────┐
                    │        NITROSTACK CLOUD (Hosting)     │
                    │    Live UI · Factory OS Dashboard     │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │         NITROSTACK MCP SERVER          │
                    │   (shared tool registry for all agents)│
                    └───────────────────┬───────────────────┘
                                        │
        ┌──────────────┬────────────────┼─────────────────┬──────────────┐
        │              │                │                 │              │
        ▼              ▼                ▼                 ▼              ▼
 ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ ┌────────────────┐
 │ AI Vision   │ │   Triage &  │ │  Procurement   │ │    Supplier     │
 │  Classifier │→│  Escalation │→│    Sourcing    │→│     Network     │
 │  (45ms)     │ │  Dispatcher │ │   Specialist   │ │    Negotiator   │
 │             │ │   (12ms)    │ │    (110ms)     │ │     (185ms)     │
 └─────────────┘ └─────────────┘ └───────────────┘ └────────────────┘
     Defect            Reject +         Cost/Speed         Vendor SLA
     detection         criticality      trade-off          scoring &
     + localization     lookup          decision            auditing
```

**Flow:** Live optical feed → contour/pixel-scan defect detection → automated reject + criticality lookup → cost-vs-speed sourcing decision → live vendor audit and PO dispatch. All state changes are reflected instantly across **Inspection Workspace → Audit Center → Supplier Intelligence → Orders**.

---

## 🤖 The Agent Pipeline

| # | Agent | Latency | Responsibility | MCP Tools |
|---|-------|---------|-----------------|-----------|
| 1 | **AI Vision Classifier** | `45ms` | Runs contour/pixel-scan analysis against reference CAD tolerances to confirm and localize a defect | `opencv-contour-vector-scan()`, `heat-map-overlay()` |
| 2 | **Triage & Escalation Dispatcher** | `12ms` | Rejects the flagged item, logs it to the non-conformance ledger, pulls the part's criticality tier | `reject_item()`, `part-criticality-registry()` |
| 3 | **Procurement Sourcing Specialist** | `110ms` | Decides **how** to reorder based on criticality — not just whether to | `search_suppliers()`, `place_order()` |
| 4 | **Supplier Network Negotiator** | `185ms` | Continuously audits vendor logistics and SLA compliance across the registered supplier base | `audit_vendor_latency()`, `supplier-slas()` |

### The Core Sourcing Logic

This is the decision engine that makes the whole system meaningful — not a flat threshold rule, but a policy that actually differs by stakes:

| Criticality | Priority Rule | Behavior |
|---|---|---|
| 🔴 **Critical** | Minimize lead time **at all costs** | Skips cost comparison entirely — dispatches to whichever vendor delivers **fastest**, to avoid assembly stoppages |
| 🟡 **Standard / Low** | Minimize procurement cost | Dispatches to whichever vendor is **cheapest**, even accepting longer transit delays |

> Example from a live run: a **High-Resolution Radar Sensor (SNS-07)**, tagged `CRITICAL`, was auto-sourced from **Texas Instruments India** — 1-day lead time at $450 — bypassing a $280 / 10-day option from Mouser Electronics, because criticality rules override cost for that tier.

---

## ✨ Feature Walkthrough

- **Live Conveyor Digital Twin** — drag-and-drop parts library, adjustable manual quality-injection profiles (Auto / Good / Avg / Poor), real-time lane speed and vision-sensor overlay
- **Inspection Workspace** — live optical feed with exposure/aperture/temp telemetry, manual pass/defect override, real-time AI multi-agent review timeline
- **Audit Center** — non-conformance ledger with cost-impact tracking, per-part diagnostic files, root-cause mechanical analysis, exportable ISO 9001–verified CSV audit reports
- **Supplier Intelligence Registry** — criticality-tagged parts registry (24 indexed global vendors), live sourcing matrix comparing fastest/cheapest/balanced options per part
- **AI Operations Center** — select any of the 4 agents to inspect live cognitive memory, dispatched MCP interfaces, and full execution logs
- **Purchase Orders Tracker** — real-time PO dashboard showing supplier, delivery lead, cost, and fulfillment status, with manual reorder override

---

## 🛠 Tech Stack

<p>
  <img src="https://img.shields.io/badge/Nitrostack%20MCP-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Nitrostack%20API-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Nitrostack%20Cloud-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white" />
  <img src="https://img.shields.io/badge/Siemens%20SCADA%20V4.2-009999?style=flat-square" />
</p>

- **Orchestration & Hosting:** Nitrostack (MCP tool registry, API layer, Cloud deployment) — the entire system, agents included, runs as a single deployable Nitrostack instance
- **Computer Vision:** OpenCV-based contour/pixel-scan defect classification against CAD tolerance references
- **Simulation Layer:** Siemens SCADA–styled Factory OS shell for the digital twin UI
- **Agent Framework:** 4 independent MCP tool-calling agents sharing one Nitrostack MCP server

---

## 🖼 Screenshots

> Add exported screenshots to a `/screenshots` folder in the repo and reference them below.

| Dashboard | Inspection Workspace | Supplier Intelligence |
|---|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Inspection](./screenshots/inspection.png) | ![Supplier Intel](./screenshots/supplier-intel.png) |

---

## 🚀 Getting Started

> This project is deployed and run entirely on **Nitrostack Cloud**. If a local/dev setup exists, fill in the section below — otherwise the live demo link above is the primary entry point.

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# TODO: add Nitrostack CLI / local dev commands here if applicable
```

---

## 🗺 Roadmap

- [ ] Add historical defect-rate analytics dashboard
- [ ] Expand supplier registry beyond current 24 indexed vendors
- [ ] Add configurable criticality-tier thresholds per part category
- [ ] Export full agent decision trails as signed audit PDFs

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built by **Nithish Kumar S** · B.Tech CS, Amrita Vishwa Vidyapeetham

<img width="100%" alt="footer" src="https://capsule-render.vercel.app/api?type=waving&color=0:6C5CE7,100:0F172A&height=100&section=footer" />

</div>
