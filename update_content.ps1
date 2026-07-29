# お知らせ・広報紙・各種配布物・行事予定・キーイメージ CSV からサイト用データを再生成
Set-Location $PSScriptRoot
python build_content.py
if ($LASTEXITCODE -eq 0) {
  Write-Host "完了。ブラウザを再読み込みしてください。" -ForegroundColor Green
} else {
  Write-Host "ビルドに失敗しました。" -ForegroundColor Red
  exit $LASTEXITCODE
}
