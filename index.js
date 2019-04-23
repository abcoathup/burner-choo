const html = require('choo/html')
const devtools = require('choo-devtools')
const choo = require('choo')
const css = require('sheetify')
const ethers = require('ethers')

const preview = require('./qr-preview')

const qrView = require('./screens/get')

require('dotenv').config()

const { JSON_RPC_URL } = process.env

const app = choo()
app.use(devtools())
app.use(providerStore)
app.use(walletStore)
app.use(balanceStore)
app.use(txStore)
app.route('/', mainView)
app.route('/get', qrView)
app.mount('body')

function mainView (state, emit) {

  const styles = css`

    body {
      margin: 0;
      background: #2A333E;
      height: 100vh;
      color: #A7E4AE;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    p, h1, h2, h3, h4, a {
      font-family: 'VT323';
      font-weight: normal;
    }

    .wallet-status {
      margin-top: 40px;
      text-align: center;
    }

    .wallet-status h1 {
      font-size: 4rem;
    }

    .vip-status {
      margin-top: -70px;
      font-size: 2rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      text-align: center;
      margin-bottom: 40px;
    }

    .actions a {
      font-size: 3.5rem;
      color: #A7E4AE;
      padding: 20px;
      text-decoration: none;
    }
  `

  return html`
    <body class=${styles}>
      <div class="wallet-status">
        <h1>៛${state.wallet.balance}</h1>
        <p class="vip-status">VIP=FALSE</p>
      </div>
      <div class="actions">
        <a href="/get">GET</a>
        <a href="/send">SEND</a>
        <a href="/gamble">GAMBLE</a>
        <a href="/vip">VIP_ZONE</a>
      </div>
      <link href='//fonts.googleapis.com/css?family=VT323' rel='stylesheet' type='text/css'>
    </body>
  `


  // <p>Private key: ${state.wallet.signingKey.privateKey}</p>
  // <p>Address: ${state.wallet.signingKey.address}</p>
  //
  // <button onclick=${sendEth}>Return 0.01 ETH</button>
  //     <button onclick=${scan}>Scan QR</button>
  //     ${preview.render()}

  function sendEth () {
    emit('sendEth', '0.01')
  }

  function scan () {
    preview.beginScan(res => {
      console.log(res)
      if (res.indexOf('ethereum:') !== -1) {
        preview.endScan()
      }
    })
    // const qrScanner = new QrScanner(document.getElementById('preview'), result => console.log('decoded qr code:', result));
  }
}

function providerStore (state, emitter) {
  state.provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL);
}

function walletStore (state, emitter) {
  state.wallet = getWallet(state.provider)
}

function balanceStore (state, emitter) {
  const { address } = state.wallet.signingKey

  const setBalance = (bal) => {
    const etherString = ethers.utils.formatEther(bal)
    state.wallet.balance = etherString
    emitter.emit('render')
  }

  state.provider.getBalance(address).then((b) => {
    setBalance(b)
  })
  state.provider.on(address, (b) => {
    setBalance(b)
  })
}

function txStore (state, emitter) {
  emitter.on('sendEth', (eth) => {
    const weiString = ethers.utils.parseEther(eth)
    const tx = {
      to: '0xdbb84cf59Acb7E4bE58FFCdE2e1D9b8819D1F27E',
      value: weiString
    }
    state.wallet.sendTransaction(tx).then(t => {
      console.log(t)
    })
  })
}

function getWallet (provider) {
  let w = localStorage.getItem('wallet')
  if (w) {
    w = new ethers.Wallet(JSON.parse(w).signingKey.privateKey, provider)
  } else  {
    w = ethers.Wallet.createRandom()
    localStorage.setItem('wallet', JSON.stringify(w))
  }
  console.log(w)
  return w
}