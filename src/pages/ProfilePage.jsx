import React from 'react';
import ProfileDetails from '../components/browse/ProfileDetails';

const ProfilePage = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>
      </div>

      <ProfileDetails />
    </div>
  );
};

export default ProfilePage; 