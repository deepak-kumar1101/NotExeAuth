import {
  SandboxEndpointInfo,
  SandboxEndpointPath,
  SandboxRequestConfig,
  SandboxResponseData,
  SandboxMetrics,
  SandboxLanguage,
  ExportFormat,
  SandboxErrorCard
} from '../types/sandbox';
import { verifyRsaSignature } from '../utils/rsaVerifier';
import { auditService } from './auditService';

export const SANDBOX_ENDPOINTS: SandboxEndpointInfo[] = [
  {
    path: '/login',
    name: 'User Authentication',
    description: 'Authenticate user credentials, check HWID lock, and verify subscription status.',
    requiredFields: ['secret', 'app', 'username', 'password', 'hwid', 'version']
  },
  {
    path: '/register',
    name: 'User Registration',
    description: 'Register a new user account or redeem a license key for the application.',
    requiredFields: ['secret', 'app', 'username', 'password', 'hwid', 'version']
  },
  {
    path: '/versioncheck',
    name: 'Software Version Check',
    description: 'Check if the client version matches the latest deployed application release.',
    requiredFields: ['secret', 'app', 'version']
  },
  {
    path: '/getvariable',
    name: 'Get Remote Variable',
    description: 'Fetch an individual encrypted remote cloud variable value.',
    requiredFields: ['secret', 'app', 'varName']
  },
  {
    path: '/getvariables',
    name: 'Get All Remote Variables',
    description: 'Retrieve all encrypted remote cloud variables configured for the app.',
    requiredFields: ['secret', 'app']
  },
  {
    path: '/isapplicationpaused',
    name: 'Check Application Pause Status',
    description: 'Verify if the application is currently paused or undergoing maintenance.',
    requiredFields: ['secret', 'app']
  }
];

export async function executeWorkerRequest(
  endpointPath: SandboxEndpointPath,
  config: SandboxRequestConfig,
  signal?: AbortSignal
): Promise<SandboxResponseData> {
  const startTime = performance.now();
  let headersReceivedTime = startTime;

  const endpointClean = endpointPath.startsWith('/') ? endpointPath.slice(1) : endpointPath;
  const baseUrl = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'https://deepxauth-api.pages.dev'
    : window.location.origin;

  const apiUrl = `${baseUrl}/${endpointClean}`;

  const isLicenseOnly = endpointPath === '/login' && (config.authMode === 'license' || (!!config.licenseKey && !config.password));

  const payload: Record<string, any> = {
    secret: config.secret,
    appName: config.app,
    app: config.app,
    appVersion: config.version,
    version: config.version,
    hwid: config.hwid,
    clientTimestamp: config.autoTimestamp ? Date.now() : config.clientTimestamp,
    clientNonce: config.autoNonce ? Math.random().toString(36).substring(2, 15) : config.clientNonce,
    devMode: config.devMode
  };

  if (isLicenseOnly) {
    payload.licenseKey = config.licenseKey || config.username;
  } else {
    payload.username = config.username;
    payload.password = config.password;
    if (endpointPath === '/register' && config.licenseKey) {
      payload.licenseKey = config.licenseKey;
    }
  }

  if (endpointPath === '/getvariable' && config.varName) {
    payload.varName = config.varName;
  }

  const bodyString = JSON.stringify(payload);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Platform': 'DXA-Sandbox/2.0'
      },
      body: bodyString,
      signal
    });

    headersReceivedTime = performance.now();
    const rawText = await response.text();
    const endTime = performance.now();

    const latencyMs = Math.max(1, Math.round(headersReceivedTime - startTime));
    const responseTimeMs = Math.max(1, Math.round(endTime - startTime));
    const payloadSizeKb = Number((new Blob([rawText]).size / 1024).toFixed(2));

    let parsedBody: any = null;
    try {
      parsedBody = JSON.parse(rawText);
    } catch (e) {
      parsedBody = { raw: rawText };
    }

    const headersRecord: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headersRecord[key] = val;
    });

    const verification = await verifyRsaSignature(endpointPath, parsedBody);

    const metrics: SandboxMetrics = {
      latencyMs,
      responseTimeMs,
      httpStatus: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
      payloadSizeKb,
      endpoint: endpointPath,
      timestamp: new Date().toLocaleTimeString()
    };

    auditService.log({
      type: response.ok ? 'USER_LOGIN' : (response.status === 409 ? 'VERSION_MISMATCH' : 'FAILED_LOGIN'),
      actorType: 'worker',
      actorEmail: config.username || 'Sandbox Tester',
      actorSecret: config.secret,
      application: config.app,
      username: config.username,
      hwid: config.hwid,
      status: response.ok ? 'SUCCESS' : (response.status === 403 || response.status === 409 ? 'BLOCKED' : 'FAILURE'),
      description: `Executed Sandbox request to ${endpointPath} (${response.status} ${response.statusText || 'OK'})`,
      metadata: {
        latencyMs,
        endpoint: endpointPath,
        httpStatus: response.status,
        responseSnippet: typeof parsedBody === 'object' ? parsedBody.message || parsedBody.type : String(parsedBody)
      }
    });

    return {
      status: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
      headers: headersRecord,
      body: parsedBody,
      rawText,
      metrics,
      verification
    };
  } catch (err: any) {
    const endTime = performance.now();
    const responseTimeMs = Math.max(1, Math.round(endTime - startTime));

    const isAbort = err.name === 'AbortError';

    const metrics: SandboxMetrics = {
      latencyMs: isAbort ? 0 : responseTimeMs,
      responseTimeMs,
      httpStatus: isAbort ? 0 : 500,
      statusText: isAbort ? 'Aborted' : 'Network Error',
      payloadSizeKb: 0,
      endpoint: endpointPath,
      timestamp: new Date().toLocaleTimeString()
    };

    return {
      status: isAbort ? 0 : 500,
      statusText: isAbort ? 'Aborted' : 'Network Error',
      headers: {},
      body: { success: false, message: isAbort ? 'Request canceled by new execution' : (err.message || 'Connection failed') },
      rawText: JSON.stringify({ success: false, message: err.message }),
      metrics
    };
  }
}

