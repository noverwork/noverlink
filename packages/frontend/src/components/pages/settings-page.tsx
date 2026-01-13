'use client';

import { GlowButton, PulseBadge } from '@noverlink/ui-shared';
import { useEffect, useState } from 'react';

import { useProfile, useUpdateProfile } from '@/lib/hooks';

import { DashboardLayout } from '../dashboard-layout';

export function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (profile) {
      setEditData({ name: profile.name, email: profile.email });
    }
  }, [profile]);

  const handleSave = () => {
    const updates: { name?: string; email?: string } = {};

    if (editData.name !== profile?.name) {
      updates.name = editData.name;
    }
    if (editData.email !== profile?.email) {
      updates.email = editData.email;
    }

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates, {
        onSuccess: () => setIsEditing(false),
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({ name: profile.name, email: profile.email });
    }
    setIsEditing(false);
  };

  const formatPlan = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00ff00] border-t-transparent animate-spin" />
            <div className="text-white/40 text-sm font-mono uppercase tracking-wider">Loading settings...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center text-white/40 font-mono uppercase tracking-wider">
          Failed to load profile. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2
          className="text-3xl text-white uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.7) scaleX(0.85)',
            transformOrigin: 'left',
            letterSpacing: '0.05em',
          }}
        >
          Settings
        </h2>
        <p
          className="text-white/50 mt-2 text-xs"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Manage your account settings
        </p>
      </div>

      {/* CLI Setup */}
      <div className="p-6 bg-[#111] border border-white/10 mb-6">
        <h3
          className="text-xl text-white mb-4 uppercase"
          style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontWeight: 900,
            transform: 'scaleY(0.75) scaleX(0.9)',
            transformOrigin: 'left',
            letterSpacing: '0.03em',
          }}
        >
          CLI Setup
        </h3>

        <div className="space-y-4">
          <div>
            <div
              className="text-[0.65rem] text-white/40 mb-2"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              1. Install the CLI
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-black border border-white/10 font-mono text-sm">
                <div className="text-[#00ff00]">brew tap noverwork/noverlink</div>
                <div className="text-white/60 mt-1">brew install noverlink</div>
              </div>
              <CopyButton text="brew tap noverwork/noverlink && brew install noverlink" />
            </div>
          </div>

          <div>
            <div
              className="text-[0.65rem] text-white/40 mb-2"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              2. Login to your account
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-black border border-white/10 font-mono text-sm text-white/60">
                noverlink login
              </code>
              <CopyButton text="noverlink login" />
            </div>
          </div>

          <div>
            <div
              className="text-[0.65rem] text-white/40 mb-2"
              style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              3. Start a tunnel
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-black border border-white/10 font-mono text-sm text-white/60">
                noverlink http 3000
              </code>
              <CopyButton text="noverlink http 3000" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-6 bg-[#111] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl text-white uppercase"
            style={{
              fontFamily: "'Times New Roman', Georgia, serif",
              fontWeight: 900,
              transform: 'scaleY(0.75) scaleX(0.9)',
              transformOrigin: 'left',
              letterSpacing: '0.03em',
            }}
          >
            Account
          </h3>
          {!isEditing && (
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </GlowButton>
          )}
        </div>

        <div className="space-y-4">
          {/* Name Field */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex-1">
              <div
                className="text-xs text-white"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="mt-1 w-full max-w-xs px-3 py-2 bg-black border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                />
              ) : (
                <div className="text-sm text-white/40">{profile.name}</div>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex-1">
              <div
                className="text-xs text-white"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Email
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="mt-1 w-full max-w-xs px-3 py-2 bg-black border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
                />
              ) : (
                <div className="text-sm text-white/40 font-mono">
                  {profile.email}
                </div>
              )}
            </div>
          </div>

          {/* Current Plan */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
              <div
                className="text-xs text-white"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Current Plan
              </div>
              <div className="flex items-center gap-2 mt-1">
                <PulseBadge variant="connected" appearance="pill" pulse={false}>
                  {formatPlan(profile.plan)}
                </PulseBadge>
                <span className="text-xs text-white/40 font-mono">
                  {profile.maxTunnels} tunnel{profile.maxTunnels !== 1 ? 's' : ''}
                  , {(profile.maxBandwidthMb / 1000).toFixed(0)} GB/month
                </span>
              </div>
            </div>
            <GlowButton variant="secondary" size="sm">
              Upgrade
            </GlowButton>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 pt-2">
              <GlowButton
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={updateMutation.isPending}
              >
                Save Changes
              </GlowButton>
              <GlowButton
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Cancel
              </GlowButton>
            </div>
          )}

          {/* Error message */}
          {updateMutation.error && (
            <p className="text-sm text-[#ff0000] font-mono">
              {updateMutation.error.message}
            </p>
          )}

          {/* Delete Account */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div
                className="text-xs text-[#ff0000]"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Delete Account
              </div>
              <div
                className="text-[0.65rem] text-white/40 mt-1"
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: '0.1em',
                }}
              >
                Permanently delete your account and all data
              </div>
            </div>
            <GlowButton variant="ghost" size="sm">
              <TrashIcon className="w-4 h-4 text-[#ff0000]" />
            </GlowButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-white/5 transition-colors border border-white/10"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4 text-[#00ff00]" />
      ) : (
        <CopyIcon className="w-4 h-4 text-white/40" />
      )}
    </button>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
