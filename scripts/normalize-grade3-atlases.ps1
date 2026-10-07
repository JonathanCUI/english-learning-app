param([string[]]$Units = @('welcome', 'unit1a', 'unit1b', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6', 'corrections'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
# Grid boundaries measured on the generated originals (fractions of image height).
# Normalizing each cell avoids adjacent illustrations leaking into the card crop.
$plans = @(
    @{ Unit = 'corrections'; Name = 'meaning-corrections-v1.png'; Columns = 3; Y = @(0, 0.330, 0.644, 1) },
    @{ Unit = 'welcome'; Columns = 4; Y = @(0, 0.251, 0.500, 0.735, 1) },
    @{ Unit = 'unit1a'; Columns = 3; Y = @(0, 0.33333, 0.66667, 1) },
    @{ Unit = 'unit1b'; Columns = 4; Y = @(0, 0.33333, 0.66667, 1) },
    @{ Unit = 'unit2'; Columns = 4; Y = @(0, 0.251, 0.477, 0.715, 1) },
    @{ Unit = 'unit3'; Columns = 4; Y = @(0, 0.240, 0.489, 0.739, 1) },
    @{ Unit = 'unit4'; Columns = 4; Y = @(0, 0.25, 0.50, 0.75, 1) },
    @{ Unit = 'unit5'; Columns = 4; Y = @(0, 0.25, 0.50, 0.75, 1) },
    @{ Unit = 'unit6'; Columns = 4; Y = @(0, 0.251, 0.501, 0.735, 1) }
)
foreach ($plan in $plans) {
    if ($Units -notcontains $plan.Unit) { continue }
    $name = 'g3-s1-' + $plan.Unit + '-extra.png'
    if ($plan.Name) { $name = $plan.Name }
    $source = Join-Path $root ('assets/grade3/source/' + $name)
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing generated atlas: $source" }
    $image = [System.Drawing.Image]::FromFile($source)
    $bitmap = New-Object System.Drawing.Bitmap(1280, 1280)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 248, 232))
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $cellWidth = 1280 / $plan.Columns
        $rows = $plan.Y.Count - 1
        $cellHeight = 1280 / $rows
        for ($row = 0; $row -lt $rows; $row++) {
            for ($col = 0; $col -lt $plan.Columns; $col++) {
                $left = $col * $image.Width / $plan.Columns + 3
                $top = $plan.Y[$row] * $image.Height + 3
                $width = $image.Width / $plan.Columns - 6
                $height = ($plan.Y[$row + 1] - $plan.Y[$row]) * $image.Height - 6
                $scale = [Math]::Min(($cellWidth - 12) / $width, ($cellHeight - 12) / $height)
                $drawWidth = $width * $scale
                $drawHeight = $height * $scale
                $dest = New-Object System.Drawing.RectangleF(($col * $cellWidth + ($cellWidth - $drawWidth) / 2), ($row * $cellHeight + ($cellHeight - $drawHeight) / 2), $drawWidth, $drawHeight)
                $src = New-Object System.Drawing.RectangleF($left, $top, $width, $height)
                $graphics.DrawImage($image, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
            }
        }
        $bitmap.Save((Join-Path $root ('assets/grade3/' + $name)), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
        $image.Dispose()
    }
    Write-Output ('Normalized ' + $name)
}
