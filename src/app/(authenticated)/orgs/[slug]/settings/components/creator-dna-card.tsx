"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type CreatorDNAFormValues = {
  description?: string;
  icp?: string;
  salesTranscripts?: string;
  brandVoice?: string;
  mission?: string;
  coreValues?: string;
  competitors?: string;
  valuePropositions?: string;
  bio?: string;
};

type CreatorDNACardProps = {
  value?: CreatorDNAFormValues;
  onChange?: (values: CreatorDNAFormValues) => void;
};

export function CreatorDNACard({ value, onChange }: CreatorDNACardProps) {
  const [formData, setFormData] = useState<CreatorDNAFormValues>({
    description: value?.description || "",
    icp: value?.icp || "",
    salesTranscripts: value?.salesTranscripts || "",
    brandVoice: value?.brandVoice || "",
    mission: value?.mission || "",
    coreValues: value?.coreValues || "",
    valuePropositions: value?.valuePropositions || "",
    competitors: value?.competitors || "",
    bio: value?.bio || "",
  });

  const handleFieldChange = (
    field: keyof CreatorDNAFormValues,
    fieldValue: string
  ) => {
    setFormData({ ...formData, [field]: fieldValue });
  };

  const handleFieldBlur = () => {
    onChange?.(formData);
  };

  useEffect(() => {
    if (!value) return;

    // Only update if the actual values have changed
    const hasChanged = Object.keys(value).some(
      (key) =>
        value[key as keyof CreatorDNAFormValues] !==
        formData[key as keyof CreatorDNAFormValues]
    );

    if (hasChanged) {
      setFormData({
        description: value.description || "",
        icp: value.icp || "",
        salesTranscripts: value.salesTranscripts || "",
        brandVoice: value.brandVoice || "",
        mission: value.mission || "",
        coreValues: value.coreValues || "",
        valuePropositions: value.valuePropositions || "",
        competitors: value.competitors || "",
        bio: value.bio || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Creator DNA</CardTitle>
        <CardDescription>
          Define your brand identity and target audience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>
          <Input
            id="description"
            placeholder="Enter a short description of the team/company"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            onBlur={handleFieldBlur}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icp">Ideal Customer Profile</Label>
          <Input
            id="icp"
            placeholder="Describe your ideal customer"
            value={formData.icp}
            onChange={(e) => handleFieldChange("icp", e.target.value)}
            onBlur={handleFieldBlur}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salesTranscripts">Sales Transcripts</Label>
          <Textarea
            id="salesTranscripts"
            placeholder="Paste sales call transcripts here"
            value={formData.salesTranscripts}
            onChange={(e) =>
              handleFieldChange("salesTranscripts", e.target.value)
            }
            onBlur={handleFieldBlur}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitors">Competitors</Label>
          <Input
            id="competitors"
            placeholder="Enter the URLs of your competitors"
            value={formData.competitors}
            onChange={(e) => handleFieldChange("competitors", e.target.value)}
            onBlur={handleFieldBlur}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Creator Bio</Label>
          <Input
            id="bio"
            placeholder="Describe your creator bio"
            value={formData.bio}
            onChange={(e) => handleFieldChange("bio", e.target.value)}
            onBlur={handleFieldBlur}
          />
        </div>
      </CardContent>
    </Card>
  );
}
