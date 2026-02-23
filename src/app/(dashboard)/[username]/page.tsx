"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ImageIcon, Video, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const username = params?.username as string;

  // Check if this is the current user's profile
  const isOwnProfile = user?.username === username.replace("@", "");

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-blue-100 text-2xl text-blue-600">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{username}</h1>
              <p className="mt-1 text-gray-500">
                {isOwnProfile ? user?.primaryEmailAddress?.emailAddress : "VizLynx User"}
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <Link href="/settings">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Images</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Videos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <ImageIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* User's Assets/Gallery */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Work</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            No work to display yet
          </h3>
          <p className="text-gray-500">
            {isOwnProfile
              ? "Create your first project to see it here"
              : "This user hasn't created any public work yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
