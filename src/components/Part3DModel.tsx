/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface Part3DModelProps {
  partId: string;
  className?: string;
  animate?: boolean;
  status?: "approaching" | "inspecting" | "passed_moving" | "rejecting" | "done";
}

export default function Part3DModel({
  partId,
  className = "w-full h-full",
  animate = true,
  status,
}: Part3DModelProps) {
  // Determine highlight colors based on parent status or part properties
  const isInspecting = status === "inspecting";
  
  // Render high-fidelity isometric vector artwork with gradients
  switch (partId) {
    case "SNS-07": // High-Resolution Radar Sensor
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sns-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sns-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="sns-dish" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          {/* Radar Scanning Field */}
          {animate && (
            <circle cx="50" cy="50" r="45" fill="url(#sns-glow)">
              <animate attributeName="r" values="25;45;25" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Isometric Base Plate */}
          <path d="M 15,50 L 50,30 L 85,50 L 50,70 Z" fill="url(#sns-body)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 15,50 L 15,55 L 50,75 L 50,70 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <path d="M 50,70 L 50,75 L 85,55 L 85,50 Z" fill="#020617" stroke="#334155" strokeWidth="1" />

          {/* Central Dome/Emitter */}
          <path d="M 32,45 C 32,32 68,32 68,45" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="50" cy="45" rx="18" ry="8" fill="url(#sns-dish)" stroke="#0284c7" strokeWidth="1" />

          {/* Emitting Sensor Tip */}
          <line x1="50" y1="45" x2="50" y2="25" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="24" r="3" fill="#38bdf8">
            {animate && (
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
            )}
          </circle>

          {/* Target Scanning Beam Arcs */}
          {animate && (
            <path d="M 38,20 Q 50,12 62,20" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.8">
              <animate attributeName="opacity" values="0;0.9;0" dur="2s" repeatCount="indefinite" />
              <animate attributeName="transform" values="scale(0.8) translate(12, 5); scale(1.2) translate(-8, -5)" dur="2s" repeatCount="indefinite" />
            </path>
          )}
          {/* Outer Grid Ring */}
          <ellipse cx="50" cy="50" rx="30" ry="14" stroke="#0891b2" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
        </svg>
      );

    case "BRK-22": // Electromagnetic Brake Actuator
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brk-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="40%" stopColor="#64748b" />
              <stop offset="70%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="brk-copper" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          {/* Rotated Braking Disc with Holes (Isometric View) */}
          <g transform={animate ? "rotate(0 50 50)" : undefined}>
            {animate && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="15s"
                repeatCount="indefinite"
              />
            )}
            {/* Outer Rotor Ring */}
            <ellipse cx="50" cy="50" rx="38" ry="22" fill="url(#brk-metal)" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="50" cy="50" rx="28" ry="16" fill="#0f172a" stroke="#475569" strokeWidth="1" />

            {/* Ventilation Slots/Holes */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const x = 50 + Math.cos(angle) * 33;
              const y = 50 + Math.sin(angle) * 19;
              return <circle key={i} cx={x} cy={y} r="2" fill="#020617" opacity="0.8" />;
            })}
          </g>

          {/* Heavy Brake Caliper Block clamped on the top right */}
          <path d="M 62,32 L 85,38 L 78,58 L 55,52 Z" fill="#b91c1c" stroke="#f87171" strokeWidth="1.5" />
          <path d="M 62,32 L 62,26 L 85,32 L 85,38 Z" fill="#991b1b" />
          <path d="M 85,32 L 85,38 L 78,58 L 78,52 Z" fill="#7f1d1d" />

          {/* Copper Electromagnetic Coil Housing in the center */}
          <ellipse cx="50" cy="50" rx="16" ry="9" fill="url(#brk-copper)" stroke="#c2410c" strokeWidth="1.5" />
          <ellipse cx="50" cy="46" rx="12" ry="7" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Central Axle Spindle Hole */}
          <ellipse cx="50" cy="46" rx="6" ry="3.5" fill="#020617" />
        </svg>
      );

    case "BAT-99": // Thermal Management Controller
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bat-fin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          
          {/* Main 3D Box Chassis (Isometric Prism) */}
          {/* Top Face */}
          <path d="M 20,40 L 50,22 L 80,40 L 50,58 Z" fill="url(#bat-fin)" stroke="#475569" strokeWidth="1.5" />
          {/* Left Face */}
          <path d="M 20,40 L 20,62 L 50,80 L 50,58 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          {/* Right Face */}
          <path d="M 50,58 L 50,80 L 80,62 L 80,40 Z" fill="#020617" stroke="#1e293b" strokeWidth="1" />

          {/* Heatsink Fins (Extruded horizontal lines on the top face) */}
          <path d="M 28,36 L 50,49 L 72,36" stroke="#475569" strokeWidth="2" />
          <path d="M 33,33 L 50,43 L 67,33" stroke="#475569" strokeWidth="2" />
          <path d="M 38,30 L 50,37 L 62,30" stroke="#475569" strokeWidth="2" />
          <path d="M 43,27 L 50,31 L 57,27" stroke="#475569" strokeWidth="2" />

          {/* Active Liquid Cooling Glowing Pipes (Glowing neon lines) */}
          <path d="M 25,52 L 25,67 L 45,79" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
            {animate && (
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
            )}
          </path>
          <path d="M 75,52 L 75,67 L 55,79" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
            {animate && (
              <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
            )}
          </path>

          {/* Micro LEDs on the Controller body */}
          <circle cx="50" cy="65" r="1.5" fill="#10b981">
            {animate && (
              <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="55" cy="68" r="1.5" fill="#f59e0b" />
        </svg>
      );

    case "MTR-44": // Brushless Drive Motor
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mtr-cyl" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Motor cylindrical body block (Isometric angled cylinder) */}
          {/* Bottom End Base */}
          <ellipse cx="50" cy="68" rx="24" ry="12" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          
          {/* Main extruded cylinder sleeve */}
          <path d="M 26,38 L 26,68 A 24 12 0 0 0 74,68 L 74,38 Z" fill="url(#mtr-cyl)" stroke="#475569" strokeWidth="1.5" />
          
          {/* Top End Bezel */}
          <ellipse cx="50" cy="38" rx="24" ry="12" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Longitudinal winding cooling slats */}
          <line x1="36" y1="44" x2="36" y2="69" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="43" y1="46" x2="43" y2="71" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="50" y1="47" x2="50" y2="72" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="57" y1="46" x2="57" y2="71" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="64" y1="44" x2="64" y2="69" stroke="#1e293b" strokeWidth="1.5" />

          {/* Central Rotor Shaft Spinning (Dynamic) */}
          <g>
            {/* Spinning rotor key/notch */}
            <path d="M 50,38 L 50,15" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="50" cy="15" rx="5" ry="2.5" fill="#94a3b8" stroke="#f1f5f9" strokeWidth="1" />
            
            {/* Rotor rotating marker */}
            {animate && (
              <line x1="47" y1="15" x2="53" y2="15" stroke="#e11d48" strokeWidth="1.5">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 15"
                  to="360 50 15"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </line>
            )}
          </g>

          {/* Power Terminal Junction box on the side */}
          <path d="M 68,48 L 84,42 L 84,54 L 68,60 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" />
        </svg>
      );

    case "GRB-15": // Precision Planetary Gearbox
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grb-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="grb-brass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* Main Gearbox Housing */}
          <ellipse cx="50" cy="50" rx="36" ry="20" fill="url(#grb-body)" stroke="#64748b" strokeWidth="2" />
          <ellipse cx="50" cy="50" rx="28" ry="15" fill="#1e293b" stroke="#334155" strokeWidth="1" />

          {/* Planetary Gear Interlocking Teeth (Outer Rim) */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI) / 6;
            const rx = 50 + Math.cos(angle) * 32;
            const ry = 50 + Math.sin(angle) * 17;
            return (
              <circle
                key={i}
                cx={rx}
                cy={ry}
                r="3"
                fill="#475569"
                stroke="#64748b"
                strokeWidth="1"
              />
            );
          })}

          {/* Spinning Central Sun Gear */}
          <g>
            {animate && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="-360 50 50"
                dur="10s"
                repeatCount="indefinite"
              />
            )}
            <ellipse cx="50" cy="50" rx="16" ry="9" fill="url(#grb-brass)" stroke="#a16207" strokeWidth="1.5" />
            
            {/* Individual tooth ridges */}
            {[...Array(6)].map((_, i) => {
              const angle = (i * Math.PI) / 3;
              const gx = 50 + Math.cos(angle) * 12;
              const gy = 50 + Math.sin(angle) * 6;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={gx}
                  y2={gy}
                  stroke="#78350f"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="50" cy="50" r="3" fill="#0f172a" />
          </g>
        </svg>
      );

    case "PNL-01": // Exterior Protective Shroud
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pnl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#0f172a" />
              <stop offset="80%" stopColor="#020617" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <pattern id="carbon-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 0,0 L 4,4 M 4,0 L 0,4" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          {/* Carbon Shroud Plate (Curved Aerodynamic Shield Profile) */}
          {/* Base plate with carbon texture */}
          <path
            d="M 12,35 Q 50,15 88,35 L 75,75 Q 50,85 25,75 Z"
            fill="url(#pnl-gradient)"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Carbon texture layer */}
          <path
            d="M 12,35 Q 50,15 88,35 L 75,75 Q 50,85 25,75 Z"
            fill="url(#carbon-grid)"
            opacity="0.4"
          />

          {/* Embossed reinforce panel contours */}
          <path
            d="M 22,42 Q 50,26 78,42 L 68,68 Q 50,75 32,68 Z"
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4,2"
            opacity="0.75"
          />

          {/* Aerodynamic Air-Intake slots in the center */}
          <path d="M 40,48 L 60,48" stroke="#020617" strokeWidth="4" strokeLinecap="round" />
          <path d="M 42,55 L 58,55" stroke="#020617" strokeWidth="4" strokeLinecap="round" />

          {/* Bolt rivets */}
          <circle cx="18" cy="39" r="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
          <circle cx="82" cy="39" r="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
          <circle cx="28" cy="71" r="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
          <circle cx="72" cy="71" r="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
        </svg>
      );

    case "BKT-05": // Heavy-Duty Mounting Bracket
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bkt-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          {/* L-Shaped Orthogonal Bracket */}
          {/* Horizontal Flange (Bottom) */}
          <path d="M 18,65 L 50,82 L 82,65 L 50,48 Z" fill="#334155" stroke="#475569" strokeWidth="1.2" />
          
          {/* Vertical Flange (Back) */}
          <path d="M 18,25 L 50,42 L 50,82 L 18,65 Z" fill="url(#bkt-face)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 50,42 L 82,25 L 82,65 L 50,82 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />

          {/* Gusset web support brace (Triangular reinforcement center) */}
          <path d="M 50,42 L 50,75 L 34,67 Z" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Bolt mounting holes with thickness */}
          <ellipse cx="34" cy="40" rx="3" ry="1.8" fill="#020617" />
          <ellipse cx="66" cy="40" rx="3" ry="1.8" fill="#020617" />
          <ellipse cx="50" cy="58" rx="4" ry="2.2" fill="#020617" stroke="#475569" strokeWidth="0.5" />
        </svg>
      );

    case "FST-12": // Vibration-Damping Fastener
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fst-screw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          {/* Hex Bolt Head on Top */}
          <path d="M 50,15 L 68,23 L 68,34 L 50,42 L 32,34 L 32,23 Z" fill="url(#fst-screw)" stroke="#94a3b8" strokeWidth="1.5" />
          <ellipse cx="50" cy="28.5" rx="10" ry="5.5" fill="none" stroke="#cbd5e1" strokeWidth="1" />

          {/* Damping Rubber Bushing Spacer (Black) */}
          <ellipse cx="50" cy="48" rx="20" ry="10" fill="#090d16" stroke="#1e293b" strokeWidth="2.5" />
          <ellipse cx="50" cy="44" rx="20" ry="10" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

          {/* Threaded Screw Shaft extending below */}
          <path d="M 40,52 L 40,82 A 10 5 0 0 0 60,82 L 60,52 Z" fill="url(#fst-screw)" stroke="#475569" strokeWidth="1" />

          {/* Screw Thread Spirals */}
          <path d="M 40,57 Q 50,60 60,57" stroke="#334155" strokeWidth="1.5" />
          <path d="M 40,63 Q 50,66 60,63" stroke="#334155" strokeWidth="1.5" />
          <path d="M 40,69 Q 50,72 60,69" stroke="#334155" strokeWidth="1.5" />
          <path d="M 40,75 Q 50,78 60,75" stroke="#334155" strokeWidth="1.5" />
          
          {/* Thread Highlights */}
          {animate && (
            <path d="M 40,61 Q 50,64 60,61" stroke="#f1f5f9" strokeWidth="0.8" opacity="0.6">
              <animate attributeName="opacity" values="0.1;0.9;0.1" dur="2s" repeatCount="indefinite" />
            </path>
          )}
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="50" height="50" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        </svg>
      );
  }
}
