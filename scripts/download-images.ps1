$ErrorActionPreference = 'Continue'
$outputDir = "C:\projectcynt\ferrotech-frontend\public\images\productos"
$txtFile = "$outputDir\Link Productos.txt.txt"

# Read and parse txt file
$lines = Get-Content $txtFile | Where-Object { $_ -match ':' -and $_ -notmatch '^Imagenes:' }
$results = @()
$seen = @{}

foreach ($line in $lines) {
    $parts = $line -split ':', 2
    $name = $parts[0].Trim()
    $url = $parts[1].Trim()
    
    # Skip empty
    if (-not $name -or -not $url) { continue }
    
    # Track duplicates
    if ($seen.ContainsKey($name)) {
        Write-Host "⚠️  DUPLICATE: $name (keeping first URL)" -ForegroundColor Yellow
        continue
    }
    $seen[$name] = $true
    
    # Sanitize filename
    $safeName = $name -replace '[<>:"/\\|?*]', '' -replace '\s+', '_' -replace '["""]', 'in'
    $ext = 'jpg'
    if ($url -match '\.png') { $ext = 'png' }
    if ($url -match '\.webp') { $ext = 'webp' }
    $filename = "$safeName.$ext"
    $outputPath = Join-Path $outputDir $filename
    
    $results += [PSCustomObject]@{
        Name = $name
        Url = $url
        Filename = $filename
        OutputPath = $outputPath
        Downloaded = $false
        Error = ''
    }
}

Write-Host "`n=== Products to download: $($results.Count) ===`n" -ForegroundColor Cyan

$i = 0
foreach ($r in $results) {
    $i++
    Write-Host "[$i/$($results.Count)] $($r.Name)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $r.Url -OutFile $r.OutputPath -TimeoutSec 30 -ErrorAction Stop
        $size = (Get-Item $r.OutputPath).Length
        if ($size -gt 100) {
            Write-Host " ✅ ($($size / 1kb -f 0)KB)" -ForegroundColor Green
            $r.Downloaded = $true
        } else {
            Write-Host " ⚠️  File too small ($size bytes)" -ForegroundColor Yellow
            Remove-Item $r.OutputPath -Force -ErrorAction SilentlyContinue
            $r.Error = "File too small"
        }
    } catch {
        Write-Host " ❌ $($_.Exception.Message)" -ForegroundColor Red
        $r.Error = $_.Exception.Message
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
$ok = $results | Where-Object { $_.Downloaded }
$fail = $results | Where-Object { -not $_.Downloaded }
Write-Host "Downloaded: $($ok.Count) / $($results.Count)" -ForegroundColor Green
if ($fail.Count -gt 0) {
    Write-Host "Failed: $($fail.Count)" -ForegroundColor Red
    $fail | Format-Table Name, Error -AutoSize
}

# Save results to JSON for next step
$results | ConvertTo-Json | Set-Content "$outputDir\download-results.json"
