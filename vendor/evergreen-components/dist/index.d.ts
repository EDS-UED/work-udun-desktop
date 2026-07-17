import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

declare const __VLS_component: DefineComponent<__VLS_Props_2, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<__VLS_Props_2> & Readonly<{}>, {
variant: TypographyVariant;
as: TypographyTag;
muted: boolean;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_component_2: DefineComponent<__VLS_Props_3, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<__VLS_Props_3> & Readonly<{}>, {
size: ButtonSize;
type: "button" | "submit" | "reset";
variant: ButtonVariant;
disabled: boolean;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, HTMLButtonElement>;

declare type __VLS_Props = {
    name: IconName;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
};

declare type __VLS_Props_2 = {
    variant?: TypographyVariant;
    as?: TypographyTag;
    muted?: boolean;
};

declare type __VLS_Props_3 = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
};

declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        default?(_: {}): any;
    };
    refs: {};
    rootEl: any;
};

declare function __VLS_template_2(): {
    attrs: Partial<{}>;
    slots: {
        default?(_: {}): any;
    };
    refs: {};
    rootEl: HTMLButtonElement;
};

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_TemplateResult_2 = ReturnType<typeof __VLS_template_2>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_2<T, S> = T & {
    new (): {
        $slots: S;
    };
};

export declare function applyTheme(theme: ThemeMode, target?: HTMLElement): void;

export declare type ButtonSize = 'sm' | 'md' | 'lg';

export declare type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export declare const EgButton: __VLS_WithTemplateSlots_2<typeof __VLS_component_2, __VLS_TemplateResult_2["slots"]>;

export declare const EgIcon: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
size: "sm" | "md" | "lg";
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, SVGSVGElement>;

export declare const EgTypography: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

export declare function getPreferredTheme(): ThemeMode;

export declare type IconName = keyof typeof iconPaths;

export declare const iconNames: IconName[];

declare const iconPaths: {
    readonly 'arrow-right': "M5 12h14m0 0-4-4m4 4-4 4";
    readonly check: "M5 13l4 4L19 7";
    readonly close: "M6 6l12 12M18 6 6 18";
    readonly menu: "M4 7h16M4 12h16M4 17h16";
    readonly search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm10 14-4.3-4.3";
    readonly sun: "M12 4V2m0 18v-2M4.93 4.93 3.52 3.52m16.96 16.96-1.41-1.41M4 12H2m20 0h-2M4.93 19.07 3.52 20.48m16.96-16.96-1.41 1.41M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z";
    readonly moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z";
};

export declare function initThemeProvider(mode?: ThemeMode): void;

export declare type ThemeMode = 'light' | 'dark';

export declare function toggleTheme(current: ThemeMode): ThemeMode;

export declare type TypographyTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'code';

export declare type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption' | 'code';

export declare function useThemeProvider(): {
    theme: Ref<ThemeMode, ThemeMode>;
    setTheme: (next: ThemeMode) => void;
    toggleTheme: () => void;
};

export { }
