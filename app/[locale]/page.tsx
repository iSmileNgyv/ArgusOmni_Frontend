"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { YamlEditor } from "@/components/yaml-editor";
import { TestRunner } from "@/components/test-runner";
import { TestResults } from "@/components/test-results";
import { TestHistory } from "@/components/test-history";
import { StepBuilderModal } from "@/components/modals/step-builder-modal";
import { SavedTestsModal } from "@/components/modals/saved-tests-modal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { parseYamlToSuite } from "@/lib/yaml-parser";
import { SavedTestCase } from "@/lib/test-storage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, History, Code2, Plus, FolderOpen } from "lucide-react";

interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  timestamp: string;
  htmlReportPath?: string;
}

export default function Home() {
  const t = useTranslations();
  const [yamlContent, setYamlContent] = useState("");
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [savedTestsModalOpen, setSavedTestsModalOpen] = useState(false);
  const [editingYaml, setEditingYaml] = useState<string | null>(null);

  const handleYamlChange = (yaml: string) => {
    setYamlContent(yaml);
  };

  const handleResultsChange = (result: TestResult) => {
    setCurrentResult(result);
  };

  const handleHistorySelect = (result: TestResult) => {
    setCurrentResult(result);
  };

  const handleSelectSavedTest = (testCase: SavedTestCase) => {
    try {
      // YAML-ı yüklə
      setYamlContent(testCase.yamlContent);
      // Modal bağla
      setSavedTestsModalOpen(false);
    } catch (error) {
      console.error("Test case yüklənərkən xəta:", error);
      alert("Test case yüklənə bilmədi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('header.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                size="lg"
                onClick={() => setBuilderModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                {t('header.newTestCase')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setSavedTestsModalOpen(true)}
                className="gap-2"
              >
                <FolderOpen className="h-5 w-5" />
                {t('header.savedTests')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - YAML Preview */}
          <div className="space-y-4">
            <YamlEditor
              value={yamlContent}
              onChange={() => {}}
              readOnly={true}
              onOpenEditor={() => {
                // Modal aç və YAML-ı yüklə
                setEditingYaml(yamlContent || "");
                setBuilderModalOpen(true);
              }}
            />
            {!yamlContent && (
              <div className="text-center py-12 text-muted-foreground">
                <Code2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">{t('yamlEditor.noYaml')}</p>
                <p className="text-sm mb-4">
                  {t('yamlEditor.noYamlDescription')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBuilderModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('header.newTestCase')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSavedTestsModalOpen(true)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {t('header.savedTests')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right - Test Runner & Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('testRunner.title')}</h2>

            <TestRunner
              yamlContent={yamlContent}
              onResultsChange={handleResultsChange}
            />

            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">
                  <Code2 className="h-4 w-4 mr-2" />
                  {t('testResults.currentResult')}
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  {t('testResults.history')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-4">
                <TestResults result={currentResult} />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <TestHistory
                  currentResult={currentResult}
                  onSelectResult={handleHistorySelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>{t('footer.text')}</p>
        </div>
      </footer>

      {/* Modals */}
      <StepBuilderModal
        open={builderModalOpen}
        onOpenChange={(open) => {
          setBuilderModalOpen(open);
          if (!open) {
            setEditingYaml(null);
          }
        }}
        onYamlChange={handleYamlChange}
        onSaveSuccess={() => {
          // Modal bağlandı, yeniləmə lazım deyil
        }}
        onImportSuccess={(yaml) => {
          setYamlContent(yaml);
        }}
        initialYaml={editingYaml}
      />

      <SavedTestsModal
        open={savedTestsModalOpen}
        onOpenChange={setSavedTestsModalOpen}
        onSelectTest={handleSelectSavedTest}
      />
    </div>
  );
}
