cmake_minimum_required(VERSION 3.10)
project(CookWithPremBackend CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(cpp_backend main.cpp)

if(WIN32)
    target_link_libraries(cpp_backend ws2_32)
endif()
