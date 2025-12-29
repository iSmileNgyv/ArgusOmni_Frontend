"use client";

import { ExtractConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ExtractFormProps {
  config: ExtractConfig;
  onChange: (config: ExtractConfig) => void;
}

export function ExtractForm({ config, onChange }: ExtractFormProps) {
  const t = useTranslations();
  const [extractions, setExtractions] = useState<Array<{ key: string; value: string }>>(
    Object.entries(config).map(([key, value]) => ({ key, value }))
  );

  const addExtraction = () => {
    setExtractions([...extractions, { key: "", value: "" }]);
  };

  const removeExtraction = (index: number) => {
    const newExtractions = extractions.filter((_, i) => i !== index);
    setExtractions(newExtractions);
    updateExtractionsInConfig(newExtractions);
  };

  const updateExtraction = (index: number, field: "key" | "value", value: string) => {
    const newExtractions = [...extractions];
    newExtractions[index][field] = value;
    setExtractions(newExtractions);
    updateExtractionsInConfig(newExtractions);
  };

  const updateExtractionsInConfig = (newExtractions: Array<{ key: string; value: string }>) => {
    const extractObj: ExtractConfig = {};
    newExtractions.forEach(({ key, value }) => {
      if (key && value) extractObj[key] = value;
    });
    onChange(extractObj);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{t('forms.extract.title')}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {t('forms.extract.description')}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={addExtraction}>
            <Plus className="h-3 w-3 mr-1" />
            {t('forms.extract.addButton')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {extractions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t('forms.extract.noExtracts')}
          </p>
        ) : (
          extractions.map((extraction, index) => (
            <div key={index} className="space-y-2">
              <Label className="text-xs">{t('forms.extract.extractLabel', { number: index + 1 })}</Label>
              <div className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.extract.variableNamePlaceholder')}
                  value={extraction.key}
                  onChange={(e) => updateExtraction(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2 font-mono text-xs"
                  placeholder={t('forms.extract.jsonPathPlaceholder')}
                  value={extraction.value}
                  onChange={(e) => updateExtraction(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeExtraction(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                {t('forms.extract.extractDescription', {
                  path: extraction.value || "$.path",
                  variable: extraction.key || "variableName"
                })}
              </p>
            </div>
          ))
        )}

        {extractions.length === 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-mono">
              <strong>{t('forms.extract.exampleTitle')}</strong><br/>
              {t('forms.extract.exampleVariable')}: <code>userId</code><br/>
              {t('forms.extract.exampleJsonPath')}: <code>$.id</code><br/>
              <br/>
              {t('forms.extract.exampleResponse')}: <code>{`{"id": 123, "name": "John"}`}</code><br/>
              {t('forms.extract.exampleResult')}: <code>userId = 123</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
