"use node";

import { createRender, getRenderState } from "@packages/render-engine/render";
import { type CompositionData } from "@packages/render-engine/types";

export class RenderEngine {
  public async createRender(args: CompositionData) {
    return createRender(args);
  }

  public async getRenderState(renderId: string) {
    return getRenderState(renderId);
  }
}
