import axios, { AxiosError, HeadersDefaults } from "axios";
import { parseCookies, setCookie } from "nookies";

interface AxiosErrorResponse {
  code?: string;
}

interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string;
}

let cookies = parseCookies();
let isRefreshing = false;
let failRequestsQueue: {
  onSuccess: (token: string) => void;
  onFailed: (error: AxiosError<unknown, any>) => void;
}[] = [];

export const api = axios.create({
  baseURL: "http://localhost:3333/",
  headers: {
    Authorization: `Bearer ${cookies["authpoc.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();

        const { "authpoc.token": refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token } = response?.data;

              setCookie(undefined, "authpoc.token", token, {
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: "/",
              });

              setCookie(
                undefined,
                "authpoc.refreshToken",
                response?.data?.refreshToken,
                {
                  maxAge: 30 * 24 * 60 * 60, // 30 days
                  path: "/",
                }
              );

              api.defaults.headers = {
                Authorization: `Bearer ${token}`,
              } as CommonHeaderProperties;

              failRequestsQueue.forEach((request) => request.onSuccess(token));
              failRequestsQueue = [];
            })
            .catch((err) => {
              failRequestsQueue.forEach((request) => request.onFailed(err));
              failRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers = {
                Authorization: `Bearer ${token}`,
              };

              resolve(api(originalConfig));
            },
            onFailed: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      } else {
      }
    }
  }
);
