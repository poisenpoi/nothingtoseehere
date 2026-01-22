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
  Save
} from "lucide-react";

type ProfileFormProps = {
  profile: Profile | null;
  user: User;
  onCancel: () => void;
};

interface FormFieldProps {
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
  bgClass?: string;
  children: React.ReactNode;
}

function FormField({ icon, label, colorClass = "text-eduBlue", bgClass = "bg-blue-100", children }: FormFieldProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

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
            gender: formData.gender === "" ? null : formData.gender
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

  const inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-eduBlue focus:ring-2 focus:ring-eduBlue/20 focus:outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={formData.pictureUrl || "/avatars/male.svg"}
              alt="Profile"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Edit Profile
            </h1>
            <p className="mt-1 text-slate-500">
              Update your personal and company information
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-eduBlue py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eduBlue focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          </div>
          <div className="px-6 divide-y divide-slate-100">
            <FormField
              icon={<Image className="w-4 h-4" />}
              label="Picture URL"
              colorClass="text-indigo-600"
              bgClass="bg-indigo-100"
            >
              <input
                type="text"
                name="pictureUrl"
                id="pictureUrl"
                value={formData.pictureUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className={inputClassName}
              />
            </FormField>

            <FormField
              icon={<UserIcon className="w-4 h-4" />}
              label="Full Name"
              colorClass="text-eduBlue"
              bgClass="bg-blue-100"
            >
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputClassName}
              />
            </FormField>

            <FormField
              icon={<Calendar className="w-4 h-4" />}
              label="Date of Birth"
              colorClass="text-purple-600"
              bgClass="bg-purple-100"
            >
              <input
                type="date"
                name="dob"
                id="dob"
                value={formData.dob}
                onChange={handleChange}
                className={inputClassName}
              />
            </FormField>

            <FormField
              icon={<Users className="w-4 h-4" />}
              label="Gender"
              colorClass="text-emerald-600"
              bgClass="bg-emerald-100"
            >
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </FormField>

            <FormField
              icon={<FileText className="w-4 h-4" />}
              label="Bio"
              colorClass="text-rose-600"
              bgClass="bg-rose-100"
            >
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className={inputClassName + " resize-none"}
              />
            </FormField>
          </div>
        </div>

        {/* Company Information Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Company Information</h2>
          </div>
          <div className="px-6 divide-y divide-slate-100">
            <FormField
              icon={<Building2 className="w-4 h-4" />}
              label="Company Name"
              colorClass="text-amber-600"
              bgClass="bg-amber-100"
            >
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                className={inputClassName}
              />
            </FormField>

            <FormField
              icon={<Globe className="w-4 h-4" />}
              label="Company Website"
              colorClass="text-cyan-600"
              bgClass="bg-cyan-100"
            >
              <input
                type="text"
                name="companyWebsite"
                id="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://example.com"
                className={inputClassName}
              />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
}
