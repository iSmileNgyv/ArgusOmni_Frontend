"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TestResultDetailModal } from "./modals/test-result-detail-modal";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Calendar,
  FileText,
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

interface TestResultsProps {
  result: TestResult | null;
}

export function TestResults({ result }: TestResultsProps) {
  const t = useTranslations();
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t("testResults.title")}</CardTitle>
          <CardDescription>
            {t("testResults.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-sm">{t("testResults.waitingForResults")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get first line of output for preview
  const outputPreview = result.output
    ? result.output.split("\n")[0].substring(0, 100)
    : t("testResults.noOutput");

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("testResults.currentResult")}</span>
            <Button
              onClick={() => setDetailModalOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("testResults.viewDetails")}
            </Button>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {format(new Date(result.timestamp), "dd.MM.yyyy HH:mm:ss")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Card */}
          <Card className={result.success ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-500/10 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {result.success ? t("testResults.testSuccessful") : t("testResults.testFailed")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.success
                        ? t("testResults.testSuccessfulDescription")
                        : t("testResults.testFailedDescription")}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={result.success ? "default" : "destructive"}
                  className="text-base px-4 py-2"
                >
                  {result.success ? `✓ ${t("common.success").toUpperCase()}` : `✗ ${t("common.failed").toUpperCase()}`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("testResults.executionDuration")}</p>
                    <p className="text-xl font-bold">{result.duration}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("testResults.outputSize")}</p>
                    <p className="text-xl font-bold">
                      {Math.round(result.output.length / 1024)}KB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("testResults.outputPreview")}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
              <p className="text-muted-foreground truncate">{outputPreview}...</p>
            </div>
          </div>

          {/* Error Alert */}
          {result.error && (
            <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                      {t("testResults.warningsAndErrors")}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-200 truncate">
                      {result.error.split("\n")[0]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Open Detail Button */}
          <Button
            onClick={() => setDetailModalOpen(true)}
            className="w-full"
            size="lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("testResults.viewFullResults")}
          </Button>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <TestResultDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        result={result}
      />
    </>
  );
}
