'use client';

import { useState } from 'react';
import {
  // Buttons
  GlowButton,
  // Inputs
  TunnelInput,
  TunnelTextarea,
  TunnelInputGroup,
  CyberToggle,
  CyberCheckbox,
  CyberRadioGroup,
  CyberRadioItem,
  // Data Display
  DataGrid,
  DataCell,
  PulseBadge,
  StatusIndicator,
  ConnectionBadge,
  // Loading & Progress
  TunnelLoader,
  SpinnerLoader,
  ConnectionLoader,
  LoadingOverlay,
  TunnelProgress,
  SegmentedProgress,
  CircularProgress,
  // Backgrounds
  GridBackground,
  ParticleField,
  // Tunnel Components
  TunnelNode,
  TunnelLine,
  TunnelConnection,
  TunnelCard,
  MetricCard,
  TunnelStats,
} from '@noverlink/ui-shared';
import { Search } from 'lucide-react';

type TableRow = {
  id: string;
  name: string;
  status: string;
  traffic: string;
  latency: number;
};

const sampleData: TableRow[] = [
  { id: 'tun-001', name: 'api-gateway', status: 'active', traffic: '1.2 GB', latency: 12 },
  { id: 'tun-002', name: 'web-server', status: 'active', traffic: '856 MB', latency: 24 },
  { id: 'tun-003', name: 'db-replica', status: 'idle', traffic: '124 MB', latency: 45 },
  { id: 'tun-004', name: 'cache-node', status: 'error', traffic: '0 B', latency: 999 },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-teal-400 uppercase tracking-wider border-b border-teal-500/20 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ComponentGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</h3>
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </div>
  );
}

