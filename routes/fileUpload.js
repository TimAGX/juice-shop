const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const libxml = require('libxmljs')
const vm = require('vm')
const fs = require('fs')
const unzipper = require('unzipper')
const path = require('path')

module.exports = function fileUpload () {
  return (req, res, next) => {
    if (req.file) {
      const file = req.file
      if (utils.endsWith(file.originalname.toLowerCase(), '.zip')) {
        const buffer = file.buffer
        const filename = file.originalname.toLowerCase()
        fs.open('/tmp/' + filename, 'w', function (err, fd) {
          if (err) {
            console.log('error opening file: ' + err)
          }
          fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) console.log('error opening file: ' + err)
            fs.close(fd, function () {
              fs.createReadStream('/tmp/' + filename)
                .pipe(unzipper.Parse())
                .on('entry', function (entry) {
                  var fileName = entry.path
                  var absolutePath = path.resolve('uploads/complaints/' + fileName)
                  console.log(absolutePath)
                  if (absolutePath === path.resolve('ftp/legal.md') && utils.notSolved(challenges.fileWriteChallenge)) {
                    utils.solve(challenges.fileWriteChallenge)
                  }
                  var juiceShopPath = path.resolve('.')
                  if (absolutePath.includes(juiceShopPath)) {
                    entry.pipe(fs.createWriteStream('uploads/complaints/' + fileName).on('error', function (e) { console.log(e) }))
                  } else {
                    entry.autodrain()
                  }
                })
            })
          })
        })
      }
      if (utils.notSolved(challenges.uploadSizeChallenge) && file.size > 100000) {
        utils.solve(challenges.uploadSizeChallenge)
      }
      if (utils.notSolved(challenges.uploadTypeChallenge) && !(utils.endsWith(file.originalname.toLowerCase(), '.pdf') ||
        utils.endsWith(file.originalname.toLowerCase(), '.xml') || utils.endsWith(file.originalname.toLowerCase(), '.zip'))) {
        utils.solve(challenges.uploadTypeChallenge)
      }
      if (utils.endsWith(file.originalname.toLowerCase(), '.xml')) {
        if (utils.notSolved(challenges.deprecatedInterfaceChallenge)) {
          utils.solve(challenges.deprecatedInterfaceChallenge)
        }
        if (file.buffer && !utils.runsOnContainerEnv()) { // XXE attacks in Docker/Heroku containers regularly cause "segfault" crashes
          const data = file.buffer.toString()
          try {
            const sandbox = {libxml, data}
            vm.createContext(sandbox)
            const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: true, nocdata: true })', sandbox, {timeout: 2000})
            const xmlString = xmlDoc.toString(false)
            if (utils.notSolved(challenges.xxeFileDisclosureChallenge) && (matchesSystemIniFile(xmlString) || matchesEtcPasswdFile(xmlString))) {
              utils.solve(challenges.xxeFileDisclosureChallenge)
            }
            res.status(410)
            next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 200) + ' (' + file.originalname + ')'))
          } catch (err) {
            if (err.message === 'Script execution timed out.') {
              if (utils.notSolved(challenges.xxeDosChallenge)) {
                utils.solve(challenges.xxeDosChallenge)
              }
              res.status(503)
              next(new Error('Sorry, we are temporarily not available! Please try again later.'))
            } else {
              res.status(410)
              next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
            }
          }
        }
        res.status(410)
        next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + file.originalname + ')'))
      }
      res.status(204).end()
    }

    function matchesSystemIniFile (text) {
      const match = text.match(/(; for 16-bit app support|drivers|mci|driver32|386enh|keyboard|boot|display)/gi)
      return match && match.length >= 2
    }

    function matchesEtcPasswdFile (text) {
      const match = text.match(/\w*:\w*:\d*:\d*:\w*:.*/gi)
      return match && match.length >= 2
    }
  }
}
