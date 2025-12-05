# Read the original file
$lines = @(Get-Content "server/index.js.orig")

# Create new content array
$newLines = @()

# Add lines and insert JWT import after app declaration
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    # Add JWT import after "const app = express();"
    if ($lines[$i] -match "const app = express\(\);") {
        $newLines += "const { generateToken } = require('./utils/jwt');"
    }
}

# Write the new file
$newLines | Set-Content "server/index.js" -Encoding UTF8
Write-Host "File updated successfully"
