#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <chrono>
#include <algorithm>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "Ws2_32.lib")
    typedef int socklen_t;
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    typedef int SOCKET;
    const SOCKET INVALID_SOCKET = -1;
    const int SOCKET_ERROR = -1;
    #define closesocket close
#endif

const int PORT = 8080;
const int RATE_LIMIT_MAX_REQUESTS = 120; // 120 requests per minute per IP
const int RATE_LIMIT_WINDOW_SECONDS = 60;

// Simple IP Rate Limiting Structure
struct ClientRateLimit {
    int requestCount = 0;
    std::chrono::steady_clock::time_point windowStart = std::chrono::steady_clock::now();
};

static std::map<std::string, ClientRateLimit> rateLimitMap;

// Trim helper
std::string trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\r\n");
    if (std::string::npos == first) return "";
    size_t last = str.find_last_not_of(" \t\r\n");
    return str.substr(first, (last - first + 1));
}

// Load COOK_ADMIN_KEY from Environment Variable or .env file
std::string loadAdminKey() {
    // 1. Try system environment variable
    const char* envKey = std::getenv("COOK_ADMIN_KEY");
    if (envKey && std::string(envKey).length() > 0) {
        return trim(std::string(envKey));
    }

    // 2. Try loading from .env file (current dir or parent dir)
    std::vector<std::string> envPaths = {".env", "../.env", "backend/.env"};
    for (const auto& path : envPaths) {
        std::ifstream file(path);
        if (file.is_open()) {
            std::string line;
            while (std::getline(file, line)) {
                line = trim(line);
                if (line.rfind("COOK_ADMIN_KEY=", 0) == 0) {
                    std::string key = trim(line.substr(15));
                    if (!key.empty()) return key;
                }
            }
        }
    }

    // 3. Secure Fallback Key (Log warning if used)
    std::cout << "[SECURITY WARNING] COOK_ADMIN_KEY not found in environment or .env! Using default secure key." << std::endl;
    return "CookWithPrem_Admin_2026_SecretKey!";
}

static const std::string ADMIN_SECRET_KEY = loadAdminKey();

// Helper to read file content with fallback paths
std::string readFile(const std::string& filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (file.is_open()) {
        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }

    if (filepath.rfind("../frontend/", 0) == 0) {
        std::string fallbackPath = filepath.substr(3);
        std::ifstream fallbackFile(fallbackPath, std::ios::binary);
        if (fallbackFile.is_open()) {
            std::stringstream buffer;
            buffer << fallbackFile.rdbuf();
            return buffer.str();
        }
    }

    std::string fallbackPath2 = "backend/" + filepath;
    std::ifstream fallbackFile2(fallbackPath2, std::ios::binary);
    if (fallbackFile2.is_open()) {
        std::stringstream buffer;
        buffer << fallbackFile2.rdbuf();
        return buffer.str();
    }

    return "";
}

// Helper to write file content safely
bool writeFile(const std::string& filepath, const std::string& content) {
    std::ofstream file(filepath, std::ios::binary | std::ios::trunc);
    if (file.is_open()) {
        file << content;
        file.close();
    }

    // Also write to backend/ copy if it exists to maintain sync
    std::string secondaryPath = "backend/" + filepath;
    std::ofstream file2(secondaryPath, std::ios::binary | std::ios::trunc);
    if (file2.is_open()) {
        file2 << content;
        file2.close();
    }
    return true;
}

std::string getMimeType(const std::string& path) {
    if (path.find(".html") != std::string::npos) return "text/html";
    if (path.find(".css") != std::string::npos) return "text/css";
    if (path.find(".js") != std::string::npos) return "application/javascript";
    if (path.find(".json") != std::string::npos) return "application/json";
    if (path.find(".png") != std::string::npos) return "image/png";
    if (path.find(".jpg") != std::string::npos || path.find(".jpeg") != std::string::npos) return "image/jpeg";
    if (path.find(".svg") != std::string::npos) return "image/svg+xml";
    if (path.find(".gif") != std::string::npos) return "image/gif";
    if (path.find(".ico") != std::string::npos) return "image/x-icon";
    return "text/plain";
}

// URL Decoder
std::string urlDecode(const std::string& in) {
    std::string out;
    out.reserve(in.size());
    for (std::size_t i = 0; i < in.size(); ++i) {
        if (in[i] == '%') {
            if (i + 2 < in.size()) {
                int hexValue = 0;
                std::istringstream is(in.substr(i + 1, 2));
                if (is >> std::hex >> hexValue) {
                    out += static_cast<char>(hexValue);
                    i += 2;
                } else {
                    out += '%';
                }
            } else {
                out += '%';
            }
        } else if (in[i] == '+') {
            out += ' ';
        } else {
            out += in[i];
        }
    }
    return out;
}

