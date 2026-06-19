# MP SCNI Desk — One-Click GitHub Pages Deployment Script
# Run this script in PowerShell from the project directory.
#
# Usage:
#   .\deploy.ps1 -Username YOUR_GITHUB_USERNAME
#
# Prerequisites:
#   - Git installed (already done ✓)
#   - A GitHub account
#   - You may be prompted to log in via browser on first push

param(
    [Parameter(Mandatory=$true)]
    [string]$Username
)

$RepoName = "mp-scni-desk"
$RemoteUrl = "https://github.com/$Username/$RepoName.git"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MP SCNI Desk — GitHub Pages Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if remote exists
$existingRemote = git remote -v 2>&1
if ($existingRemote -match "origin") {
    Write-Host "[i] Remote 'origin' already exists. Updating URL..." -ForegroundColor Yellow
    git remote set-url origin $RemoteUrl
} else {
    Write-Host "[+] Adding remote: $RemoteUrl" -ForegroundColor Green
    git remote add origin $RemoteUrl
}

# Step 2: Stage and commit any new changes
$status = git status --porcelain
if ($status) {
    Write-Host "[+] Staging and committing changes..." -ForegroundColor Green
    git add -A
    git commit -m "Update MP SCNI Desk application"
}

# Step 3: Push to GitHub
Write-Host ""
Write-Host "[>] Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "    If this is your first push, a browser window may open for authentication." -ForegroundColor DarkGray
Write-Host ""
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code pushed to GitHub." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now enable GitHub Pages:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/$Username/$RepoName/settings/pages" -ForegroundColor White
    Write-Host "  2. Source: Deploy from a branch" -ForegroundColor White
    Write-Host "  3. Branch: master / (root)" -ForegroundColor White
    Write-Host "  4. Click Save" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app will be live at:" -ForegroundColor Cyan
    Write-Host "  https://$Username.github.io/$RepoName/" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Push failed. Please check:" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  - Create the repo first at: https://github.com/new" -ForegroundColor White
    Write-Host "    Name: $RepoName  |  Visibility: Public  |  NO README" -ForegroundColor White
    Write-Host "  - Then run this script again." -ForegroundColor White
    Write-Host ""
}
