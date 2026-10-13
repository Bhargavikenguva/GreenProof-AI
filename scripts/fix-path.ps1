$current = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($current -notlike '*C:\Program Files\nodejs*') {
    [Environment]::SetEnvironmentVariable('Path', "$current;C:\Program Files\nodejs", 'User')
    Write-Host "Node.js successfully added to User PATH environment variable."
} else {
    Write-Host "Node.js is already in User PATH."
}
