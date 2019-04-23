const html = require('choo/html')
const css = require('sheetify')

const QRCode = require('qrcode')

module.exports = (state, emitter) => {

  const container = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
    }

    img {
      width: 70vw;
      height: auto;
    }
  `

  QRCode.toDataURL(state.wallet.signingKey.address, {
    margin: 1,
    color: {
      light: '#A7E4AE',
      dark: '#2A333E'
    },
    scale: 10
  }, (err, url) => {
    state.wallet.qr = url
  })

  return html`
    <body>
      <div class=${container}>
        <img src=${state.wallet.qr} />
        <div class="actions">
          <a href="/">Back</a>
        </div>
      </div>
    </body>
  `
}