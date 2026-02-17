/* cms/app/(payload)/serverFunction.ts */
"use server";

import { handleServerFunctions } from "@payloadcms/next/layouts";

import { importMap } from "./admin/importMap";
import { configPromise } from "../../payload.config";

export async function serverFunction(args: Parameters<typeof handleServerFunctions>[0]) {
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
}
