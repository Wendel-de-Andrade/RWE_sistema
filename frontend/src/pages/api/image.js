import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const { filename } = req.query;
    const filepath = path.resolve('../processed', filename);
    const imageBuffer = fs.readFileSync(filepath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
}
