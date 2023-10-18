// The main configuration file structure.
export interface Configuration {
    general: GeneralSettings;
    recoil: RecoilSettings;
}

// The configuration file structure for the "general" section.
export interface GeneralSettings {
    enabled: boolean;
    debug: boolean;
}

// The configuration file structure for the "recoil" section.
export interface RecoilSettings {
    method: "precise" | "percent";
    precise: number;
    percent: number;
}
