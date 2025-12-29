"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react";

interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  timestamp: string;
}

interface TestRunnerProps {
  yamlContent: string;
  onResultsChange: (result: TestResult) => void;
}

export function TestRunner({ yamlContent, onResultsChange }: TestRunnerProps) {
  const t = useTranslations();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    if (!yamlContent.trim()) {
      alert(t('testRunner.noYaml'));
      return;
    }

    setIsRunning(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/run-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ yamlContent }),
      });

      const result = await response.json();
      setLastResult(result);
      onResultsChange(result);
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        output: "",
        error: error.message || t('common.error'),
        duration: 0,
        timestamp: new Date().toISOString(),
      };
      setLastResult(errorResult);
      onResultsChange(errorResult);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('testRunner.title')}</CardTitle>
        <CardDescription>
          {t('testRunner.runTest')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runTest}
          disabled={isRunning || !yamlContent.trim()}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('testRunner.running')}
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {t('testRunner.runTest')}
            </>
          )}
        </Button>

        {lastResult && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="success">{t('common.success')}</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="destructive">{t('common.failed')}</Badge>
                  </>
                )}
              </div>
              <Badge variant="outline">{lastResult.duration}ms</Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              {new Date(lastResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
