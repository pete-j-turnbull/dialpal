"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pen, User2Icon } from "lucide-react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { api } from "@convex/_generated/api";
import { useAuthenticatedQuery } from "@/hooks/convex-hooks";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RenderedVideo } from "@convex/schema/rendered_video";
import { VideoThumbnail } from "./components/video-thumbnail";
import { Id } from "@convex/_generated/dataModel";
import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "convex/react";
import { toast } from "sonner";

const ActionGrid = (props: { className?: string }) => {
  const { slug } = useParams();
  const isAvatarRawEnabled = useFeatureFlagEnabled("avatar-raw");

  const actions = [
    {
      id: "0",
      to: `/orgs/${slug}/thought-leadership-916`,
      icon: <User2Icon className="text-primary h-6 w-6" />,
      title: "Create 9:16 video",
      desc: "Designed for thought leadership.",
    },
    {
      id: "1",
      to: `/orgs/${slug}/thought-leadership-169`,
      icon: <User2Icon className="text-primary h-6 w-6" />,
      title: "Create 16:9 video",
      desc: "Designed for thought leadership.",
    },
  ];

  if (isAvatarRawEnabled) {
    actions.push({
      id: "2",
      to: `/orgs/${slug}/raw`,
      icon: <Pen className="text-primary h-6 w-6" />,
      title: "Create talking head video",
      desc: "Designed for avatar only videos.",
    });
  }

  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        props.className
      )}
    >
      {actions.map((a) => (
        <Link key={a.id} href={a.to}>
          <Card
            className="hover:ring-primary/40 group h-full cursor-pointer
                           transition hover:ring-1"
          >
            <CardHeader className="space-y-2">
              {a.icon}
              <CardTitle className="text-xl">{a.title}</CardTitle>
              <CardDescription>{a.desc}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const RecentVideos = (props: {
  renderedVideos: RenderedVideo[];
  className?: string;
}) => {
  const { renderedVideos, className } = props;
  const [retryingVideos, setRetryingVideos] = useState<
    Set<Id<"rendered_videos">>
  >(new Set());

  const router = useRouter();
  const params = useParams();
  const retryMutation = useMutation(api.protected.rendered_video.retry);

  const sortedProjects = [...renderedVideos].sort((a, b) => {
    const dateA = a._creationTime;
    const dateB = b._creationTime;
    return dateB > dateA ? 1 : -1; // Sort in descending order (newest first)
  });

  const handleWatch = useCallback(
    (videoId: Id<"rendered_videos">) => {
      router.push(`/orgs/${params.slug}/videos/${videoId}/view`);
    },
    [router, params.slug]
  );

  const handleRetry = useCallback(
    async (videoId: Id<"rendered_videos">) => {
      setRetryingVideos((prev) => new Set(prev).add(videoId));
      try {
        await retryMutation({ id: videoId });
        toast.success("Video generation restarted successfully");
      } catch (error) {
        toast.error("Failed to retry video generation");
      } finally {
        setRetryingVideos((prev) => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
      }
    },
    [retryMutation]
  );

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-medium">Recent Videos</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProjects.map((v) => (
          <VideoThumbnail
            key={v._id}
            renderedVideo={v}
            onWatch={handleWatch}
            onRetry={handleRetry}
            isRetrying={retryingVideos.has(v._id)}
          />
        ))}
      </div>
    </div>
  );
};

const VideoThumbnailSkeleton = () => {
  return (
    <div className="w-full max-w-xs space-y-2">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video overflow-hidden rounded-md">
        <Skeleton className="absolute inset-0 h-full w-full" />
        {/* Status badge skeleton */}
        <Skeleton className="absolute right-2 top-2 h-6 w-20 rounded-full" />
        {/* Duration indicator skeleton */}
        <Skeleton className="absolute bottom-2 right-2 h-5 w-12 rounded" />
      </div>

      {/* Title and metadata skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
};

const RecentVideosLoading = (props: { className?: string }) => {
  const { className } = props;

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-medium">Recent Videos</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Show 8 skeleton items */}
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoThumbnailSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// TODO: add flows (as draft area)

export default function Page() {
  const renderedVideos = useAuthenticatedQuery(
    api.protected.rendered_video.list
  )?.data;

  const isLoading = renderedVideos === undefined;

  return (
    <div className="flex h-full flex-col gap-12 px-12">
      <div className="mt-8 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800">Hey there,</h2>

        <p className="text-muted-foreground text-2xl font-medium">
          {isLoading
            ? "Loading your videos..."
            : renderedVideos.length > 0
            ? "Let's create your next video!"
            : "Let's create your first video!"}
        </p>
      </div>

      <ActionGrid className="w-full" />

      {isLoading ? (
        <RecentVideosLoading className="w-full" />
      ) : (
        <RecentVideos renderedVideos={renderedVideos} className="w-full" />
      )}
    </div>
  );
}
