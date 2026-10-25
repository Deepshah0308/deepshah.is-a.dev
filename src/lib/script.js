// Pure builders for the Fleet Script Builder and Token Optimizer, kept DOM-free so node --test can cover them.

export const HARDENING = [
  {
    id: "bloat",
    label: "Remove bloatware",
    hint: "Uninstall consumer AppX packages",
    code: `# Remove consumer bloatware (AppX)
$bloat = @("Microsoft.BingNews", "Microsoft.GetHelp", "Microsoft.Getstarted", "Microsoft.MicrosoftSolitaireCollection", "Microsoft.XboxApp", "Microsoft.ZuneMusic")
foreach ($app in $bloat) {
    Get-AppxPackage -Name $app -AllUsers | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue
    Get-AppxProvisionedPackage -Online | Where-Object DisplayName -eq $app | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue
}
Write-Log "Bloatware removed"`
  },
  {
    id: "bitlocker",
    label: "Enforce BitLocker",
    hint: "XTS-AES 256 on the OS drive",
    code: `# Enforce BitLocker on the OS drive
$vol = Get-BitLockerVolume -MountPoint $env:SystemDrive
if ($vol.ProtectionStatus -ne "On") {
    Enable-BitLocker -MountPoint $env:SystemDrive -EncryptionMethod XtsAes256 -UsedSpaceOnly -TpmProtector
    Write-Log "BitLocker enabled"
} else {
    Write-Log "BitLocker already on"
}`
  },
  {
    id: "ntp",
    label: "Sync NTP time",
    hint: "Point w32time at pool.ntp.org",
    code: `# Sync time against a trusted NTP pool
w32tm /config /manualpeerlist:"pool.ntp.org" /syncfromflags:manual /update | Out-Null
Restart-Service w32time
w32tm /resync /force | Out-Null
Write-Log "Time synced"`
  },
  {
    id: "winget",
    label: "Deploy Winget app",
    hint: "Silent install from winget",
    code: `# Deploy an app with winget
$appId = "Microsoft.CompanyPortal"
winget install --id $appId --silent --accept-package-agreements --accept-source-agreements
Write-Log "Installed $appId"`
  },
  {
    id: "defender",
    label: "Harden Defender",
    hint: "Real-time protection and PUA blocking",
    code: `# Harden Microsoft Defender
Set-MpPreference -DisableRealtimeMonitoring $false -PUAProtection Enabled -MAPSReporting Advanced -SubmitSamplesConsent SendSafeSamples
Update-MpSignature
Write-Log "Defender hardened"`
  }
];

export function buildScript(selected) {
  const blocks = HARDENING.filter((h) => selected.includes(h.id));
  const header = `<#
.SYNOPSIS
    Fleet hardening script generated at deepshah.is-a.dev
.NOTES
    Review before running. Deploy as an Intune platform script (64-bit, SYSTEM context).
#>
#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$LogPath = "$env:ProgramData\\FleetHardening\\hardening.log"
New-Item -ItemType Directory -Force -Path (Split-Path $LogPath) | Out-Null
function Write-Log($msg) { "$(Get-Date -Format s)  $msg" | Tee-Object -FilePath $LogPath -Append }`;
  if (!blocks.length) return header + "\n\n# Pick at least one hardening step.";
  return [header, ...blocks.map((b) => b.code), 'Write-Log "Done"'].join("\n\n");
}

// Tiny PowerShell highlighter: returns [text, kind] tokens so React can render them without innerHTML.
const PS = /(<#[\s\S]*?#>|#[^\n]*)|("(?:[^"`]|`.)*"|'[^']*')|(\$[\w:]+)|(\b(?:if|else|foreach|in|function|return)\b)|(\b[A-Z][a-z]+-[A-Za-z]+\b)|(-[A-Z][A-Za-z]+)/g;
export function highlight(src) {
  const out = [];
  let last = 0;
  for (const m of src.matchAll(PS)) {
    if (m.index > last) out.push([src.slice(last, m.index), ""]);
    const kind = m[1] ? "comment" : m[2] ? "string" : m[3] ? "var" : m[4] ? "keyword" : m[5] ? "cmdlet" : "param";
    out.push([m[0], kind]);
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push([src.slice(last), ""]);
  return out;
}

// shortcut: ~4 chars per token heuristic, swap in a real tokenizer if exact counts matter.
export const estimateTokens = (s) => Math.ceil(s.trim().length / 4);

const FILLER = /\b(please|kindly|basically|actually|really|very|just|simply|i would like you to|could you|can you|in order to)\b\s*/gi;
export function optimizePrompt(s) {
  return s
    .replace(FILLER, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ *\n */g, "\n")
    .trim();
}
