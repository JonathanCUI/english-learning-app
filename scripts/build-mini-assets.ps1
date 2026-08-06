param(
    [int]$VocabularyMaxSize = 480,
    [int]$ShopMaxSize = 300
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceAssetRoot = Join-Path $projectRoot 'assets'
$targetAssetRoot = Join-Path $projectRoot 'miniprogram\assets'
$vocabularyTarget = Join-Path $targetAssetRoot 'vocab'
$shopTarget = Join-Path $targetAssetRoot 'shop'
New-Item -ItemType Directory -Path $vocabularyTarget -Force | Out-Null
New-Item -ItemType Directory -Path $shopTarget -Force | Out-Null

function Save-OptimizedJpeg {
    param(
        [string]$Source,
        [string]$Destination,
        [int]$MaxSize,
        [long]$Quality
    )

    $sourceImage = [System.Drawing.Image]::FromFile($Source)
    try {
        $scale = [Math]::Min([double]1.0, [double]$MaxSize / [double][Math]::Max($sourceImage.Width, $sourceImage.Height))
        $width = [Math]::Max(1, [Math]::Round($sourceImage.Width * $scale))
        $height = [Math]::Max(1, [Math]::Round($sourceImage.Height * $scale))
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 248, 232))
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
            } finally {
                $graphics.Dispose()
            }

            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                Where-Object { $_.MimeType -eq 'image/jpeg' } |
                Select-Object -First 1
            $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                [System.Drawing.Imaging.Encoder]::Quality,
                $Quality
            )
            try {
                $bitmap.Save($Destination, $encoder, $parameters)
            } finally {
                $parameters.Dispose()
            }
        } finally {
            $bitmap.Dispose()
        }
    } finally {
        $sourceImage.Dispose()
    }
}

$vocabularySources = @(
    @('unit1-vocabulary-atlas.png', 'g1-s1-u1.jpg'),
    @('g1-s1-unit2-atlas.png', 'g1-s1-u2.jpg'),
    @('g1-s1-unit3-atlas.png', 'g1-s1-u3.jpg'),
    @('g1-s1-unit4-atlas.png', 'g1-s1-u4.jpg'),
    @('g1-s1-unit5-atlas.png', 'g1-s1-u5.jpg'),
    @('g1-s1-unit6-atlas.png', 'g1-s1-u6.jpg'),
    @('g1-s2-unit1-atlas.png', 'g1-s2-u1.jpg'),
    @('g1-s2-unit2-atlas.png', 'g1-s2-u2.jpg'),
    @('g1-s2-unit3-atlas.png', 'g1-s2-u3.jpg'),
    @('g1-s2-unit4-atlas.png', 'g1-s2-u4.jpg'),
    @('g1-s2-unit5-atlas.png', 'g1-s2-u5.jpg'),
    @('g1-s2-unit6-atlas.png', 'g1-s2-u6.jpg'),
    @('g2-s1-unit1-atlas.png', 'g2-s1-u1.jpg'),
    @('g2-s1-unit2-atlas.png', 'g2-s1-u2.jpg'),
    @('g2-s1-unit3-atlas.png', 'g2-s1-u3.jpg'),
    @('g2-s1-unit4-atlas.png', 'g2-s1-u4.jpg'),
    @('g2-s1-unit5-atlas.png', 'g2-s1-u5.jpg'),
    @('g2-s1-unit6-atlas.png', 'g2-s1-u6.jpg'),
    @('g2-s2-unit1-atlas.png', 'g2-s2-u1.jpg'),
    @('g2-s2-unit2-atlas.png', 'g2-s2-u2.jpg'),
    @('g2-s2-unit3-atlas.png', 'g2-s2-u3.jpg'),
    @('g2-s2-unit4-atlas.png', 'g2-s2-u4.jpg'),
    @('g2-s2-unit5-atlas.png', 'g2-s2-u5.jpg'),
    @('g2-s2-unit6-atlas.png', 'g2-s2-u6.jpg')
)

foreach ($mapping in $vocabularySources) {
    Save-OptimizedJpeg `
        -Source (Join-Path $sourceAssetRoot $mapping[0]) `
        -Destination (Join-Path $vocabularyTarget $mapping[1]) `
        -MaxSize $VocabularyMaxSize `
        -Quality 66
}

$shopSources = Get-ChildItem -LiteralPath (Join-Path $sourceAssetRoot 'shop-items') -Filter '*.png' -File
foreach ($source in $shopSources) {
    $destinationName = [System.IO.Path]::GetFileNameWithoutExtension($source.Name) + '.jpg'
    Save-OptimizedJpeg `
        -Source $source.FullName `
        -Destination (Join-Path $shopTarget $destinationName) `
        -MaxSize $ShopMaxSize `
        -Quality 74
}

$assetSize = (Get-ChildItem -LiteralPath $targetAssetRoot -Recurse -File | Measure-Object Length -Sum).Sum
Write-Output ('Generated {0} vocabulary atlases and {1} shop images ({2:N2} MB)' -f $vocabularySources.Count, $shopSources.Count, ($assetSize / 1MB))
