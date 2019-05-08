const frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const utils = require('../../lib/utils')

const URL = 'http://localhost:3000'

describe('/file-upload', () => {
  it('POST file valid PDF for client and API', () => {
    const file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST file too large for client validation but valid for API', () => {
    const file = path.resolve(__dirname, '../files/invalidSizeForClient.pdf')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST file with illegal type for client validation but valid for API', () => {
    const file = path.resolve(__dirname, '../files/invalidTypeForClient.exe')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  xit('POST file type XML deprecated for API', () => { // FIXME fails with "socket hang up" error from node-fetch
    const file = path.resolve(__dirname, '../files/deprecatedTypeForServer.xml')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 410)
  })

  xit('POST large XML file near upload size limit', () => { // FIXME fails with "socket hang up" error from node-fetch
    const file = path.resolve(__dirname, '../files/maxSizeForServer.xml')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 410)
  })

  if (!utils.disableOnContainerEnv()) {
    xit('POST file type XML with XXE attack against Windows', () => { // FIXME fails with "socket hang up" error from node-fetch
      const file = path.resolve(__dirname, '../files/xxeForWindows.xml')
      const form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', {
        headers: { 'Content-Type': form.getHeaders()['content-type'] },
        body: form
      })
        .expect('status', 410)
    })

    xit('POST file type XML with XXE attack against Linux', () => { // FIXME fails with "socket hang up" error from node-fetch
      const file = path.resolve(__dirname, '../files/xxeForLinux.xml')
      const form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', {
        headers: { 'Content-Type': form.getHeaders()['content-type'] },
        body: form
      })
        .expect('status', 410)
    })

    xit('POST file type XML with Billion Laughs attack is caught by parser', () => { // FIXME fails with "socket hang up" error from node-fetch
      const file = path.resolve(__dirname, '../files/xxeBillionLaughs.xml')
      const form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', {
        headers: { 'Content-Type': form.getHeaders()['content-type'] },
        body: form
      })
        .expect('status', 410)
        .expect('bodyContains', 'Detected an entity reference loop')
    })

    xit('POST file type XML with Quadratic Blowup attack', () => {
      const file = path.resolve(__dirname, '../files/xxeQuadraticBlowup.xml')
      const form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', {
        headers: { 'Content-Type': form.getHeaders()['content-type'] },
        body: form
      })
        .expect('status', 503)
    })

    xit('POST file type XML with dev/random attack', () => { // FIXME fails with "socket hang up" error from node-fetch
      const file = path.resolve(__dirname, '../files/xxeDevRandom.xml')
      const form = frisby.formData()
      form.append('file', fs.createReadStream(file))

      return frisby.post(URL + '/file-upload', {
        headers: { 'Content-Type': form.getHeaders()['content-type'] },
        body: form
      })
    })
  }

  it('POST file too large for API', () => {
    const file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 500)
  })

  it('POST zip file with directory traversal payload', () => {
    const file = path.resolve(__dirname, '../files/arbitraryFileWrite.zip')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })

  it('POST zip file with password protection', () => {
    const file = path.resolve(__dirname, '../files/passwordProtected.zip')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
  })
})
