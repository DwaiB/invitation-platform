'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Tag,
  Copy,
  Check,
  Edit3,
  Trash2,
  Sparkles,
  Search,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  EditGuestModal,
  EditGroupModal,
  GuestData,
  GroupData,
} from '@/components/dashboard/EditItemModals';

interface Invitation {
  _id: string;
  publicId: string;
  title: string;
}

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = getAccessToken();

  const [userEmail, setUserEmail] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);

  // Add guest form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('');
  const [note, setNote] = useState('');
  const [savingGuest, setSavingGuest] = useState(false);

  // Add group form
  const [newGroup, setNewGroup] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);

  // Editing state
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function loadData() {
    const [userRes, invRes, guestRes, groupRes] = await Promise.all([
      getCurrentUser(),
      fetchApi<Invitation>(`/invitations/${id}`, { token: token ?? undefined }),
      fetchApi<GuestData[]>(`/invitations/${id}/guests`, { token: token ?? undefined }),
      fetchApi<GroupData[]>(`/invitations/${id}/groups`, { token: token ?? undefined }),
    ]);

    if (userRes.success) setUserEmail(userRes.data.email ?? '');
    if (invRes.success) setInvitation(invRes.data);
    if (!guestRes.success) return setError(guestRes.error.message);

    setGuests(guestRes.data);
    if (groupRes.success) setGroups(groupRes.data);
  }

  useEffect(() => {
    if (!token) router.replace('/auth/login');
    else loadData();
  }, [id, token]);

  // Add Guest
  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingGuest(true);
    setError('');

    const response = await fetchApi<GuestData>(`/invitations/${id}/guests`, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        personalNote: note.trim() || undefined,
        groupId: groupId || null,
      }),
    });
    setSavingGuest(false);

    if (!response.success) return setError(response.error.message);

    setGuests((current) => [response.data, ...current]);
    setName('');
    setEmail('');
    setPhone('');
    setNote('');
    setGroupId('');
  }

  // Update Guest
  async function handleUpdateGuest(guestId: string, updated: Partial<GuestData>) {
    const response = await fetchApi<GuestData>(`/invitations/${id}/guests/${guestId}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify(updated),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    setGuests((current) =>
      current.map((g) => (g._id === guestId ? response.data : g)),
    );
  }

  // Remove Guest
  async function removeGuest(guestId: string, guestName: string) {
    if (!window.confirm(`Delete guest "${guestName}"?`)) return;
    const response = await fetchApi(`/invitations/${id}/guests/${guestId}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    if (!response.success) return setError(response.error.message);
    setGuests((current) => current.filter((guest) => guest._id !== guestId));
  }

  // Add Group
  async function addGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroup.trim()) return;
    setSavingGroup(true);
    setError('');

    const response = await fetchApi<GroupData>(`/invitations/${id}/groups`, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify({ name: newGroup.trim() }),
    });
    setSavingGroup(false);

    if (!response.success) return setError(response.error.message);
    setGroups((current) => [...current, response.data]);
    setNewGroup('');
  }

  // Update Group
  async function handleUpdateGroup(groupIdToUpdate: string, groupName: string) {
    const response = await fetchApi<GroupData>(`/invitations/${id}/groups/${groupIdToUpdate}`, {
      method: 'PATCH',
      token: token ?? undefined,
      body: JSON.stringify({ name: groupName }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    setGroups((current) =>
      current.map((g) => (g._id === groupIdToUpdate ? response.data : g)),
    );
  }

  // Delete Group
  async function handleDeleteGroup(groupIdToDelete: string) {
    const response = await fetchApi(`/invitations/${id}/groups/${groupIdToDelete}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    setGroups((current) => current.filter((g) => g._id !== groupIdToDelete));
    // Update any guests that were in this group
    setGuests((current) =>
      current.map((g) => (g.groupId === groupIdToDelete ? { ...g, groupId: null } : g)),
    );
  }

  // Copy Personalized Capability Link
  async function copyPersonalizedLink(guest: GuestData) {
    if (!invitation || !guest.publicId) return;
    const personalUrl = `${window.location.origin}/invite/${invitation.publicId}/guest/${guest.publicId}`;
    await navigator.clipboard.writeText(personalUrl);
    setCopiedGuestId(guest._id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  }

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.personalNote && guest.personalNote.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup =
        selectedGroupFilter === 'ALL'
          ? true
          : selectedGroupFilter === 'UNGROUPED'
            ? !guest.groupId
            : guest.groupId === selectedGroupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [guests, searchQuery, selectedGroupFilter]);

  const groupNameMap = useMemo(() => {
    return Object.fromEntries(groups.map((g) => [g._id, g.name]));
  }, [groups]);

  return (
    <DashboardShell
      userEmail={userEmail}
      breadcrumbs={[
        { label: 'Creator Studio', href: '/dashboard' },
        { label: invitation?.title || 'Invitation', href: `/dashboard/invitations/${id}` },
        { label: 'Guest List & Groups' },
      ]}
      title="Guest List & Personalization"
      subtitle="Manage invitees, organize custom groups, and generate personalized recipient links."
    >
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300 backdrop-blur-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Guest List & Filter */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="font-serif text-2xl font-bold text-white">
                Guest Directory
              </h2>
              <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {guests.length}
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, note..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Group Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedGroupFilter('ALL')}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({guests.length})
            </button>
            <button
              onClick={() => setSelectedGroupFilter('UNGROUPED')}
              className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                selectedGroupFilter === 'UNGROUPED'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Ungrouped ({guests.filter((g) => !g.groupId).length})
            </button>
            {groups.map((group) => {
              const count = guests.filter((g) => g.groupId === group._id).length;
              return (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroupFilter(group._id)}
                  className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                    selectedGroupFilter === group._id
                      ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                      : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {group.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Guests Cards */}
          {filteredGuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                {searchQuery || selectedGroupFilter !== 'ALL'
                  ? 'No matching guests found'
                  : 'No guests added yet'}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-neutral-400">
                {searchQuery || selectedGroupFilter !== 'ALL'
                  ? 'Try selecting another group filter tab or clearing your search.'
                  : 'Add guests using the panel on the right to start generating personalized invitations.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest) => {
                const groupName = guest.groupId ? groupNameMap[guest.groupId] : null;

                return (
                  <article
                    key={guest._id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-xl transition-all hover:border-neutral-700 hover:bg-neutral-900"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                          {guest.name}
                        </span>
                        {groupName && (
                          <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                            {groupName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                        {guest.email ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-neutral-500" />
                            {guest.email}
                          </span>
                        ) : (
                          <span className="text-neutral-500 italic">No email</span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-neutral-500" />
                            {guest.phone}
                          </span>
                        )}
                      </div>

                      {guest.personalNote && (
                        <div className="flex items-start gap-1.5 pt-1 text-xs text-amber-300/80">
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="italic leading-tight">
                            &ldquo;{guest.personalNote}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Copy Personalized Link, Edit Guest, Delete */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {guest.publicId && (
                        <button
                          onClick={() => copyPersonalizedLink(guest)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
                          title="Copy personalized capability link"
                        >
                          {copiedGuestId === guest._id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Personal Link</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="inline-flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all"
                        title="Edit guest details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => removeGuest(guest._id, guest.name)}
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/80 p-2 text-rose-400 hover:border-rose-900 hover:bg-rose-950/40 transition-all"
                        title="Delete guest"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Add Guest & Add/Edit Groups */}
        <aside className="space-y-6">
          {/* Add Guest Card */}
          <form
            onSubmit={addGuest}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <UserPlus className="h-5 w-5 text-amber-400" />
              <h2 className="font-serif text-xl font-bold text-white">Add New Guest</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Full Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emily Watson"
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emily@example.com"
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Guest Group
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="">Ungrouped (General)</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Personalized Note
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Private greeting message for this guest..."
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <button
              disabled={savingGuest}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-3 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              {savingGuest ? 'Adding Guest...' : '+ Add to Guest List'}
            </button>
          </form>

          {/* Manage Groups Card */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                <h2 className="font-serif text-xl font-bold text-white">Guest Groups</h2>
              </div>
              <span className="text-xs text-neutral-400">{groups.length} active</span>
            </div>

            {/* List of existing groups with Edit button */}
            {groups.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-2.5 text-xs"
                  >
                    <span className="font-medium text-neutral-200">{group.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditingGroup(group)}
                      className="rounded-lg border border-neutral-800 px-2 py-1 text-[11px] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Create new group form */}
            <form onSubmit={addGroup} className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Create New Group
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="e.g., VIP Colleagues"
                  className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={savingGroup}
                  className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all disabled:opacity-50"
                >
                  {savingGroup ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>

      {/* Edit Guest Modal */}
      <EditGuestModal
        isOpen={Boolean(editingGuest)}
        onClose={() => setEditingGuest(null)}
        guest={editingGuest}
        groups={groups}
        onSave={handleUpdateGuest}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        group={editingGroup}
        onSave={handleUpdateGroup}
        onDelete={handleDeleteGroup}
      />
    </DashboardShell>
  );
}
