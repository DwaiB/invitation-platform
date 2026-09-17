'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, MapPin, AlignLeft, User, Mail, Tag, MessageSquare, AlertCircle } from 'lucide-react';

/* =========================================================================
   Base Modal Backdrop & Container
   ========================================================================= */
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}: BaseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-50 w-full ${maxWidth} rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800/80">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   1. Edit Invitation Modal
   ========================================================================= */
export interface InvitationData {
  _id: string;
  title: string;
  type: string;
  description?: string;
  location?: string;
  eventDate?: string;
  status?: string;
}

interface EditInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: InvitationData | null;
  onSave: (updated: Partial<InvitationData>) => Promise<boolean | void>;
}

export function EditInvitationModal({
  isOpen,
  onClose,
  invitation,
  onSave,
}: EditInvitationModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('wedding');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invitation) {
      setTitle(invitation.title || '');
      setType(invitation.type || 'wedding');
      setEventDate(invitation.eventDate ? invitation.eventDate.slice(0, 10) : '');
      setLocation(invitation.location || '');
      setDescription(invitation.description || '');
      setError('');
    }
  }, [invitation, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await onSave({
        title: title.trim(),
        type,
        eventDate: eventDate || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update invitation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Invitation Details"
      subtitle="Update the core title, celebration type, main venue, and message."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Invitation Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sarah & Michael's Wedding Celebration"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Celebration Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="engagement">Engagement</option>
              <option value="party">Party</option>
              <option value="baby_shower">Baby Shower</option>
              <option value="corporate">Corporate Event</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Celebration Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Primary Location / Venue
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., The Grand Ballroom, Bengaluru"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Invitation Message / Note
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A heartfelt message welcoming your guests..."
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

/* =========================================================================
   2. Edit Event Modal
   ========================================================================= */
export interface EventItemData {
  _id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventItem: EventItemData | null;
  onSave: (eventId: string, updated: Partial<EventItemData>) => Promise<boolean | void>;
}

export function EditEventModal({
  isOpen,
  onClose,
  eventItem,
  onSave,
}: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventItem) {
      setTitle(eventItem.title || '');
      setDate(eventItem.date ? eventItem.date.slice(0, 10) : '');
      setStartTime(eventItem.startTime || '');
      setEndTime(eventItem.endTime || '');
      setLocation(eventItem.location || '');
      setDescription(eventItem.description || '');
      setError('');
    }
  }, [eventItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventItem) return;
    if (!title.trim() || !date) {
      setError('Title and date are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await onSave(eventItem._id, {
        title: title.trim(),
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event / Schedule Item"
      subtitle="Modify ceremony, party, or itinerary details."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Event Name *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Haldi & Sangeet Ceremony"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Venue / Hall Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Lotus Hall, 2nd Floor"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Description / Dress Code
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Traditional yellow attire, dinner served at 8:00 PM"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Save Event'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

/* =========================================================================
   3. Edit Guest Modal
   ========================================================================= */
export interface GuestData {
  _id: string;
  publicId?: string;
  name: string;
  email?: string;
  phone?: string;
  personalNote?: string;
  groupId?: string | null;
  status?: string;
}

export interface GroupData {
  _id: string;
  name: string;
}

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestData | null;
  groups: GroupData[];
  onSave: (guestId: string, updated: Partial<GuestData>) => Promise<boolean | void>;
}

export function EditGuestModal({
  isOpen,
  onClose,
  guest,
  groups,
  onSave,
}: EditGuestModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (guest) {
      setName(guest.name || '');
      setEmail(guest.email || '');
      setPhone(guest.phone || '');
      setGroupId(guest.groupId || '');
      setPersonalNote(guest.personalNote || '');
      setError('');
    }
  }, [guest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;
    if (!name.trim()) {
      setError('Guest name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await onSave(guest._id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        groupId: groupId || null,
        personalNote: personalNote.trim() || undefined,
      });
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update guest');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Guest Details"
      subtitle="Customize guest identity, contact info, group membership, and private note."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Guest Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dr. Marcus Vance & Family"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
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
              placeholder="+1 555-0199"
              className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Guest Group
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">Ungrouped (General)</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Personal Note (Visible only to this guest)
          </label>
          <textarea
            rows={2}
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="e.g., We reserved VIP seating for you in Row 2!"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Save Guest'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

/* =========================================================================
   4. Edit Group Modal
   ========================================================================= */
interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupData | null;
  onSave: (groupId: string, name: string) => Promise<boolean | void>;
  onDelete?: (groupId: string) => Promise<boolean | void>;
}

export function EditGroupModal({
  isOpen,
  onClose,
  group,
  onSave,
  onDelete,
}: EditGroupModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setError('');
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await onSave(group._id, name.trim());
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!group || !onDelete) return;
    if (!window.confirm(`Delete the group "${group.name}"? Guests in this group will become ungrouped.`)) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      const res = await onDelete(group._id);
      if (res !== false) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Guest Group"
      subtitle="Rename or manage group category."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bride's Close Family"
            className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          {onDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Group'}
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Group'}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
