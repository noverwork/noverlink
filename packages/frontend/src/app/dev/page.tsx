'use client';

import {
  CircularProgress,
  ConnectionBadge,
  ConnectionLoader,
  CyberCheckbox,
  CyberRadioGroup,
  CyberRadioItem,
  CyberToggle,
  DataCell,
  // Data Display
  DataGrid,
  // Buttons
  GlowButton,
  // Backgrounds
  GridBackground,
  LoadingOverlay,
  MetricCard,
  ParticleField,
  PulseBadge,
  SegmentedProgress,
  SpinnerLoader,
  StatusIndicator,
  TunnelCard,
  TunnelConnection,
  // Inputs
  TunnelInput,
  TunnelInputGroup,
  TunnelLine,
  // Loading & Progress
  TunnelLoader,
  // Tunnel Components
  TunnelNode,
  TunnelProgress,
  TunnelStats,
  TunnelTextarea,
} from '@noverlink/ui-shared';
import { Search } from 'lucide-react';
import { useState } from 'react';

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
      <h2 className="text-sm font-mono uppercase tracking-wider text-white/60 border-b border-white/10 pb-2">
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

function getStatusVariant(value: unknown): 'connected' | 'warning' | 'disconnected' {
  if (value === 'active') return 'connected';
  if (value === 'idle') return 'warning';
  return 'disconnected';
}

function getLatencyVariant(latency: number): 'success' | 'warning' | 'danger' {
  if (latency < 50) return 'success';
  if (latency < 100) return 'warning';
  return 'danger';
}

export default function DevPage() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [checkbox1, setCheckbox1] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [progress, setProgress] = useState(65);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Header - EVA Compressed Style */}
        <header className="text-center space-y-4">
          <h1 className="font-mono uppercase tracking-[0.5em] text-white text-4xl font-bold">
            NOVERLINK
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-white/20" />
            <p className="font-mono uppercase tracking-wider text-white/50 text-xs">
              Component Library Preview
            </p>
            <div className="h-px w-16 bg-white/20" />
          </div>
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
                  publicSublabel="api.noverlink.com"
                  status="connected"
                  tunnelName="api-gateway"
                  animated
                />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Connection States">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="p-4 bg-white/5 border border-white/10">
                  <TunnelConnection
                    localLabel="Connected"
                    status="connected"
                    tunnelName="active"
                    animated
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                  <TunnelConnection
                    localLabel="Connecting"
                    status="connecting"
                    tunnelName="pending"
                  />
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
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
              <TunnelNode variant="public" label="Public" sublabel=".noverlink.com" />
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
              publicUrl="api.noverlink.com"
              stats="12.4k requests"
            />
            <TunnelCard
              status="online"
              name="web-server"
              localPort={8080}
              publicUrl="app.noverlink.com"
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
              <span className="text-xs text-white/40 font-mono uppercase">TunnelLoader</span>
            </div>
            <div className="text-center space-y-2">
              <TunnelLoader size="default" />
              <span className="text-xs text-white/40 font-mono uppercase">Default</span>
            </div>
            <div className="text-center space-y-2">
              <SpinnerLoader size="lg" />
              <span className="text-xs text-white/40 font-mono uppercase">SpinnerLoader</span>
            </div>
            <div className="text-center space-y-2">
              <ConnectionLoader />
              <span className="text-xs text-white/40 font-mono uppercase">ConnectionLoader</span>
            </div>
          </div>

          <div className="mt-6">
            <GlowButton onClick={() => setShowOverlay(!showOverlay)}>
              Toggle Loading Overlay
            </GlowButton>
            <div className="mt-4 h-32 bg-white/5 border border-white/10 relative">
              <LoadingOverlay loading={showOverlay} text="Loading...">
                <div className="p-4 text-white/50">
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
              <span className="text-xs text-white/40 font-mono uppercase">Drag to change: {progress}%</span>
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
                render: (value: unknown) => (
                  <PulseBadge variant={getStatusVariant(value)} size="sm">
                    {String(value)}
                  </PulseBadge>
                ),
              },
              { key: 'traffic', header: 'Traffic', align: 'right' },
              {
                key: 'latency',
                header: 'Latency',
                align: 'right',
                render: (value: unknown) => (
                  <DataCell value={`${value}ms`} variant={getLatencyVariant(Number(value))} />
                ),
              },
            ]}
            data={sampleData}
            onRowClick={() => undefined}
          />
        </Section>

        {/* Background Effects */}
        <Section title="Background Effects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GridBackground
              color="white"
              size={24}
              opacity={0.03}
              className="h-48 border border-white/10 bg-white/5"
            >
              <div className="p-4">
                <span className="text-white font-mono uppercase tracking-wider text-sm">GridBackground</span>
                <p className="text-white/40 text-sm mt-2 font-mono">Subtle dot grid pattern</p>
              </div>
            </GridBackground>

            <div className="relative h-48 overflow-hidden border border-white/10 bg-white/5">
              <ParticleField count={30} color="rgba(0,255,0,0.3)" connected />
              <div className="relative z-10 p-4">
                <span className="text-white font-mono uppercase tracking-wider text-sm">ParticleField</span>
                <p className="text-white/40 text-sm mt-2 font-mono">Green particles with connections</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/10">
          <p className="text-white/30 text-xs font-mono uppercase tracking-wider">
            Built with React 19 + Tailwind CSS 4.1 + Radix UI
          </p>
        </footer>
      </div>
    </div>
  );
}
