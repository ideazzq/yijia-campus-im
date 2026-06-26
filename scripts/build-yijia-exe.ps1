Set-StrictMode -Version Latest
# Build the rebranded Wingjia package end-to-end.
$ErrorActionPreference = "Stop"

function Join-UnicodeText {
    param(
        [int[]]$CodePoints
    )

    return -join ($CodePoints | ForEach-Object { [char]$_ })
}

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"
$desktopShell = Join-Path $root "desktop-shell"
$dist = Join-Path $root "dist"
$appImageDir = Join-Path $dist "YijiaApp"
$electronOutputDir = Join-Path $dist "electron"
$buildId = [guid]::NewGuid().ToString("N")
$manualPortableDir = Join-Path $dist ("electron-portable-" + $buildId)
$desktopShellStageDir = Join-Path $dist ("desktop-shell-stage-" + $buildId)
$electronCacheZip = Join-Path $env:LOCALAPPDATA "electron\Cache\electron-v28.3.3-win32-x64.zip"
$desktopBundleZip = Join-Path $dist "YijiaDesktopBundle.zip"
$desktopAppAsar = Join-Path $dist "desktop-app.asar"
$desktopBootstrapSource = Join-Path $root "tools\launcher\YijiaDesktopBootstrap.cs"
$installerSource = Join-Path $root "tools\installer\YijiaSetupInstaller.cs"
$appDisplayName = "翼家校园通信系统"
$installerDisplayName = "翼家校园通信系统-安装包"
$appDisplayExeName = $appDisplayName + ".exe"
$finalExe = Join-Path $dist ($appDisplayName + ".exe")
$installerExe = Join-Path $dist ($installerDisplayName + ".exe")
$buildFinalExe = Join-Path $dist "YijiaCampusSystem.exe"
$buildInstallerExe = Join-Path $dist "YijiaCampusSystem-Setup.exe"
$iconSourcePng = "E:\desktop\7d33ace3-509b-4e7c-b97e-7a620188d330.png"
$iconPng = Join-Path $frontend "src\assets\yijia-logo.png"
$appIconPng = Join-Path $frontend "src\assets\yijia-app-icon.png"
$iconIco = Join-Path $frontend "src\assets\yijia-logo.ico"
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

function Assert-ExitCode {
    param(
        [string]$Step
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

function New-PngIco {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PngPath,
        [Parameter(Mandatory = $true)]
        [string]$IcoPath
    )

    $pythonScript = @'
from pathlib import Path
from PIL import Image

png_path = Path(r"""__PNG_PATH__""")
ico_path = Path(r"""__ICO_PATH__""")

img = Image.open(png_path).convert("RGBA")
sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(ico_path, format="ICO", sizes=sizes)
'@

    $pythonScript = $pythonScript.Replace("__PNG_PATH__", $PngPath).Replace("__ICO_PATH__", $IcoPath)
    $tempScriptPath = Join-Path $env:TEMP ("yijia-icon-" + [guid]::NewGuid().ToString("N") + ".py")

    try {
        Set-Content -LiteralPath $tempScriptPath -Value $pythonScript -Encoding UTF8
        python $tempScriptPath
        Assert-ExitCode "Icon generation"
    }
    finally {
        if (Test-Path $tempScriptPath) {
            Remove-Item -LiteralPath $tempScriptPath -Force
        }
    }
}

function New-AppIconPng {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourcePngPath,
        [Parameter(Mandatory = $true)]
        [string]$OutputPngPath
    )

    $pythonScript = @'
from pathlib import Path
from PIL import Image, ImageFilter

source_path = Path(r"""__SOURCE_PATH__""")
output_path = Path(r"""__OUTPUT_PATH__""")

source = Image.open(source_path).convert("RGBA")

# Crop to the actual app-mark area so the icon does not look tiny inside Windows.
crop_box = (300, 72, 1171, 943)
cropped = source.crop(crop_box)

target_size = 1024
canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))

inner_size = 880
resized = cropped.resize((inner_size, inner_size), Image.LANCZOS)
offset = ((target_size - inner_size) // 2, (target_size - inner_size) // 2)

shadow = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
shadow.paste((0, 0, 0, 120), (offset[0] + 10, offset[1] + 18, offset[0] + inner_size + 10, offset[1] + inner_size + 18))
shadow = shadow.filter(ImageFilter.GaussianBlur(26))

canvas.alpha_composite(shadow)
canvas.alpha_composite(resized, dest=offset)
canvas.save(output_path, format="PNG")
'@

    $pythonScript = $pythonScript.Replace("__SOURCE_PATH__", $SourcePngPath).Replace("__OUTPUT_PATH__", $OutputPngPath)
    $tempScriptPath = Join-Path $env:TEMP ("yijia-app-icon-" + [guid]::NewGuid().ToString("N") + ".py")

    try {
        Set-Content -LiteralPath $tempScriptPath -Value $pythonScript -Encoding UTF8
        python $tempScriptPath
        Assert-ExitCode "App icon rendering"
    }
    finally {
        if (Test-Path $tempScriptPath) {
            Remove-Item -LiteralPath $tempScriptPath -Force
        }
    }
}

if (-not (Test-Path $iconSourcePng)) {
    throw "Custom logo source was not found: $iconSourcePng"
}

Write-Host "Updating logo assets..."
Copy-Item -LiteralPath $iconSourcePng -Destination $iconPng -Force

Write-Host "Building frontend..."
Push-Location $frontend
try {
    npm run build:backend
}
finally {
    Pop-Location
}
Assert-ExitCode "Frontend build"

