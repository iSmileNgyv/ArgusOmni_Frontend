"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TestCaseStorage, SavedTestCase } from "@/lib/test-storage";
import { StepBuilderModal } from "@/components/modals/step-builder-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Search,
  Trash2,
  Download,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { az, enUS, ru, es } from "date-fns/locale";

interface SavedTestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTest: (testCase: SavedTestCase) => void;
}

export function SavedTestsModal({
  open,
  onOpenChange,
  onSelectTest,
}: SavedTestsModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [testCases, setTestCases] = useState<SavedTestCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTests, setFilteredTests] = useState<SavedTestCase[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<SavedTestCase | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Map locale to date-fns locale
  const dateFnsLocale = {
    az: az,
    en: enUS,
    ru: ru,
    es: es,
  }[locale] || enUS;

  useEffect(() => {
    if (open) {
      loadTestCases();
    }
  }, [open]);

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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("savedTestsModal.confirmDelete"))) {
      TestCaseStorage.delete(id);
      loadTestCases();
    }
  };

  const handleExportYaml = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleEdit = (testCase: SavedTestCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTestCase(testCase);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    // Refresh test cases list after save
    loadTestCases();
    setShowEditModal(false);
    setEditingTestCase(null);
  };

  const handleSelect = (testCase: SavedTestCase) => {
    setSelectedId(testCase.id);
    onSelectTest(testCase);

    // Success feedback
    setTimeout(() => {
      onOpenChange(false);
      setSelectedId(null);
    }, 800);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {t("savedTestsModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("savedTestsModal.description")}
          </DialogDescription>
        </DialogHeader>

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
        <div className="flex-1 overflow-auto space-y-2">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {searchQuery
                  ? t("savedTestsModal.noResults")
                  : t("savedTestsModal.noTests")}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? t("savedTestsModal.noResultsDescription")
                  : t("savedTestsModal.noTestsDescription")}
              </p>
            </div>
          ) : (
            filteredTests.map((testCase) => (
              <Card
                key={testCase.id}
                className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                  selectedId === testCase.id
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : ""
                }`}
                onClick={() => handleSelect(testCase)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title */}
                      <div className="flex items-start gap-2">
                        {selectedId === testCase.id && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {testCase.name}
                          </h3>
                          {testCase.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {testCase.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(testCase.updatedAt), {
                            addSuffix: true,
                            locale: dateFnsLocale,
                          })}
                        </span>
                      </div>

                      {/* Tags */}
                      {testCase.tags && testCase.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {testCase.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEdit(testCase, e)}
                        title={t("savedTestsModal.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleExportYaml(testCase.id, e)}
                        title={t("savedTestsModal.export")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDelete(testCase.id, e)}
                        title={t("savedTestsModal.delete")}
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

        {/* Footer Stats */}
        {testCases.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("common.loading")} <strong>{testCases.length}</strong> {t("savedTestsModal.noTests")}
              {searchQuery && ` • ${filteredTests.length} ${t("savedTestsModal.noResults")}`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>

      {/* Edit Modal */}
      {editingTestCase && (
        <StepBuilderModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onYamlChange={() => {}}
          onSaveSuccess={handleEditSave}
          initialYaml={editingTestCase.yamlContent}
          existingTestCaseId={editingTestCase.id}
          existingTestCaseName={editingTestCase.name}
          existingTestCaseDescription={editingTestCase.description}
          existingTestCaseTags={editingTestCase.tags}
        />
      )}
    </>
  );
}
