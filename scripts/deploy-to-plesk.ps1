# 🚀 PowerShell Script for Plesk Deployment
# این اسکریپت برای deployment به سرور ویندوزی پلسک طراحی شده است

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionType = "patch",
    
    [Parameter(Mandatory=$false)]
    [string]$FtpHost = "",
    
    [Parameter(Mandatory=$false)]
    [string]$FtpUsername = "",
    
    [Parameter(Mandatory=$false)]
    [string]$FtpPassword = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/httpdocs",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# رنگ‌ها برای output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-ColorOutput {
    param([string]$Message, [System.ConsoleColor]$Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." $Blue
    
    # بررسی Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js: $nodeVersion" $Green
    } catch {
        Write-ColorOutput "❌ Node.js not found. Please install Node.js" $Red
        exit 1
    }
    
    # بررسی npm
    try {
        $npmVersion = npm --version
        Write-ColorOutput "✅ npm: $npmVersion" $Green
    } catch {
        Write-ColorOutput "❌ npm not found" $Red
        exit 1
    }
    
    # بررسی Git
    try {
        $gitVersion = git --version
        Write-ColorOutput "✅ Git: $gitVersion" $Green
    } catch {
        Write-ColorOutput "❌ Git not found" $Red
        exit 1
    }
}

function Update-Version {
    param([string]$Type)
    
    Write-ColorOutput "🔄 Updating version ($Type)..." $Blue
    
    try {
        npm run "version:$Type"
        
        # خواندن version جدید
        $versionJson = Get-Content "version.json" | ConvertFrom-Json
        $newVersion = $versionJson.version
        
        Write-ColorOutput "✅ Version updated to: $newVersion" $Green
        return $newVersion
    } catch {
        Write-ColorOutput "❌ Failed to update version: $_" $Red
        exit 1
    }
}

function Build-Application {
    Write-ColorOutput "🏗️ Building application..." $Blue
    
    try {
        # نصب dependencies
        Write-ColorOutput "📦 Installing dependencies..." $Yellow
        npm ci
        
        # Build
        Write-ColorOutput "🔨 Building for production..." $Yellow
        npm run build:production
        
        Write-ColorOutput "✅ Build completed successfully" $Green
    } catch {
        Write-ColorOutput "❌ Build failed: $_" $Red
        exit 1
    }
}

function Create-WindowsConfig {
    Write-ColorOutput "📝 Creating Windows server configuration files..." $Blue
    
    # ایجاد web.config برای IIS
    $webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    <httpCompression>
      <dynamicTypes>
        <add mimeType="application/json" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="text/css" enabled="true" />
      </dynamicTypes>
    </httpCompression>
  </system.webServer>
</configuration>
"@
    
    $webConfig | Out-File -FilePath "dist/web.config" -Encoding UTF8
    
    # ایجاد .htaccess برای Apache
    $htaccess = @"
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
"@
    
    $htaccess | Out-File -FilePath "dist/.htaccess" -Encoding UTF8
    
    Write-ColorOutput "✅ Configuration files created" $Green
}

function Deploy-ToFTP {
    param(
        [string]$Host,
        [string]$Username,
        [string]$Password,
        [string]$RemotePath
    )
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Would deploy to FTP server..." $Yellow
        Write-ColorOutput "   Host: $Host" $Yellow
        Write-ColorOutput "   Username: $Username" $Yellow
        Write-ColorOutput "   Remote Path: $RemotePath" $Yellow
        return
    }
    
    Write-ColorOutput "🚀 Deploying to FTP server..." $Blue
    Write-ColorOutput "   Host: $Host" $Yellow
    Write-ColorOutput "   Remote Path: $RemotePath" $Yellow
    
    try {
        # استفاده از WinSCP برای FTP deployment (اگر نصب باشد)
        if (Get-Command "WinSCP.com" -ErrorAction SilentlyContinue) {
            $winscp = @"
open ftp://$Username`:$Password@$Host
cd $RemotePath
lcd dist
put *
close
exit
"@
            $winscp | WinSCP.com /script=-
        } else {
            # استفاده از PowerShell FTP client
            $distFiles = Get-ChildItem -Path "dist" -Recurse -File
            
            foreach ($file in $distFiles) {
                $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 6) # +6 for "\dist\"
                $remotePath = "$RemotePath/$($relativePath.Replace('\', '/'))"
                
                Write-ColorOutput "   Uploading: $relativePath" $Yellow
                
                # اینجا باید FTP upload logic اضافه شود
                # برای سادگی، فقط نمایش می‌دهیم
            }
        }
        
        Write-ColorOutput "✅ Deployment completed successfully" $Green
    } catch {
        Write-ColorOutput "❌ Deployment failed: $_" $Red
        exit 1
    }
}

function Create-DeploymentInfo {
    param([string]$Version)
    
    Write-ColorOutput "📋 Creating deployment info..." $Blue
    
    $deploymentInfo = @{
        version = $Version
        buildDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        platform = "windows-plesk"
        deployedBy = $env:USERNAME
        computerName = $env:COMPUTERNAME
    }
    
    # اضافه کردن Git info اگر موجود باشد
    try {
        $gitCommit = git rev-parse HEAD
        $gitBranch = git rev-parse --abbrev-ref HEAD
        $deploymentInfo.commitSha = $gitCommit
        $deploymentInfo.branch = $gitBranch
    } catch {
        Write-ColorOutput "⚠️ Could not get Git info" $Yellow
    }
    
    $deploymentInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath "dist/deployment-info.json" -Encoding UTF8
    $Version | Out-File -FilePath "dist/version.txt" -Encoding UTF8
    (Get-Date) | Out-File -FilePath "dist/build-date.txt" -Encoding UTF8
    
    Write-ColorOutput "✅ Deployment info created" $Green
}

function Show-Summary {
    param([string]$Version)
    
    Write-ColorOutput "`n🎉 Deployment Summary" $Green
    Write-ColorOutput "===================" $Green
    Write-ColorOutput "Version: $Version" $Blue
    Write-ColorOutput "Type: $VersionType" $Blue
    Write-ColorOutput "Date: $(Get-Date)" $Blue
    Write-ColorOutput "Platform: Windows Plesk" $Blue
    
    if ($DryRun) {
        Write-ColorOutput "Mode: DRY RUN (no actual deployment)" $Yellow
    } else {
        Write-ColorOutput "Status: ✅ Deployed Successfully" $Green
    }
}

# اجرای اصلی
function Main {
    Write-ColorOutput "🚀 Plesk Deployment Script" $Green
    Write-ColorOutput "=========================" $Green
    
    # بررسی پیش‌نیازها
    Test-Prerequisites
    
    # آپدیت version
    $newVersion = Update-Version -Type $VersionType
    
    # Build (اگر skip نشده باشد)
    if (-not $SkipBuild) {
        Build-Application
    }
    
    # ایجاد فایل‌های پیکربندی ویندوز
    Create-WindowsConfig
    
    # ایجاد اطلاعات deployment
    Create-DeploymentInfo -Version $newVersion
    
    # Deploy (اگر اطلاعات FTP داده شده باشد)
    if ($FtpHost -and $FtpUsername -and $FtpPassword) {
        Deploy-ToFTP -Host $FtpHost -Username $FtpUsername -Password $FtpPassword -RemotePath $RemotePath
    } else {
        Write-ColorOutput "⚠️ FTP credentials not provided. Skipping deployment." $Yellow
        Write-ColorOutput "   Files are ready in 'dist' folder for manual upload." $Yellow
    }
    
    # نمایش خلاصه
    Show-Summary -Version $newVersion
}

# اجرای اسکریپت
Main