export default function DevPage() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [checkbox1, setCheckbox1] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [progress, setProgress] = useState(65);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            NOVERLINK <span className="text-teal-400">UI</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">
            Component Library Preview — Design C
          </p>
        </header>

        {/* Tunnel Visualization */}
        <Section title="Tunnel Visualization">
          <div className="space-y-8">
            <ComponentGroup label="TunnelConnection (Complete)">
              <div className="w-full max-w-2xl">
                <TunnelConnection
                  localLabel="Local"
                  localSublabel=":3000"
                  publicLabel="Public"
                  publicSublabel="api.nover.link"
                  status="connected"
                  tunnelName="api-gateway"
                  animated
                />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Connection States">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <TunnelConnection
                    localLabel="Connected"
                    status="connected"
                    tunnelName="active"
                    animated
                  />
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <TunnelConnection
                    localLabel="Connecting"
                    status="connecting"
                    tunnelName="pending"
                  />
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <TunnelConnection
                    localLabel="Disconnected"
                    status="disconnected"
                    tunnelName="offline"
                  />
                </div>
              </div>
            </ComponentGroup>

            <ComponentGroup label="TunnelNode Variants">
              <TunnelNode variant="local" label="Local" sublabel=":3000" />
              <TunnelNode variant="public" label="Public" sublabel=".nover.link" />
              <TunnelNode variant="relay" label="Relay" sublabel="edge-01" />
            </ComponentGroup>

            <ComponentGroup label="TunnelLine">
              <div className="w-64">
                <TunnelLine status="connected" animated label="tunnel-xyz" />
              </div>
              <div className="w-64">
                <TunnelLine status="connecting" />
              </div>
              <div className="w-64">
                <TunnelLine status="disconnected" />
              </div>
            </ComponentGroup>
          </div>
        </Section>

        {/* Tunnel Cards */}
        <Section title="Tunnel Cards">
          <div className="space-y-4">
            <TunnelCard
              status="online"
              name="api-gateway"
              localPort={3000}
              publicUrl="api.nover.link"
              stats="12.4k requests"
            />
            <TunnelCard
              status="online"
              name="web-server"
              localPort={8080}
              publicUrl="app.nover.link"
              stats="8.2k requests"
            />
            <TunnelCard
              status="offline"
              name="db-admin"
              localPort={5432}
              stats="Offline"
            />
            <TunnelCard
              status="error"
              name="failed-tunnel"
              localPort={9000}
              stats="Connection failed"
            />
          </div>

          <ComponentGroup label="Tunnel Stats">
            <div className="w-full">
              <TunnelStats
                requests="45.2k"
                bandwidth="12.4 GB"
                latency="23ms"
                uptime="99.9%"
              />
            </div>
          </ComponentGroup>

          <ComponentGroup label="Metric Cards">
            <MetricCard value="23ms" label="Latency" sublabel="avg" />
            <MetricCard value="99.9%" label="Uptime" trend="up" />
            <MetricCard value="1.2k" label="Requests" sublabel="/min" trend="up" />
            <MetricCard value="45" label="Errors" sublabel="today" trend="down" />
          </ComponentGroup>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <ComponentGroup label="GlowButton Variants">
            <GlowButton variant="primary">Primary</GlowButton>
            <GlowButton variant="secondary">Secondary</GlowButton>
            <GlowButton variant="ghost">Ghost</GlowButton>
          </ComponentGroup>

          <ComponentGroup label="Sizes">
            <GlowButton size="sm">Small</GlowButton>
            <GlowButton size="default">Default</GlowButton>
            <GlowButton size="lg">Large</GlowButton>
            <GlowButton size="xl">Extra Large</GlowButton>
          </ComponentGroup>

          <ComponentGroup label="States">
            <GlowButton loading>Loading</GlowButton>
            <GlowButton disabled>Disabled</GlowButton>
            <GlowButton rounded="full">Rounded Full</GlowButton>
          </ComponentGroup>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TunnelInputGroup label="Default Input">
              <TunnelInput placeholder="Enter text..." />
            </TunnelInputGroup>

            <TunnelInputGroup label="With Icon">
              <TunnelInput
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
              />
            </TunnelInputGroup>

            <TunnelInputGroup label="Monospace (URL/Port)">
              <TunnelInput placeholder="localhost:3000" mono />
            </TunnelInputGroup>

            <TunnelInputGroup label="With Error">
              <TunnelInput
                placeholder="Email"
                error="Invalid email format"
              />
            </TunnelInputGroup>
          </div>

          <TunnelInputGroup label="Textarea">
            <TunnelTextarea
              placeholder="Enter your message..."
              className="max-w-md"
            />
          </TunnelInputGroup>
        </Section>

        {/* Toggles & Checkboxes */}
        <Section title="Toggles & Controls">
          <div className="flex flex-wrap gap-8">
            <CyberToggle
              checked={toggle1}
              onCheckedChange={setToggle1}
              label="Toggle"
              description="Enable feature"
            />

            <CyberToggle
              checked={toggle2}
              onCheckedChange={setToggle2}
              label="Active Toggle"
            />

            <CyberToggle size="sm" label="Small" />
            <CyberToggle size="lg" label="Large" />
          </div>

          <div className="flex flex-wrap gap-6 mt-4">
            <CyberCheckbox
              checked={checkbox1}
              onCheckedChange={setCheckbox1}
              label="Accept terms"
            />
            <CyberCheckbox label="Newsletter" defaultChecked />
            <CyberCheckbox label="Remember me" />
          </div>

          <div className="mt-4">
            <CyberRadioGroup
              value={radioValue}
              onValueChange={setRadioValue}
            >
              <CyberRadioItem value="option1" label="Option One" />
              <CyberRadioItem value="option2" label="Option Two" />
              <CyberRadioItem value="option3" label="Option Three" />
            </CyberRadioGroup>
          </div>
        </Section>

        {/* Badges & Status */}
        <Section title="Badges & Status">
          <ComponentGroup label="PulseBadge">
            <PulseBadge variant="connected">Connected</PulseBadge>
            <PulseBadge variant="disconnected">Disconnected</PulseBadge>
            <PulseBadge variant="warning">Warning</PulseBadge>
            <PulseBadge variant="info">Info</PulseBadge>
            <PulseBadge variant="processing">Processing</PulseBadge>
          </ComponentGroup>

          <ComponentGroup label="Appearances">
            <PulseBadge variant="connected" appearance="dot">Dot Style</PulseBadge>
            <PulseBadge variant="info" appearance="pill">Pill Style</PulseBadge>
            <PulseBadge variant="warning" appearance="tag">Tag Style</PulseBadge>
          </ComponentGroup>

          <ComponentGroup label="StatusIndicator">
            <StatusIndicator status="connected" />
            <StatusIndicator status="disconnected" />
            <StatusIndicator status="idle" />
            <StatusIndicator status="busy" />
          </ComponentGroup>

          <ComponentGroup label="ConnectionBadge">
            <ConnectionBadge connected latency={23} />
            <ConnectionBadge connected latency={120} />
            <ConnectionBadge connected={false} />
          </ComponentGroup>
        </Section>

        {/* Loaders */}
        <Section title="Loaders">
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-center space-y-2">
              <TunnelLoader size="lg" />
              <span className="text-xs text-slate-400">TunnelLoader</span>
            </div>
            <div className="text-center space-y-2">
              <TunnelLoader size="default" />
              <span className="text-xs text-slate-400">Default</span>
            </div>
            <div className="text-center space-y-2">
              <SpinnerLoader size="lg" />
              <span className="text-xs text-slate-400">SpinnerLoader</span>
            </div>
            <div className="text-center space-y-2">
              <ConnectionLoader />
              <span className="text-xs text-slate-400">ConnectionLoader</span>
            </div>
          </div>

          <div className="mt-6">
            <GlowButton onClick={() => setShowOverlay(!showOverlay)}>
              Toggle Loading Overlay
            </GlowButton>
            <div className="mt-4 h-32 bg-slate-900/50 rounded-lg relative">
              <LoadingOverlay loading={showOverlay} text="Loading...">
                <div className="p-4 text-slate-400">
                  Content behind the overlay
                </div>
              </LoadingOverlay>
            </div>
          </div>
        </Section>

        {/* Progress */}
        <Section title="Progress">
          <div className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-slate-400">Drag to change: {progress}%</span>
            </div>

            <TunnelProgress value={progress} showValue />
            <TunnelProgress value={progress} size="sm" />
            <TunnelProgress value={progress} size="lg" />
            <TunnelProgress value={0} indeterminate />

            <SegmentedProgress value={progress} segments={10} />

            <div className="flex gap-6 pt-4">
              <CircularProgress value={progress} size="sm" />
              <CircularProgress value={progress} />
              <CircularProgress value={progress} size="lg" />
            </div>
          </div>
        </Section>

        {/* Data Grid */}
        <Section title="Data Grid">
          <DataGrid
            columns={[
              { key: 'id', header: 'ID', width: '100px' },
              { key: 'name', header: 'Tunnel Name' },
              {
                key: 'status',
                header: 'Status',
                render: (value) => (
                  <PulseBadge
                    variant={
                      value === 'active' ? 'connected' :
                      value === 'idle' ? 'warning' : 'disconnected'
                    }
                    size="sm"
                  >
                    {String(value)}
                  </PulseBadge>
                ),
              },
              { key: 'traffic', header: 'Traffic', align: 'right' },
              {
                key: 'latency',
                header: 'Latency',
                align: 'right',
                render: (value) => (
                  <DataCell
                    value={`${value}ms`}
                    variant={
                      Number(value) < 50 ? 'success' :
                      Number(value) < 100 ? 'warning' : 'danger'
                    }
                  />
                ),
              },
            ]}
            data={sampleData}
            onRowClick={(row) => console.log('Clicked:', row)}
          />
        </Section>

        {/* Background Effects */}
        <Section title="Background Effects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GridBackground
              color="white"
              size={24}
              opacity={0.03}
              className="h-48 rounded-lg border border-white/10 bg-slate-900"
            >
              <div className="p-4">
                <span className="text-white font-mono">GridBackground</span>
                <p className="text-slate-400 text-sm mt-2">Subtle dot grid pattern</p>
              </div>
            </GridBackground>

            <div className="relative h-48 rounded-lg overflow-hidden border border-white/10 bg-slate-900">
              <ParticleField count={30} color="rgba(20,184,166,0.3)" connected />
              <div className="relative z-10 p-4">
                <span className="text-white font-mono">ParticleField</span>
                <p className="text-slate-400 text-sm mt-2">Teal particles with connections</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm font-mono">
            Built with React 19 + Tailwind CSS 4.1 + Radix UI
          </p>
        </footer>
      </div>
    </div>
  );
}
