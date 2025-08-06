export type TextToSpeechResult = {
  url: string;
  duration: number;
  words: {
    text: string;
    start: number;
    end: number;
  }[];
};
