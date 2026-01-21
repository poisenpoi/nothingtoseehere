"use client";

import { Profile, User } from "@prisma/client";

type ProfileViewProps = {
  profile: Profile | null;
  user: User;
  onEdit: () => void;
};

export default function ProfileView({ profile, user, onEdit }: ProfileViewProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Profile Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and company information.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex justify-center rounded-md border border-transparent bg-eduBlue py-2 px-4 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eduBlue focus:ring-offset-2"
        >
          Edit Profile
        </button>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Picture</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <img
                src={profile?.pictureUrl || "/avatars/male.svg"}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border"
              />
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">
              {user.id}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {profile?.name || "-"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {profile?.dob ? new Date(profile.dob).toLocaleDateString() : "-"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {profile?.gender || "-"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
              {profile?.bio || "-"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {profile?.companyName || "-"}
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Company Website</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {profile?.companyWebsite ? (
                <a 
                  href={profile.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-eduBlue hover:underline"
                >
                  {profile.companyWebsite}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}