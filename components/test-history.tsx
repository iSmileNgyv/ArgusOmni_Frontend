"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TestResultDetailModal } from "./modals/test-result-detail-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";

interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  timestamp: string;
  htmlReportPath?: string;
}

interface TestHistoryProps {
  currentResult: TestResult | null;
  onSelectResult: (result: TestResult) => void;
}

export function TestHistory({ currentResult, onSelectResult }: TestHistoryProps) {
  const t = useTranslations();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("test-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (currentResult) {
      // Add to history
      const newHistory = [currentResult, ...history].slice(0, 20); // Keep last 20 results
      setHistory(newHistory);
      localStorage.setItem("test-history", JSON.stringify(newHistory));
    }
  }, [currentResult]);

  const clearHistory = async () => {
    try {
      // Call API to delete all test files
      await fetch("/api/delete-test-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteAll" }),
      });
    } catch (error) {
      console.error("Error deleting test files:", error);
    }

    setHistory([]);
    localStorage.removeItem("test-history");
    setConfirmClearOpen(false);
  };

  const handleDeleteOne = async (index: number) => {
    const result = history[index];

    try {
      // Extract timestamp from result to delete associated files
      const timestamp = result.timestamp;

      // Call API to delete specific test files
      await fetch("/api/delete-test-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteOne", timestamp }),
      });
    } catch (error) {
      console.error("Error deleting test file:", error);
    }

    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem("test-history", JSON.stringify(newHistory));
    setConfirmDeleteOpen(false);
    setDeleteIndex(null);
  };

  const handleResultClick = (result: TestResult) => {
    setSelectedResult(result);
    setDetailModalOpen(true);
    onSelectResult(result);
  };

  const handleDeleteClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteIndex(index);
    setConfirmDeleteOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("testHistory.title")}</CardTitle>
            <CardDescription>
              {t("testHistory.description", { count: history.length })}
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("testHistory.clearHistory")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("testHistory.noTests")}
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {history.map((result, index) => (
              <div key={index}>
                <div
                  className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="success" className="text-xs">{t("common.success")}</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <Badge variant="destructive" className="text-xs">{t("common.failed")}</Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.duration}ms
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleDeleteClick(index, e)}
                        title={t("testHistory.deleteResult")}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(result.timestamp).toLocaleString("az-AZ", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {index < history.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Detail Modal */}
      <TestResultDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        result={selectedResult}
      />

      {/* Clear All Confirmation */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("testHistory.confirmClearTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("testHistory.confirmClearDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90">
              {t("testHistory.clearHistory")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete One Confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("testHistory.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("testHistory.confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIndex !== null && handleDeleteOne(deleteIndex)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
