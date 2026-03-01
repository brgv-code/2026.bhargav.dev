import "@payloadcms/next/css";
import type { Metadata } from "next";
import { RootLayout } from "@payloadcms/next/layouts";
import { serverFunction } from "./serverFunction";
import { importMap } from "./admin/importMap";
import { configPromise } from "../../payload.config";
import React from "react";

type Args = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  description: "Payload CMS",
  title: "Payload CMS",
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={configPromise}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
