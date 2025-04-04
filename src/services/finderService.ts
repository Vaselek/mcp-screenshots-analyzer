import { exec } from 'child_process';

export function revealInFinder(filePaths: string[]) {
  if (process.platform !== 'darwin') {
    console.log('This feature is only available on macOS');
    return;
  }

  if (filePaths.length === 0) return;

  if (filePaths.length === 1) {
    exec(`open -R "${filePaths[0]}"`);
  } else {
    exec(`open -R "${filePaths[0]}" && osascript -e 'tell application "Finder" to select (POSIX file "${filePaths.join('" & POSIX file "')}")' -e 'tell application "Finder" to activate'`);
  }
}