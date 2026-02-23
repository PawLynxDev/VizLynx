"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { AppRouter } from "@/server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type ProjectListItem = inferRouterOutputs<AppRouter>["project"]["list"][number];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const utils = trpc.useUtils();
  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      utils.project.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const thumbnail =
    project.generatedContent[0]?.imageUrl ??
    project.sourceImages[0]?.originalUrl;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold truncate">
              {project.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Delete this project?")) {
                  deleteMutation.mutate({ id: project.id });
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={project.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={statusColors[project.status]}>
              {project.status}
            </Badge>
            <span className="text-xs text-gray-500">
              {project.template.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
