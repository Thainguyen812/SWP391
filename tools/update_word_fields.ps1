param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

$ErrorActionPreference = "Stop"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($Path)
    $doc.TrackRevisions = $false

    foreach ($toc in $doc.TablesOfContents) {
        $toc.Update()
    }

    $null = $doc.Fields.Update()

    foreach ($section in $doc.Sections) {
        foreach ($header in $section.Headers) {
            $null = $header.Range.Fields.Update()
        }
        foreach ($footer in $section.Footers) {
            $null = $footer.Range.Fields.Update()
        }
    }

    $doc.Save()
    $doc.Close()
}
finally {
    try {
        $word.Quit()
    }
    catch {
        Write-Warning "Word already closed or COM connection was released after save."
    }
}

Write-Output "word_fields_updated=$Path"
