; The desktop controller keeps running in the tray after its window closes.
; Stop only this app before NSIS replaces its executable and ffmpeg runtime.
!macro customInit
  nsExec::Exec 'taskkill /F /T /IM "Codex Theme Creator.exe"'
  Pop $0
!macroend
