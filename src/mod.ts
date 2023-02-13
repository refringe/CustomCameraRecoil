import { IPostDBLoadModAsync } from "@spt-aki/models/external/IPostDBLoadModAsync";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DependencyContainer } from "tsyringe";

class CustomCameraRecoil implements IPostDBLoadModAsync
{
    public async postDBLoadAsync(container: DependencyContainer): Promise<void>
    {
        // Get the configuration options.
        const config = require("../config/config.json");

        // Get the logger from the server container.
        const logger = container.resolve<ILogger>("WinstonLogger");

        // Check to see if the mod is enabled.
        const enabled:boolean = config.mod_enabled;
        if (!enabled)
        {
            logger.info("CustomCameraRecoil is disabled in the config file.");
            return;
        }

        // Find out if we're logging everything.
        const debug:boolean = config.debug;

        // Get database from server.
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get in-memory json found in /assets/database
        const tables = databaseServer.getTables();

        // Get a list of all items in the database.
        const items = tables.templates.items

        // Which method are we using to modify the recoil?
        const method:string = config.camera_recoil_method;

        // Count for the logs.
        let changeCount = 0;

        // Loop through all weapons in the database. Check to see if camera recoil is available and update it.
        for (const item in items)
        {
            if (
                Object.prototype.hasOwnProperty.call(items[item]._props, "ShortName") && 
                Object.prototype.hasOwnProperty.call(items[item]._props, "CameraRecoil") &&
                Object.prototype.hasOwnProperty.call(items[item]._props, "weapClass")
            )
            {
                let newRecoil:number;

                if (method === "precise")
                {
                    newRecoil = config.precise_camera_recoil;
                }
                else if (method === "percent")
                {
                    // Calculate the relative percentage of the current camera recoil value.
                    // Example: 50% (increase) to 0.5 = 0.75
                    //         -50% (decrease) to 0.5 = 0.25
                    const increase = config.percent_camera_recoil >= 0;
                    const percentage = increase ? config.percent_camera_recoil : config.percent_camera_recoil * -1;
                    newRecoil = (percentage / 100) * items[item]._props.CameraRecoil;
                    newRecoil = increase ? (items[item]._props.CameraRecoil + newRecoil) : (items[item]._props.CameraRecoil - newRecoil);
                    
                    // Round the new recoil value to max 4 decimal places.
                    newRecoil = Math.round(newRecoil * 10000) / 10000;
                }

                if (debug)
                {
                    logger.info(`CustomCameraRecoil: Weapon '${items[item]._props.ShortName}' of class '${items[item]._props.weapClass}' has had camera recoil modified from ${items[item]._props.CameraRecoil} to ${newRecoil}.`);
                }

                // No negative camera recoil values.
                items[item]._props.CameraRecoil = newRecoil;
                if (items[item]._props.CameraRecoil <= 0)
                {
                    items[item]._props.CameraRecoil = 0.0;
                    if (debug)
                    {
                        logger.info(`CustomCameraRecoil: Weapon '${items[item]._props.ShortName}' of class '${items[item]._props.weapClass}' can not have negative camera recoil. Setting to 0.`);
                    }
                }

                changeCount++;
            }
        }

        logger.logWithColor(`CustomCameraRecoil: Adjusted the camera recoil for ${changeCount} weapons.`, LogTextColor.CYAN, LogBackgroundColor.DEFAULT);
    }
}

module.exports = { mod: new CustomCameraRecoil() };
