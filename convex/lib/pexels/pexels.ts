import { createClient } from "pexels";
import { requireEnv } from "../../../env";

export class Pexels {
  private client?: ReturnType<typeof createClient>;

  private ensureClient(): ReturnType<typeof createClient> {
    if (!this.client) {
      const env = requireEnv("pexels");
      this.client = createClient(env.pexels.apiKey);
    }

    return this.client;
  }

  public async searchPhotos(
    query: string,
    options?: {
      orientation?: "landscape" | "portrait" | "square";
    }
  ) {
    const client = this.ensureClient();
    const response = await client.photos.search({
      query,
      per_page: 10,
      orientation: options?.orientation ?? "square",
    });

    if ("error" in response) {
      throw Error(response.error);
    }

    return response.photos;
  }

  public async searchVideos(
    query: string,
    options?: {
      orientation?: "landscape" | "portrait" | "square";
    }
  ) {
    const client = this.ensureClient();
    const response = await client.videos.search({
      query,
      per_page: 25,
      orientation: options?.orientation ?? "square",
    });

    if ("error" in response) {
      throw Error(response.error);
    }

    return response.videos;
  }

  // TODO: videos
}
