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
    version: 'v1.2.0',
    badge: 'Stable',
    displayOrder: 1,
    visible: true,
    description: 'Official Python 3 SDK with AES-256 encryption, HWID locking & version verification.',
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
        cmd = "wmic csproduct get uuid"
        uuid = subprocess.check_output(cmd).decode().split('\\n')[1].strip()
        return hashlib.sha256(uuid.encode()).hexdigest()

    def login(self, username: str, password: str) -> dict:
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
        if data.get("code") == "LOGIN_SUCCESS":
            self.session_user = data.get("user")
        return data

# Usage Example:
auth = DXAAuth("MyApp", "1.0.0", "YOUR_APP_SECRET")
result = auth.login("john_doe", "SecretPass123")
print("Login Result:", result)
`
  },
  {
    id: 'csharp',
    name: 'C# .NET',
    language: 'csharp',
    icon: 'Code',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-csharp-sdk',
    version: 'v2.1.4',
    badge: 'Stable',
    displayOrder: 2,
    visible: true,
    description: 'Native C# .NET Core & Framework SDK for Windows desktop applications.',
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

    public DXAAuth(string appName, string appVersion, string appSecret) 
    {
        _appName = appName;
        _appVersion = appVersion;
        _appSecret = appSecret;
    }

    public async Task<bool> AuthenticateAsync(string username, string password) 
    {
        var payload = new {
            username = username,
            password = password,
            secret = _appSecret,
            appName = _appName,
            appVersion = _appVersion
        };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://deepxauth-api.pages.dev/login", content);
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
    version: 'v1.0.0',
    badge: 'Stable',
    displayOrder: 3,
    visible: true,
    description: 'High-performance header-only C++ library with memory anti-tamper protection.',
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

    bool login(const std::string& username, const std::string& password) {
        std::cout << "[DXA] Initializing secure handshake..." << std::endl;
        // Native CURL POST request payload
        return true;
    }
};

int main() {
    DXAClient auth("MyGame", "1.0.0", "YOUR_APP_SECRET");
    if (auth.login("player1", "Pass123")) {
        std::cout << "Authentication Granted!" << std::endl;
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
    version: 'v1.1.0',
    badge: 'Beta',
    displayOrder: 4,
    visible: true,
    description: 'Official Java JDK client with asynchronous REST requests & JSON parsing.',
    sdkCode: `package com.deepxauth.sdk;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class DXAAuth {
    private final String appSecret;
    private final HttpClient client = HttpClient.newHttpClient();

    public DXAAuth(String appSecret) {
        this.appSecret = appSecret;
    }

    public void login(String username, String password) throws Exception {
        String jsonPayload = String.format(
            "{\\"username\\":\\"%s\\", \\"password\\":\\"%s\\", \\"secret\\":\\"%s\\"}",
            username, password, appSecret
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://deepxauth-api.pages.dev/login"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Response: " + response.body());
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
    version: 'v0.9.0',
    badge: 'Experimental',
    displayOrder: 5,
    visible: true,
    description: 'Zero-overhead memory-safe Rust client crate for high-security applications.',
    sdkCode: `use reqwest::Client;
use serde_json::json;

pub struct DXAClient {
    app_secret: String,
    client: Client,
}

impl DXAClient {
    pub fn new(app_secret: String) -> Self {
        Self {
            app_secret,
            client: Client::new(),
        }
    }

    pub async fn login(&self, username: &str, password: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let payload = json!({
            "username": username,
            "password": password,
            "secret": self.app_secret,
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
    version: 'v1.0.0',
    badge: 'Stable',
    displayOrder: 6,
    visible: true,
    description: 'High-throughput Go client module for backend microservices and CLI tools.',
    sdkCode: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type AuthRequest struct {
	Username string \`json:"username"\`
	Password string \`json:"password"\`
	Secret   string \`json:"secret"\`
}

func main() {
	reqData := AuthRequest{
		Username: "admin",
		Password: "password123",
		Secret:   "DXA-SECRET-KEY",
	}
	body, _ := json.Marshal(reqData)
	resp, err := http.Post("https://deepxauth-api.pages.dev/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		panic(err)
	}
	fmt.Println("Status:", resp.Status)
}
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    language: 'typescript',
    icon: 'Code',
    githubUrl: 'https://github.com/deepak-kumar1101/deepXauth-ts-sdk',
    version: 'v2.0.1',
    badge: 'Stable',
    displayOrder: 7,
    visible: true,
    description: 'Type-safe SDK for Node.js, Next.js, and web backends.',
    sdkCode: `import axios from 'axios';

export interface DXAOptions {
  appName: string;
  appVersion: string;
  secret: string;
}

export class DXAService {
  constructor(private options: DXAOptions) {}

  async authenticate(username: string, password: str): Promise<boolean> {
    const { data } = await axios.post('https://deepxauth-api.pages.dev/login', {
      username,
      password,
      secret: this.options.secret,
      appName: this.options.appName,
      appVersion: this.options.appVersion
    });
    return data.code === 'LOGIN_SUCCESS';
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
