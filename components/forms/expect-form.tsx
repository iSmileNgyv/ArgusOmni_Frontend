"use client";

import { ExpectConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ExpectFormProps {
  config: ExpectConfig;
  onChange: (config: ExpectConfig) => void;
}

export function ExpectForm({ config, onChange }: ExpectFormProps) {
  const t = useTranslations();
  const [jsonPathAssertions, setJsonPathAssertions] = useState(
    typeof config.jsonPath === 'string'
      ? config.jsonPath
      : config.jsonPath
        ? JSON.stringify(config.jsonPath, null, 2)
        : ""
  );

  const [jsonContainsValue, setJsonContainsValue] = useState(
    typeof config.jsonContains === 'string'
      ? config.jsonContains
      : config.jsonContains
        ? JSON.stringify(config.jsonContains, null, 2)
        : ""
  );

  const updateConfig = (updates: Partial<ExpectConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleJsonPathChange = (value: string) => {
    setJsonPathAssertions(value);
    try {
      const parsed = JSON.parse(value);
      updateConfig({ jsonPath: parsed });
    } catch {
      // Invalid JSON, keep as string
      updateConfig({ jsonPath: value as any });
    }
  };

  const handleJsonContainsChange = (value: string) => {
    setJsonContainsValue(value);
    try {
      const parsed = JSON.parse(value);
      updateConfig({ jsonContains: parsed });
    } catch {
      // Invalid JSON, keep as string
      updateConfig({ jsonContains: value as any });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('forms.expect.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Code */}
        <div>
          <Label>{t('forms.expect.statusCode')}</Label>
          <Input
            type="number"
            placeholder={t('forms.expect.statusCodePlaceholder')}
            value={config.status || ""}
            onChange={(e) => updateConfig({ status: parseInt(e.target.value) || undefined })}
          />
        </div>

        {/* JSON Contains */}
        <div>
          <Label>{t('forms.expect.jsonContains')}</Label>
          <Textarea
            placeholder={t('forms.expect.jsonContainsPlaceholder')}
            className="font-mono text-xs"
            rows={8}
            value={jsonContainsValue}
            onChange={(e) => handleJsonContainsChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('forms.expect.jsonContainsDescription')}
          </p>
        </div>

        {/* JSONPath Assertions */}
        <div>
          <Label>{t('forms.expect.jsonPath')}</Label>
          <Textarea
            placeholder={t('forms.expect.jsonPathPlaceholder')}
            className="font-mono text-xs"
            rows={10}
            value={jsonPathAssertions}
            onChange={(e) => handleJsonPathChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('forms.expect.jsonPathDescription')}
          </p>
        </div>

        {/* Performance */}
        <div>
          <Label>{t('forms.expect.maxDuration')}</Label>
          <Input
            type="number"
            placeholder={t('forms.expect.maxDurationPlaceholder')}
            value={config.performance?.maxDuration || ""}
            onChange={(e) =>
              updateConfig({
                performance: {
                  maxDuration: parseInt(e.target.value) || undefined,
                },
              })
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('forms.expect.maxDurationDescription')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
