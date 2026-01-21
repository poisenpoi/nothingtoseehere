"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, User } from "@prisma/client";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Profile</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ID</label>
        <input
          type="text"
          value={user.id}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm px-3 py-2 cursor-not-allowed text-gray-500"
        />
      </div>

      <div>
        <label htmlFor="pictureUrl" className="block text-sm font-medium text-gray-700">
          Picture URL
        </label>
        <div className="mt-1 flex items-center gap-4">
          {formData.pictureUrl && (
            <img 
              src={formData.pictureUrl} 
              alt="Preview" 
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <input
            type="text"
            name="pictureUrl"
            id="pictureUrl"
            value={formData.pictureUrl}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          name="dob"
          id="dob"
          value={formData.dob}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          name="gender"
          id="gender"
          value={formData.gender}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        >
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          name="bio"
          id="bio"
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          id="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">
          Company Website
        </label>
        <input
          type="text"
          name="companyWebsite"
          id="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eduBlue focus:ring-eduBlue sm:text-sm px-3 py-2 border"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eduBlue focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-eduBlue py-2 px-4 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eduBlue focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}