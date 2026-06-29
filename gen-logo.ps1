Add-Type -AssemblyName System.Drawing

$sz = 512
$bmp = New-Object System.Drawing.Bitmap($sz, $sz)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'

# 橙色渐变背景
$b1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0,0)),
    (New-Object System.Drawing.Point($sz,$sz)),
    [System.Drawing.Color]::FromArgb(255, 245, 130, 50),
    [System.Drawing.Color]::FromArgb(255, 220, 100, 40)
)
$g.FillRectangle($b1, 0, 0, $sz, $sz)

# 铅笔主体
$pencil = New-Object System.Drawing.Drawing2D.GraphicsPath
$cx = 256; $cy = 220
# 铅笔杆
$pencil.AddPolygon(@(
    $cx-50, $cy+80,
    $cx+50, $cy+80,
    $cx+50, $cy-140,
    $cx-50, $cy-140
))
# 笔尖
$pencil.AddPolygon(@(
    $cx-50, $cy+80,
    $cx+50, $cy+80,
    $cx, $cy+200
))

# 画铅笔杆 - 黄色
$penB = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 215, 0))
$g.FillRectangle($penB, $cx-48, $cy-140, 96, 220)

# 铅笔条纹装饰
$stripe = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 180, 0))
$g.FillRectangle($stripe, $cx-48, $cy-100, 96, 12)
$g.FillRectangle($stripe, $cx-48, $cy-50, 96, 12)
$g.FillRectangle($stripe, $cx-48, $cy, 96, 12)

# 铅笔橡皮头 - 粉色
$eraser = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 180, 180))
$g.FillRectangle($eraser, $cx-48, $cy-170, 96, 35)

# 橡皮头金属箍
$metal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 200, 200, 200))
$g.FillRectangle($metal, $cx-48, $cy-140, 96, 8)

# 笔尖 - 木色
$tip = @($cx-48, $cy+75, $cx+48, $cy+75, $cx, $cy+185)
$tipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 240, 200, 150))
$g.FillPolygon($tipBrush, $tip)

# 笔尖石墨
$lead = @($cx-8, $cy+100, $cx+8, $cy+100, $cx, $cy+185)
$leadBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 50, 50, 50))
$g.FillPolygon($leadBrush, $lead)

# 白色高光条
$highlight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 255, 255, 255))
$g.FillRectangle($highlight, $cx-30, $cy-130, 16, 190)

$g.Dispose()

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 512x512
$bmp.Save("$baseDir\public\logo-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 192x192
$bmp192 = New-Object System.Drawing.Bitmap($bmp, 192, 192)
$bmp192.Save("$baseDir\public\logo-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 180x180 apple
$bmp180 = New-Object System.Drawing.Bitmap($bmp, 180, 180)
$bmp180.Save("$baseDir\public\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# icon-192
$bmp192.Save("$baseDir\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
Write-Host 'Pencil logo generated!'
