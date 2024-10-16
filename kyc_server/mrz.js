const Tesseract = require('tesseract.js');
const { parse } = require('mrz').parse;
const IJS = require('image-js').Image; // Import image-js for potential image manipulation

const TESSERACT_CONFIG = {
    lang: "OCRB",
    load_system_dawg: "F",
    load_freq_dawg: "F",
    load_unambig_dawg: "F",
    load_punc_dawg: "F",
    load_number_dawg: "F",
    load_fixed_length_dawgs: "F",
    load_bigram_dawg: "F",
    wordrec_enable_assoc: "F",
    tessedit_pageseg_mode: "6",
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<"
};

// Function to clean the MRZ text
const cleanMRZ = (mrzText) => {
    const replacementRegex = /<[^<]*[L7][^<]*</g;
    let cleanedMRZ = mrzText;

    // Iteratively replace until the pattern ceases to exist
    while (replacementRegex.test(cleanedMRZ)) {
        cleanedMRZ = cleanedMRZ.replace(replacementRegex, match => {
            return match.replace(/[L7]/g, '<');
        });
    }

    // Split the MRZ into lines and remove empty lines
    const mrzLines = cleanedMRZ.split('\n').filter(line => line.trim().length > 0);
    const mrzRegex = /^[A-Z0-9<]{44}$/;
    const validLines = mrzLines.filter(line => mrzRegex.test(line));

    // Return cleaned MRZ or 'Invalid MRZ' if format doesn't match
    return validLines.length === 2 ? validLines.join('\n') : 'Invalid MRZ';
};

// Main function to parse MRZ
const parseMRZ = async (imagePath) => {
    try {
        const result = await Tesseract.recognize(imagePath, 'eng', TESSERACT_CONFIG);
        const mrzText = result.data.text;
        const cleanedMrzText = cleanMRZ(mrzText);

        // Check if the cleaned MRZ is valid
        if (cleanedMrzText === 'Invalid MRZ') {
            console.error('Invalid MRZ format detected.');
            return null;
        }

        // Parse the cleaned MRZ
        const parsedResult = parse(cleanedMrzText);
        console.log('Parsed MRZ:', parsedResult);
        return parsedResult;

    } catch (err) {
        console.error('Error detecting MRZ:', err);
        return null;
    }
};

module.exports = { parseMRZ };

