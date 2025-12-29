"use client";

import { testTemplates, getAllCategories } from "@/lib/test-templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { FileText } from "lucide-react";

interface TestTemplatesProps {
  onSelectTemplate: (yaml: string) => void;
}

export function TestTemplates({ onSelectTemplate }: TestTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredTemplates = selectedCategory
    ? testTemplates.filter((t) => t.category === selectedCategory)
    : testTemplates;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Nümunələri</CardTitle>
        <CardDescription>
          Hazır template-lərdən birini seçin və dəyişdirin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Hamısı
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates List */}
          <div className="grid gap-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onSelectTemplate(template.yaml)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
