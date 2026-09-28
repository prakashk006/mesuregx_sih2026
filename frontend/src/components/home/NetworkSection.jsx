import React, { useState } from 'react';
import {
  Globe2,
  Radio,
  Server,
  ShieldCheck,
  Zap,
  Activity,
  MapPin,
  X,
  CheckCircle2,
  Clock,
  Cpu,
  Layers
} from 'lucide-react';

export default function NetworkSection() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    {
      id: 'delhi',
      name: 'New Delhi National HQ',
      city: 'NEW DELHI',
      x: 260,
      y: 140,
      type: 'Central Metrological Directorate',
      status: 'ONLINE',
      connectedInstruments: 384,
      activeVerifications: 112,
      pendingInspections: 14,
      lastSync: '1 sec ago',
      ping: '12 ms',
      accuracyEvents: '99.99%',
      load: '14,200/s',
    },
    {
      id: 'mumbai',
      name: 'Mumbai Western Hub',
      city: 'MUMBAI',
      x: 190,
      y: 270,
      type: 'Port & Industrial Metrology',
      status: 'ONLINE',
      connectedInstruments: 296,
      activeVerifications: 89,
      pendingInspections: 12,
      lastSync: '2 sec ago',
      ping: '16 ms',
      accuracyEvents: '99.98%',
      load: '18,450/s',
    },
    {
      id: 'bengaluru',
      name: 'Bengaluru Tech Metrology',
      city: 'BENGALURU',
      x: 235,
      y: 380,
      type: 'Precision Digital Laboratory',
      status: 'ONLINE',
      connectedInstruments: 210,
      activeVerifications: 64,
      pendingInspections: 9,
      lastSync: '1 sec ago',
      ping: '18 ms',
      accuracyEvents: '99.99%',
      load: '9,800/s',
    },
    {
      id: 'chennai',
      name: 'Chennai Southern Hub',
      city: 'CHENNAI',
      x: 275,
      y: 395,
      type: 'Coastal Enforcement Zone',
      status: 'ONLINE',
      connectedInstruments: 128,
      activeVerifications: 42,
      pendingInspections: 7,
      lastSync: '2 sec ago',
      ping: '19 ms',
      accuracyEvents: '99.98%',
      load: '11,200/s',
    },
    {
      id: 'kolkata',
      name: 'Kolkata Eastern Hub',
      city: 'KOLKATA',
      x: 385,
      y: 225,
      type: 'Regional Standard Laboratory',
      status: 'ONLINE',
      connectedInstruments: 175,
      activeVerifications: 53,
      pendingInspections: 8,
      lastSync: '3 sec ago',
      ping: '21 ms',
      accuracyEvents: '99.97%',
      load: '8,900/s',
    },
    {
      id: 'hyderabad',
      name: 'Hyderabad Central Node',
      city: 'HYDERABAD',
      x: 255,
      y: 310,
      type: 'District Enforcement Grid',
      status: 'ONLINE',
      connectedInstruments: 194,
      activeVerifications: 58,
      pendingInspections: 6,
      lastSync: '2 sec ago',
      ping: '15 ms',
      accuracyEvents: '99.98%',
      load: '10,150/s',
    },
    {
      id: 'ahmedabad',
      name: 'Ahmedabad Trade Zone',
      city: 'AHMEDABAD',
      x: 175,
      y: 215,
      type: 'Commercial Fleet Verification',
      status: 'ONLINE',
      connectedInstruments: 162,
      activeVerifications: 47,
      pendingInspections: 5,
      lastSync: '2 sec ago',
      ping: '14 ms',
      accuracyEvents: '99.98%',
      load: '7,600/s',
    },
    {
      id: 'guwahati',
      name: 'Guwahati North-East Grid',
      city: 'GUWAHATI',
      x: 440,
      y: 165,
      type: 'Sub-Regional Enforcement Grid',
      status: 'ONLINE',
      connectedInstruments: 94,
      activeVerifications: 28,
      pendingInspections: 4,
      lastSync: '3 sec ago',
      ping: '24 ms',
      accuracyEvents: '99.96%',
      load: '4,200/s',
    },
  ];

  // Inter-node network topology connections
  const links = [
    { from: 'delhi', to: 'mumbai' },
    { from: 'delhi', to: 'ahmedabad' },
    { from: 'delhi', to: 'kolkata' },
    { from: 'delhi', to: 'guwahati' },
    { from: 'delhi', to: 'hyderabad' },
    { from: 'delhi', to: 'bengaluru' },
    { from: 'delhi', to: 'chennai' },
    { from: 'mumbai', to: 'ahmedabad' },
    { from: 'mumbai', to: 'hyderabad' },
    { from: 'hyderabad', to: 'bengaluru' },
    { from: 'bengaluru', to: 'chennai' },
    { from: 'kolkata', to: 'guwahati' },
    { from: 'kolkata', to: 'hyderabad' },
  ];

  const handleNodeClick = (nodeId, e) => {
    e?.stopPropagation?.();
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  };

  const activeNodeData = nodes.find((n) => n.id === selectedNode);
  const hoveredNodeData = nodes.find((n) => n.id === hoveredNode);

  return (
    <section
      id="network"
      style={{
        padding: '6rem 1.5rem',
        background: `radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.06), transparent 32%),
                     radial-gradient(circle at 85% 30%, rgba(234, 88, 12, 0.04), transparent 30%),
                     #F9FAFB`,
        position: 'relative',
        borderBottom: '1px solid rgba(6, 78, 59, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            style={{
              color: '#065F46',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}
          >
            NATIONAL LEGAL METROLOGY NETWORK
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              color: '#064E3B',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Sovereign Digital Grid Across India
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '1.08rem',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Unifying 36 States & Union Territories into an immutable, cryptographic legal metrology network with sub-second synchronization and tamper detection.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Interactive SVG Network Map Visual */}
          <div
            style={{
              padding: '2rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(6, 78, 59, 0.12)',
              borderRadius: '20px',
              boxShadow: '0 10px 35px rgba(15, 23, 42, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: '#64748B',
              }}
            >
              <span style={{ color: '#064E3B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Radio size={13} color="#10B981" className="animate-pulse" /> LIVE MESH TOPOLOGY
              </span>
              <span style={{ color: selectedNode ? '#064E3B' : '#64748B', fontWeight: selectedNode ? 700 : 500 }}>
                {selectedNode ? '1 Node Selected' : 'Click any node to inspect telemetry'}
              </span>
            </div>

            {/* SVG Map of India Stylized Grid */}
            <svg
              viewBox="0 0 520 500"
              style={{
                width: '100%',
                maxWidth: '460px',
                height: 'auto',
                filter: 'drop-shadow(0 4px 14px rgba(6, 78, 59, 0.08))',
                overflow: 'visible',
              }}
            >
              {/* Outer India Contour Silhouette */}
              <polygon
                points="245,45 285,60 300,95 325,120 455,140 480,170 430,225 390,220 370,260 320,320 280,450 240,430 205,370 170,300 150,220 180,180 220,130 235,70"
                fill="rgba(6, 78, 59, 0.03)"
                stroke="#0F766E"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.35"
                style={{ pointerEvents: 'none' }}
              />

              {/* Grid Lines across territory */}
              <line x1="150" y1="200" x2="450" y2="200" stroke="rgba(6, 78, 59, 0.08)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
              <line x1="180" y1="300" x2="350" y2="300" stroke="rgba(6, 78, 59, 0.08)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
              <line x1="260" y1="80" x2="260" y2="440" stroke="rgba(6, 78, 59, 0.08)" strokeWidth="1" style={{ pointerEvents: 'none' }} />

              {/* Network Links with active node highlighting and photon pulse animations */}
              {links.map((link, idx) => {
                const fromNode = nodes.find((n) => n.id === link.from);
                const toNode = nodes.find((n) => n.id === link.to);
                if (!fromNode || !toNode) return null;

                const isActiveLink =
                  selectedNode && (link.from === selectedNode || link.to === selectedNode);

                return (
                  <g key={`link-${idx}`} style={{ pointerEvents: 'none' }}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActiveLink ? '#064E3B' : 'rgba(6, 78, 59, 0.18)'}
                      strokeWidth={isActiveLink ? 2.5 : 1.2}
                      strokeDasharray={isActiveLink ? 'none' : '3 3'}
                      style={{
                        transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                      }}
                    />

                    {/* Animated Photon Pulse along active connection */}
                    {isActiveLink && (
                      <circle r="3" fill="#EA580C" filter="drop-shadow(0 0 6px #EA580C)">
                        <animateMotion
                          path={`M ${fromNode.x},${fromNode.y} L ${toNode.x},${toNode.y}`}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Interactive Node Markers with 48px hit areas */}
              {nodes.map((n) => {
                const isSelected = selectedNode === n.id;
                const isHovered = hoveredNode === n.id;

                return (
                  <g
                    key={n.id}
                    onClick={(e) => handleNodeClick(n.id, e)}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.name}. Click to inspect telemetry`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(n.id, e);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {/* Large Invisible Hit Area for effortless clicking */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="24"
                      fill="transparent"
                      style={{ pointerEvents: 'all' }}
                    />

                    {/* Outer animated radar pulse ring when selected */}
                    {isSelected && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r="20"
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="2"
                        opacity="0.35"
                        className="animate-radar-pulse"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Outer hover ring */}
                    {isHovered && !isSelected && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r="15"
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Visual Node Core with smooth scale and subtle government glow */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={
                        n.id === 'delhi'
                          ? isSelected || isHovered
                            ? 12
                            : 9
                          : isSelected || isHovered
                          ? 9
                          : 6.5
                      }
                      fill={isSelected ? '#EA580C' : isHovered ? '#0F766E' : '#064E3B'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      style={{
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: isSelected
                          ? 'drop-shadow(0 2px 8px rgba(234, 88, 12, 0.45))'
                          : isHovered
                          ? 'drop-shadow(0 2px 6px rgba(15, 118, 110, 0.35))'
                          : 'drop-shadow(0 2px 4px rgba(6, 78, 59, 0.25))',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* City Name Label */}
                    <text
                      x={n.x}
                      y={n.y - 13}
                      textAnchor="middle"
                      fill={isSelected ? '#064E3B' : isHovered ? '#064E3B' : '#334155'}
                      fontSize={isSelected || isHovered ? '11' : '10'}
                      fontWeight={isSelected || isHovered ? '800' : '600'}
                      fontFamily="Outfit, sans-serif"
                      style={{
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {n.city}
                    </text>
                  </g>
                );
              })}

              {/* Hover Tooltip Overlay */}
              {hoveredNodeData && (
                <g
                  transform={`translate(${hoveredNodeData.x}, ${hoveredNodeData.y - 34})`}
                  style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }}
                >
                  <rect
                    x="-65"
                    y="-26"
                    width="130"
                    height="30"
                    rx="6"
                    fill="rgba(255, 255, 255, 0.96)"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))"
                  />
                  <polygon points="-5,4 5,4 0,9" fill="#10B981" />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="#064E3B"
                    fontSize="9"
                    fontWeight="800"
                    letterSpacing="0.08em"
                  >
                    {hoveredNodeData.city}
                  </text>
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="7.5"
                    fontWeight="600"
                  >
                    Click to inspect telemetry
                  </text>
                </g>
              )}
            </svg>

            {/* Quick city selector pills underneath map */}
            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '1.25rem',
                width: '100%',
              }}
            >
              {nodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNode((prev) => (prev === n.id ? null : n.id))}
                  style={{
                    background: selectedNode === n.id ? '#064E3B' : '#FFFFFF',
                    border: `1px solid ${selectedNode === n.id ? '#064E3B' : '#CBD5E1'}`,
                    color: selectedNode === n.id ? '#FFFFFF' : '#064E3B',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNode !== n.id) {
                      e.currentTarget.style.background = '#ECFDF5';
                      e.currentTarget.style.borderColor = '#10B981';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNode !== n.id) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                >
                  {n.city}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Network HUD & Telemetry Status Details */}
          <div>
            {/* Active Selected Node Card OR Default Mesh Overview */}
            {activeNodeData ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(6, 78, 59, 0.12)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
                  padding: '1.75rem',
                  marginBottom: '1.75rem',
                  animation: 'm3d-telemetry-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
              >
                {/* Header with Close Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#0F766E',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Activity size={12} color="#10B981" /> REGIONAL VERIFICATION HUB
                    </div>
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#064E3B',
                        margin: '4px 0',
                      }}
                    >
                      {activeNodeData.city}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {activeNodeData.type}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#047857',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ● {activeNodeData.status}
                    </div>

                    {/* Close Telemetry Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedNode(null)}
                      title="Close Telemetry"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#DC2626';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <X size={13} />
                      <span>Close</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Metrics Grid matching User Specification */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.85rem',
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      Connected Instruments
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B' }}>
                      {activeNodeData.connectedInstruments}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      Active Verifications
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>
                      {activeNodeData.activeVerifications}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      Pending Inspections
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EA580C' }}>
                      {activeNodeData.pendingInspections}
                    </div>
                  </div>
                </div>

                {/* Secondary Telemetry Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.85rem',
                    fontSize: '0.72rem',
                    color: '#64748B',
                  }}
                >
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem' }}>Network Latency</span>
                    <strong style={{ color: '#064E3B', fontSize: '0.95rem' }}>
                      {activeNodeData.ping}
                    </strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem' }}>Accuracy Events</span>
                    <strong style={{ color: '#10B981', fontSize: '0.95rem' }}>
                      {activeNodeData.accuracyEvents}
                    </strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem' }}>Last Sync</span>
                    <strong style={{ color: '#111827', fontSize: '0.95rem' }}>
                      {activeNodeData.lastSync}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Topology Overview when no node is selected */
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(6, 78, 59, 0.12)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
                  padding: '1.75rem',
                  marginBottom: '1.75rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.72rem',
                    color: '#0F766E',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Layers size={13} color="#10B981" /> NATIONAL MESH TELEMETRY
                </div>
                <h3
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#064E3B',
                    marginBottom: '0.5rem',
                  }}
                >
                  Select a Node to Inspect
                </h3>
                <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Click on any of the 8 regional hubs across India to examine live legal metrology throughput, connected weighing instruments, accuracy tolerance events, and synchronization latency.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#047857',
                    background: '#ECFDF5',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #A7F3D0',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>8 Regional Mesh Centers Online & Synced</span>
                </div>
              </div>
            )}

            {/* Sovereign 4-Pillar Grid Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
              }}
            >
              {[
                { title: 'States / UTs', val: '36 Covered', sub: 'All Indian Jurisdictions', valColor: '#064E3B' },
                { title: 'Connected Officers', val: '4,850+ Active', sub: 'Field Verification Staff', valColor: '#10B981' },
                { title: 'Verified Instruments', val: '1.2M+ Enrolled', sub: 'OIML Compliant Scales', valColor: '#EA580C' },
                { title: 'Digital Certificates', val: '98,720+ Minted', sub: 'Tamper-Evident QR', valColor: '#2563EB' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.25rem 1rem',
                    background: 'rgba(255, 255, 255, 0.82)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.valColor, margin: '3px 0' }}>
                    {item.val}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes m3d-telemetry-in {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
