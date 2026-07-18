<div align="center">

<br/>

<h1>

⚙️ &nbsp;S Y N T H - L I N E &nbsp; V I R T U A L

</h1>

<h3>Autonomous, Criticality-Aware QC & Procurement Orchestration</h3>
<p><sub>Built entirely on <b>Nitrostack</b> — MCP · API · Cloud</sub></p>

<br/>

<p>
  <img src="https://img.shields.io/badge/status-LIVE-00C853?style=for-the-badge&labelColor=0F172A" alt="status" />
  <img src="https://img.shields.io/badge/stack-NITROSTACK-6C5CE7?style=for-the-badge&labelColor=0F172A" alt="stack" />
  <img src="https://img.shields.io/badge/agents-4%20MCP%20Agents-2196F3?style=for-the-badge&labelColor=0F172A" alt="agents" />
  <img src="https://img.shields.io/badge/vision-OpenCV-EF5350?style=for-the-badge&labelColor=0F172A" alt="vision" />
  <img src="https://img.shields.io/badge/license-MIT-9E9E9E?style=for-the-badge&labelColor=0F172A" alt="license" />
</p>

<br/>

<a href="https://synth-line-omni-6-omni-bots-amrita-university-amritapuri-campus.app.nitrocloud.ai">
  <img src="https://img.shields.io/badge/%F0%9F%9A%80%20LAUNCH%20LIVE%20DEMO-6C5CE7?style=for-the-badge&labelColor=0F172A&logo=vercel&logoColor=white" alt="Launch Live Demo" />
</a>

<br/><br/>

<table>
<tr><td align="center">

🤖&nbsp;**Detect**&nbsp;&nbsp;→&nbsp;&nbsp;⚖️&nbsp;**Triage**&nbsp;&nbsp;→&nbsp;&nbsp;💸&nbsp;**Source**&nbsp;&nbsp;→&nbsp;&nbsp;🌐&nbsp;**Audit**&nbsp;&nbsp;→&nbsp;&nbsp;🚀&nbsp;**Ship**

</td></tr>
</table>

<br/>

<p>
  <a href="#-problem-statement">Problem</a> &nbsp;•&nbsp;
  <a href="#-proposed-solution">Solution</a> &nbsp;•&nbsp;
  <a href="#-architecture">Architecture</a> &nbsp;•&nbsp;
  <a href="#-the-agent-pipeline">Agents</a> &nbsp;•&nbsp;
  <a href="#-feature-walkthrough">Features</a> &nbsp;•&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;•&nbsp;
  <a href="#-getting-started">Setup</a>
</p>

</div>

<br/>

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

**Flow:** Live optical feed → contour/pixel-scan defect detection → automated reject + criticality lookup → cost-vs-speed sourcing decision → live vendor audit and PO dispatch. All state changes are reflected instantly across **Inspection Workspace → Audit Center → Supplier Intelligence → Orders**.

<details>
<summary><b>View system architecture diagram</b></summary>

<br/>

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

</details>

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

| | Module | What it does |
|---|---|---|
| 🏭 | **Live Conveyor Digital Twin** | Drag-and-drop parts library, adjustable manual quality-injection profiles (Auto / Good / Avg / Poor), real-time lane speed and vision-sensor overlay |
| 🔍 | **Inspection Workspace** | Live optical feed with exposure/aperture/temp telemetry, manual pass/defect override, real-time AI multi-agent review timeline |
| 📋 | **Audit Center** | Non-conformance ledger with cost-impact tracking, per-part diagnostic files, root-cause mechanical analysis, exportable ISO 9001–verified CSV audit reports |
| 🌐 | **Supplier Intelligence Registry** | Criticality-tagged parts registry (24 indexed global vendors), live sourcing matrix comparing fastest/cheapest/balanced options per part |
| 🧠 | **AI Operations Center** | Select any of the 4 agents to inspect live cognitive memory, dispatched MCP interfaces, and full execution logs |
| 📦 | **Purchase Orders Tracker** | Real-time PO dashboard showing supplier, delivery lead, cost, and fulfillment status, with manual reorder override |

---

## 🛠 Tech Stack

<p>
  <img src="https://img.shields.io/badge/Nitrostack%20MCP-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Nitrostack%20API-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Nitrostack%20Cloud-6C5CE7?style=flat-square" />
  <img src="https://img.shields.io/badge/Siemens%20SCADA%20V4.2-009999?style=flat-square" />
</p>

| Layer | Technology | Role |
|---|---|---|
| **Orchestration & Hosting** | Nitrostack (MCP · API · Cloud) | Entire system — agents included — runs as one deployable Nitrostack instance |
| **Simulation Layer** | Siemens SCADA–styled Factory OS | Digital twin UI shell for the conveyor and inspection views |
| **Agent Framework** | 4× MCP tool-calling agents | Independent agents sharing one Nitrostack MCP server |

---





## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

<br/>

<div align="center">
<br/>
👥 Team OMNI-BOTS

<table>
<tr>
<td align="center">
Nithish Kumar S
<br/>
<a href="https://github.com/nithishkumar-dev-10"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>

</td>
<td align="center">
Sri Surya
<br/>
<a href="https://github.com/kramasrisurya"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>

</td>
<td align="center">
Nithilan
<br/>
<a href="https://github.com/nithilan-su57"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>

</td>
<td align="center">
Vikranth C
<br/>
<a href="https://github.com/harishvikrant07-ops"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>

</td>
</tr>
</table>
<sub>⚙️ Powered end-to-end by Nitrostack — MCP · API · Cloud</sub>

<br/><br/>

</div>
