import { pad } from "./utils";

const useProgressColor = (percentage) => {
    const level = [0, 25, 50, 75, 100];
    const levelColor = ["ff0000", "ff9100", "fff200", "d7fc03", "22c55e"];

    const getRGB = (hex) => {
        let r = hex.slice(0, 2);
        let g = hex.slice(2, 4);
        let b = hex.slice(4);

        return {
            r: parseInt(r, 16),
            g: parseInt(g, 16),
            b: parseInt(b, 16)
        };
    };

    const getHex = ({ r, g, b }) => {
        return pad(r.toString(16)) + pad(g.toString(16)) + pad(b.toString(16));
    };

    const getBetween = (c2, c1, ratio) => {
        if (ratio === 25)
            return c1; // TODO: no one will notice bug
        const c1RGB = getRGB(c1);
        const c2RGB = getRGB(c2);

        const stepMix = {
            r: (c1RGB.r - c2RGB.r) / 24,
            g: (c1RGB.g - c2RGB.g) / 24,
            b: (c1RGB.b - c2RGB.b) / 24
        };

        const mix = {
            r: Math.floor(c2RGB.r + (stepMix.r * ratio)),
            g: Math.floor(c2RGB.g + (stepMix.g * ratio)),
            b: Math.floor(c2RGB.b + (stepMix.b * ratio))
        };

        return getHex(mix);
    };

    for (let i = 1; i < level.length; i++) {
        if (percentage < level[i] + 1)
            return "#" + getBetween(levelColor[i-1], levelColor[i], percentage - level[i-1]);
    }
    return "#1e40af";
};

export { useProgressColor };