import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, PlayCircle, Trash2, Undo2 } from "lucide-react";

type ContentPillarCardProps = {
  title: string;
  description: string;
  isActive?: boolean;
  onActivate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onCreate?: () => void;
  activateDisabled?: boolean;
};

export const ContentPillarCard = ({
  title,
  description,
  isActive = false,
  onActivate,
  onArchive,
  onDelete,
  onCreate,
  activateDisabled = false,
}: ContentPillarCardProps) => {
  return (
    <Card
      className={`flex h-full min-h-[220px] flex-col justify-between ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-md">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="space-x-2">
        {isActive && (
          <Button variant="outline" onClick={onCreate}>
            <PlayCircle className="mr-2 h-4 w-4" /> Create
          </Button>
        )}
        <Button
          variant="outline"
          onClick={isActive ? onArchive : onActivate}
          disabled={!isActive && activateDisabled}
        >
          {isActive ? (
            <>
              <Archive className="mr-2 h-4 w-4" /> Deactivate
            </>
          ) : (
            <>
              <Undo2 className="mr-2 h-4 w-4" /> Activate
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
