Unicode true
!include "MUI2.nsh"
!define APPNAME "Matematicas vs. Zombis"
!define VERSION "4.4.4"
Name "${APPNAME} ${VERSION}"
OutFile "Matematicas_vs_Zombis_4.4.4_Instalador.exe"
InstallDir "$LOCALAPPDATA\Programs\Matematicas vs Zombis"
RequestExecutionLevel user
SetCompressor /SOLID lzma
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Spanish"
Section "Instalar"
  SetOutPath "$INSTDIR"
  File /r "payload\*.*"
  WriteUninstaller "$INSTDIR\Desinstalar.exe"
  CreateDirectory "$SMPROGRAMS\Matematicas vs Zombis"
  CreateShortCut "$SMPROGRAMS\Matematicas vs Zombis\Jugar.lnk" "$INSTDIR\Matematicas vs. Zombis.exe"
  CreateShortCut "$SMPROGRAMS\Matematicas vs Zombis\Desinstalar.lnk" "$INSTDIR\Desinstalar.exe"
  CreateShortCut "$DESKTOP\Matematicas vs Zombis.lnk" "$INSTDIR\Matematicas vs. Zombis.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MatematicasVsZombis444" "DisplayName" "${APPNAME} ${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MatematicasVsZombis444" "UninstallString" '"$INSTDIR\Desinstalar.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MatematicasVsZombis444" "DisplayVersion" "${VERSION}"
SectionEnd
Section "Uninstall"
  Delete "$DESKTOP\Matematicas vs Zombis.lnk"
  RMDir /r "$SMPROGRAMS\Matematicas vs Zombis"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MatematicasVsZombis444"
  RMDir /r "$INSTDIR"
SectionEnd
