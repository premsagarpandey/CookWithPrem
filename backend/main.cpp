#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "Ws2_32.lib")
    typedef int socklen_t;
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <unistd.h>
    typedef int SOCKET;
    const SOCKET INVALID_SOCKET = -1;
    const int SOCKET_ERROR = -1;
    #define closesocket close
#endif

const int PORT = 8080;

// Helper to read file content with fallback paths for robust execution directories
std::string readFile(const std::string& filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (file.is_open()) {
        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }

    // Fallback 1: if filepath starts with "../frontend/", try "frontend/"
    if (filepath.rfind("../frontend/", 0) == 0) {
        std::string fallbackPath = filepath.substr(3); // Remove "../" prefix
        std::ifstream fallbackFile(fallbackPath, std::ios::binary);
        if (fallbackFile.is_open()) {
            std::stringstream buffer;
            buffer << fallbackFile.rdbuf();
            return buffer.str();
        }
    }

    // Fallback 2: try prefixing with "backend/" (useful for categories.json, recipes.json if run from root)
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

void handleClient(SOCKET clientSocket) {
    char buffer[4096] = {0};
    int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    if (bytesRead <= 0) {
        closesocket(clientSocket);
        return;
    }

    std::string request(buffer);
    std::stringstream reqStream(request);
    std::string method, path, protocol;
    reqStream >> method >> path >> protocol;

    // Extract query parameters from path (e.g. /recipes.html?cat=breakfast -> /recipes.html)
    size_t queryPos = path.find('?');
    std::string cleanPath = (queryPos == std::string::npos) ? path : path.substr(0, queryPos);

    std::cout << "Received request: " << method << " " << path << " (Clean: " << cleanPath << ")" << std::endl;

    std::string responseBody = "";
    std::string contentType = "text/plain";
    std::string status = "200 OK";

    // Prevent path traversal attacks (check if cleanPath contains "..")
    if (cleanPath.find("..") != std::string::npos) {
        status = "400 Bad Request";
        contentType = "text/plain";
        responseBody = "Bad Request: Path traversal not allowed.";
    } else if (method == "GET") {
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
                responseBody = "<h1>404 Not Found</h1><p>File could not be read.</p>";
            } else {
                contentType = getMimeType(cleanPath);
            }
        }
    } else if (method == "OPTIONS") {
        status = "204 No Content";
    } else {
        status = "405 Method Not Allowed";
        responseBody = "<h1>405 Method Not Allowed</h1>";
    }

    std::stringstream response;
    response << "HTTP/1.1 " << status << "\r\n"
             << "Content-Type: " << contentType << "\r\n"
             << "Content-Length: " << responseBody.length() << "\r\n"
             << "Access-Control-Allow-Origin: *\r\n"
             << "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
             << "Access-Control-Allow-Headers: Content-Type\r\n"
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
        std::cerr << "Bind failed." << std::endl;
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
    std::cout << "CookWithPrem — C++ Web Server running on port " << PORT << std::endl;
    std::cout << "Access the site at: http://localhost:8080" << std::endl;
    std::cout << "====================================================" << std::endl;

    while (true) {
        sockaddr_in clientAddr;
        socklen_t clientSize = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientSize);
        if (clientSocket != INVALID_SOCKET) {
            handleClient(clientSocket);
        }
    }

    closesocket(serverSocket);
    #ifdef _WIN32
        WSACleanup();
    #endif
    return 0;
}