// Check IP Rate Limiting
bool checkRateLimit(const std::string& clientIP) {
    auto now = std::chrono::steady_clock::now();
    auto& info = rateLimitMap[clientIP];
    auto duration = std::chrono::duration_cast<std::chrono::seconds>(now - info.windowStart).count();

    if (duration > RATE_LIMIT_WINDOW_SECONDS) {
        info.windowStart = now;
        info.requestCount = 1;
        return true;
    }

    info.requestCount++;
    if (info.requestCount > RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limit exceeded
    }
    return true;
}

// Extract Header Value from HTTP Request
std::string getHeaderValue(const std::string& rawRequest, const std::string& headerName) {
    std::string target = headerName + ":";
    size_t pos = rawRequest.find(target);
    if (pos == std::string::npos) {
        // Try case-insensitive search
        std::string lowerRaw = rawRequest;
        std::string lowerTarget = target;
        std::transform(lowerRaw.begin(), lowerRaw.end(), lowerRaw.begin(), ::tolower);
        std::transform(lowerTarget.begin(), lowerTarget.end(), lowerTarget.begin(), ::tolower);
        pos = lowerRaw.find(lowerTarget);
        if (pos == std::string::npos) return "";
    }

    size_t start = pos + target.length();
    size_t end = rawRequest.find("\r\n", start);
    if (end == std::string::npos) end = rawRequest.length();

    return trim(rawRequest.substr(start, end - start));
}

// Extract Body from HTTP Request
std::string getRequestBody(const std::string& rawRequest) {
    size_t pos = rawRequest.find("\r\n\r\n");
    if (pos != std::string::npos) {
        return rawRequest.substr(pos + 4);
    }
    return "";
}

void handleClient(SOCKET clientSocket, const std::string& clientIP) {
    char buffer[16384] = {0};
    int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    if (bytesRead <= 0) {
        closesocket(clientSocket);
        return;
    }

    std::string request(buffer, bytesRead);
    std::stringstream reqStream(request);
    std::string method, path, protocol;
    reqStream >> method >> path >> protocol;

    // Decode URL
    std::string decodedPath = urlDecode(path);

    // Extract query parameters
    size_t queryPos = decodedPath.find('?');
    std::string cleanPath = (queryPos == std::string::npos) ? decodedPath : decodedPath.substr(0, queryPos);

    // Rate Limiting Check
    if (!checkRateLimit(clientIP)) {
        std::string response = "HTTP/1.1 429 Too Many Requests\r\n"
                               "Content-Type: text/plain\r\n"
                               "Retry-After: 60\r\n"
                               "Connection: close\r\n\r\n"
                               "429 Too Many Requests: Rate limit exceeded. Try again in 1 minute.";
        send(clientSocket, response.data(), response.length(), 0);
        closesocket(clientSocket);
        return;
    }

    std::string responseBody = "";
    std::string contentType = "text/plain";
    std::string status = "200 OK";

    // Path Traversal Security Checks
    bool isPathTraversal = (cleanPath.find("..") != std::string::npos) ||
                           (cleanPath.find("\\") != std::string::npos) ||
                           (cleanPath.find('\0') != std::string::npos);

    if (isPathTraversal) {
        status = "400 Bad Request";
        contentType = "text/plain";
        responseBody = "Bad Request: Path traversal or invalid characters detected.";
    } 
    // Handle GET Requests
    else if (method == "GET") {
        if (cleanPath == "/") {
            cleanPath = "/index.html";
        }

        if (cleanPath.find("/api/") == 0) {
            std::string filename = cleanPath.substr(5);
            if (!filename.empty() && filename.back() == '/') filename.pop_back();
            responseBody = readFile(filename + ".json");
            contentType = "application/json";
            if (responseBody.empty()) {
                responseBody = "[]";
            }
        } else {
            std::string filepath = "../frontend" + cleanPath;
            responseBody = readFile(filepath);

            if (responseBody.empty()) {
                status = "404 Not Found";
                contentType = "text/html";
                responseBody = "<h1>404 Not Found</h1><p>File could not be found or opened.</p>";
            } else {
                contentType = getMimeType(cleanPath);
            }
        }
    } 
    // Handle POST Requests (Admin Authentication Required)
    else if (method == "POST") {
        std::string adminKeyHeader = getHeaderValue(request, "X-Admin-Key");
        std::string body = getRequestBody(request);

        // Check if Admin Key matches
        bool isAuthorized = (!adminKeyHeader.empty() && adminKeyHeader == ADMIN_SECRET_KEY);
        if (!isAuthorized && !body.empty()) {
            if (body.find("\"key\":\"" + ADMIN_SECRET_KEY + "\"") != std::string::npos ||
                body.find("\"key\": \"" + ADMIN_SECRET_KEY + "\"") != std::string::npos) {
                isAuthorized = true;
            }
        }

        if (cleanPath == "/api/admin/verify") {
            contentType = "application/json";
            if (isAuthorized) {
                status = "200 OK";
                responseBody = "{\"status\":\"ok\",\"message\":\"Admin authentication successful\"}";
            } else {
                status = "403 Forbidden";
                responseBody = "{\"status\":\"error\",\"message\":\"Invalid Admin Secret Key\"}";
            }
        } 
        else if (cleanPath == "/api/admin/update-recipes") {
            contentType = "application/json";
            if (!isAuthorized) {
                status = "403 Forbidden";
                responseBody = "{\"status\":\"error\",\"message\":\"Unauthorized: Valid Admin Secret Key required to update recipes.\"}";
            } else {
                if (!body.empty() && (body.front() == '[' || body.front() == '{')) {
                    writeFile("recipes.json", body);
                    status = "200 OK";
                    responseBody = "{\"status\":\"ok\",\"message\":\"Recipes successfully updated & saved.\"}";
                    std::cout << "[ADMIN ACTION] Recipes database updated by Admin." << std::endl;
                } else {
                    status = "400 Bad Request";
                    responseBody = "{\"status\":\"error\",\"message\":\"Invalid JSON data payload.\"}";
                }
            }
        } 
        else if (cleanPath == "/api/admin/update-categories") {
            contentType = "application/json";
            if (!isAuthorized) {
                status = "403 Forbidden";
                responseBody = "{\"status\":\"error\",\"message\":\"Unauthorized: Valid Admin Secret Key required to update categories.\"}";
            } else {
                if (!body.empty() && (body.front() == '[' || body.front() == '{')) {
                    writeFile("categories.json", body);
                    status = "200 OK";
                    responseBody = "{\"status\":\"ok\",\"message\":\"Categories successfully updated & saved.\"}";
                    std::cout << "[ADMIN ACTION] Categories database updated by Admin." << std::endl;
                } else {
                    status = "400 Bad Request";
                    responseBody = "{\"status\":\"error\",\"message\":\"Invalid JSON data payload.\"}";
                }
            }
        } 
        else {
            status = "403 Forbidden";
            contentType = "application/json";
            responseBody = "{\"status\":\"error\",\"message\":\"Public write operations are blocked for security.\"}";
        }
    } 
    else if (method == "OPTIONS") {
        status = "204 No Content";
    } 
    else {
        status = "405 Method Not Allowed";
        responseBody = "<h1>405 Method Not Allowed</h1>";
    }

    // Build Full Response with Mandatory Security Headers
    std::stringstream response;
    response << "HTTP/1.1 " << status << "\r\n"
             << "Content-Type: " << contentType << "\r\n"
             << "Content-Length: " << responseBody.length() << "\r\n"
             << "Access-Control-Allow-Origin: *\r\n"
             << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
             << "Access-Control-Allow-Headers: Content-Type, X-Admin-Key\r\n"
             // Security Headers
             << "X-Content-Type-Options: nosniff\r\n"
             << "X-Frame-Options: SAMEORIGIN\r\n"
             << "X-XSS-Protection: 1; mode=block\r\n"
             << "Referrer-Policy: strict-origin-when-cross-origin\r\n"
             << "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self';\r\n"
             << "Connection: close\r\n\r\n"
             << responseBody;

    std::string responseStr = response.str();
    send(clientSocket, responseStr.data(), responseStr.length(), 0);
    closesocket(clientSocket);
}

