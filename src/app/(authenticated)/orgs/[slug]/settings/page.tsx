"use client";

import { api } from "@convex/_generated/api";
import { useAuthenticatedQuery } from "@/hooks/convex-hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneticCorrectionsTable } from "./components/phonetic-corrections-table";
import { CreatorDNACard } from "./components/creator-dna-card";
import { useMutation } from "convex/react";
import { CreatorDNA, PhoneticCorrection } from "@convex/schema/workspace";
import { toast } from "sonner";
import { useRef } from "react";

export default function SettingsPage() {
  const workspace = useAuthenticatedQuery(api.protected.workspace.get)?.data;
  const lastToastTime = useRef(0);

  // Throttled toast function - shows at most one toast per second
  const showSavingToast = () => {
    const now = Date.now();
    if (now - lastToastTime.current >= 1000) {
      toast("Saving changes");
      lastToastTime.current = now;
    }
  };

  const updateWorkspaceMutation = useMutation(
    api.protected.workspace.update
  ).withOptimisticUpdate((localStore, args) => {
    const currentWorkspace = localStore.getQuery(api.protected.workspace.get);

    if (!currentWorkspace) return;

    localStore.setQuery(
      api.protected.workspace.get,
      {},
      {
        ...currentWorkspace,
        phoneticCorrections:
          args.data.phoneticCorrections ?? currentWorkspace.phoneticCorrections,
        creatorDNA: args.data.creatorDNA ?? currentWorkspace.creatorDNA,
      }
    );
  });

  const handleUpdateCorrections = (corrections: PhoneticCorrection[]) => {
    showSavingToast();
    updateWorkspaceMutation({
      data: {
        phoneticCorrections: corrections,
      },
    });
  };
  const handleUpdateCreatorDNA = (creatorDNA: CreatorDNA) => {
    showSavingToast();
    updateWorkspaceMutation({
      data: {
        creatorDNA,
      },
    });
  };

  console.log(workspace);

  return (
    <div className="flex flex-1 flex-col overflow-auto px-8 py-2">
      <div className="max-w-3xl space-y-8">
        {/* Phonetic Corrections Section  */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Phonetic Corrections</CardTitle>
            <CardDescription>
              Help text-to-speech systems pronounce your brand name and terms
              correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneticCorrectionsTable
              value={workspace?.phoneticCorrections || []}
              onChange={handleUpdateCorrections}
            />

            <div className="text-muted-foreground mt-4 text-sm">
              <p>
                Add phonetic spellings for terms that are commonly mispronounced
                by text-to-speech systems. Each term must be a single word using
                only letters.
              </p>
            </div>
          </CardContent>
        </Card>

        <CreatorDNACard
          value={workspace?.creatorDNA}
          onChange={handleUpdateCreatorDNA}
        />
      </div>
    </div>
  );
}
