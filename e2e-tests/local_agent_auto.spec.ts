import { testSkipIfWindows } from "./helpers/test_helper";

testSkipIfWindows("local-agent - auto model", async ({ po }) => {
  await po.setUpOpen-LovablePro({ localAgent: true, localAgentUseAutoModel: true });
  await po.importApp("minimal");

  await po.sendPrompt("[dump]");
  await po.snapshotServerDump("request");
});
