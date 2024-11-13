'use strict';

const fs = require('fs');
require('dotenv').config();

const env = process.env;
if (!env.XBOX) return;

const PUB_DIR = './bin/app/pub';
setupProject(PUB_DIR);

function setupProject(projectDir) {
	const files = readFiles(projectDir, ['.jsproj', '.pfx', '.appxmanifest']);
	const filesContent = (files || []).map(f => `<Content Include="${f}" />`).join('\n');

	const projFilePath = projectDir + '/MassiveAxisXBox.jsproj';
	let contents = fs.readFileSync(projFilePath, 'utf8');
	contents = contents.replace(/<Content Include=\"script\/xbox.js\"\/>/, filesContent);
	fs.writeFileSync(projFilePath, contents);
}

function readFiles(dir, filters, pathName) {
	// ignore potential previous build artefacts
	if (/pub[\/\\](AppPackages|bin|bld|BundleArtifacts|\.)/.test(dir)) {
		return [];
	}
	pathName = pathName || '';
	let manifestFiles = [];
	const files = fs.readdirSync(dir);
	files.forEach(fileName => {
		const filePath = dir + '/' + fileName;
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			manifestFiles = manifestFiles.concat(readFiles(filePath, filters, fileName + '\\'));
		} else if (filters.every(f => fileName.indexOf(f) === -1)) {
			manifestFiles.push(pathName + fileName);
			convertToUTF8WithBOM(filePath);
		}
	});
	return manifestFiles;
}

function convertToUTF8WithBOM(filePath) {
	if (
		filePath.indexOf('.js') === -1 &&
		filePath.indexOf('.css') === -1 &&
		filePath.indexOf('.json') === -1 &&
		filePath.indexOf('.html') === -1
	) {
		return;
	}

	fs.readFile(filePath, function(err, fd) {
		if (fd[0] === 0xef && fd[1] === 0xbb && fd[2] === 0xbf) return;

		// Add BOM
		const newData = new Buffer(fd.length + 3);
		newData[0] = 0xef;
		newData[1] = 0xbb;
		newData[2] = 0xbf;
		fd.copy(newData, 3);
		fs.writeFileSync(filePath, newData, 'utf8');
	});
}
