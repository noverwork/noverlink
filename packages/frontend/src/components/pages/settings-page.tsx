'use client';

import { GlowButton, PulseBadge } from '@noverlink/ui-shared';
import { useState } from 'react';

import { DashboardLayout } from '../dashboard-layout';

// Mock data
const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Development',
    prefix: 'nv_dev_',
    lastUsed: '2 hours ago',
    createdAt: '2024-01-10',
  },
  {
    id: 'key_2',
    name: 'Production',
    prefix: 'nv_prod_',
    lastUsed: 'Never',
    createdAt: '2024-01-15',
  },
];

export function SettingsPage() {
  const [apiKeys] = useState(mockApiKeys);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue] = useState('nv_dev_sk_abc123xyz789...');

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Settings
        </h2>
        <p className="text-slate-400 mt-1">
          Manage your API keys and account settings
        </p>
      </div>

      {/* API Keys Section */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">API Keys</h3>
            <p className="text-sm text-slate-400 mt-1">
              Use these keys to authenticate the CLI
            </p>
          </div>
          <GlowButton size="sm" onClick={() => setShowNewKey(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Key
          </GlowButton>
        </div>

        {/* New key display */}
        {showNewKey && (
          <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <KeyIcon className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-teal-300 mb-1">
                  New API Key Created
                </div>
                <p className="text-xs text-teal-400/70 mb-3">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded bg-slate-950 font-mono text-sm text-white">
                    {newKeyValue}
                  </code>
                  <CopyButton text={newKeyValue} />
                </div>
              </div>
              <button
                onClick={() => setShowNewKey(false)}
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Key list */}
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                  <KeyIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{key.name}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono">{key.prefix}••••••••</span>
                    <span>•</span>
                    <span>Last used: {key.lastUsed}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GlowButton variant="ghost" size="sm">
                  <TrashIcon className="w-4 h-4 text-slate-400" />
                </GlowButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLI Setup */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">CLI Setup</h3>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-400 mb-2">1. Install the CLI</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-lg bg-slate-950 font-mono text-sm text-teal-400">
                cargo install noverlink
              </code>
              <CopyButton text="cargo install noverlink" />
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">
              2. Configure your API key
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-lg bg-slate-950 font-mono text-sm text-slate-300">
                noverlink auth login
              </code>
              <CopyButton text="noverlink auth login" />
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">
              3. Start a tunnel
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-lg bg-slate-950 font-mono text-sm text-slate-300">
                noverlink http 3000
              </code>
              <CopyButton text="noverlink http 3000" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-lg font-medium text-white mb-4">Account</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <div className="text-sm font-medium text-white">Email</div>
              <div className="text-sm text-slate-400">user@example.com</div>
            </div>
            <GlowButton variant="ghost" size="sm">
              Change
            </GlowButton>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <div className="text-sm font-medium text-white">Current Plan</div>
              <div className="flex items-center gap-2 mt-1">
                <PulseBadge variant="connected" appearance="pill" pulse={false}>
                  Free
                </PulseBadge>
                <span className="text-xs text-slate-500">
                  1 tunnel, 1 GB/month
                </span>
              </div>
            </div>
            <GlowButton variant="secondary" size="sm">
              Upgrade
            </GlowButton>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-rose-400">
                Delete Account
              </div>
              <div className="text-xs text-slate-500">
                Permanently delete your account and all data
              </div>
            </div>
            <GlowButton variant="ghost" size="sm">
              <TrashIcon className="w-4 h-4 text-rose-400" />
            </GlowButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
      title="Copy to clipboard"
    >
      <CopyIcon className="w-4 h-4 text-slate-400" />
    </button>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
