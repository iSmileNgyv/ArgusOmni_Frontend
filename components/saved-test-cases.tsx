"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TestCaseStorage, SavedTestCase } from "@/lib/test-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Trash2,
  Download,
  Search,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedTestCasesProps {
  onLoad: (testCase: SavedTestCase) => void;
}

export function SavedTestCases({ onLoad }: SavedTestCasesProps) {
  const t = useTranslations();
  const [testCases, setTestCases] = useState<SavedTestCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTests, setFilteredTests] = useState<SavedTestCase[]>([]);

  // Load test cases
  useEffect(() => {
    loadTestCases();
  }, []);

  // Filter tests
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTests(testCases);
    } else {
      const results = TestCaseStorage.search(searchQuery);
      setFilteredTests(results);
    }
  }, [searchQuery, testCases]);

  const loadTestCases = () => {
    const tests = TestCaseStorage.getAll();
    setTestCases(tests);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("savedTestsModal.confirmDelete"))) {
      TestCaseStorage.delete(id);
      loadTestCases();
    }
  };

  const handleExportYaml = (id: string) => {
    const result = TestCaseStorage.exportAsYaml(id);

    if (result.success && result.yaml && result.filename) {
      const blob = new Blob([result.yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLoad = (testCase: SavedTestCase) => {
    onLoad(testCase);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t("savedTestsModal.title")}
        </CardTitle>
        <CardDescription>
          {t("savedTestsModal.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("savedTestsModal.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Test Cases List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery
                  ? t("savedTestsModal.noResults")
                  : t("savedTestsModal.noTests")}
              </p>
            </div>
          ) : (
            filteredTests.map((testCase) => (
              <Card key={testCase.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{testCase.name}</h3>
                        {testCase.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {testCase.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(testCase.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Tags */}
                    {testCase.tags && testCase.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {testCase.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoad(testCase)}
                        className="flex-1"
                      >
                        {t("stepBuilderModal.loadYaml")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportYaml(testCase.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testCase.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        {testCases.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {t("common.loading")} {testCases.length} {t("savedTestsModal.noTests")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
