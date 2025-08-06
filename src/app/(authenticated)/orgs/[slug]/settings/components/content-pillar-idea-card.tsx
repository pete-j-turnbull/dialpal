import { IdeaStatus } from "@convex/schema/content_pillar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Archive, PlayCircle, Undo2 } from "lucide-react";

export type ContentPillarIdeaCardProps = {
  title: string;
  summary: string;
  status: IdeaStatus;
  showSummary?: boolean;
  onUse?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onUnarchive?: () => void;
};

export const ContentPillarIdeaCard = ({
  title,
  summary,
  status,
  showSummary = true,
  onUse,
  onArchive,
  onDelete,
  onUnarchive,
}: ContentPillarIdeaCardProps) => {
  return (
    <Card className="p-4">
      <p className="mb-2 text-md">{title}</p>
      <div className="flex items-center space-x-2">
        {status === IdeaStatus.Draft && (
          <Button variant="outline" onClick={onUse}>
            <PlayCircle className="mr-2 h-4 w-4" /> Use
          </Button>
        )}
        {status === IdeaStatus.Draft && (
          <Button variant="outline" onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" /> Archive
          </Button>
        )}
        {status === IdeaStatus.Archived && (
          <Button variant="outline" onClick={onUnarchive}>
            <Undo2 className="mr-2 h-4 w-4" /> Unarchive
          </Button>
        )}
      </div>
      {showSummary && (
        <p className="text-sm text-muted-foreground">{summary}</p>
      )}
    </Card>
  );
};
