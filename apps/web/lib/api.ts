const API_URL = "http://localhost:3001";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    auth = true,
    headers,
    ...rest
  } = options;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...rest,
      headers: {
        "Content-Type": "application/json",

        ...(auth && token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...headers,
      },
    }
  );

  let data: any = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    console.error("API Error details:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    throw new Error(data.message || "API Error");
  }

  return data as T;
}