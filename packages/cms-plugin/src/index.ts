import type { Config } from "payload";

// NOTE: Placeholder plugin. Real markdown logic currently lives in:
// apps/cms/plugins/markdownField/
export const technicalBlogPlugin = () => {
  return (config: Config): Config => config;
};
