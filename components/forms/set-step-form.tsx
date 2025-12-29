"use client";

import { SetStepConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SetStepFormProps {
  config: SetStepConfig;
  onChange: (config: SetStepConfig) => void;
}

export function SetStepForm({ config, onChange }: SetStepFormProps) {
  const t = useTranslations();
  const [variables, setVariables] = useState<Array<{ key: string; value: string }>>(
    config.variables
      ? Object.entries(config.variables).map(([key, value]) => ({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        }))
      : [{ key: "", value: "" }]
  );

  const addVariable = () => {
    setVariables([...variables, { key: "", value: "" }]);
  };

  const removeVariable = (index: number) => {
    const newVars = variables.filter((_, i) => i !== index);
    setVariables(newVars);
    updateVariablesInConfig(newVars);
  };

  const updateVariable = (index: number, field: "key" | "value", value: string) => {
    const newVars = [...variables];
    newVars[index][field] = value;
    setVariables(newVars);
    updateVariablesInConfig(newVars);
  };

  const updateVariablesInConfig = (newVars: Array<{ key: string; value: string }>) => {
    const varsObj: Record<string, any> = {};
    newVars.forEach(({ key, value }) => {
      if (key && value) {
        // Try to parse as JSON, otherwise use as string
        try {
          const parsed = JSON.parse(value);
          varsObj[key] = parsed;
        } catch {
          varsObj[key] = value;
        }
      }
    });
    onChange({ variables: varsObj });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{t('forms.set.title')}</CardTitle>
          <Button size="sm" variant="outline" onClick={addVariable}>
            <Plus className="h-3 w-3 mr-1" />
            {t('forms.set.addButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {variables.map((variable, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-xs">{t('forms.set.variableLabel', { number: index + 1 })}</Label>
            <div className="grid grid-cols-5 gap-2">
              <Input
                className="col-span-2"
                placeholder={t('forms.set.keyPlaceholder')}
                value={variable.key}
                onChange={(e) => updateVariable(index, "key", e.target.value)}
              />
              <Input
                className="col-span-2"
                placeholder={t('forms.set.valuePlaceholder')}
                value={variable.value}
                onChange={(e) => updateVariable(index, "value", e.target.value)}
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeVariable(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
