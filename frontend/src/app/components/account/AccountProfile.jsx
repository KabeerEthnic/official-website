import { useState } from 'react';

import { auth } from '../../../lib/api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

export function AccountProfile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [profileStatus, setProfileStatus] = useState({ state: 'idle', message: '' });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ state: 'idle', message: '' });

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileStatus({ state: 'saving', message: '' });

    try {
      setUser(await auth.updateProfile(profile));
      setProfileStatus({ state: 'done', message: 'Profile updated.' });
    } catch (error) {
      setProfileStatus({ state: 'error', message: error.message });
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordStatus({ state: 'saving', message: '' });

    try {
      await auth.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPasswordStatus({
        state: 'done',
        message: 'Password changed. Other devices have been signed out.',
      });
    } catch (error) {
      setPasswordStatus({ state: 'error', message: error.message });
    }
  };

  const statusClass = (state) => (state === 'error' ? 'text-[#E89B3C]' : 'text-green-300');

  return (
    <div>
      <h2 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Profile Details</h2>

      <form onSubmit={saveProfile} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="profile-name" className="block text-white/70 text-sm mb-2">Name</label>
          <input
            id="profile-name"
            required
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="block text-white/70 text-sm mb-2">Phone</label>
          <input
            id="profile-phone"
            value={profile.phone}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">Email</label>
          <p className="text-white/50 text-sm">{user?.email}</p>
        </div>

        {profileStatus.message ? (
          <p className={`text-sm ${statusClass(profileStatus.state)}`} role="status">{profileStatus.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={profileStatus.state === 'saving'}
          className="bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all disabled:opacity-60"
        >
          {profileStatus.state === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-4 max-w-md mt-12 border-t border-white/10 pt-8">
        <h3 className="text-lg text-white">Change password</h3>

        <div>
          <label htmlFor="current-password" className="block text-white/70 text-sm mb-2">Current password</label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-white/70 text-sm mb-2">New password</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
            className={FIELD_CLASS}
          />
          <p className="text-xs text-white/40 mt-2">At least 10 characters.</p>
        </div>

        {passwordStatus.message ? (
          <p className={`text-sm ${statusClass(passwordStatus.state)}`} role="status">{passwordStatus.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={passwordStatus.state === 'saving'}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-full transition-all disabled:opacity-60"
        >
          {passwordStatus.state === 'saving' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
