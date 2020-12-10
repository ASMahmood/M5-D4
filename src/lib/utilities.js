const { writeJson, readJson } = require("fs-extra"); //TAKING ASYNC READ/WRITE METHODS FROM FS-EXTRA

const readDB = async (filepath) => {
  //NEEDS TO USE ASYNC/AWAIT
  try {
    const fileJson = await readJson(filepath); //READS FILEPATH AS PARAMETER AND RETURNS THE JSON
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filepath, data) => {
  try {
    await writeJson(filepath, data); //RECEIVES FILEPATH AND DATA, OVERWRITES EXISTING JSON ON FILEPATH WITH DATA PROVIDED
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  readDB,
  writeDB,
};
