"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { TestCaseStorage } from "@/lib/test-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Save,
  Upload,
  Download,
  FileUp,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface TestCaseSaverProps {
  yamlContent: string;
  onSaveSuccess?: () => void;
  onImportSuccess?: (yamlContent: string) => void;
  existingId?: string;
  initialName?: string;
  initialDescription?: string;
  initialTags?: string[];
}

export function TestCaseSaver({
  yamlContent,
  onSaveSuccess,
  onImportSuccess,
  existingId,
  initialName,
  initialDescription,
  initialTags,
}: TestCaseSaverProps) {
  const t = useTranslations();
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [tags, setTags] = useState(initialTags ? initialTags.join(", ") : "");
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setStatus({ type: "error", message: t("testCaseSaver.namePlaceholder") });
      return;
    }

    if (!yamlContent.trim()) {
      setStatus({ type: "error", message: t("testCaseSaver.noYaml") });
      return;
    }

    setIsLoading(true);

    try {
      const tagArray = tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (existingId) {
        // Update existing test case
        TestCaseStorage.update(existingId, {
          name: name.trim(),
          description: description.trim() || undefined,
          yamlContent,
          tags: tagArray.length > 0 ? tagArray : undefined,
        });
        setStatus({ type: "success", message: t("testCaseSaver.updated") });
      } else {
        // Create new test case
        TestCaseStorage.save({
          name: name.trim(),
          description: description.trim() || undefined,
          yamlContent,
          tags: tagArray.length > 0 ? tagArray : undefined,
        });
        setStatus({ type: "success", message: t("testCaseSaver.saved") });
        setName("");
        setDescription("");
        setTags("");
      }

      onSaveSuccess?.();

      setTimeout(() => {
        setStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error) {
      setStatus({ type: "error", message: t("common.error") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = () => {
    const jsonData = TestCaseStorage.exportAll();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `argusomni_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus({ type: "success", message: t("testCaseSaver.backedUp") });
    setTimeout(() => setStatus({ type: "idle", message: "" }), 3000);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = TestCaseStorage.importAll(content);

      if (result.success) {
        setStatus({
          type: "success",
          message: t("testCaseSaver.restored", { count: result.count }),
        });
        onSaveSuccess?.();
      } else {
        setStatus({
          type: "error",
          message: result.error || t("common.error"),
        });
      }

      setTimeout(() => setStatus({ type: "idle", message: "" }), 3000);
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const handleImportYaml = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // YAML-ı editor-ə yüklə
      onImportSuccess?.(content);

      setStatus({
        type: "success",
        message: t("testCaseSaver.imported"),
      });

      setTimeout(() => setStatus({ type: "idle", message: "" }), 3000);
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {t("testCaseSaver.title")}
        </CardTitle>
        <CardDescription>
          {t("testCaseSaver.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Form */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="test-name">{t("testCaseSaver.name")} *</Label>
            <Input
              id="test-name"
              placeholder={t("testCaseSaver.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="test-description">{t("testCaseSaver.caseDescription")}</Label>
            <Textarea
              id="test-description"
              placeholder={t("testCaseSaver.caseDescriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="test-tags">{t("testCaseSaver.tags")}</Label>
            <Input
              id="test-tags"
              placeholder={t("testCaseSaver.tagsPlaceholder")}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading || !yamlContent.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {existingId ? t("testCaseSaver.updateTestCase") : t("testCaseSaver.saveTestCase")}
              </>
            )}
          </Button>
        </div>

        {/* Status Message */}
        {status.type !== "idle" && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {status.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {status.message}
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("testCaseSaver.import")} / {t("testCaseSaver.export")}
            </span>
          </div>
        </div>

        {/* Import/Export Buttons */}
        <div className="grid grid-cols-1 gap-2">
          {/* Import YAML */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".yml,.yaml"
              onChange={handleImportYaml}
              className="hidden"
              id="yaml-import"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" />
              {t("testCaseSaver.importFile")}
            </Button>
          </div>

          {/* Import Backup */}
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
              id="backup-import"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("backup-import")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("testCaseSaver.restoreBackup")}
            </Button>
          </div>

          {/* Export Backup */}
          <Button variant="outline" className="w-full" onClick={handleExportBackup}>
            <Download className="h-4 w-4 mr-2" />
            {t("testCaseSaver.backupAll")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t("testCaseSaver.backupDescription")}
        </p>
      </CardContent>
    </Card>
  );
}
