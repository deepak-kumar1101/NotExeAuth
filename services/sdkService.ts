import { ref, onValue, set, remove, get } from 'firebase/database';
import { db } from './firebase';
import { SDK } from '../types';

export const DEFAULT_SDKS: SDK[] = [
  {
    id: 'python',
    name: 'Python',
    language: 'python',
    icon: 'Terminal',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-python-sdk',
    version: 'v1.3.0',
    badge: 'Stable',
    displayOrder: 1,
    visible: true,
    description: 'Official Python 3 SDK with username/password & license-only auth, AES encryption & HWID locking.',
    sdkCode: `import requests
import json
import hashlib
import subprocess

class DXAAuth:
    def __init__(self, app_name: str, app_version: str, app_secret: str):
        self.app_name = app_name
        self.app_version = app_version
        self.app_secret = app_secret
        self.base_url = "https://deepxauth-api.pages.dev"
        self.session_user = None

    def get_hwid(self) -> str:
        try:
            cmd = "wmic csproduct get uuid"
            uuid = subprocess.check_output(cmd).decode().split('\\n')[1].strip()
            return hashlib.sha256(uuid.encode()).hexdigest()
        except Exception:
            return "HWID_FAIL"

    def login(self, username: str, password: str) -> dict:
        """Authenticate using Username and Password."""
        payload = {
            "username": username,
            "password": password,
            "secret": self.app_secret,
            "appName": self.app_name,
            "appVersion": self.app_version,
            "hwid": self.get_hwid()
        }
        res = requests.post(f"{self.base_url}/login", json=payload)
        data = res.json()
        if data.get("success") or data.get("message") == "LOGIN_SUCCESS":
            self.session_user = data.get("username")
        return data

    def license_login(self, license_key: str) -> dict:
        """Authenticate using License Key only."""
        payload = {
            "licenseKey": license_key,
            "secret": self.app_secret,
            "appName": self.app_name,
            "appVersion": self.app_version,
            "hwid": self.get_hwid()
        }
        res = requests.post(f"{self.base_url}/login", json=payload)
        data = res.json()
        if data.get("success") or data.get("message") == "LOGIN_SUCCESS":
            self.session_user = data.get("username") or license_key
        return data

# Usage Example:
auth = DXAAuth("MyApp", "1.0.0", "YOUR_APP_SECRET")

# Option A: License-Only Login
result = auth.license_login("DXA-XXXX-YYYY-ZZZZ")
print("License Login Result:", result)

# Option B: Username + Password Login
# result = auth.login("john_doe", "SecretPass123")
`
  },
  {
    id: 'csharp',
    name: 'C# .NET',
    language: 'csharp',
    icon: 'Code',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-csharp-sdk',
    version: 'v2.2.0',
    badge: 'Stable',
    displayOrder: 2,
    visible: true,
    description: 'Native C# .NET Core & Framework SDK with License-Only and Username/Password authentication.',
    sdkCode: `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

public class DXAAuth 
{
    private readonly string _appName;
    private readonly string _appVersion;
    private readonly string _appSecret;
    private static readonly HttpClient client = new HttpClient();
    private const string BaseUrl = "https://deepxauth-api.pages.dev/login";

    public DXAAuth(string appName, string appVersion, string appSecret) 
    {
        _appName = appName;
        _appVersion = appVersion;
        _appSecret = appSecret;
    }

    /// <summary>Authenticate with Username and Password</summary>
    public async Task<bool> AuthenticateAsync(string username, string password, string hwid = "") 
    {
        var payload = new {
            username = username,
            password = password,
            secret = _appSecret,
            appName = _appName,
            appVersion = _appVersion,
            hwid = hwid
        };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync(BaseUrl, content);
        var result = await response.Content.ReadAsStringAsync();
        return result.Contains("LOGIN_SUCCESS");
    }

    /// <summary>Authenticate with License Key Only</summary>
    public async Task<bool> AuthenticateLicenseAsync(string licenseKey, string hwid = "") 
    {
        var payload = new {
            licenseKey = licenseKey,
            secret = _appSecret,
            appName = _appName,
            appVersion = _appVersion,
            hwid = hwid
        };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync(BaseUrl, content);
        var result = await response.Content.ReadAsStringAsync();
        return result.Contains("LOGIN_SUCCESS");
    }
}
`
  },
  {
    id: 'cpp',
    name: 'C++ Native',
    language: 'cpp',
    icon: 'Cpu',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-cpp-sdk',
    version: 'v1.1.0',
    badge: 'Stable',
    displayOrder: 3,
    visible: true,
    description: 'High-performance header-only C++ library with license-only login & memory anti-tamper protection.',
    sdkCode: `#include <iostream>
#include <string>
#include <curl/curl.h>

class DXAClient {
public:
    std::string app_name;
    std::string app_version;
    std::string secret_key;

    DXAClient(std::string name, std::string ver, std::string secret) 
        : app_name(name), app_version(ver), secret_key(secret) {}

    // Username and Password Authentication
    bool login(const std::string& username, const std::string& password, const std::string& hwid = "") {
        std::cout << "[DXA] Authenticating user credentials..." << std::endl;
        return send_auth_request("{\\"username\\":\\"" + username + "\\",\\"password\\":\\"" + password + "\\",\\"secret\\":\\"" + secret_key + "\\",\\"appName\\":\\"" + app_name + "\\",\\"appVersion\\":\\"" + app_version + "\\",\\"hwid\\":\\"" + hwid + "\\"}");
    }

    // License-Only Authentication
    bool login_license(const std::string& license_key, const std::string& hwid = "") {
        std::cout << "[DXA] Authenticating license key..." << std::endl;
        return send_auth_request("{\\"licenseKey\\":\\"" + license_key + "\\",\\"secret\\":\\"" + secret_key + "\\",\\"appName\\":\\"" + app_name + "\\",\\"appVersion\\":\\"" + app_version + "\\",\\"hwid\\":\\"" + hwid + "\\"}");
    }

private:
    bool send_auth_request(const std::string& json_payload) {
        CURL* curl = curl_easy_init();
        if(!curl) return false;
        
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, "https://deepxauth-api.pages.dev/login");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_payload.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        CURLcode res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        return res == CURLE_OK;
    }
};

int main() {
    DXAClient auth("MyGame", "1.0.0", "YOUR_APP_SECRET");
    
    // License-Only Login
    if (auth.login_license("DXA-XXXX-YYYY-ZZZZ", "HWID-1234")) {
        std::cout << "License Verified & Granted!" << std::endl;
    }
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    language: 'java',
    icon: 'Box',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-java-sdk',
    version: 'v1.2.0',
    badge: 'Beta',
    displayOrder: 4,
    visible: true,
    description: 'Official Java JDK client with dual Username/Password and License-Only authentication.',
    sdkCode: `package com.deepxauth.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class DXAAuth {
    private final String appName;
    private final String appVersion;
    private final String appSecret;
    private final HttpClient client = HttpClient.newHttpClient();
    private static final String API_URL = "https://deepxauth-api.pages.dev/login";

    public DXAAuth(String appName, String appVersion, String appSecret) {
        this.appName = appName;
        this.appVersion = appVersion;
        this.appSecret = appSecret;
    }

    public boolean login(String username, String password, String hwid) throws Exception {
        String jsonPayload = String.format(
            "{\\"username\\":\\"%s\\", \\"password\\":\\"%s\\", \\"secret\\":\\"%s\\", \\"appName\\":\\"%s\\", \\"appVersion\\":\\"%s\\", \\"hwid\\":\\"%s\\"}",
            username, password, appSecret, appName, appVersion, hwid
        );
        return sendRequest(jsonPayload);
    }

    public boolean loginLicense(String licenseKey, String hwid) throws Exception {
        String jsonPayload = String.format(
            "{\\"licenseKey\\":\\"%s\\", \\"secret\\":\\"%s\\", \\"appName\\":\\"%s\\", \\"appVersion\\":\\"%s\\", \\"hwid\\":\\"%s\\"}",
            licenseKey, appSecret, appName, appVersion, hwid
        );
        return sendRequest(jsonPayload);
    }

    private boolean sendRequest(String jsonPayload) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(API_URL))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body().contains("LOGIN_SUCCESS");
    }
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    language: 'rust',
    icon: 'Shield',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-rust-sdk',
    version: 'v1.0.0',
    badge: 'Stable',
    displayOrder: 5,
    visible: true,
    description: 'Zero-overhead memory-safe Rust client crate supporting license-only authentication.',
    sdkCode: `use reqwest::Client;
use serde_json::json;

pub struct DXAClient {
    pub app_name: String,
    pub app_version: String,
    pub app_secret: String,
    client: Client,
}

impl DXAClient {
    pub fn new(app_name: &str, app_version: &str, app_secret: &str) -> Self {
        Self {
            app_name: app_name.to_string(),
            app_version: app_version.to_string(),
            app_secret: app_secret.to_string(),
            client: Client::new(),
        }
    }

    pub async fn login(&self, username: &str, password: &str, hwid: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let payload = json!({
            "username": username,
            "password": password,
            "secret": self.app_secret,
            "appName": self.app_name,
            "appVersion": self.app_version,
            "hwid": hwid
        });

        let res = self.client.post("https://deepxauth-api.pages.dev/login")
            .json(&payload)
            .send()
            .await?;

        let text = res.text().await?;
        Ok(text.contains("LOGIN_SUCCESS"))
    }

    pub async fn login_license(&self, license_key: &str, hwid: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let payload = json!({
            "licenseKey": license_key,
            "secret": self.app_secret,
            "appName": self.app_name,
            "appVersion": self.app_version,
            "hwid": hwid
        });

        let res = self.client.post("https://deepxauth-api.pages.dev/login")
            .json(&payload)
            .send()
            .await?;

        let text = res.text().await?;
        Ok(text.contains("LOGIN_SUCCESS"))
    }
}
`
  },
  {
    id: 'go',
    name: 'Go',
    language: 'go',
    icon: 'Zap',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-go-sdk',
    version: 'v1.1.0',
    badge: 'Stable',
    displayOrder: 6,
    visible: true,
    description: 'High-throughput Go client module with license-only and user authentication methods.',
    sdkCode: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type DXAClient struct {
	AppName    string
	AppVersion string
	AppSecret  string
}

func (c *DXAClient) Login(username, password, hwid string) (bool, error) {
	payload := map[string]string{
		"username":   username,
		"password":   password,
		"secret":     c.AppSecret,
		"appName":    c.AppName,
		"appVersion": c.AppVersion,
		"hwid":       hwid,
	}
	return c.sendAuth(payload)
}

func (c *DXAClient) LicenseLogin(licenseKey, hwid string) (bool, error) {
	payload := map[string]string{
		"licenseKey": licenseKey,
		"secret":     c.AppSecret,
		"appName":    c.AppName,
		"appVersion": c.AppVersion,
		"hwid":       hwid,
	}
	return c.sendAuth(payload)
}

func (c *DXAClient) sendAuth(payload map[string]string) (bool, error) {
	body, _ := json.Marshal(payload)
	resp, err := http.Post("https://deepxauth-api.pages.dev/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return bytes.Contains(respBody, []byte("LOGIN_SUCCESS")), nil
}
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    language: 'typescript',
    icon: 'Code',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-ts-sdk',
    version: 'v2.1.0',
    badge: 'Stable',
    displayOrder: 7,
    visible: true,
    description: 'Type-safe SDK for Node.js, Next.js, and web backends supporting license-only login.',
    sdkCode: `import axios from 'axios';

export interface DXAOptions {
  appName: string;
  appVersion: string;
  secret: string;
}

export class DXAService {
  private baseUrl = 'https://deepxauth-api.pages.dev/login';

  constructor(private options: DXAOptions) {}

  /** Authenticate with Username and Password */
  async authenticate(username: string, password: string, hwid: string = ''): Promise<boolean> {
    const { data } = await axios.post(this.baseUrl, {
      username,
      password,
      secret: this.options.secret,
      appName: this.options.appName,
      appVersion: this.options.appVersion,
      hwid
    });
    return data.message === 'LOGIN_SUCCESS' || data.success === true;
  }

  /** Authenticate with License Key Only */
  async authenticateLicense(licenseKey: string, hwid: string = ''): Promise<boolean> {
    const { data } = await axios.post(this.baseUrl, {
      licenseKey,
      secret: this.options.secret,
      appName: this.options.appName,
      appVersion: this.options.appVersion,
      hwid
    });
    return data.message === 'LOGIN_SUCCESS' || data.success === true;
  }
}
`
  }
];

