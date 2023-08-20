//from: https://github.com/tauri-apps/plugins-workspace/blob/v1/plugins/store/guest-js/index.ts

class Store {
  constructor(path) {
    this.path = path;
  }
  set(key, value) {
    return window.__TAURI__.invoke("plugin:store|set", {
      path: this.path,
      key,
      value,
    });
  }
  get(key) {
    return window.__TAURI__.invoke("plugin:store|get", {
      path: this.path,
      key
    })
  }
  save() {
    return window.__TAURI__.invoke("plugin:store|save", {
      path: this.path,
    })
  }
}