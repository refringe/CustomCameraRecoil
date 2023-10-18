import type { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DependencyContainer } from "tsyringe";
import { CameraRecoilAdjuster } from "./adjusters/CameraRecoilAdjuster";
import { ConfigServer } from "./servers/ConfigServer";
import { Configuration } from "./types";

export class CustomCameraRecoil implements IPostDBLoadMod, IPreAkiLoadMod {
    public static container: DependencyContainer;
    public static logger: ILogger;
    public static config: Configuration | null = null;

    /**
     * Handle loading the configuration file and registering our custom MatchCallbacks class.
     * Runs before the database is loaded.
     */
    public preAkiLoad(container: DependencyContainer): void {
        CustomCameraRecoil.container = container;

        // Resolve the logger and save it to the static logger property for simple access.
        CustomCameraRecoil.logger = container.resolve<ILogger>("WinstonLogger");

        // Load and validate the configuration file, saving it to the static config property for simple access.
        try {
            CustomCameraRecoil.config = new ConfigServer().loadConfig().validateConfig().getConfig();
        } catch (error: any) {
            CustomCameraRecoil.config = null; // Set the config to null so we know it's failed to load or validate.
            CustomCameraRecoil.logger.log(`CustomCameraRecoil: ${error.message}`, "red");
        }

        // Set a flag so we know that we shouldn't continue when the postDBLoad method fires... just setting the config
        // back to null should do the trick. Use optional chaining because we have not yet checked if the config is
        // loaded and valid yet.
        if (CustomCameraRecoil.config?.general?.enabled === false) {
            CustomCameraRecoil.config = null;
            CustomCameraRecoil.logger.log("CustomCameraRecoil is disabled in the config file.", "red");
        }

        // If the configuration is null at this point we can stop here.
        if (CustomCameraRecoil.config === null) {
            return;
        }
    }

    /**
     * Trigger the changes to extracts once the database has loaded.
     */
    public postDBLoad(): void {
        // If the configuration is null at this point we can stop here. This will happen if the configuration file
        // failed to load, failed to validate, or if the mod is disabled in the configuration file.
        if (CustomCameraRecoil.config === null) {
            return;
        }

        // Modify the extracts based on the configuration.
        new CameraRecoilAdjuster();
    }
}

module.exports = { mod: new CustomCameraRecoil() };
