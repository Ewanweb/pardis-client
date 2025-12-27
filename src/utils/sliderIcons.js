import * as LucideIcons from 'lucide-react';

const normalizeStats = (stats) => (Array.isArray(stats) ? stats : []);

export const serializeStatsIcons = (stats) => normalizeStats(stats).map((stat) => {
    const iconName = typeof stat.icon === 'function' ? stat.icon.name : stat.iconName;
    const { icon, iconName: _iconName, ...rest } = stat;

    return {
        ...rest,
        ...(iconName ? { iconName } : {}),
    };
});

export const serializeSlidesForStorage = (slides) => (Array.isArray(slides)
    ? slides.map((slide) => ({
        ...slide,
        stats: serializeStatsIcons(slide.stats),
    }))
    : []);

export const hydrateStatsIcons = (stats) => normalizeStats(stats).map((stat) => {
    const iconName = stat.iconName || stat.icon;
    const Icon = typeof stat.icon === 'function' ? stat.icon : LucideIcons[iconName];
    const { icon, ...rest } = stat;

    return {
        ...rest,
        ...(iconName ? { iconName } : {}),
        ...(typeof Icon === 'function' ? { icon: Icon } : {}),
    };
});

export const hydrateSlidesForDisplay = (slides) => (Array.isArray(slides)
    ? slides.map((slide) => ({
        ...slide,
        stats: hydrateStatsIcons(slide.stats),
    }))
    : []);
