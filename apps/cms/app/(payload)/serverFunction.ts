"use server";

import type { ServerFunctionClient } from "payload";
import { handleServerFunctions } from "@payloadcms/next/layouts";

import { importMap } from "./admin/importMap";
import { configPromise } from "../../payload.config";

export const serverFunction: ServerFunctionClient = async (clientArgs) => {
  return handleServerFunctions({
    ...clientArgs,
    config: configPromise,
    importMap,
  });
};
