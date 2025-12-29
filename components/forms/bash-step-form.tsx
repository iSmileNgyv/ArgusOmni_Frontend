"use client";

import { BashStepConfig } from "@/lib/yaml-generator";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useTranslations } from "next-intl";

interface BashStepFormProps {
  config: BashStepConfig;
  onChange: (config: BashStepConfig) => void;
}

export function BashStepForm({ config, onChange }: BashStepFormProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('forms.bash.command')}</Label>
        <Textarea
          placeholder={t('forms.bash.commandPlaceholder')}
          className="font-mono text-sm"
          rows={6}
          value={config.command}
          onChange={(e) => onChange({ command: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t('forms.bash.commandDescription')}
        </p>
      </div>
    </div>
  );
}
