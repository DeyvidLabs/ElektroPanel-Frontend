import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { $t } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { LayoutService } from '../../../core/services/layout';

@Component({
    selector: 'app-configurator',
    standalone: true,
    template: '', // Empty template since we don't need UI
})
export class AppConfigurator {
    layoutService = inject(LayoutService);
    platformId = inject(PLATFORM_ID);

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            // Apply dark theme immediately to prevent white flash
            document.body.classList.add('dark');
            
            // Set default configuration
            this.layoutService.layoutConfig.update(state => ({
                ...state,
                darkTheme: true,
                primary: 'fuchsia',
                surface: 'gray',
                preset: 'aura'
            }));

            // Apply theme with defaults
            this.applyTheme();
        }
    }

    private applyTheme() {
        // Define the Fuchsia palette for primary
        const primaryPalette = {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75',
        };

        // Define the Gray surface palette
        const surfacePalette = {
            0: '#ffffff',
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712'
        };

        // Define additional palettes
        const secondaryPalette = {
            50: '#f0f1ff',
            100: '#e0e2ff',
            200: '#c7caff',
            300: '#a6abff',
            400: '#8388ff',  // Base secondary color
            500: '#6369ff',
            600: '#464dff',
            700: '#2f37ff',
            800: '#1a24ff',
            900: '#000dff'
        };

        const tertiaryPalette = {
            50: '#e6f7ff',
            100: '#ccefff',
            200: '#99dfff',
            300: '#66cfff',
            400: '#33bfff',
            500: '#0090ff',  // Base tertiary color
            600: '#0073cc',
            700: '#005699',
            800: '#003966',
            900: '#001d33'
        };

        const quaternaryPalette = {
            50: '#e6f5ff',
            100: '#ccebff',
            200: '#99d7ff',
            300: '#66c3ff',
            400: '#33afff',
            500: '#008de1',  // Base quaternary color
            600: '#0071b4',
            700: '#005587',
            800: '#003859',
            900: '#001c2c'
        };

        const quinaryPalette = {
            50: '#e6f7ff',
            100: '#ccefff',
            200: '#99dfff',
            300: '#66cfff',
            400: '#33bfff',
            500: '#0083ab',  // Base quinary color
            600: '#00698c',
            700: '#004f6d',
            800: '#00354e',
            900: '#001a2f'
        };

        const senaryPalette = {
            50: '#e6f7f7',
            100: '#ccefee',
            200: '#99dfdd',
            300: '#66cfcc',
            400: '#33bfbb',
            500: '#00746e',  // Base senary color
            600: '#005d58',
            700: '#004642',
            800: '#002e2c',
            900: '#001716'
        };

        // Create theme extension with all palettes
        const themeExtension = {
            semantic: {
                primary: primaryPalette,
                secondary: secondaryPalette,
                tertiary: tertiaryPalette,
                quaternary: quaternaryPalette,
                quinary: quinaryPalette,
                senary: senaryPalette,
                colorScheme: {
                    dark: {
                        primary: {
                            color: '{primary.400}',
                            contrastColor: '{surface.900}',
                            hoverColor: '{primary.300}',
                            activeColor: '{primary.200}'
                        },
                        highlight: {
                            background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                            focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                            color: 'rgba(255,255,255,.87)',
                            focusColor: 'rgba(255,255,255,.87)'
                        }
                    }
                }
            }
        };

        // Apply the theme
        $t()
            .preset(Aura)
            .preset(themeExtension)
            .surfacePalette(surfacePalette)
            .use({ useDefaultOptions: true });
    }
}