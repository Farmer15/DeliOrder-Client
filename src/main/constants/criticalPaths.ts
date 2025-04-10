import os from "os";
import path from "path";

export const MAC_CRITICAL_PATHS: readonly string[] = [
  path.join(os.homedir(), "Desktop"),
  os.homedir(),
  path.join(os.homedir(), "Library"),
  path.join(os.homedir(), "Documents"),
  path.join(os.homedir(), "Downloads"),
  path.join(os.homedir(), "Pictures"),
  path.join(os.homedir(), "Music"),
  path.join(os.homedir(), "Movies"),
  "/System",
  "/Applications",
  "/Library",
  "/System/Library",
  "/bin",
  "/usr",
  "/sbin",
  "/etc",
  "/var",
  "/Volumes",
  "/private",
  "/tmp",
  "/Users",
  "/Applications/Utilities",
  "/Library/Application Support",
  "/Library/Preferences",
  "/Library/Caches",
  "/private/var",
  "/private/tmp",
  "/usr/local",
  "/usr/share",
  "/Library/Extensions",
  "/Library/Receipts",
  "/Library/Logs",
  "/private/var/log",
  "/private/var/spool",
  "/usr/local/bin",
  "/usr/local/etc",
  "/Library/Audio",
  "/Library/Fonts",
  "/Library/Sounds",
  "/Library/ColorSync",
  "/Library/Frameworks",
  "/Library/Internet Plug-Ins",
  "/Library/PreferencePanes",
  "/Library/PDF Services",
  "/private/var/folders",
];

export const WINDOWS_CRITICAL_PATHS: readonly string[] = [
  path.join(os.homedir(), "Desktop"),
  os.homedir(),
  path.join(os.homedir(), "AppData"),
  path.join(os.homedir(), "Documents"),
  path.join(os.homedir(), "Downloads"),
  path.join(os.homedir(), "Pictures"),
  path.join(os.homedir(), "Music"),
  path.join(os.homedir(), "Videos"),
  "C:\\Windows",
  "C:\\Program Files",
  "C:\\Program Files (x86)",
  "C:\\Windows\\System32",
  "C:\\System Volume Information",
  "C:\\",
  "C:\\Users",
  "C:\\Windows\\Temp",
  "C:\\Recovery",
  "C:\\ProgramData",
  "C:\\Users\\Public",
  "C:\\Windows\\Prefetch",
  "C:\\Windows\\SoftwareDistribution",
  "C:\\Windows\\SysWOW64",
  "C:\\Program Files\\Common Files",
  "C:\\Program Files\\WindowsApps",
  "C:\\Program Files\\Windows Defender",
  "C:\\Program Files\\Microsoft SQL Server",
  "C:\\Program Files\\Adobe",
  "C:\\Windows\\WinSxS",
  "C:\\Windows\\Globalization",
  "C:\\Windows\\Web",
  "C:\\Program Files (x86)\\Microsoft SQL Server",
  "C:\\Program Files\\Common Files\\Microsoft Shared",
  "C:\\Windows\\System",
  "C:\\Windows\\Media",
  "C:\\Windows\\Microsoft.NET",
  "C:\\Windows\\IME",
  "C:\\Program Files\\Oracle",
  "C:\\Program Files\\WinRAR",
  "C:\\Program Files\\TeamViewer",
  "C:\\Windows\\Setup",
  "C:\\Windows\\servicing",
];
