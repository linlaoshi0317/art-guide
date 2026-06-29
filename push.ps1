Set-Location "C:\Users\蔺先生\Documents\提升孩子作品审美的技能skill\ios-art-guide-prototype"
$env:GIT_TERMINAL_PROMPT = "0"
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" commit -m "deploy"
& "C:\Program Files\Git\bin\git.exe" remote remove origin 2>$null
& "C:\Program Files\Git\bin\git.exe" remote add origin "https://linlaoshi0317:Art2024!!@github.com/linlaoshi0317/art-guide.git"
& "C:\Program Files\Git\bin\git.exe" push -u origin master --force
Write-Host "Done!"
