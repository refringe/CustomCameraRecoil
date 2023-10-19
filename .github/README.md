This is a mod for Single Player Tarkov.
https://www.sp-tarkov.com

When you fire a weapon, you might notice that not only does the gun move but the whole screen kind of shakes and jumps. This shaking and jumping of the screen is what's called "camera recoil". It's like the game is trying to simulate how when you fire a real gun, the force makes your hands and your view shake a bit. This makes the game feel more real and challenging, because you have to control the weapon not just by aiming, but also by handling how it "kicks" and moves your view around when you shoot.

This modification allows you to change the camera recoil on guns by a relative percentage, or remove it entirely.

**Before:**

![Before Mod](https://github.com/refringe/CustomCameraRecoil/blob/main/images/Before.gif?raw=true)

**After:**

![After Mod](https://github.com/refringe/CustomCameraRecoil/blob/main/images/After.gif?raw=true)

# To Install:

 - Decompress the contents of the download into the `./user/mods/` directory.
 - Open the `CustomCameraRecoil/config/config.json5` file to adjust camera recoil options.
    - The configuration file is in **JSON5** format. The file extension is not a mistake. **_Do not rename it!_**
 - Leave a review and let me know what you think.

If you experience any problems, please [submit a detailed bug report](https://github.com/refringe/CustomCameraRecoil/issues).

# To Build Locally:

This project has been built in [Visual Studio Code](https://code.visualstudio.com/) (VSC) using [Node.js](https://nodejs.org/). If you are unfamiliar with Node.js, I recommend using [NVM](https://github.com/nvm-sh/nvm) to manage installation and switching versions. If you do not wish to use NVM, you will need to install the version of Node.js listed within the `.nvmrc` file manually.

This project uses [Prettier](https://prettier.io/) to format code on save.

To build the project locally:

1. Clone the repository.
2. Open the `mod.code-workspace` file in Visual Studio Code (VSC).
3. Install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) VSC extension.
4. Install the [JSON5](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-json5) VSC extension.
5. Run `nvm use` in the terminal.
6. Run `npm install` in the terminal.
7. Run `npm run build` in the terminal.
