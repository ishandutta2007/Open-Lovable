import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";
import { OpenAIResponsesLanguageModel } from "@ai-sdk/openai/internal";
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";

import log from "electron-log";
import { getExtraProviderOptions } from "./thinking_utils";
import type { UserSettings } from "../../lib/schemas";
import type { LanguageModel } from "ai";

const logger = log.scope("llm_engine_provider");

export type ExampleChatModelId = string & {};
export interface ChatParams {
  providerId: string;
}
export interface ExampleProviderSettings {
  /**
Example API key.
*/
  apiKey?: string;
  /**
Base URL for the API calls.
*/
  baseURL?: string;
  /**
Custom headers to include in the requests.
*/
  headers?: Record<string, string>;
  /**
Optional custom url query parameters to include in request urls.
*/
  queryParams?: Record<string, string>;
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
*/
  fetch?: FetchFunction;

  openlovableOptions: {
    enableLazyEdits?: boolean;
    enableSmartFilesContext?: boolean;
    enableWebSearch?: boolean;
  };
  settings: UserSettings;
}

export interface Open-LovableEngineProvider {
  /**
Creates a model for text generation.
*/
  (modelId: ExampleChatModelId, chatParams: ChatParams): LanguageModel;

  /**
Creates a chat model for text generation.
*/
  chatModel(modelId: ExampleChatModelId, chatParams: ChatParams): LanguageModel;

  responses(modelId: ExampleChatModelId, chatParams: ChatParams): LanguageModel;
}

export function createOpen-LovableEngine(
  options: ExampleProviderSettings,
): Open-LovableEngineProvider {
  const baseURL = withoutTrailingSlash(options.baseURL);
  logger.info("creating openlovable engine with baseURL", baseURL);

  // Track request ID attempts
  const requestIdAttempts = new Map<string, number>();

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "DYAD_PRO_API_KEY",
      description: "Example API key",
    })}`,
    ...options.headers,
  });

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getCommonModelConfig = (): CommonModelConfig => ({
    provider: `openlovable-engine`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${path}`);
      if (options.queryParams) {
        url.search = new URLSearchParams(options.queryParams).toString();
      }
      return url.toString();
    },
    headers: getHeaders,
    fetch: options.fetch,
  });

  // Custom fetch implementation that adds openlovable-specific options to the request
  const createOpen-LovableFetch = ({
    providerId,
  }: {
    providerId: string;
  }): FetchFunction => {
    return (input: RequestInfo | URL, init?: RequestInit) => {
      // Use default fetch if no init or body
      if (!init || !init.body || typeof init.body !== "string") {
        return (options.fetch || fetch)(input, init);
      }

      try {
        // Parse the request body to manipulate it
        const parsedBody = {
          ...JSON.parse(init.body),
          ...getExtraProviderOptions(providerId, options.settings),
        };
        const openlovableVersionedFiles = parsedBody.openlovableVersionedFiles;
        if ("openlovableVersionedFiles" in parsedBody) {
          delete parsedBody.openlovableVersionedFiles;
        }
        const openlovableFiles = parsedBody.openlovableFiles;
        if ("openlovableFiles" in parsedBody) {
          delete parsedBody.openlovableFiles;
        }
        const requestId = parsedBody.openlovableRequestId;
        if ("openlovableRequestId" in parsedBody) {
          delete parsedBody.openlovableRequestId;
        }
        const openlovableAppId = parsedBody.openlovableAppId;
        if ("openlovableAppId" in parsedBody) {
          delete parsedBody.openlovableAppId;
        }
        const openlovableDisableFiles = parsedBody.openlovableDisableFiles;
        if ("openlovableDisableFiles" in parsedBody) {
          delete parsedBody.openlovableDisableFiles;
        }
        const openlovableMentionedApps = parsedBody.openlovableMentionedApps;
        if ("openlovableMentionedApps" in parsedBody) {
          delete parsedBody.openlovableMentionedApps;
        }
        const openlovableSmartContextMode = parsedBody.openlovableSmartContextMode;
        if ("openlovableSmartContextMode" in parsedBody) {
          delete parsedBody.openlovableSmartContextMode;
        }

        // Track and modify requestId with attempt number
        let modifiedRequestId = requestId;
        if (requestId) {
          const currentAttempt = (requestIdAttempts.get(requestId) || 0) + 1;
          requestIdAttempts.set(requestId, currentAttempt);
          modifiedRequestId = `${requestId}:attempt-${currentAttempt}`;
        }

        // Add files to the request if they exist
        if (!openlovableDisableFiles) {
          parsedBody.openlovable_options = {
            files: openlovableFiles,
            versioned_files: openlovableVersionedFiles,
            enable_lazy_edits: options.openlovableOptions.enableLazyEdits,
            enable_smart_files_context:
              options.openlovableOptions.enableSmartFilesContext,
            smart_context_mode: openlovableSmartContextMode,
            enable_web_search: options.openlovableOptions.enableWebSearch,
            app_id: openlovableAppId,
          };
          if (openlovableMentionedApps?.length) {
            parsedBody.openlovable_options.mentioned_apps = openlovableMentionedApps;
          }
        }

        // Return modified request with files included and requestId in headers
        const modifiedInit = {
          ...init,
          headers: {
            ...init.headers,
            ...(modifiedRequestId && {
              "X-Open-Lovable-Request-Id": modifiedRequestId,
            }),
          },
          body: JSON.stringify(parsedBody),
        };

        // Use the provided fetch or default fetch
        return (options.fetch || fetch)(input, modifiedInit);
      } catch (e) {
        logger.error("Error parsing request body", e);
        // If parsing fails, use original request
        return (options.fetch || fetch)(input, init);
      }
    };
  };

  const createChatModel = (
    modelId: ExampleChatModelId,
    chatParams: ChatParams,
  ) => {
    const config = {
      ...getCommonModelConfig(),
      fetch: createOpen-LovableFetch({ providerId: chatParams.providerId }),
    };

    return new OpenAICompatibleChatLanguageModel(modelId, config);
  };

  const createResponsesModel = (
    modelId: ExampleChatModelId,
    chatParams: ChatParams,
  ) => {
    const config = {
      ...getCommonModelConfig(),
      fetch: createOpen-LovableFetch({ providerId: chatParams.providerId }),
    };

    return new OpenAIResponsesLanguageModel(modelId, config);
  };

  const provider = (modelId: ExampleChatModelId, chatParams: ChatParams) =>
    createChatModel(modelId, chatParams);

  provider.chatModel = createChatModel;
  provider.responses = createResponsesModel;

  return provider;
}