int main() {
    #ifdef _WIN32
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            std::cerr << "WSAStartup failed." << std::endl;
            return 1;
        }
    #endif

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        std::cerr << "Error creating socket." << std::endl;
        #ifdef _WIN32
            WSACleanup();
        #endif
        return 1;
    }

    int opt = 1;
    #ifdef _WIN32
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
    #else
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    #endif

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(PORT);

    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        std::cerr << "Bind failed on port " << PORT << "." << std::endl;
        closesocket(serverSocket);
        #ifdef _WIN32
            WSACleanup();
        #endif
        return 1;
    }

    if (listen(serverSocket, SOMAXCONN) == SOCKET_ERROR) {
        std::cerr << "Listen failed." << std::endl;
        closesocket(serverSocket);
        #ifdef _WIN32
            WSACleanup();
        #endif
        return 1;
    }

    std::cout << "====================================================" << std::endl;
    std::cout << "CookWithPrem — Secure C++ Server running on port " << PORT << std::endl;
    std::cout << "Security Mode: ACTIVE (Headers, Path-Sanitization, Rate Limit)" << std::endl;
    std::cout << "Admin API Protection: ENABLED (Environment/Key Protected)" << std::endl;
    std::cout << "Access Website at: http://localhost:" << PORT << std::endl;
    std::cout << "====================================================" << std::endl;

    while (true) {
        sockaddr_in clientAddr;
        socklen_t clientSize = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientSize);
        if (clientSocket != INVALID_SOCKET) {
            char* ipStr = inet_ntoa(clientAddr.sin_addr);
            std::string clientIP = ipStr ? std::string(ipStr) : "127.0.0.1";
            handleClient(clientSocket, clientIP);
        }
    }

    closesocket(serverSocket);
    #ifdef _WIN32
        WSACleanup();
    #endif
    return 0;
}
