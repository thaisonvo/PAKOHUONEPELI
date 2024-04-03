const fs = require("fs").promises;

const readFileJSON = async (filePath) => {
    try {
        const res = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(res);
        return data;
    } catch (err) {
        console.error(err);
        throw new Error("Unable to read file");
    }
}

const writeFileJSON = async (filePath, data) => {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonData, "utf-8");
    } catch (err) {
        console.error(err);
        throw new Error("Unable to write file");
    }
}

module.exports = { readFileJSON, writeFileJSON };