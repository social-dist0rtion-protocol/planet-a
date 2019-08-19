# 🌍 Planet A 🌍

Planet A is a "serious social game" taking place during the Berlin Blockchain Week 2019 and CCCamp 2019 involving as many participants as possible.

The game will begin as a gimmick incentivizing participants through a financial incentive to interact with each other via a burner wallet. Half way through the game, players will find themselves in a tragedy of the commons, as they find out that their greedy interactions had dangerous emissions that now threaten to collapse the economy of Berlin Blockchain Week. They enter as teams into a competition to educate each other, and prevent an economic tipping points to be reached. The team that manages to achieve the best climate score wins the event.

## Installation

The Planet A Wallet runs on LeapDAO's test network. Installation should be
simple and straight forward:

```bash
$ git clone https://github.com/social-dist0rtion-protocol/planet-a.git
$ npm i
$ npm run start
```

If you're experiencing issues in relation to HTTP, you can start the burner on
HTTPS by running:

```bash
$ HTTPS=true npm run start
```

## Components

### ERC20 Tokens
- LeapToken (LEAP)
  - decimals: 18
  - address: [`0xD2D0F8a6ADfF16C2098101087f9548465EC96C98`](https://testnet.leapdao.org/explorer/address/0xD2D0F8a6ADfF16C2098101087f9548465EC96C98)
  - purpose: to pay the execution of the smart contract.
- CO2 (CO2)
  - decimals: 18
  - unit: Gigaton of CO₂
  - addresss: [`0xF64fFBC4A69631D327590f4151B79816a193a8c6`](https://testnet.leapdao.org/explorer/address/0xF64fFBC4A69631D327590f4151B79816a193a8c6)
  - purpose: reserve of CO₂ that is released to `Air`. CO₂ cannot be created out of thin air (eheheh), so the contract needs to be preloaded with a big amount of CO₂.
- Goellars (GOE)
  - decimals: 18
  - address: [`0x1f89Fb2199220a350287B162B9D0A330A2D2eFAD`](https://testnet.leapdao.org/explorer/address/0x1f89Fb2199220a350287B162B9D0A330A2D2eFAD)
  - purpose: reserve of Göllars to distribute to players on successful handshake.

### ERC1948 Tokens
Passports are ERC1948 tokens. Each player needs at least one passport to play.

Passport data structure:

```
+------------+------------+------------+-------------+
| 20 bytes   | 4 bytes    | 4 bytes    | 4 bytes     |
| name str   | picId      | CO₂ locked | CO₂ emitted |
+------------+------------+------------+-------------+
```

Note that the CO₂ value in the passport is expressed in Megatons.

### Smart Contracts
The [planet-a-contracts](https://github.com/social-dist0rtion-protocol/planet-a-contracts) repository contains:
- `Earth`: smart contract that handles the handshake function and releases CO₂ to `Air`, and Göllars to the players.
- `Air`: smart contact that accumulates CO₂. It exposes the `plantTree` function to lock CO₂ back to `Earth`.

#### Earth
`Earth` needs:
- LeapToken
- CO2
- Goellars

#### Air
`Air` needs:
- LeapToken

## Attribution

- [Sad Trombone Licensed as Attribution 3.0 and recorded by Joe Lamb](http://soundbible.com/1830-Sad-Trombone.html)

## License

MIT
