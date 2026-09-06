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
    #ifdef _MSC_VER
        #pragma comment(lib, "Ws2_32.lib")
    #endif
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
    else if (method == "OPTIONS") {
        status = "204 No Content";
    } 
    else {
        status = "405 Method Not Allowed";
        contentType = "text/html";
        responseBody = "<h1>405 Method Not Allowed</h1>";
    }

    // Build Full Response with Mandatory Security Headers & Server Signature Obfuscation
    std::stringstream response;
    response << "HTTP/1.1 " << status << "\r\n"
             << "Server: CookEngine/1.0 (Production Security Hardened)\r\n"
             << "Content-Type: " << contentType << "\r\n"
             << "Content-Length: " << responseBody.length() << "\r\n"
             << "Access-Control-Allow-Origin: *\r\n"
             << "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
             << "Access-Control-Allow-Headers: Content-Type\r\n"
             // Security & Anti-Inspection Headers
             << "X-Content-Type-Options: nosniff\r\n"
             << "X-Frame-Options: SAMEORIGIN\r\n"
             << "X-XSS-Protection: 1; mode=block\r\n"
             << "Cache-Control: no-cache, no-store, must-revalidate\r\n"
             << "Pragma: no-cache\r\n"
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