export const subscribeToSDKs = (callback: (sdks: SDK[]) => void) => {
  const sdksRef = ref(db, 'system/sdks');
  return onValue(sdksRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: SDK[] = Object.values(data);
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      callback(list);
    } else {
      // Seed default SDKs into Firebase if empty
      const initialMap: Record<string, SDK> = {};
      DEFAULT_SDKS.forEach(sdk => {
        initialMap[sdk.id] = sdk;
      });
      set(sdksRef, initialMap);
      callback(DEFAULT_SDKS);
    }
  });
};

export const saveSDK = async (sdk: SDK): Promise<void> => {
  const sdkRef = ref(db, `system/sdks/${sdk.id}`);
  const now = new Date().toISOString();
  const sdkData: SDK = {
    ...sdk,
    updatedAt: now,
    createdAt: sdk.createdAt || now,
    link: sdk.githubUrl // backward compatibility
  };
  await set(sdkRef, sdkData);
};

export const deleteSDK = async (id: string): Promise<void> => {
  const sdkRef = ref(db, `system/sdks/${id}`);
  await remove(sdkRef);
};

export const toggleSDKVisibility = async (id: string, currentVisible: boolean): Promise<void> => {
  const sdkRef = ref(db, `system/sdks/${id}/visible`);
  await set(sdkRef, !currentVisible);
};
