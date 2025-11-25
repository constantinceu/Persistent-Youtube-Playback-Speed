# Persistent-Youtube-Playback-Speed
Firefox Extension that supplies a Persistent Youtube Playback Speed that never changes on its own.

### Firefox Permanent Installation

1. Download or clone this repository
2. Install the Firefox Developer edition: https://www.firefox.com/en-GB/channel/desktop/?redirect_source=mozilla-org
3. Open about:config in Firefox and set xpinstall.signatures.required to false
4. Compress: background.js, contentScript.js, manifest.json, options.html, options.js into a single .zip File
5. Open about:addons in Firefox and drag the .zip Folder in the Window.
6. Give necessary Permissions and you are good to go.

#### Firefox Temporary Installation (recommended)

1. Download or clone this repository  
2. Open Firefox and navigate to:  
   `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**  
4. Select any file inside the extension directory (e.g., `manifest.json`)  
5. The extension will load and work until Firefox is closed

Editing default speed:
  - After installation, use Options page (right-click the extension → Manage Extension → Options) to change the stored speed (applies immediately).

Notes:
  - The Options page writes the value to browser.storage.local and this value is used every time a YouTube video runs.
