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
  FileText,
  MapPin,
  Sparkles
} from "lucide-react";

type ProfileViewProps = {
  profile: Profile | null;
  user: User;
  onEdit: () => void;
};

export default function ProfileView({ profile, user, onEdit }: ProfileViewProps) {
  const websiteUrl = profile?.companyWebsite
    ? profile.companyWebsite.startsWith("http")
      ? profile.companyWebsite
      : `https://${profile.companyWebsite}`
    : "#";

  const displayName = profile?.name || user.email.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return null;
    return gender.charAt(0) + gender.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-eduBlue via-blue-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative px-6 py-16 sm:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                {profile?.pictureUrl ? (
                  <img
                    src={profile.pictureUrl}
                    alt="Profile"
                    className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
                  />
                ) : (
                  <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white/10 backdrop-blur-sm ring-4 ring-white/30 shadow-2xl flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold text-white/90">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Name & Email */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{user.email}</span>
                </div>
                {profile?.bio && (
                  <p className="mt-4 text-white/70 text-sm sm:text-base max-w-lg line-clamp-2">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-3 bg-white text-eduBlue font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-eduBlue/10 rounded-xl">
                      <UserIcon className="w-5 h-5 text-eduBlue" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Personal Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem
                      icon={<UserIcon className="w-4 h-4" />}
                      label="Full Name"
                      value={profile?.name}
                      iconBg="bg-blue-50"
                      iconColor="text-blue-600"
                    />
                    <DetailItem
                      icon={<Calendar className="w-4 h-4" />}
                      label="Date of Birth"
                      value={formatDate(profile?.dob)}
                      iconBg="bg-purple-50"
                      iconColor="text-purple-600"
                    />
                    <DetailItem
                      icon={<Users className="w-4 h-4" />}
                      label="Gender"
                      value={formatGender(profile?.gender)}
                      iconBg="bg-emerald-50"
                      iconColor="text-emerald-600"
                    />
                    <DetailItem
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      value={user.email}
                      iconBg="bg-rose-50"
                      iconColor="text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Card */}
              {profile?.bio && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-xl">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Company</h2>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Company Name
                    </p>
                    <p className="text-slate-900 font-medium">
                      {profile?.companyName || (
                        <span className="text-slate-400 font-normal">Not specified</span>
                      )}
                    </p>
                  </div>
                  {profile?.companyWebsite && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Website
                      </p>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-eduBlue hover:text-blue-700 font-medium transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        {profile.companyWebsite}
                        <svg
                          className="w-3 h-3 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                  {!profile?.companyName && !profile?.companyWebsite && (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No company info added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-gradient-to-br from-eduBlue to-indigo-600 rounded-3xl shadow-lg overflow-hidden text-white">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-white/80" />
                    <h3 className="font-semibold">Profile Completion</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Progress</span>
                      <span className="font-medium">{calculateCompletion(profile)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${calculateCompletion(profile)}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 mt-2">
                      Complete your profile to help others learn more about you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor} shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-900 mt-0.5 truncate">
          {value || <span className="text-slate-400">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function calculateCompletion(profile: Profile | null): number {
  if (!profile) return 10;
  const fields = [
    profile.name,
    profile.dob,
    profile.gender,
    profile.pictureUrl,
    profile.bio,
    profile.companyName,
    profile.companyWebsite,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
