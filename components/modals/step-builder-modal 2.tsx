"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { StepBuilder, StepBuilderRef } from "@/components/step-builder";
import { TestCaseSaver } from "@/components/test-case-saver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit3, Save, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseYamlToSuite } from "@/lib/yaml-parser";

interface StepBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onYamlChange: (yaml: string) => void;
  onSaveSuccess?: () => void;
  onImportSuccess?: (yamlContent: string) => void;
  initialYaml?: string | null;
  existingTestCaseId?: string;
  existingTestCaseName?: string;
  existingTestCaseDescription?: string;
  existingTestCaseTags?: string[];
}

export function StepBuilderModal({
  open,
  onOpenChange,
  onYamlChange,
  onSaveSuccess,
  onImportSuccess,
  initialYaml,
  existingTestCaseId,
  existingTestCaseName,
  existingTestCaseDescription,
  existingTestCaseTags,
}: StepBuilderModalProps) {
  const t = useTranslations();
  const stepBuilderRef = useRef<StepBuilderRef>(null);
  const [currentYaml, setCurrentYaml] = useState("");
  const [activeTab, setActiveTab] = useState<"builder" | "save">("builder");

  // Modal açıldıqda və initialYaml varsa, YAML-ı parse edib yüklə
  useEffect(() => {
    if (open && initialYaml) {
      try {
        const suite = parseYamlToSuite(initialYaml);
        setTimeout(() => {
          stepBuilderRef.current?.loadSuite(suite);
          setCurrentYaml(initialYaml);
        }, 100);
      } catch (error) {
        console.error("YAML parse xətası:", error);
        alert("YAML parse edilə bilmədi");
      }
    }
  }, [open, initialYaml]);

  const handleYamlChange = (yaml: string) => {
    setCurrentYaml(yaml);
  };

  const handleImport = (yamlContent: string) => {
    // Step builder'a yüklə
    const { parseYamlToSuite } = require("@/lib/yaml-parser");
    try {
      const suite = parseYamlToSuite(yamlContent);
      stepBuilderRef.current?.loadSuite(suite);
      setCurrentYaml(yamlContent);
      // Builder tab'ına keç
      setActiveTab("builder");
    } catch (error) {
      console.error("YAML import xətası:", error);
      alert("YAML import edilə bilmədi");
    }
  };

  const handleLoadYaml = () => {
    if (currentYaml.trim()) {
      onYamlChange(currentYaml);
      onOpenChange(false);
    } else {
      alert(t("testCaseSaver.noYaml"));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            {t("stepBuilderModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("testCaseSaver.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Custom Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Headers */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              onClick={() => setActiveTab("builder")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "builder"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              )}
            >
              <Edit3 className="h-4 w-4" />
              {t("stepBuilderModal.formBuilder")}
            </button>
            <button
              onClick={() => setActiveTab("save")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "save"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              )}
            >
              <Save className="h-4 w-4" />
              {t("stepBuilderModal.saveAndExport")}
            </button>
          </div>

          {/* Tab Contents - HƏR İKİSİ DƏ RENDER OLUR, SADƏCƏ GİZLƏNİR */}
          <div className="flex-1 overflow-auto">
            {/* Builder Tab */}
            <div
              className={cn(
                "h-full",
                activeTab !== "builder" && "hidden"
              )}
            >
              <StepBuilder ref={stepBuilderRef} onYamlChange={handleYamlChange} />
            </div>

            {/* Save Tab */}
            <div
              className={cn(
                "h-full",
                activeTab !== "save" && "hidden"
              )}
            >
              <TestCaseSaver
                yamlContent={currentYaml}
                onSaveSuccess={() => {
                  onSaveSuccess?.();
                }}
                onImportSuccess={handleImport}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {currentYaml ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                {t("stepBuilderModal.yamlStatus")} {t("stepBuilderModal.ready")} ({currentYaml.split("\n").length} {t("common.loading")})
              </span>
            ) : (
              <span className="text-muted-foreground/60">{t("stepBuilderModal.yamlStatus")} {t("stepBuilderModal.empty")}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              {t("stepBuilderModal.closeModal")}
            </Button>
            <Button onClick={handleLoadYaml} disabled={!currentYaml.trim()}>
              <Check className="h-4 w-4 mr-2" />
              {t("stepBuilderModal.loadYaml")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
