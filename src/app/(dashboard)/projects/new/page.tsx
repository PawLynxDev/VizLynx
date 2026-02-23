"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "@/components/template/TemplateCard";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TemplateConfig } from "@/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "social", label: "Social Posts" },
  { id: "story", label: "Stories" },
  { id: "ad", label: "Ad Banners" },
  { id: "product", label: "Product Cards" },
  { id: "promo", label: "Sale & Promo" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(null);

  const { data: templates, isLoading: templatesLoading } = trpc.template.list.useQuery(
    selectedCategory === "all" ? {} : { category: selectedCategory }
  );

  const { data: brandKits } = trpc.brandKit.list.useQuery();

  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created");
      router.push(`/projects/${project.id}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }
    createProject.mutate({
      name: name.trim(),
      templateId: selectedTemplateId,
      brandKitId: selectedBrandKitId ?? undefined,
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Project</h1>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Project Name</label>
            <Input
              placeholder="e.g., Summer Collection Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Brand Kit (optional)</label>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <select
                value={selectedBrandKitId ?? ""}
                onChange={(e) => setSelectedBrandKitId(e.target.value || null)}
                className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm"
              >
                <option value="">No brand kit</option>
                {brandKits?.map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.name}{kit.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">Choose a Template</label>

          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {templatesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates?.map((template: { id: string; name: string; description: string; category: string; config: unknown }) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  description={template.description}
                  category={template.category}
                  config={template.config as TemplateConfig}
                  selected={selectedTemplateId === template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          )}

          {!templatesLoading && templates?.length === 0 && (
            <p className="py-8 text-center text-gray-400">No templates in this category.</p>
          )}
        </div>

        <Button
          onClick={handleCreate}
          disabled={!name.trim() || !selectedTemplateId || createProject.isPending}
          className="w-full"
          size="lg"
        >
          {createProject.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
