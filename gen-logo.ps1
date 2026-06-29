Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'

$orange1 = [System.Drawing.Color]::FromArgb(255, 235, 100, 40)
$orange2 = [System.Drawing.Color]::FromArgb(255, 230, 120, 50)
$whiteAlpha = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
$white = [System.Drawing.Color]::White
$yellow = [System.Drawing.Color]::FromArgb(255, 255, 220, 80)

$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0,0)), (New-Object System.Drawing.Point(512,512)), $orange1, $orange2)
$g.FillRectangle($brush, 0, 0, 512, 512)

$brush2 = New-Object System.Drawing.SolidBrush($whiteAlpha)
$g.FillEllipse($brush2, 30, 30, 452, 452)

$font1 = New-Object System.Drawing.Font('Arial', 130, [System.Drawing.FontStyle]::Bold)
$brush3 = New-Object System.Drawing.SolidBrush($white)
$point = New-Object System.Drawing.PointF(155, 80)
$g.DrawString('A', $font1, $brush3, $point)

$brush4 = New-Object System.Drawing.SolidBrush($yellow)
$points = @(256,160, 276,210, 330,210, 286,240, 302,290, 256,260, 210,290, 226,240, 182,210, 236,210)
$g.FillPolygon($brush4, [int[]]$points)

$g.Dispose()

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bmp.Save("$baseDir\public\logo-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp192 = New-Object System.Drawing.Bitmap($bmp, 192, 192)
$bmp192.Save("$baseDir\public\logo-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp180 = New-Object System.Drawing.Bitmap($bmp, 180, 180)
$bmp180.Save("$baseDir\public\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
Write-Host 'OK'
