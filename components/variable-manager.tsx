"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Trash2 } from "lucide-react";

interface VariableManagerProps {
  env: Record<string, string>;
  variables: Record<string, any>;
  onEnvChange: (env: Record<string, string>) => void;
  onVariablesChange: (variables: Record<string, any>) => void;
}

export function VariableManager({
  env,
  variables,
  onEnvChange,
  onVariablesChange,
}: VariableManagerProps) {
  const t = useTranslations();
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>(
    Object.entries(env).map(([key, value]) => ({ key, value }))
  );

  const [globalVars, setGlobalVars] = useState<Array<{ key: string; value: string }>>(
    Object.entries(variables).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
    }))
  );

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    const newVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newVars);
    updateEnvInParent(newVars);
  };

  const updateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const newVars = [...envVars];
    newVars[index][field] = value;
    setEnvVars(newVars);
    updateEnvInParent(newVars);
  };

  const updateEnvInParent = (newVars: Array<{ key: string; value: string }>) => {
    const envObj: Record<string, string> = {};
    newVars.forEach(({ key, value }) => {
      if (key && value) envObj[key] = value;
    });
    onEnvChange(envObj);
  };

  const addGlobalVar = () => {
    setGlobalVars([...globalVars, { key: "", value: "" }]);
  };

  const removeGlobalVar = (index: number) => {
    const newVars = globalVars.filter((_, i) => i !== index);
    setGlobalVars(newVars);
    updateGlobalVarsInParent(newVars);
  };

  const updateGlobalVar = (index: number, field: "key" | "value", value: string) => {
    const newVars = [...globalVars];
    newVars[index][field] = value;
    setGlobalVars(newVars);
    updateGlobalVarsInParent(newVars);
  };

  const updateGlobalVarsInParent = (newVars: Array<{ key: string; value: string }>) => {
    const varsObj: Record<string, any> = {};
    newVars.forEach(({ key, value }) => {
      if (key && value) {
        try {
          varsObj[key] = JSON.parse(value);
        } catch {
          varsObj[key] = value;
        }
      }
    });
    onVariablesChange(varsObj);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('forms.variableManager.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="env">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="env">{t('forms.variableManager.envTab')}</TabsTrigger>
            <TabsTrigger value="global">{t('forms.variableManager.globalTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="env" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t('forms.variableManager.envDescription')}
              </Label>
              <Button size="sm" variant="outline" onClick={addEnvVar}>
                <Plus className="h-3 w-3 mr-1" />
                {t('forms.variableManager.addButton')}
              </Button>
            </div>
            {envVars.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('forms.variableManager.noEnvVars')}
              </p>
            ) : (
              <div className="space-y-2">
                {envVars.map((envVar, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <Input
                      className="col-span-2"
                      placeholder={t('forms.variableManager.keyPlaceholderEnv')}
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    />
                    <Input
                      className="col-span-2"
                      placeholder={t('forms.variableManager.valuePlaceholder')}
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeEnvVar(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t('forms.variableManager.globalDescription')}
              </Label>
              <Button size="sm" variant="outline" onClick={addGlobalVar}>
                <Plus className="h-3 w-3 mr-1" />
                {t('forms.variableManager.addButton')}
              </Button>
            </div>
            {globalVars.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('forms.variableManager.noGlobalVars')}
              </p>
            ) : (
              <div className="space-y-2">
                {globalVars.map((globalVar, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <Input
                      className="col-span-2"
                      placeholder={t('forms.variableManager.keyPlaceholderGlobal')}
                      value={globalVar.key}
                      onChange={(e) => updateGlobalVar(index, "key", e.target.value)}
                    />
                    <Input
                      className="col-span-2"
                      placeholder={t('forms.variableManager.valuePlaceholder')}
                      value={globalVar.value}
                      onChange={(e) => updateGlobalVar(index, "value", e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeGlobalVar(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
