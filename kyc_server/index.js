const express = require('express');
const multer = require('multer');
const { parseMRZ } = require('./mrz');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
    const mrzText = await parseMRZ(imagePath);

    if (mrzText) {
        res.json({ success: true, mrz: mrzText });
    } else {
        res.status(500).json({ success: false, message: 'MRZ detection failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
