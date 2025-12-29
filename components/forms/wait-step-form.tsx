"use client";

import { WaitStepConfig } from "@/lib/yaml-generator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslations } from "next-intl";

interface WaitStepFormProps {
  config: WaitStepConfig;
  onChange: (config: WaitStepConfig) => void;
}

export function WaitStepForm({ config, onChange }: WaitStepFormProps) {
  const t = useTranslations();

  const updateConfig = (updates: Partial<WaitStepConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* Simple Duration Wait */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('forms.wait.simpleWait')}</CardTitle>
          <CardDescription className="text-xs">
            {t('forms.wait.simpleWaitDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>{t('forms.wait.duration')}</Label>
          <Input
            type="number"
            placeholder={t('forms.wait.durationPlaceholder')}
            value={config.duration || ""}
            onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || undefined })}
          />
        </CardContent>
      </Card>

      {/* Conditional Wait */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('forms.wait.conditionalWait')}</CardTitle>
          <CardDescription className="text-xs">
            {t('forms.wait.conditionalWaitDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>{t('forms.wait.variableName')}</Label>
            <Input
              placeholder={t('forms.wait.variableNamePlaceholder')}
              value={config.condition?.variable || ""}
              onChange={(e) =>
                updateConfig({
                  condition: { ...config.condition, variable: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>{t('forms.wait.expectedValue')}</Label>
            <Input
              placeholder={t('forms.wait.expectedValuePlaceholder')}
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
              <Label>{t('forms.wait.maxRetries')}</Label>
              <Input
                type="number"
                placeholder={t('forms.wait.maxRetriesPlaceholder')}
                value={config.maxRetries || ""}
                onChange={(e) => updateConfig({ maxRetries: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div>
              <Label>{t('forms.wait.retryInterval')}</Label>
              <Input
                type="number"
                placeholder={t('forms.wait.retryIntervalPlaceholder')}
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
