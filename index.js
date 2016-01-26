'use strict';
const fs = require('fs');
const exec = require('child_process').exec;

(function() {
  const newSize = process.argv[4];
  var sourcePath = process.argv[2];
  var destPath = process.argv[3];

  var directories = [];

  function escapeSpaces(str) {
    return str.replace(/\s/g,'\\ ');
  }

  function convertImage(source, dest, fileName) {
    source = escapeSpaces(source);
    dest = escapeSpaces(dest);
    fileName = escapeSpaces(fileName);
    var command = 'convert '+ source +'/'+ fileName +' -resize ';
    command += newSize +' '+ dest +'/'+ fileName +'\n';
    exec(command, (err, stdout, stderr) => {
      if (err) throw err;
      if (stderr) console.log(stderr);
    });
  }

  function cacheDir(fullPath) {
    var relPath = fullPath.replace(sourcePath,'');
    directories.push(relPath);
  }

  function pathExists(path) {
    try { 
      fs.statSync(path);
      return true;
    } catch(err) {
      return false;
    }
  }

  function processDirectory(relPath) {
    var currentSourcePath = sourcePath + (relPath || '');
    var currentDestPath = destPath + (relPath || '');
    if (!pathExists(currentDestPath)) {
      fs.mkdirSync(currentDestPath);
    }

    fs.readdir(currentSourcePath, (err, list) =>  {
      var fullPath;
      for (var i=0; i<list.length; i++) {
        fullPath = currentSourcePath+'/'+list[i];
        if (fs.statSync(fullPath).isDirectory()) cacheDir(fullPath);
        else {
          convertImage(currentSourcePath, currentDestPath, list[i]);
        }
      } // endfor
      if (directories.length) processDirectory(directories.pop());
    });
  }
  processDirectory();
}());