export function diagnoseError(status: number, body: any): SandboxErrorCard | null {
  if (status === 200 && body?.success !== false) return null;

  const msg = (body?.message || '').toLowerCase();

  if (status === 0 || msg.includes('network error') || msg.includes('fetch')) {
    return {
      type: 'Network Error',
      title: 'Worker Connection Failed',
      description: 'Unable to reach the Cloudflare Worker API. Check internet connectivity or CORS configuration.',
      code: status || 'NET_ERR',
      recommendation: 'Ensure your network allows connections to deepxauth.pages.dev'
    };
  }

  if (status === 429 || msg.includes('rate limit')) {
    return {
      type: 'Rate Limited',
      title: 'Too Many Requests',
      description: 'API rate limit exceeded. IP address temporarily throttled to protect infrastructure.',
      code: 429,
      recommendation: 'Wait 60 seconds before sending subsequent authentication calls.'
    };
  }

  if (msg.includes('paused') || msg.includes('maintenance')) {
    return {
      type: 'Application Paused',
      title: 'App Temporarily Suspended',
      description: 'The target application is currently paused by developer or undergoing maintenance.',
      code: 'APP_PAUSED',
      recommendation: 'Resume the application status inside your Developer Dashboard.'
    };
  }

  if (msg.includes('hwid') || msg.includes('hardware')) {
    return {
      type: 'HWID Mismatch',
      title: 'Hardware Signature Dispute',
      description: 'User account is locked to a different hardware ID. Multi-device usage rejected.',
      code: 'HWID_LOCKED',
      recommendation: 'Reset the user HWID lock in Dashboard > Users tab.'
    };
  }

  if (msg.includes('version')) {
    return {
      type: 'Version Mismatch',
      title: 'Outdated Client Version',
      description: 'Client application version does not match the mandated release version.',
      code: 'VERSION_OUTDATED',
      recommendation: 'Update your client app version string or adjust application settings.'
    };
  }

  if (msg.includes('expired') || msg.includes('subscription')) {
    return {
      type: 'License Expired',
      title: 'Subscription Period Ended',
      description: 'The user account or license key duration has expired.',
      code: 'SUB_EXPIRED',
      recommendation: 'Renew key or issue additional credit duration in Dashboard.'
    };
  }

  if (msg.includes('nonce') || msg.includes('replay')) {
    return {
      type: 'Replay Attack',
      title: 'Stale Request Nonce/Timestamp',
      description: 'Request timestamp or nonce was previously consumed or falls outside acceptable time window.',
      code: 'REPLAY_GUARD',
      recommendation: 'Enable Auto Timestamp & Auto Nonce toggles.'
    };
  }

  if (status === 401 || msg.includes('invalid credentials') || msg.includes('secret')) {
    return {
      type: '401 Unauthorized',
      title: 'Authentication Rejected',
      description: 'Invalid Developer Secret, Username, or Access Password provided.',
      code: 401,
      recommendation: 'Double-check your Developer Secret in App Settings.'
    };
  }

  return {
    type: `Error ${status}`,
    title: 'API Request Error',
    description: body?.message || 'The server returned a negative validation state.',
    code: status,
    recommendation: 'Verify input parameters and consult DeepXAuth Docs.'
  };
}

