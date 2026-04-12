$Root = Split-Path -Parent $PSScriptRoot
$Keys = Join-Path $Root "apps\api\keys"
New-Item -ItemType Directory -Force -Path $Keys | Out-Null
Push-Location $Keys
try {
  openssl genrsa -out private.pem 2048
  openssl rsa -in private.pem -pubout -out public.pem
  openssl ecparam -name prime256v1 -genkey -noout -out ec_private.pem
  openssl ec -in ec_private.pem -pubout -out ec_public.pem
  Write-Host "Keys written to $Keys"
}
finally {
  Pop-Location
}
