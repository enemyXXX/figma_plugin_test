"use strict";
(() => {
  // src/constants.ts
  var STORAGE_KEYS = {
    selected: "repo_selected",
    // RepoKind
    tokenPublic: "token_public_icons",
    // GitHub PAT
    tokenPrivate: "token_private_icons",
    // GitLab token
    tokenImages: "token_internal_images"
    // GitLab token
  };
  var REPOS = {
    "public-icons": {
      kind: "github",
      apiBase: "https://api.github.com",
      owner: "VKCOM",
      repo: "icons"
    },
    "private-icons": {
      kind: "gitlab",
      baseUrl: "https://gitlab.mvk.com",
      projectPath: "design/icons-private"
    },
    "internal-images": {
      kind: "gitlab",
      baseUrl: "https://gitlab.mvk.com",
      projectPath: "design/images"
    }
  };

  // src/utils/api.ts
  function hasMessage(x) {
    return typeof x === "object" && x !== null && "message" in x;
  }
  function toApiError(e) {
    if (hasMessage(e)) return String(e.message);
    return String(e);
  }
  async function safeFetch(url, init, timeoutMs) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    let timeoutId;
    if (controller) {
      init = Object.assign({}, init, { signal: controller.signal });
    }
    try {
      const request = fetch(url, init);
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller == null ? void 0 : controller.abort();
          reject(new Error("Request timed out: " + url));
        }, timeoutMs);
      });
      const res = await Promise.race([request, timeout]);
      if (timeoutId) clearTimeout(timeoutId);
      return res;
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId);
      throw e;
    }
  }
  async function checkGithubToken(token) {
    try {
      const res = await safeFetch(
        "https://api.github.com/user",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/vnd.github+json"
          }
        },
        12e3
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, status: res.status, error: text || "GitHub token check failed" };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, error: toApiError(e) };
    }
  }
  async function checkGitlabToken(token, baseUrl) {
    try {
      const res = await safeFetch(
        baseUrl.replace(/\/+$/, "") + "/api/v4/user",
        {
          method: "GET",
          headers: { "Private-Token": token }
        },
        12e3
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, status: res.status, error: text || "GitLab token check failed" };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, error: toApiError(e) };
    }
  }
  async function verifyTokenByKind(kind, token) {
    if (!token) return { ok: false, status: 0, error: "\u0422\u043E\u043A\u0435\u043D \u043D\u0435 \u0437\u0430\u0434\u0430\u043D" };
    if (kind === "public-icons") {
      const gh = await checkGithubToken(token);
      return gh.ok && gh.data ? { ok: true, status: gh.status, data: { displayName: gh.data.login } } : { ok: false, status: gh.status, error: gh.error || "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 GitHub \u0442\u043E\u043A\u0435\u043D\u0430" };
    }
    const cfg = REPOS[kind];
    if (cfg.kind !== "gitlab") {
      return { ok: false, status: 0, error: "\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u044F" };
    }
    const gl = await checkGitlabToken(token, cfg.baseUrl);
    return gl.ok && gl.data ? { ok: true, status: gl.status, data: { displayName: gl.data.username } } : { ok: false, status: gl.status, error: gl.error || "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 GitLab \u0442\u043E\u043A\u0435\u043D\u0430" };
  }

  // src/utils/storage.ts
  var tokenKeyByRepo = {
    "public-icons": STORAGE_KEYS.tokenPublic,
    "private-icons": STORAGE_KEYS.tokenPrivate,
    "internal-images": STORAGE_KEYS.tokenImages
  };
  var Storage = {
    async getRepoKind() {
      return await figma.clientStorage.getAsync(STORAGE_KEYS.selected);
    },
    async setRepoKind(kind) {
      await figma.clientStorage.setAsync(STORAGE_KEYS.selected, kind);
    },
    async getToken(kind) {
      const key = tokenKeyByRepo[kind];
      return await figma.clientStorage.getAsync(key);
    },
    async setToken(kind, token) {
      const key = tokenKeyByRepo[kind];
      await figma.clientStorage.setAsync(key, token);
    },
    async clearToken(kind) {
      const key = tokenKeyByRepo[kind];
      await figma.clientStorage.deleteAsync(key);
    },
    async getAllTokens() {
      const [pub, priv, img] = await Promise.all([
        figma.clientStorage.getAsync(STORAGE_KEYS.tokenPublic),
        figma.clientStorage.getAsync(STORAGE_KEYS.tokenPrivate),
        figma.clientStorage.getAsync(STORAGE_KEYS.tokenImages)
      ]);
      return {
        "public-icons": pub || "",
        "private-icons": priv || "",
        "internal-images": img || ""
      };
    }
  };

  // src/code.ts
  figma.showUI(__html__, { width: 520, height: 420 });
  function postMessage(msg) {
    figma.ui.postMessage(msg);
  }
  function isRepoKind(v) {
    return v === "public-icons" || v === "private-icons" || v === "internal-images";
  }
  function hasMessage2(x) {
    return typeof x === "object" && x !== null && "message" in x;
  }
  function toMessage(e) {
    if (hasMessage2(e)) return String(e.message);
    return String(e);
  }
  (async function bootstrap() {
    try {
      const selected = await Storage.getRepoKind() || "public-icons";
      const tokens = await Storage.getAllTokens();
      postMessage({ type: "init", payload: { selected, tokens } });
    } catch (e) {
      postMessage({ type: "error", message: toMessage(e) });
    }
  })();
  figma.ui.onmessage = async function(msg) {
    try {
      switch (msg.type) {
        case "set-selected": {
          const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : "public-icons";
          await Storage.setRepoKind(kind);
          postMessage({ type: "selected-saved", payload: { kind } });
          break;
        }
        case "save-token": {
          const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : "public-icons";
          const token = msg.payload.token;
          if (kind === "public-icons" && !/^ghp_|^github_pat_/.test(token)) {
            postMessage({ type: "error", message: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F GitHub PAT (ghp_\u2026 \u0438\u043B\u0438 github_pat_\u2026)" });
            return;
          }
          await Storage.setToken(kind, token);
          postMessage({ type: "token-saved", payload: { kind } });
          break;
        }
        case "clear-token": {
          const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : "public-icons";
          await Storage.clearToken(kind);
          postMessage({ type: "token-cleared", payload: { kind } });
          break;
        }
        case "check-token": {
          const kind = isRepoKind(msg.payload.kind) ? msg.payload.kind : "public-icons";
          const tokenValue = await Storage.getToken(kind) || "";
          if (!tokenValue) {
            postMessage({ type: "error", message: "\u0422\u043E\u043A\u0435\u043D \u043D\u0435 \u0437\u0430\u0434\u0430\u043D" });
            return;
          }
          const result = await verifyTokenByKind(kind, tokenValue);
          if (result.ok && result.data) {
            postMessage({
              type: "token-ok",
              payload: { kind, login: result.data.displayName }
            });
          } else {
            postMessage({
              type: "error",
              message: (result.error || "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430") + (result.status ? " (" + String(result.status) + ")" : "")
            });
          }
          break;
        }
      }
    } catch (e) {
      postMessage({ type: "error", message: toMessage(e) });
    }
  };
})();
