"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Settings, User, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { data: projects } = trpc.project.list.useQuery();

  const completedCount = projects?.filter((p) => p.status === "completed").length ?? 0;
  const totalCount = projects?.length ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.[0] ?? "U"}
                  {user?.lastName?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <Separator />
            <Button
              variant="outline"
              onClick={() => {
                window.open(
                  "https://accounts.clerk.dev/user",
                  "_blank"
                );
              }}
            >
              Manage Account
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Plan & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Plan</span>
              <Badge>Free</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-xs text-gray-500">Total Projects</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-gray-500">Images Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
