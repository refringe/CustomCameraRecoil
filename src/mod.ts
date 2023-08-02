import type { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import type { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DependencyContainer } from "tsyringe";

class CustomCameraRecoil implements IPostDBLoadMod
{
    private config:any;
    private container:DependencyContainer;
    private logger:ILogger;
    private debug = false;

    public postDBLoad(container:DependencyContainer): void
    {
        require("json5/lib/register");
        this.config = require("../config/config.json5");

        this.container = container;

        // Get the logger from the server container.
        this.logger = this.container.resolve<ILogger>("WinstonLogger");

        // Check to see if the mod is enabled.
        if (!this.config.enabled)
        {
            this.logger.log("CustomCameraRecoil is disabled in the config file.", "red");
            return;
        }

        // We loud?
        this.debug = this.config.debug;

        // Engage!
        this.adjustCameraRecoil();
    }

    /**
     * Generates custom raid times based on a number of configuration values.
     */
    private adjustCameraRecoil():void
    {
        // Get the database tables.
        const items:Record<string, ITemplateItem> = this.container.resolve<DatabaseServer>("DatabaseServer").getTables().templates.items;

        // Which method are we using to modify the recoil?
        const method:string = this.config.camera_recoil_method;

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
                    newRecoil = this.config.precise_camera_recoil;
                else if (method === "percent")
                {
                    // Calculate the relative percentage of the current camera recoil value.
                    // Example: 50% (increase) to 0.5 = 0.75
                    //         -50% (decrease) to 0.5 = 0.25
                    const increase = this.config.percent_camera_recoil >= 0;
                    const percentage = increase ? this.config.percent_camera_recoil : this.config.percent_camera_recoil * -1;
                    newRecoil = (percentage / 100) * items[item]._props.CameraRecoil;
                    newRecoil = increase ? (items[item]._props.CameraRecoil + newRecoil) : (items[item]._props.CameraRecoil - newRecoil);
                    
                    // Round the new recoil value to max 4 decimal places.
                    newRecoil = Math.round(newRecoil * 10000) / 10000;
                }

                if (this.debug)
                    this.logger.log(`CustomCameraRecoil: Weapon '${items[item]._name}' of class '${items[item]._props.weapClass}' has had camera recoil modified from ${items[item]._props.CameraRecoil} to ${newRecoil}.`, "gray");

                // No negative camera recoil values.
                items[item]._props.CameraRecoil = newRecoil;
                if (items[item]._props.CameraRecoil < 0)
                {
                    items[item]._props.CameraRecoil = 0.0;
                    if (this.debug)
                        this.logger.log(`CustomCameraRecoil: Weapon '${items[item]._name}' of class '${items[item]._props.weapClass}' can not have negative camera recoil. Setting to 0.`, "gray");
                }

                changeCount++;
            }
        }

        this.logger.log(`CustomCameraRecoil: Adjusted the camera recoil for ${changeCount} weapons.`, "cyan");
    }
}

module.exports = { mod: new CustomCameraRecoil() };
