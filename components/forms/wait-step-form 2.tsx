"use client";

import { WaitStepConfig } from "@/lib/yaml-generator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface WaitStepFormProps {
  config: WaitStepConfig;
  onChange: (config: WaitStepConfig) => void;
}

export function WaitStepForm({ config, onChange }: WaitStepFormProps) {
  const updateConfig = (updates: Partial<WaitStepConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* Simple Duration Wait */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Sadə Gözləmə</CardTitle>
          <CardDescription className="text-xs">
            Müəyyən müddət gözləyin (millisaniyələrlə)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Duration (ms)</Label>
          <Input
            type="number"
            placeholder="5000"
            value={config.duration || ""}
            onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || undefined })}
          />
        </CardContent>
      </Card>

      {/* Conditional Wait */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Şərti Gözləmə (Polling)</CardTitle>
          <CardDescription className="text-xs">
            Bir dəyişənin dəyişməsini gözləyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Variable Name</Label>
            <Input
              placeholder="jobStatus"
              value={config.condition?.variable || ""}
              onChange={(e) =>
                updateConfig({
                  condition: { ...config.condition, variable: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Expected Value</Label>
            <Input
              placeholder="completed"
              value={config.condition?.equals || ""}
              onChange={(e) =>
                updateConfig({
                  condition: { ...config.condition!, variable: config.condition?.variable || "", equals: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max Retries</Label>
              <Input
                type="number"
                placeholder="10"
                value={config.maxRetries || ""}
                onChange={(e) => updateConfig({ maxRetries: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div>
              <Label>Retry Interval (ms)</Label>
              <Input
                type="number"
                placeholder="2000"
                value={config.retryInterval || ""}
                onChange={(e) => updateConfig({ retryInterval: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
