import { Jimp, diff } from "jimp";

import fs from 'fs';
import path from 'path';
import { exit } from "process";

const dirname = import.meta.dirname;

const baselinePath = dirname + path.sep + "baseline_shots";
const comparePath = dirname + path.sep + "updated_shots";
const diffsPath = dirname + path.sep + "diffs";
const comparisonSensitivity = 0.25;

const canRead = path => {
    // Check read permissions
    try {
        fs.accessSync(path, fs.constants.R_OK);
        return true;
    } catch (err) {
        logger.error("error occurred when getting permissions for %s: %s", path, err);
        return false;
    }
};

const canReadExecute = path => {
    // Check read and execute permissions
    try {
        fs.accessSync(path, fs.constants.R_OK);
        fs.accessSync(path, fs.constants.X_OK);
        return true; // made it here ... dir exist and we can read/execute (cd) the dir
    } catch (err) {
        logger.error("error occurred when getting permissions for %s: %s", path, err);
        return false;
    }
};

const ls = (dir, exts, lsDirs=false, lsFiles=false, deep=true) => {
    let list = [];
    if (!dir || !fs.existsSync(dir)) {
        console.warn("path does not exist: '" + dir + "'");
        return list;
    }

    if (!canReadExecute(dir)) {
        logger.warn("path is not readable/executable: '" + dir + "'");
        return list;
    }

    let files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = dir + path.sep + file;
        if (fs.lstatSync(filepath).isDirectory()) {
            if (lsDirs)
                list.push(filepath);
            if (deep) {
                list = list.concat(ls(filepath, exts, lsDirs, lsFiles, deep));
            }
        }
        if (fs.lstatSync(filepath).isFile() && lsFiles) {
            if (canRead(filepath)) { // no point adding it if i cant read from it
                if (exts.includes(path.extname(file).slice(1)))
                    list.push(filepath);
                if (exts.length < 1) // no extensions passed?, assume all files
                    list.push(filepath);
            }
        }
    });

    return list;
};

const normalizeImages = (img1, img2, shouldResize) => {
    const { height: img1Height, width: img1Width } = img1;
    const { height: img2Height, width: img2Width } = img2;

    if ((img1Width !== img2Width || img1Height !== img2Height) && shouldResize) {
        // Determine the target dimensions (use the larger of the two)
        const targetWidth = Math.max(img1Width, img2Width);
        const targetHeight = Math.max(img1Height, img2Height);

        // Create new canvases with target dimensions
        const newImg1 = new Jimp({ width: targetWidth, height: targetHeight });
        const newImg2 = new Jimp({ width: targetWidth, height: targetHeight });

        // Copy original images at top-left (0, 0)
        newImg1.blit({ src: img1, x: 0, y: 0 });
        newImg2.blit({ src: img2, x: 0, y: 0 });

        return [newImg1, newImg2];
    }

    return [img1, img2];
}

// adapted from https://github.com/JChris246/utils/blob/main/services/CompareImage.js
const compareImage = async (img1, img2, resize) => {
    const img1Buffer = fs.readFileSync(img1);
    const img2Buffer = fs.readFileSync(img2);

    try {
        const promises = await Promise.all([Jimp.fromBuffer(img1Buffer), Jimp.fromBuffer(img2Buffer)]);
        let jimpImg1 = promises[0];
        let jimpImg2 = promises[1];

        [jimpImg1, jimpImg2] = normalizeImages(jimpImg1, jimpImg2, resize);
        return diff(jimpImg1, jimpImg2, comparisonSensitivity);
    } catch (e) {
        console.error("Error comparing " + img1 + " vs " + img2);
        throw e;
    }
};

const getMatchGroups = () => {
    const baselineShots = ls(baselinePath, ["png"], false, true, true);
    const updatedShots = ls(comparePath, ["png"], false, true, true);
    const pairs = [];
    const newScenarios = [];

    for (let i = 0; i < updatedShots.length; i++) {
        const basename = path.basename(updatedShots[i]);

        const match = baselineShots.findIndex(p => path.basename(p) === basename);
        if (match === -1) {
            // no match found in baseline, must be a new scenario
            newScenarios.push(updatedShots[i]);
        } else {
            pairs.push({
                baseline: baselineShots[match],
                updated: updatedShots[i]
            })
        }
    }

    return [pairs, newScenarios];
}

const runComparison = async () => {
    const [toCompare, /*newScenarios*/] = getMatchGroups();
    let diffCount = 0;
    if (!fs.existsSync(diffsPath)) fs.mkdirSync(diffsPath);

    for (let i = 0; i < toCompare.length; i++) {
        const { baseline, updated } = toCompare[i];
        const { percent, image } = await compareImage(baseline, updated, true);

        if (percent > 0) {
            const diffName = path.basename(baseline);
            await image.write(path.join(diffsPath, diffName));
            diffCount++;
        }
    }

    if (diffCount > 0) {
        console.log(diffCount + " scenarios found with visual differences");
        exit(1); // since there were diffs, fail the "test"?
    } else {
        console.log("No visual differences found");
    }

    // TODO: generate an html report?
    // should I output the new scenario screenshots just to see them?
}

(async () => await runComparison())();