export function generateCodeSnippet(
  lang: SandboxLanguage,
  endpointPath: SandboxEndpointPath,
  config: SandboxRequestConfig
): string {
  const cleanEndpoint = endpointPath.startsWith('/') ? endpointPath.slice(1) : endpointPath;
  const isLicenseOnly = endpointPath === '/login' && (config.authMode === 'license' || (!!config.licenseKey && !config.password));

  const payloadData: Record<string, any> = {
    secret: config.secret || 'YOUR_DEV_SECRET',
    app: config.app || 'YOUR_APP_NAME',
    hwid: config.hwid || 'HWID-8821-X992',
    version: config.version || '1.0.0'
  };

  if (isLicenseOnly) {
    payloadData.licenseKey = config.licenseKey || config.username || 'DXA-XXXX-YYYY-ZZZZ';
  } else {
    payloadData.username = config.username || 'user123';
    payloadData.password = config.password || 'password123';
    if (endpointPath === '/register') {
      payloadData.licenseKey = config.licenseKey || 'DXA-XXXX-YYYY-ZZZZ';
    }
  }

  if (endpointPath === '/getvariable') {
    payloadData.varName = config.varName || 'API_KEY';
  }

  const jsonPayload = JSON.stringify(payloadData, null, 2);

  switch (lang) {
    case 'python':
      return `import requests

url = "https://deepxauth.pages.dev/api/${cleanEndpoint}"
payload = ${jsonPayload.replace(/"/g, '"')}

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response Body:", response.json())`;

    case 'csharp':
      return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class DXAClient
{
    static async Task Main()
    {
        var client = new HttpClient();
        var url = "https://deepxauth.pages.dev/api/${cleanEndpoint}";
        
        var jsonPayload = @"${jsonPayload.replace(/"/g, '""')}";
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        var result = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"Status: {response.StatusCode}");
        Console.WriteLine($"Response: {result}");
    }
} `;

    case 'cpp':
      return `#include <iostream>
#include <curl/curl.h>

int main() {
    CURL* curl = curl_easy_init();
    if(curl) {
        const char* url = "https://deepxauth.pages.dev/api/${cleanEndpoint}";
        const char* json_data = "${jsonPayload.replace(/"/g, '\\"').replace(/\n/g, '')}";

        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        CURLcode res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return 0;
}`;

    case 'rust':
      return `use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let url = "https://deepxauth.pages.dev/api/${cleanEndpoint}";

    let payload = json!(${jsonPayload});

    let res = client.post(url)
        .json(&payload)
        .send()
        .await?;

    println!("Status: {}", res.status());
    println!("Body: {}", res.text().await?);

    Ok(())
}`;

    case 'go':
      return `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "https://deepxauth.pages.dev/api/${cleanEndpoint}"
	var jsonStr = []byte(\`${jsonPayload}\`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("Status:", resp.Status)
	fmt.Println("Response:", string(body))
}`;

    case 'typescript':
    default:
      return `async function callDeepXAuth() {
  const response = await fetch('https://deepxauth.pages.dev/api/${cleanEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${jsonPayload})
  });

  const data = await response.json();
  console.log('API Response:', data);
}

callDeepXAuth();`;
  }
}

export function generateExportPayload(
  format: ExportFormat,
  endpointPath: SandboxEndpointPath,
  config: SandboxRequestConfig
): string {
  const cleanEndpoint = endpointPath.startsWith('/') ? endpointPath.slice(1) : endpointPath;
  const url = `https://deepxauth.pages.dev/api/${cleanEndpoint}`;
  const isLicenseOnly = endpointPath === '/login' && (config.authMode === 'license' || (!!config.licenseKey && !config.password));

  const payloadData: Record<string, any> = {
    secret: config.secret || 'YOUR_DEV_SECRET',
    app: config.app || 'YOUR_APP_NAME',
    hwid: config.hwid || 'HWID-8821-X992',
    version: config.version || '1.0.0'
  };

  if (isLicenseOnly) {
    payloadData.licenseKey = config.licenseKey || config.username || 'DXA-XXXX-YYYY-ZZZZ';
  } else {
    payloadData.username = config.username || 'user123';
    payloadData.password = config.password || 'password123';
    if (endpointPath === '/register') {
      payloadData.licenseKey = config.licenseKey || 'DXA-XXXX-YYYY-ZZZZ';
    }
  }

  if (endpointPath === '/getvariable') {
    payloadData.varName = config.varName || 'API_KEY';
  }

  if (format === 'json') {
    return JSON.stringify(payloadData, null, 2);
  }

  if (format === 'curl') {
    return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payloadData)}'`;
  }

  if (format === 'postman') {
    return JSON.stringify(
      {
        info: {
          name: `DeepXAuth ${cleanEndpoint} Request`,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: cleanEndpoint,
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify(payloadData, null, 2)
              },
              url: {
                raw: url,
                protocol: 'https',
                host: ['deepxauth', 'pages', 'dev'],
                path: ['api', cleanEndpoint]
              }
            }
          }
        ]
      },
      null,
      2
    );
  }

  return generateCodeSnippet(format as SandboxLanguage, endpointPath, config);
}
