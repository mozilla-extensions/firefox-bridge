# Firefox Bridge

A Chromium and Firefox extension that allows the user to open Firefox from Chromium quickly as well as open other browsers from Firefox.

## Requirements

- Firefox Nightly or Developer Edition 122+ (for the Firefox extension) or 126+ (to be able to launch pages in Firefox from the chromium extension)
- Some Chromium browser 97+


## Development

Run `npm i` to install dependencies.

Run `npm run build` to build the extension.

> [!WARNING]
> `npm run build` requires python < 3.12. You may want to specify a different python version if your default python version is 3.12 or above: `GLEAN_PYTHON=python3.11 npm run build`

To see changes made to the extension, first build the extension, then reload the extension in the browser.

### Run in Chromium

1. Open your chromium browser
2. Go to the extensions page (e.g. `chrome://extensions`)
3. Enable developer mode
4. Click on "Load unpacked" and select the `build/chromium` folder or the `dist/chromium.zip` file.

To see console logs, inspect the service worker.

To be able to launch pages in Firefox, native messaging must be enabled. To do so:

1. Ensure you have Firefox Nightly v126 or later installed. You can find this out in `about:preferences` and search “Update”
2. Load the extension into your chromium browser and take note of the ID. It will look something like this: `ID: idlakildeggleoomlepepihnnilkckob`
3. On Firefox Nightly, navigate to `about:config` and set `browser.firefoxbridge.enabled` to `true` and change the field in `browser.firefoxbridge.extensionOrigins` to “chrome-extension://`your-id-here`/“. 
4. Completely close and reopen Firefox Nightly. Now, the native messaging host will be installed for that extension ID. If the incorrect ID is used or the configs are not set, then the extension will think Firefox is not installed.

Repeat step 2 & 4 any time the ID changes.

### Run in Firefox

Since Firefox Bridge for Firefox uses experimental APIs, you will need to use Firefox Nightly or Beta, then:

1. Open your Firefox browser
2. Go to about:config
3. Set `xpinstall.signatures.required` to `false`
4. Set `extensions.experiments.enabled` to `true`

To load the extension:

1. Go to `about:debugging#/runtime/this-firefox`
2. Click on "Load Temporary Add-on..."
3. Select the `build/firefox/manifest.json` file.
4. Click `Inspect` to see the console logs.

### Tests

Run `npm test` to run the tests.

The tests use the files in the `build` folder. Since the shared logic is the same for both browsers, the shared tests are imported from the `build/chromium` folder only.

### Building

Since the Firefox and Chromium extension has a lot of shared logic, but also independent logic, the build process is a bit complicated.

- The `src` folder contains the `shared`, `_locales`, `firefox`, and `chromium` folders.
- The `chromium` and `firefox` folders contain an `interfaces` folder that contains the interfaces for the shared logic.
- Within shared files, imports from respective interfaces are done through the `Interfaces` alias. This resolves to the correct interface at build time.
- The `build` directory holds the built extension and the `dist` folder holds the packaged versions.

## Experimental APIs

In Firefox, we use experimental APIs to fetch which browsers are installed on the users computer as well as launch the browser without relying on the protocol handler. To learn more about the APIs, see the [Experiments Documentation](https://webextension-api.thunderbird.net/en/latest/how-to/experiments.html).

Due to the privileged-ness of the Firefox extension, we must use manifest V2, hence the lack of callbacks and `browser.browserAction` vs `browser.action`.

### Develop Experimental APIs

To develop the experimental APIs, you will need to install the Firefox source code and build the browser.

1. Follow the instructions to [install the Firefox source code.](https://firefox-source-docs.mozilla.org/setup/index.html)
2. Navigate to `mozilla-unified/`
2. Run `./mach build` to build the browser
3. Run `./mach run` to run the browser
4. Follow the above instructions to load the extension in Firefox

Doing this, you will be able to have much more context in the console, including the ability to see the logs from the `console.log` statements in `api.js`.
