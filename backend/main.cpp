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

// Helper to read file content
std::string readFile(const std::string& filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (!file.is_open()) {
        return "";
    }
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
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

    if (method == "GET") {
        if (cleanPath == "/" || cleanPath == "/index.html") {
            responseBody = readFile("../frontend/index.html");
            contentType = "text/html";
            if (responseBody.empty()) {
                status = "404 Not Found";
                responseBody = "<h1>404 Not Found</h1><p>index.html could not be read.</p>";
            }
        } else if (cleanPath == "/recipes.html") {
            responseBody = readFile("../frontend/recipes.html");
            contentType = "text/html";
            if (responseBody.empty()) {
                status = "404 Not Found";
                responseBody = "<h1>404 Not Found</h1><p>recipes.html could not be read.</p>";
            }
        } else if (cleanPath == "/about.html") {
            responseBody = readFile("../frontend/about.html");
            contentType = "text/html";
            if (responseBody.empty()) {
                status = "404 Not Found";
                responseBody = "<h1>404 Not Found</h1><p>about.html could not be read.</p>";
            }
        } else if (cleanPath == "/contact.html") {
            responseBody = readFile("../frontend/contact.html");
            contentType = "text/html";
            if (responseBody.empty()) {
                status = "404 Not Found";
                responseBody = "<h1>404 Not Found</h1><p>contact.html could not be read.</p>";
            }
        } else if (cleanPath == "/style.css") {
            responseBody = readFile("../frontend/style.css");
            contentType = "text/css";
            if (responseBody.empty()) {
                status = "404 Not Found";
            }
        } else if (cleanPath == "/app.js") {
            responseBody = readFile("../frontend/app.js");
            contentType = "application/javascript";
            if (responseBody.empty()) {
                status = "404 Not Found";
            }
        } else if (cleanPath == "/api/recipes" || cleanPath == "/api/recipes/") {
            responseBody = readFile("recipes.json");
            contentType = "application/json";
            if (responseBody.empty()) {
                responseBody = "[]";
            }
        } else if (cleanPath == "/api/categories" || cleanPath == "/api/categories/") {
            responseBody = readFile("categories.json");
            contentType = "application/json";
            if (responseBody.empty()) {
                responseBody = "[]";
            }
        } else {
            status = "404 Not Found";
            contentType = "text/html";
            responseBody = "<h1>404 Not Found</h1>";
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
    send(clientSocket, responseStr.c_str(), responseStr.length(), 0);
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
