' ============================================================
' CookWithPrem — One-Click Server Launcher
' Author: Prem Sagar Pandey
' Description: Starts the C++ backend server (if not already
'              running) and opens the website in the browser.
' ============================================================

Set WshShell = CreateObject("WScript.Shell")
Set WMI = GetObject("winmgmts:\\.\root\cimv2")

' Check if cpp_backend.exe or cpp_backend_secured.exe is already running
query = "Select * from Win32_Process Where Name = 'cpp_backend.exe' Or Name = 'cpp_backend_secured.exe'"
Set processes = WMI.ExecQuery(query)

If processes.Count = 0 Then
    ' Server is not running, start it silently
    WshShell.CurrentDirectory = "c:\CookWithPrem\backend"
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    If fso.FileExists("c:\CookWithPrem\backend\cpp_backend_secured.exe") Then
        WshShell.Run "cpp_backend_secured.exe", 0, False
    Else
        WshShell.Run "cpp_backend.exe", 0, False
    End If
    ' Wait for server to initialize
    WScript.Sleep 1000
End If

' Open the website in the default browser
WshShell.Run "http://localhost:8080"
