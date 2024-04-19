// The main configuration file structure.
export interface Configuration {
    general: GeneralSettings;
    recoil: RecoilSettings;
}

// The configuration structure for the "general" section.
export interface GeneralSettings {
    enabled: boolean;
    debug: boolean;
}

// The configuration structure for the "recoil" section.
export interface RecoilSettings {
    remove: boolean;
    percent: number;
}
