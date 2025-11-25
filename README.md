# Persistent-Youtube-Playback-Speed
Firefox Extension that supplies a Persistent Youtube Playback Speed that never changes on its own.

Installation:
  1. Zip the contents of this folder (contents must include manifest.json at the root).
  2. In Firefox, open about:debugging#/runtime/this-firefox and choose "Load Temporary Add-on..." and pick the manifest.json inside the zip (or unzip and pick manifest.json).
  3. Alternatively sign and distribute the add-on if you want persistent install.

Editing default speed via file:
  - Edit settings.json before zipping/installing to change the packaged default speed.
  - After installation, use Options page (right-click the extension → Manage Extension → Options) to change the stored speed (applies immediately).

Notes:
  - The Options page writes the value to browser.storage.local and this value is used every time a YouTube video runs.
  - Because extension package files are read-only once installed, editing settings.json after installation will have no effect. Use the Options page to change the speed live.