Write-Host "Building backend..."
Push-Location $backend
try {
    mvn -q -DskipTests package
}
finally {
    Pop-Location
}
Assert-ExitCode "Backend build"

Write-Host "Generating launcher icon..."
New-AppIconPng -SourcePngPath $iconSourcePng -OutputPngPath $appIconPng
New-PngIco -PngPath $appIconPng -IcoPath $iconIco
Copy-Item -LiteralPath $iconIco -Destination (Join-Path $frontend "public\favicon.ico") -Force

Write-Host "Creating app-image..."
if (Test-Path $appImageDir) {
    Remove-Item -LiteralPath $appImageDir -Recurse -Force
}

jpackage `
    --type app-image `
    --dest $dist `
    --name YijiaApp `
    --input (Join-Path $backend "target") `
    --main-jar chatapp-0.0.1-SNAPSHOT.jar `
    --main-class org.springframework.boot.loader.launch.JarLauncher `
    --icon $iconIco `
    --app-version 0.0.3 `
    --vendor $appDisplayName
Assert-ExitCode "jpackage app-image"

Write-Host "Installing desktop shell dependencies..."
Push-Location $desktopShell
try {
    npm install
}
finally {
    Pop-Location
}
Assert-ExitCode "Desktop shell dependency install"

Write-Host "Packing desktop resources..."
if (Test-Path $electronOutputDir) {
    Remove-Item -LiteralPath $electronOutputDir -Recurse -Force
}

if (Test-Path $desktopShellStageDir) {
    Remove-Item -LiteralPath $desktopShellStageDir -Recurse -Force
}

if (Test-Path $desktopAppAsar) {
    Remove-Item -LiteralPath $desktopAppAsar -Force
}

New-Item -ItemType Directory -Path $desktopShellStageDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $desktopShell "main.js") -Destination (Join-Path $desktopShellStageDir "main.js") -Force
Copy-Item -LiteralPath (Join-Path $desktopShell "package.json") -Destination (Join-Path $desktopShellStageDir "package.json") -Force

Push-Location $desktopShell
try {
    .\node_modules\.bin\asar.cmd pack $desktopShellStageDir $desktopAppAsar
}
finally {
    Pop-Location
}
Assert-ExitCode "Desktop resource packaging"

Write-Host "Extracting Electron runtime..."
if (-not (Test-Path $electronCacheZip)) {
    throw "Electron runtime archive was not found: $electronCacheZip"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($electronCacheZip, $manualPortableDir)

Write-Host "Assembling desktop application..."
$electronExe = Join-Path $manualPortableDir "electron.exe"
$desktopExe = Join-Path $manualPortableDir $appDisplayExeName
Rename-Item -LiteralPath $electronExe -NewName $appDisplayExeName

$resourcesDir = Join-Path $manualPortableDir "resources"
if (-not (Test-Path $resourcesDir)) {
    New-Item -ItemType Directory -Path $resourcesDir | Out-Null
}

Copy-Item -LiteralPath $desktopAppAsar -Destination (Join-Path $resourcesDir "app.asar") -Force

$runtimeResourceDir = Join-Path $resourcesDir "runtime\YijiaApp"
New-Item -ItemType Directory -Path $runtimeResourceDir -Force | Out-Null
Copy-Item -Path (Join-Path $appImageDir "*") -Destination $runtimeResourceDir -Recurse -Force

$assetResourceDir = Join-Path $resourcesDir "assets"
New-Item -ItemType Directory -Path $assetResourceDir -Force | Out-Null
Copy-Item -LiteralPath $iconPng -Destination (Join-Path $assetResourceDir "yijia-logo.png") -Force
Copy-Item -LiteralPath $appIconPng -Destination (Join-Path $assetResourceDir "yijia-app-icon.png") -Force

Write-Host "Creating desktop bundle..."
if (Test-Path $desktopBundleZip) {
    Remove-Item -LiteralPath $desktopBundleZip -Force
}
[System.IO.Compression.ZipFile]::CreateFromDirectory($manualPortableDir, $desktopBundleZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Compiling single-file desktop launcher..."
if (Test-Path $finalExe) {
    Remove-Item -LiteralPath $finalExe -Force
}
if (Test-Path $buildFinalExe) {
    Remove-Item -LiteralPath $buildFinalExe -Force
}

& $csc `
    /nologo `
    /target:winexe `
    /platform:anycpu `
    /out:$buildFinalExe `
    /win32icon:$iconIco `
    /resource:$desktopBundleZip,YijiaDesktopBundle.zip `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.IO.Compression.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Windows.Forms.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Core.dll" `
    $desktopBootstrapSource
Assert-ExitCode "Desktop launcher compilation"

Copy-Item -LiteralPath $buildFinalExe -Destination $finalExe -Force

Write-Host "Compiling installer wizard..."
if (Test-Path $installerExe) {
    Remove-Item -LiteralPath $installerExe -Force
}
if (Test-Path $buildInstallerExe) {
    Remove-Item -LiteralPath $buildInstallerExe -Force
}

& $csc `
    /nologo `
    /target:winexe `
    /platform:anycpu `
    /out:$buildInstallerExe `
    /win32icon:$iconIco `
    /resource:$buildFinalExe,$appDisplayExeName `
    /resource:$appIconPng,yijia-app-icon.png `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.IO.Compression.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Windows.Forms.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Drawing.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.Core.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\System.dll" `
    /reference:"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Microsoft.CSharp.dll" `
    $installerSource
Assert-ExitCode "Installer wizard compilation"

Copy-Item -LiteralPath $buildInstallerExe -Destination $installerExe -Force

Write-Host "Done: $finalExe"
Write-Host "Installer: $installerExe"
