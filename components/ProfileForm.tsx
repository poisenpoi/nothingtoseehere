"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, User } from "@prisma/client";
import {
  User as UserIcon,
  Calendar,
  Users,
  FileText,
  Building2,
  Globe,
  Image,
  X,
  Save,
  Loader2,
  Camera
} from "lucide-react";

type ProfileFormProps = {
  profile: Profile | null;
  user: User;
  onCancel: () => void;
};

export default function ProfileForm({ profile, user, onCancel }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    dob: profile?.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
    gender: profile?.gender || "",
    pictureUrl: profile?.pictureUrl || "",
    bio: profile?.bio || "",
    companyName: profile?.companyName || "",
    companyWebsite: profile?.companyWebsite || "",
  });

  const initials = (formData.name || user.email.split("@")[0] || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gender: formData.gender === "" ? null : formData.gender,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      router.refresh();
      onCancel();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative px-6 py-12 sm:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar with Edit Overlay */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur-md" />
                {formData.pictureUrl ? (
                  <img
                    src={formData.pictureUrl}
                    alt="Profile"
                    className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
                  />
                ) : (
                  <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-white/10 backdrop-blur-sm ring-4 ring-white/30 shadow-2xl flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-white/90">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Edit Profile
                </h1>
                <p className="mt-2 text-white/60 text-sm sm:text-base">
                  Update your personal information and company details
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-eduBlue text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-eduBlue/10 rounded-xl">
                      <UserIcon className="w-5 h-5 text-eduBlue" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Picture URL */}
                  <FormField
                    icon={<Image className="w-4 h-4" />}
                    label="Profile Picture URL"
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                  >
                    <input
                      type="text"
                      name="pictureUrl"
                      value={formData.pictureUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/your-photo.jpg"
                      className="form-input"
                    />
                  </FormField>

                  {/* Full Name */}
                  <FormField
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Full Name"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  >
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="form-input"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Date of Birth */}
                    <FormField
                      icon={<Calendar className="w-4 h-4" />}
                      label="Date of Birth"
                      iconBg="bg-purple-50"
                      iconColor="text-purple-600"
                    >
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </FormField>

                    {/* Gender */}
                    <FormField
                      icon={<Users className="w-4 h-4" />}
                      label="Gender"
                      iconBg="bg-emerald-50"
                      iconColor="text-emerald-600"
                    >
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </FormField>
                  </div>

                  {/* Bio */}
                  <FormField
                    icon={<FileText className="w-4 h-4" />}
                    label="Bio"
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                  >
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us a bit about yourself..."
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Information Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Company</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Company Name */}
                  <FormField
                    icon={<Building2 className="w-4 h-4" />}
                    label="Company Name"
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                  >
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="form-input"
                    />
                  </FormField>

                  {/* Company Website */}
                  <FormField
                    icon={<Globe className="w-4 h-4" />}
                    label="Company Website"
                    iconBg="bg-cyan-50"
                    iconColor="text-cyan-600"
                  >
                    <input
                      type="text"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      className="form-input"
                    />
                  </FormField>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6">
                <h3 className="font-semibold text-amber-900 mb-3">Profile Tips</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Use a professional profile picture
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Keep your bio concise and engaging
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Add your company details for networking
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #2269e9;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(34, 105, 233, 0.1);
        }
        .form-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </form>
  );
}

function FormField({
  icon,
  label,
  iconBg,
  iconColor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        <span className={`p-1.5 rounded-lg ${iconBg} ${iconColor}`}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
