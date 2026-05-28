import { SetupPipeline, type SetupPipelineOptions, type SetupPipelineResult } from "./SetupPipeline.js";

export async function runHarnessSetup(options: SetupPipelineOptions): Promise<SetupPipelineResult> {
  return new SetupPipeline(options).run();
}
