import { ContentType, FileAudio, FileType } from "@convex/schema/common";

import { FlowType } from "@convex/schema/flows";

export const FLOW_TYPE = FlowType.ThoughtLeadership169;

export const STOCK_MUSIC: FileAudio[] = [
  {
    id: "0f7e44a922df352c05c5f73cb40ba115",
    type: FileType.Audio,
    url: "https://assets.yuzulabs.io/music/music-track-1.mp3",
    filename: "music-track-1.mp3",
    contentType: ContentType.AudioMp3,
    metadata: {
      duration: 2 * 60 * 1000,
    },
  },
  {
    id: "d893377c9d852e09874125b10a0e4f66",
    type: FileType.Audio,
    url: "https://assets.yuzulabs.io/music/music-track-2.mp3",
    filename: "music-track-2.mp3",
    contentType: ContentType.AudioMp3,
    metadata: {
      duration: 2 * 60 * 1000,
    },
  },
  {
    id: "43042f668f07adfd174cb1823d4795e1",
    type: FileType.Audio,
    url: "https://assets.yuzulabs.io/music/music-track-3.mp3",
    filename: "music-track-3.mp3",
    contentType: ContentType.AudioMp3,
    metadata: {
      duration: 2 * 60 * 1000,
    },
  },
];
