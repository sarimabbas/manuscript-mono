import { ITheme, UIProvider, Shell } from "@manuscript/lib";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createReactRouter,
  createRouteConfig,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { AnyZodObject } from "zod";
import * as ManuscriptApi from "../api-client";
import AuthProvider from "../components/auth-provider";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { GlobalStateAtom } from "../lib/store";
import PostsPage from "./posts";
import SchemasPage from "./schemas";

const rootRoute = createRouteConfig();

const postsRoute = rootRoute.createRoute({
  path: "/",
  component: PostsPage,
});

const schemasRoute = rootRoute.createRoute({
  path: "/schemas",
  component: SchemasPage,
});

const routeConfig = rootRoute.addChildren([postsRoute, schemasRoute]);

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"], // Pass your initial url
});

const router = createReactRouter({ routeConfig, history: memoryHistory });

ManuscriptApi.OpenAPI.BASE = "http://localhost:3001/api";

const queryClient = new QueryClient();

export interface ISchema {
  name: string;
  validator: AnyZodObject;
}

export interface IManuscriptStudioProps {
  accessToken: string;
  schemas: ISchema[];
  _themeOverride?: ITheme;
}

export const ManuscriptStudio = (props: IManuscriptStudioProps) => {
  const { accessToken, _themeOverride } = props;
  ManuscriptApi.OpenAPI.TOKEN = accessToken;

  // set globals
  const setGlobalState = useSetAtom(GlobalStateAtom);
  useEffect(() => {
    setGlobalState((prev) => {
      return {
        ...prev,
        baseProps: props,
      };
    });
  }, [props]);

  return (
    <RouterProvider router={router}>
      <QueryClientProvider client={queryClient}>
        <UIProvider _themeOverride={_themeOverride}>
          <AuthProvider accessToken={accessToken}>
            <Shell navbar={<Sidebar />} header={<Header />}>
              <Outlet />
            </Shell>
          </AuthProvider>
        </UIProvider>
      </QueryClientProvider>
    </RouterProvider>
  );
};
