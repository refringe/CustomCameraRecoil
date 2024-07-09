import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import { DependencyContainer } from "tsyringe";
import { CameraRecoilAdjuster } from "./adjusters/CameraRecoilAdjuster";
import { ConfigServer } from "./servers/ConfigServer";
import { Configuration } from "./types";

class CustomCameraRecoil implements IPostDBLoadMod, IPreSptLoadMod {
    public container: DependencyContainer;
    public logger: ILogger;
    public config: Configuration | null = null;

    /**
     * Handles the initial mod set-up, registering the container, logger, and configuration file as a static that can be
     * easily accessed throughout the mod.
     */
    public preSptLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");

        // Load and validate the configuration file, saving it to the static config property for simple access.
        try {
            this.config = new ConfigServer().loadConfig().validateConfig().getConfig();
        } catch (error: any) {
            this.config = null; // Set the config to null so we know it's failed to load or validate.
            this.logger.log(`CustomCameraRecoil: ${error.message}`, "red");
        }

        // Set a flag so we know that we shouldn't continue when the postDBLoad method fires... just setting the config
        // back to null should do the trick. Use optional chaining because we have not yet checked if the config is
        // loaded and valid yet.
        if (this.config?.general?.enabled === false) {
            this.config = null;
            this.logger.log("CustomCameraRecoil is disabled in the config file.", "red");
        }

        // If the configuration is null at this point we can stop here.
        if (this.config === null) {
            return;
        }
    }

    /**
     * Trigger the changes to extracts once the database has loaded.
     */
    public postDBLoad(container: DependencyContainer): void {
        // If the configuration is null at this point we can stop here. This will happen if the configuration file
        // failed to load, failed to validate, or if the mod is disabled in the configuration file.
        if (this.config === null) {
            return;
        }

        // Modify the extracts based on the configuration.
        new CameraRecoilAdjuster(container, this.config).adjustCameraRecoil();
    }
}

module.exports = { mod: new CustomCameraRecoil() };
