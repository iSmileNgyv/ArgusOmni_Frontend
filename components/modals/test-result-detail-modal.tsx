"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Editor } from "@monaco-editor/react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  timestamp: string;
  htmlReportPath?: string;
}

interface TestResultDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: TestResult | null;
}

export function TestResultDetailModal({
  open,
  onOpenChange,
  result,
}: TestResultDetailModalProps) {
  const t = useTranslations();

  if (!result) return null;

  // Try to parse output as JSON for better display
  let parsedOutput: any = null;
  let isJson = false;

  try {
    parsedOutput = JSON.parse(result.output);
    isJson = true;
  } catch {
    // Not JSON, display as text
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t("testResultDetail.successful")}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                {t("testResultDetail.failed")}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between pr-8">
            <span>{t("testResultDetail.description")}</span>

            {/* HTML Report Button */}
            <Button
              onClick={() => {
                if (result.htmlReportPath) {
                  window.open(result.htmlReportPath, '_blank');
                } else {
                  alert(t("testResultDetail.htmlReportNotFound"));
                }
              }}
              variant="default"
              size="sm"
              className="gap-2"
              disabled={!result.htmlReportPath}
            >
              <ExternalLink className="h-4 w-4" />
              {t("testResultDetail.htmlReport")}
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Summary Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("testResultDetail.date")}</p>
                    <p className="font-medium">
                      {format(new Date(result.timestamp), "dd.MM.yyyy HH:mm:ss")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("testResultDetail.duration")}</p>
                    <p className="font-medium">{result.duration}ms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("testResultDetail.status")}</p>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? t("common.success") : t("common.failed")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* JSON Response Output Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-semibold">{t("testResultDetail.jsonResponse")}</h3>
            </div>

            {/* Monaco Editor - JSON */}
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <Editor
                height="450px"
                defaultLanguage="json"
                theme="vs-dark"
                value={
                  isJson
                    ? JSON.stringify(parsedOutput, null, 2)
                    : result.output || t("testResults.noOutput")
                }
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  folding: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>

          {/* Error Section */}
          {result.error && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="font-semibold text-red-600">{t("testResultDetail.errorsAndWarnings")}</h3>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-4 font-mono text-sm overflow-auto max-h-64">
                  <pre className="text-red-400 whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
