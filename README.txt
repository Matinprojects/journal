Trading Journal - Matin Projects
Beta build 1.0.0-beta.1

WHAT TO UPLOAD
--------------
Upload the entire contents of this folder to your host, in one directory.
For example YOUR-LINK so the app is reachable at:

    YOUR-LINK

Files:
    index.html              the app itself
    install.html            install instructions to send testers
    manifest.webmanifest    makes it installable
    sw.js                   offline support
    icons/                  home screen icons
    MatinProjects_setup.json  optional starter setup (your windows and strategies)

REQUIREMENTS
------------
- Must be served over HTTPS. Installing and offline mode do not work on plain
  HTTP, and browsers will refuse the service worker.
- No server-side anything. Static files only. No database, no PHP, no Node.
- Do not rename sw.js or move it into a subfolder. A service worker can only
  control the folder it sits in and below.

WHEN YOU UPLOAD A NEW BUILD
---------------------------
1. Change APP_VERSION in index.html
2. Change CACHE in sw.js to the same string
3. Upload both

Testers get the new version the next time they open it. If you forget step 2,
they will keep seeing the old cached build.

CHECK IT WORKED
---------------
Open the URL in Chrome, press F12, then:
- Application > Manifest        should list the name and icons with no errors
- Application > Service Workers should show one activated worker
- The address bar should show an install icon

