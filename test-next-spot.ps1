#!/usr/bin/env pwsh
# Test script for next-spot API endpoint
# Usage: .\test-next-spot.ps1

$BASE_URL = "http://localhost:3000"
$ENDPOINT = "/api/recommendations/next-spot"

Write-Host "Testing /api/recommendations/next-spot endpoint" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Test 1: Valid coordinates
Write-Host "`nTest 1: Valid coordinates (Patna location)" -ForegroundColor Yellow
$url1 = "${BASE_URL}${ENDPOINT}?lat=25.5852636&lon=85.0583753&k=3"
Write-Host "GET $url1" -ForegroundColor Gray

try {
    $response1 = Invoke-WebRequest -Uri $url1 -Method GET -UseBasicParsing
    $data1 = $response1.Content | ConvertFrom-Json
    
    Write-Host "Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($data1 | ConvertTo-Json -Depth 5)
    
    if ($data1.data.top.Count -gt 0) {
        Write-Host "`n✓ SUCCESS: Returned $($data1.data.top.Count) zones" -ForegroundColor Green
    } else {
        Write-Host "`n✗ FAIL: Returned empty top array" -ForegroundColor Red
        Write-Host "Context: $($data1.data.context | ConvertTo-Json)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
}

# Test 2: Different K value
Write-Host "`n`nTest 2: Request K=5 zones" -ForegroundColor Yellow
$url2 = "${BASE_URL}${ENDPOINT}?lat=25.5852636&lon=85.0583753&k=5"
Write-Host "GET $url2" -ForegroundColor Gray

try {
    $response2 = Invoke-WebRequest -Uri $url2 -Method GET -UseBasicParsing
    $data2 = $response2.Content | ConvertFrom-Json
    
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Returned $($data2.data.top.Count) zones (requested 5)" -ForegroundColor Green
    
    if ($data2.data.top.Count -gt 0) {
        Write-Host "✓ SUCCESS: Received zones" -ForegroundColor Green
        Write-Host "Zone names: $($data2.data.top | ForEach-Object { $_.zone_name } | Join-String -Separator ', ')" -ForegroundColor Cyan
    } else {
        Write-Host "✗ FAIL: Empty results" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
}

# Test 3: Invalid coordinates
Write-Host "`n`nTest 3: Invalid coordinates (should return 400)" -ForegroundColor Yellow
$url3 = "${BASE_URL}${ENDPOINT}?lat=invalid&lon=85.0583753&k=3"
Write-Host "GET $url3" -ForegroundColor Gray

try {
    $response3 = Invoke-WebRequest -Uri $url3 -Method GET -UseBasicParsing
    Write-Host "✗ FAIL: Should have returned 400 but got $($response3.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ SUCCESS: Correctly returned 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong error code" -ForegroundColor Red
    }
}

# Test 4: No auth (if endpoint requires auth)
Write-Host "`n`nTest 4: Without authentication" -ForegroundColor Yellow
$url4 = "${BASE_URL}${ENDPOINT}?lat=25.5852636&lon=85.0583753&k=3"
Write-Host "GET $url4 (no cookies)" -ForegroundColor Gray

try {
    $response4 = Invoke-WebRequest -Uri $url4 -Method GET -UseBasicParsing -SessionVariable noAuth
    $data4 = $response4.Content | ConvertFrom-Json
    
    if ($response4.StatusCode -eq 401) {
        Write-Host "✓ SUCCESS: Correctly requires authentication" -ForegroundColor Green
    } else {
        Write-Host "Status: $($response4.StatusCode)" -ForegroundColor Yellow
        Write-Host "Note: Endpoint may not require auth or session carried over" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ SUCCESS: Correctly returned 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "Tests complete!" -ForegroundColor Cyan
Write-Host "`nIf Test 1 shows 'top: []', check the following:" -ForegroundColor Yellow
Write-Host "1. Run: SELECT COUNT(*) FROM zones WHERE is_active = true;" -ForegroundColor Gray
Write-Host "2. Run: SELECT id, name, lat, lon, ST_AsText(center) FROM zones LIMIT 5;" -ForegroundColor Gray
Write-Host "3. Check server logs for '[recommendations]' messages" -ForegroundColor Gray
Write-Host "4. Verify DATABASE_URL and SUPABASE_* env vars are set" -ForegroundColor Gray
