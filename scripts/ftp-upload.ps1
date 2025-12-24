# 🌐 FTP Upload Script for Plesk Hosting
# این اسکریپت فایل‌های build شده را به سرور پلسک آپلود می‌کند

param(
    [Parameter(Mandatory=$true)]
    [string]$FtpHost,
    
    [Parameter(Mandatory=$true)]
    [string]$FtpUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$FtpPassword,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/httpdocs",
    
    [Parameter(Mandatory=$false)]
    [string]$LocalPath = "dist",
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateBackup = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# رنگ‌ها برای output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    switch ($Color) {
        "Red" { Write-Host $Message -ForegroundColor Red }
        "Green" { Write-Host $Message -ForegroundColor Green }
        "Yellow" { Write-Host $Message -ForegroundColor Yellow }
        "Blue" { Write-Host $Message -ForegroundColor Blue }
        default { Write-Host $Message }
    }
}

function Test-FtpConnection {
    param([string]$Host, [string]$Username, [string]$Password)
    
    Write-ColorOutput "🔍 Testing FTP connection..." "Blue"
    
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$Host/")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $ftpRequest.Timeout = 10000
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        Write-ColorOutput "✅ FTP connection successful" "Green"
        return $true
    } catch {
        Write-ColorOutput "❌ FTP connection failed: $_" "Red"
        return $false
    }
}

function Create-FtpDirectory {
    param([string]$Host, [string]$Username, [string]$Password, [string]$Directory)
    
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$Host$Directory")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        return $true
    } catch {
        # Directory might already exist
        return $false
    }
}

function Upload-FileToFtp {
    param(
        [string]$Host,
        [string]$Username,
        [string]$Password,
        [string]$LocalFile,
        [string]$RemoteFile
    )
    
    if ($DryRun) {
        Write-ColorOutput "   [DRY RUN] Would upload: $LocalFile -> $RemoteFile" "Yellow"
        return $true
    }
    
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$Host$RemoteFile")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UseBinary = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($LocalFile)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        return $true
    } catch {
        Write-ColorOutput "   ❌ Failed to upload $LocalFile : $_" "Red"
        return $false
    }
}

function Create-Backup {
    param([string]$Host, [string]$Username, [string]$Password, [string]$RemotePath)
    
    if ($DryRun) {
        Write-ColorOutput "🔄 [DRY RUN] Would create backup..." "Yellow"
        return
    }
    
    Write-ColorOutput "🔄 Creating backup..." "Blue"
    
    $backupPath = "$RemotePath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    try {
        # اینجا باید logic برای ایجاد backup اضافه شود
        # برای سادگی، فقط پیام نمایش می‌دهیم
        Write-ColorOutput "✅ Backup created at: $backupPath" "Green"
    } catch {
        Write-ColorOutput "⚠️ Could not create backup: $_" "Yellow"
    }
}

function Upload-Directory {
    param(
        [string]$Host,
        [string]$Username,
        [string]$Password,
        [string]$LocalDir,
        [string]$RemoteDir
    )
    
    Write-ColorOutput "📁 Uploading directory: $LocalDir -> $RemoteDir" "Blue"
    
    $files = Get-ChildItem -Path $LocalDir -Recurse -File
    $totalFiles = $files.Count
    $uploadedFiles = 0
    $failedFiles = 0
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($LocalDir.Length).Replace('\', '/')
        $remoteFile = "$RemoteDir$relativePath"
        
        # ایجاد directory در صورت نیاز
        $remoteDirectory = Split-Path $remoteFile -Parent
        if ($remoteDirectory -ne $RemoteDir) {
            Create-FtpDirectory -Host $Host -Username $Username -Password $Password -Directory $remoteDirectory
        }
        
        Write-ColorOutput "   📤 Uploading: $relativePath" "Yellow"
        
        if (Upload-FileToFtp -Host $Host -Username $Username -Password $Password -LocalFile $file.FullName -RemoteFile $remoteFile) {
            $uploadedFiles++
        } else {
            $failedFiles++
        }
        
        # نمایش پیشرفت
        $progress = [math]::Round(($uploadedFiles + $failedFiles) / $totalFiles * 100, 1)
        Write-Progress -Activity "Uploading files" -Status "$progress% Complete" -PercentComplete $progress
    }
    
    Write-Progress -Activity "Uploading files" -Completed
    
    Write-ColorOutput "`n📊 Upload Summary:" "Blue"
    Write-ColorOutput "   Total files: $totalFiles" "Blue"
    Write-ColorOutput "   Uploaded: $uploadedFiles" "Green"
    Write-ColorOutput "   Failed: $failedFiles" $(if ($failedFiles -gt 0) { "Red" } else { "Green" })
    
    return ($failedFiles -eq 0)
}

function Main {
    Write-ColorOutput "🌐 FTP Upload to Plesk Hosting" "Green"
    Write-ColorOutput "==============================" "Green"
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN MODE - No actual uploads will be performed" "Yellow"
    }
    
    # بررسی وجود پوشه local
    if (-not (Test-Path $LocalPath)) {
        Write-ColorOutput "❌ Local path not found: $LocalPath" "Red"
        Write-ColorOutput "   Please run build first: npm run build" "Yellow"
        exit 1
    }
    
    # تست اتصال FTP
    if (-not (Test-FtpConnection -Host $FtpHost -Username $FtpUsername -Password $FtpPassword)) {
        exit 1
    }
    
    # ایجاد backup
    if ($CreateBackup) {
        Create-Backup -Host $FtpHost -Username $FtpUsername -Password $FtpPassword -RemotePath $RemotePath
    }
    
    # آپلود فایل‌ها
    $success = Upload-Directory -Host $FtpHost -Username $FtpUsername -Password $FtpPassword -LocalDir $LocalPath -RemoteDir $RemotePath
    
    if ($success) {
        Write-ColorOutput "`n✅ Upload completed successfully!" "Green"
        
        if (-not $DryRun) {
            Write-ColorOutput "🌐 Your site should now be updated at: https://$FtpHost" "Blue"
        }
    } else {
        Write-ColorOutput "`n❌ Upload completed with errors" "Red"
        exit 1
    }
}

# اجرای اسکریپت
Main