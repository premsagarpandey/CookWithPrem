Set WshShell = CreateObject("WScript.Shell")
Set WMI = GetObject("winmgmts:\\.\root\cimv2")

' Check if cpp_backend.exe is already running
query = "Select * from Win32_Process Where Name = 'cpp_backend.exe'"
Set processes = WMI.ExecQuery(query)

If processes.Count = 0 Then
    ' Server is not running, so start it silently
    WshShell.CurrentDirectory = "c:\CookWithPrem\backend"
    WshShell.Run "cpp_backend.exe", 0, False
    ' Wait 1 second to ensure server is ready
    WScript.Sleep 1000
End If

' Open the website in the default browser
WshShell.Run "http://localhost:8080"
