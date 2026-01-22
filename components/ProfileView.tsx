"use client";

import { Profile, User } from "@prisma/client";
import {
  User as UserIcon,
  Calendar,
  Users,
  Building2,
  Globe,
  Pencil,
  Mail,
  Hash
} from "lucide-react";

type ProfileViewProps = {
  profile: Profile | null;
  user: User;
  onEdit: () => void;
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  colorClass?: string;
  bgClass?: string;
}

function InfoItem({ icon, label, value, colorClass = "text-eduBlue", bgClass = "bg-blue-100" }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-base text-slate-900 break-words">
          {value || <span className="text-slate-400">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

export default function ProfileView({ profile, user, onEdit }: ProfileViewProps) {
  const websiteUrl = profile?.companyWebsite
    ? profile.companyWebsite.startsWith("http")
      ? profile.companyWebsite
      : `https://${profile.companyWebsite}`
    : "#";

  const displayName = profile?.name || user.email.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profile?.pictureUrl || "/avatars/male.svg"}
            alt="Profile"
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {displayName}
            </h1>
            <p className="mt-1 text-slate-500 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            {profile?.bio && (
              <p className="mt-4 text-slate-600 max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl bg-eduBlue py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eduBlue focus:ring-offset-2 transition-all"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          </div>
          <div className="px-6 divide-y divide-slate-100">
            <InfoItem
              icon={<Hash className="w-4 h-4" />}
              label="User ID"
              value={<span className="font-mono text-sm">{user.id}</span>}
              colorClass="text-slate-600"
              bgClass="bg-slate-100"
            />
            <InfoItem
              icon={<UserIcon className="w-4 h-4" />}
              label="Full Name"
              value={profile?.name}
              colorClass="text-eduBlue"
              bgClass="bg-blue-100"
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Date of Birth"
              value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : undefined}
              colorClass="text-purple-600"
              bgClass="bg-purple-100"
            />
            <InfoItem
              icon={<Users className="w-4 h-4" />}
              label="Gender"
              value={profile?.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : undefined}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-100"
            />
          </div>
        </div>

        {/* Company Information Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Company Information</h2>
          </div>
          <div className="px-6 divide-y divide-slate-100">
            <InfoItem
              icon={<Building2 className="w-4 h-4" />}
              label="Company Name"
              value={profile?.companyName}
              colorClass="text-amber-600"
              bgClass="bg-amber-100"
            />
            <InfoItem
              icon={<Globe className="w-4 h-4" />}
              label="Company Website"
              value={
                profile?.companyWebsite ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-eduBlue hover:underline inline-flex items-center gap-1"
                  >
                    {profile.companyWebsite}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : undefined
              }
              colorClass="text-cyan-600"
              bgClass="bg-cyan-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
