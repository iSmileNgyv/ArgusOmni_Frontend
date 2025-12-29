"use client";

import { BashStepConfig } from "@/lib/yaml-generator";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface BashStepFormProps {
  config: BashStepConfig;
  onChange: (config: BashStepConfig) => void;
}

export function BashStepForm({ config, onChange }: BashStepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Bash Command</Label>
        <Textarea
          placeholder="ls -la /tmp"
          className="font-mono text-sm"
          rows={6}
          value={config.command}
          onChange={(e) => onChange({ command: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Shell komandası daxil edin. Çoxsətrli komandalar da dəstəklənir.
        </p>
      </div>
    </div>
  );
}
