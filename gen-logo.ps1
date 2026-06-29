Add-Type -AssemblyName System.Drawing

$sz = 512
$bmp = New-Object System.Drawing.Bitmap($sz, $sz)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'

# 橙色渐变背景
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [Drawing.Point]::new(0,0), [Drawing.Point]::new($sz,$sz),
    [Drawing.Color]::OrangeRed, [Drawing.Color]::DarkOrange)
$g.FillRectangle($brush, 0, 0, $sz, $sz)
$brush.Dispose()

# 铅笔杆 - 金黄色
$g.FillRectangle((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,255,215,0))), 208, 80, 96, 220)

# 条纹
$s = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,184,134,11))
$g.FillRectangle($s, 208, 120, 96, 10)
$g.FillRectangle($s, 208, 170, 96, 10)
$g.FillRectangle($s, 208, 220, 96, 10)
$s.Dispose()

# 橡皮头
$g.FillRectangle((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,255,182,193))), 208, 10, 96, 35)

# 金属箍
$g.FillRectangle((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,192,192,192))), 208, 80, 96, 8)

# 笔尖木头
$pts = [Drawing.Point[]]@([Drawing.Point]::new(208,295),[Drawing.Point]::new(304,295),[Drawing.Point]::new(256,405))
$g.FillPolygon((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,222,184,135))), $pts)

# 石墨
$pts2 = [Drawing.Point[]]@([Drawing.Point]::new(248,320),[Drawing.Point]::new(264,320),[Drawing.Point]::new(256,405))
$g.FillPolygon((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255,50,50,50))), $pts2)

# 高光
$g.FillRectangle((New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(80,255,255,255))), 228, 90, 14, 190)

$g.Dispose()

$dir = 'C:\Users\蔺先生\Documents\提升孩子作品审美的技能skill\ios-art-guide-prototype\public'
$bmp.Save("$dir\icon-192.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$dir\icon-512.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$dir\apple-icon.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp192 = New-Object Drawing.Bitmap($bmp, 192, 192)
$bmp192.Save("$dir\logo-192.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()
$bmp.Dispose()
Write-Host 'OK'
