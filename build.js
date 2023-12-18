import fs from "fs";
import path from "path";

function replaceInterfaceImportsInFiles(filePath) {
  const file = fs.readFileSync(filePath, "utf8");
  const result = file.replace(/\.\.\/\.\.\/chromium\/interfaces/g, "../../interfaces");
  fs.writeFileSync(filePath, result, "utf8");
}

function replaceInterfaceImportsInFolders(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceInterfaceImportsInFolders(filePath);
    } else {
      replaceInterfaceImportsInFiles(filePath);
    }
  });
}

function replaceSharedImportsInFolders(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceSharedImportsInFolders(filePath);
    } else {
      replaceSharedImportsInFiles(filePath);
    }
  });
}

function replaceSharedImportsInFiles(filePath) {
  const file = fs.readFileSync(filePath, "utf8");
  const result = file.replace(/(\.\.\/)(.*)shared/g, "./$2shared");
  fs.writeFileSync(filePath, result, "utf8");
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  if (fs.lstatSync(source).isDirectory()) {
    fs.readdirSync(source).forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        const curTarget = path.join(target, file);
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        const curTarget = path.join(target, file);
        // if its an image, copy it as a buffer
        if (file.endsWith(".png") || file.endsWith(".jpg")) {
          const read = fs.createReadStream(curSource);
          const write = fs.createWriteStream(curTarget);
          read.pipe(write);
        } else {
          fs.copyFileSync(curSource, curTarget);
        }
      }
    });
  }
}

function makeBuildFolder() {
  console.log("Creating build folder...");
  const __dirname = path.resolve();
  const buildFolder = path.join(__dirname, "build");
  if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
  } else {
    fs.rmSync(buildFolder, { recursive: true });
    fs.mkdirSync(buildFolder);
  }
}

function buildFirefoxExtension() {
  // make/clear the build/firefox folder
  const __dirname = path.resolve();
  const firefoxBuildFolder = path.join(__dirname, "build", "firefox");

  // copy everything from ./src/firefox to ./build/firefox
  console.log("Copying firefox files...");
  const firefoxFolder = path.join(__dirname, "src", "firefox");
  copyFolderRecursiveSync(firefoxFolder, firefoxBuildFolder);

  // replace all shared import paths for all files and subfolders in ./build/firefox
  console.log("Replacing shared import paths...");
  replaceSharedImportsInFolders(firefoxBuildFolder);
  

  // copy the shared folder to ./build/firefox/shared
  console.log("Copying shared files...");
  const sharedFolder = path.join(__dirname, "src", "shared");
  const sharedBuildFolder = path.join(firefoxBuildFolder, "shared");
  copyFolderRecursiveSync(sharedFolder, sharedBuildFolder);

  // replace all ../../chromium/interfaces with ../../interfaces
  console.log("Replacing interface import paths...");
  replaceInterfaceImportsInFolders(sharedBuildFolder);

  // copy the _locales folder to ./build/firefox/_locales
  console.log("Copying _locales files...");
  const localesFolder = path.join(__dirname, "src", "_locales");
  const localesBuildFolder = path.join(firefoxBuildFolder, "_locales");
  copyFolderRecursiveSync(localesFolder, localesBuildFolder);

  console.log("Done building firefox extension! Reload the extension in firefox.");
}

function buildChromiumExtension() {
  // make/clear the build/chromium folder
  const __dirname = path.resolve();
  const chromiumBuildFolder = path.join(__dirname, "build", "chromium");

  // copy everything from ./src/chromium to ./build/chromium
  console.log("Copying chromium files...");
  const chromiumFolder = path.join(__dirname, "src", "chromium");
  copyFolderRecursiveSync(chromiumFolder, chromiumBuildFolder);

  // replace all shared import paths for all files and subfolders in ./build/chromium
  console.log("Replacing shared import paths...");
  replaceSharedImportsInFolders(chromiumBuildFolder);

  // copy the shared folder to ./build/chromium/shared
  console.log("Copying shared files...");
  const sharedFolder = path.join(__dirname, "src", "shared");
  const sharedBuildFolder = path.join(chromiumBuildFolder, "shared");
  copyFolderRecursiveSync(sharedFolder, sharedBuildFolder);

  // replace all ../../chromium/interfaces with ../../interfaces inside ./build/chromium/shared
  console.log("Replacing interface import paths...");
  replaceInterfaceImportsInFolders(sharedBuildFolder);
  
  // copy the _locales folder to ./build/chromium/_locales
  console.log("Copying _locales files...");
  const localesFolder = path.join(__dirname, "src", "_locales");
  const localesBuildFolder = path.join(chromiumBuildFolder, "_locales");
  copyFolderRecursiveSync(localesFolder, localesBuildFolder);

  console.log("Done building chromium extension! Reload the extension in chromium.");
}

function buildExtensions() {
  makeBuildFolder();
  buildFirefoxExtension();
  buildChromiumExtension();
}

buildExtensions();


// navigator.useragent stores all installed browsers