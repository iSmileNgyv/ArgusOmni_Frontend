"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { useTranslations } from "next-intl";
import { TestStep, TestSuite, generateYaml } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Plus, Trash2, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { RestStepForm } from "./forms/rest-step-form";
import { BashStepForm } from "./forms/bash-step-form";
import { SetStepForm } from "./forms/set-step-form";
import { WaitStepForm } from "./forms/wait-step-form";
import { FileUploadStepForm } from "./forms/fileupload-step-form";
import { ExpectForm } from "./forms/expect-form";
import { ExtractForm } from "./forms/extract-form";
import { VariableManager } from "./variable-manager";

interface StepBuilderProps {
  onYamlChange: (yaml: string) => void;
}

export interface StepBuilderRef {
  loadSuite: (suite: TestSuite) => void;
  getSuite: () => TestSuite;
  clearSuite: () => void;
}

export const StepBuilder = forwardRef<StepBuilderRef, StepBuilderProps>(
  ({ onYamlChange }, ref) => {
    const t = useTranslations();
    const [suite, setSuite] = useState<TestSuite>({
      env: {},
      variables: {},
      tests: [],
    });

    const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
    const [showVariables, setShowVariables] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      loadSuite: (newSuite: TestSuite) => {
        setSuite(newSuite);
        onYamlChange(generateYaml(newSuite));
      },
      getSuite: () => suite,
      clearSuite: () => {
        const emptySuite: TestSuite = {
          env: {},
          variables: {},
          tests: [],
        };
        setSuite(emptySuite);
        onYamlChange(generateYaml(emptySuite));
      },
    }));

    const updateSuite = (updates: Partial<TestSuite>) => {
      const newSuite = { ...suite, ...updates };
      setSuite(newSuite);
      onYamlChange(generateYaml(newSuite));
    };

  const addStep = () => {
    const newStep: TestStep = {
      name: "New Step",
      type: "REST",
      rest: {
        url: "",
        method: "GET",
      },
    };
    updateSuite({ tests: [...suite.tests, newStep] });
    setExpandedStepIndex(suite.tests.length);
  };

  const updateStep = (index: number, updates: Partial<TestStep>) => {
    const newTests = [...suite.tests];
    newTests[index] = { ...newTests[index], ...updates };
    updateSuite({ tests: newTests });
  };

  const deleteStep = (index: number) => {
    const newTests = suite.tests.filter((_, i) => i !== index);
    updateSuite({ tests: newTests });
    if (expandedStepIndex === index) {
      setExpandedStepIndex(null);
    }
  };

  const renderStepForm = (step: TestStep, index: number) => {
    switch (step.type) {
      case "REST":
        return (
          <RestStepForm
            config={step.rest || { url: "", method: "GET" }}
            onChange={(config) => updateStep(index, { rest: config })}
          />
        );
      case "BASH":
        return (
          <BashStepForm
            config={step.bash || { command: "" }}
            onChange={(config) => updateStep(index, { bash: config })}
          />
        );
      case "SET":
        return (
          <SetStepForm
            config={step.set || { variables: {} }}
            onChange={(config) => updateStep(index, { set: config })}
          />
        );
      case "WAIT":
        return (
          <WaitStepForm
            config={step.wait || {}}
            onChange={(config) => updateStep(index, { wait: config })}
          />
        );
      case "FILEUPLOAD":
        return (
          <FileUploadStepForm
            config={step.fileupload || { url: "", files: {} }}
            onChange={(config) => updateStep(index, { fileupload: config })}
          />
        );
      default:
        return <p className="text-sm text-muted-foreground">{t("stepBuilder.noSteps")}</p>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Variables & Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {t("stepBuilder.testSuiteInfo")}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowVariables(!showVariables)}
            >
              {showVariables ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showVariables && (
          <CardContent className="pt-0">
            <VariableManager
              env={suite.env || {}}
              variables={suite.variables || {}}
              onEnvChange={(env) => updateSuite({ env })}
              onVariablesChange={(variables) => updateSuite({ variables })}
            />
          </CardContent>
        )}
      </Card>

      {/* Add Step Button */}
      <Button onClick={addStep} className="w-full" size="lg">
        <Plus className="mr-2 h-4 w-4" />
        {t("stepBuilder.addStep")}
      </Button>

      {/* Steps List */}
      <div className="space-y-3">
        {suite.tests.map((step, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder={t("stepBuilder.stepName")}
                      value={step.name}
                      onChange={(e) => updateStep(index, { name: e.target.value })}
                    />
                    <Select
                      value={step.type}
                      onValueChange={(value: any) => {
                        const newStep: Partial<TestStep> = { type: value };
                        // Initialize config based on type
                        if (value === "REST") newStep.rest = { url: "", method: "GET" };
                        if (value === "BASH") newStep.bash = { command: "" };
                        if (value === "SET") newStep.set = { variables: {} };
                        if (value === "WAIT") newStep.wait = {};
                        if (value === "FILEUPLOAD") newStep.fileupload = { url: "", files: {} };
                        updateStep(index, newStep);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REST">{t("stepBuilder.httpRequest")}</SelectItem>
                        <SelectItem value="BASH">BASH Command</SelectItem>
                        <SelectItem value="SET">SET Variables</SelectItem>
                        <SelectItem value="WAIT">WAIT</SelectItem>
                        <SelectItem value="FILEUPLOAD">{t("stepBuilder.fileUpload")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedStepIndex(expandedStepIndex === index ? null : index)}
                  >
                    {expandedStepIndex === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedStepIndex === index && (
              <CardContent className="pt-4 space-y-4">
                {/* Step Configuration */}
                {renderStepForm(step, index)}

                <Separator />

                {/* Extract (for REST, BASH, and FILEUPLOAD) */}
                {(step.type === "REST" || step.type === "BASH" || step.type === "FILEUPLOAD") && (
                  <>
                    <ExtractForm
                      config={step.extract || {}}
                      onChange={(config) => updateStep(index, { extract: config })}
                    />
                    <Separator />
                  </>
                )}

                {/* Expect/Assertions (for REST, BASH, FILEUPLOAD, etc.) */}
                {(step.type === "REST" || step.type === "BASH" || step.type === "FILEUPLOAD") && (
                  <ExpectForm
                    config={step.expect || {}}
                    onChange={(config) => updateStep(index, { expect: config })}
                  />
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {suite.tests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("stepBuilder.noSteps")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

StepBuilder.displayName = 'StepBuilder';
