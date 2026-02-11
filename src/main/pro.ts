import { readSettings, writeSettings } from "./settings";

export function handleOpen-LovableProReturn({ apiKey }: { apiKey: string }) {
  const settings = readSettings();
  writeSettings({
    providerSettings: {
      ...settings.providerSettings,
      auto: {
        ...settings.providerSettings.auto,
        apiKey: {
          value: apiKey,
        },
      },
    },
    enableOpen-LovablePro: true,
    // Switch to local-agent mode and auto model for a good default experience
    selectedChatMode: "local-agent",
    selectedModel: {
      name: "auto",
      provider: "auto",
    },
  });
}
